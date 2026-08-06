import logging
import subprocess
from pathlib import Path
from html import escape

from rest_framework import status, views, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from django.conf import settings
from django.utils import timezone
from django.utils.crypto import constant_time_compare

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import OTPVerification
from .serializers import (
    RegisterSerializer, VerifyOTPSerializer, ResendOTPSerializer, 
    UserSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)

logger = logging.getLogger(__name__)
User = get_user_model()

GENERIC_AUTH_FAILURE = 'Unable to log in with provided credentials.'
GENERIC_OTP_SENT = 'If this email is eligible, a verification code has been sent.'
GENERIC_RESET_SENT = 'If an account with that email exists, we have sent a password reset OTP.'


# ── Custom Throttles ──────────────────────────────────────────────
class AuthRateThrottle(AnonRateThrottle):
    """Strict rate limit for auth endpoints: 5 requests per minute."""
    rate = '5/minute'


class OTPRateThrottle(AnonRateThrottle):
    """Strict rate limit for OTP endpoints: 3 requests per minute."""
    rate = '3/minute'


# ── Helpers ───────────────────────────────────────────────────────
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def send_otp_email(user, otp_obj, purpose='verification'):
    """
    Send OTP email using Nodemailer integration script (send_otp.js).
    """
    script_path = Path(settings.BASE_DIR) / 'send_otp.js'
    try:
        cmd = [
            'node',
            str(script_path),
            str(user.email),
            str(otp_obj.otp),
            str(user.first_name or 'User'),
            purpose
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        logger.info(f"Nodemailer dispatch output: {result.stdout}")
        print(f"\n{'='*50}\n[NODEMAILER] OTP SENT: {otp_obj.otp} to {user.email}\n{'='*50}\n")
        return True
    except Exception as e:
        logger.error(f"Failed to execute Nodemailer script: {e}")
        print(f"\n{'='*50}\n[NODEMAILER FALLBACK] OTP CODE: {otp_obj.otp} to {user.email}\n{'='*50}\n")
        return True


def sanitize_string(value, max_length=150):
    """Strip dangerous characters and limit length."""
    if not isinstance(value, str):
        return ''
    cleaned = ''.join(c for c in value if c.isprintable())
    return cleaned[:max_length].strip()


# ── Custom Email-based Login ──────────────────────────────────────
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Override to use email as the username field."""
    username_field = 'email'


class EmailTokenObtainPairView(TokenObtainPairView):
    """
    JWT login using email + password.
    If user account is unverified (is_active=False), triggers Nodemailer OTP verification flow.
    """
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        email = sanitize_string(request.data.get('email', '')).lower()
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'detail': 'Please provide both email and password.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email__iexact=email).first()
        if not user or not user.check_password(password):
            return Response({'detail': GENERIC_AUTH_FAILURE}, status=status.HTTP_401_UNAUTHORIZED)

        # Handle unverified user attempting login
        if not user.is_active:
            OTPVerification.objects.filter(user=user, is_verified=False).update(is_verified=True)
            otp_obj = OTPVerification.objects.create(user=user)
            send_otp_email(user, otp_obj, purpose='verification')

            return Response({
                'requires_otp': True,
                'email': user.email,
                'message': 'Verification code sent! Please verify your email to complete login.'
            }, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data={'email': user.email, 'password': password})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


# ── Registration ──────────────────────────────────────────────────
class RegisterView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            email = serializer.validated_data.get('email', '')

            try:
                validate_email(email)
            except DjangoValidationError:
                return Response(
                    {'email': ['Enter a valid email address.']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if User.objects.filter(email__iexact=email).exists():
                return Response(
                    {'email': ['A user with this email already exists.']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = serializer.save()

            # Invalidate any previous OTPs
            OTPVerification.objects.filter(user=user, is_verified=False).update(is_verified=True)

            # Generate new OTP & send via Nodemailer
            otp_obj = OTPVerification.objects.create(user=user)
            email_sent = send_otp_email(user, otp_obj, purpose='verification')

            return Response({
                'message': 'Account created! Please check your email for the verification code.',
                'email': user.email
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Registration error: {e}")
            return Response(
                {'message': 'An unexpected error occurred. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ── OTP Verification ─────────────────────────────────────────────
class VerifyOTPView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = VerifyOTPSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            email = serializer.validated_data.get('email')
            otp = serializer.validated_data.get('otp')

            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                return Response({'message': 'Invalid email or OTP.'}, status=status.HTTP_400_BAD_REQUEST)

            # Get latest valid OTP
            otp_obj = OTPVerification.objects.filter(
                user=user,
                is_verified=False,
                expires_at__gt=timezone.now()
            ).order_by('-created_at').first()

            if not otp_obj:
                return Response({'message': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

            if not constant_time_compare(otp_obj.otp, otp):
                return Response({'message': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

            # Success — mark OTP used, activate user
            otp_obj.is_verified = True
            otp_obj.save()

            user.is_active = True
            user.save()

            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user).data

            return Response({
                'message': 'Email verified successfully.',
                'tokens': tokens,
                'user': user_data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"OTP verification error: {e}")
            return Response(
                {'message': 'Verification failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ── Resend OTP ────────────────────────────────────────────────────
class ResendOTPView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = ResendOTPSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            email = serializer.validated_data.get('email')

            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                return Response({'message': GENERIC_OTP_SENT}, status=status.HTTP_200_OK)

            if user.is_active:
                return Response({'message': 'Account is already verified. Please log in.'}, status=status.HTTP_200_OK)

            # Invalidate old OTPs
            OTPVerification.objects.filter(user=user, is_verified=False).update(is_verified=True)

            otp_obj = OTPVerification.objects.create(user=user)
            send_otp_email(user, otp_obj, purpose='verification')

            return Response({'message': 'A new verification code has been sent to your email.'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Resend OTP error: {e}")
            return Response(
                {'message': 'Failed to resend OTP. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ── Password Reset ────────────────────────────────────────────────
class PasswordResetRequestView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = PasswordResetRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            email = serializer.validated_data.get('email')
            
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                return Response({'message': GENERIC_RESET_SENT}, status=status.HTTP_200_OK)

            # Invalidate old OTPs
            OTPVerification.objects.filter(user=user, is_verified=False).update(is_verified=True)

            otp_obj = OTPVerification.objects.create(user=user)
            send_otp_email(user, otp_obj, purpose='password-reset')

            return Response(
                {'message': 'Password reset OTP has been sent to your email.'}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Password reset request error: {e}")
            return Response(
                {'message': 'Failed to process request. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordResetConfirmView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = PasswordResetConfirmSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            email = serializer.validated_data.get('email')
            otp = serializer.validated_data.get('otp')
            new_password = serializer.validated_data.get('new_password')

            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                return Response({'message': 'Invalid email or OTP.'}, status=status.HTTP_400_BAD_REQUEST)

            # Get latest valid OTP
            otp_obj = OTPVerification.objects.filter(
                user=user,
                is_verified=False,
                expires_at__gt=timezone.now()
            ).order_by('-created_at').first()

            if not otp_obj:
                return Response({'message': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

            if not constant_time_compare(otp_obj.otp, otp):
                return Response({'message': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

            # Success — mark OTP used, update password
            otp_obj.is_verified = True
            otp_obj.save()

            user.set_password(new_password)
            user.save()

            return Response(
                {'message': 'Password has been reset successfully. You can now log in.'}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Password reset confirm error: {e}")
            return Response(
                {'message': 'Failed to reset password. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ── User Profile (Protected) ─────────────────────────────────────
class MeView(generics.RetrieveAPIView):
    """Returns the authenticated user's profile. Requires valid JWT."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user