import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import OTPVerification

User = get_user_model()


def normalize_email(value):
    return User.objects.normalize_email(value).strip().lower()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_active')
        read_only_fields = fields

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, trim_whitespace=False)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name')

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value

    def validate_email(self, value):
        value = normalize_email(value)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists. Please log in.")
        return value

    def validate_first_name(self, value):
        return sanitize_name(value)

    def validate_last_name(self, value):
        return sanitize_name(value)

    def create(self, validated_data):
        # Create user as inactive initially
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_active=False
        )
        return user

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.RegexField(regex=r'^\d{6}$', required=True)

    def validate_email(self, value):
        return normalize_email(value)

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return normalize_email(value)

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return normalize_email(value)

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.RegexField(regex=r'^\d{6}$', required=True)
    new_password = serializers.CharField(write_only=True, required=True, trim_whitespace=False)

    def validate_email(self, value):
        return normalize_email(value)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value


def sanitize_name(value):
    if not value:
        return ''
    value = ''.join(char for char in value.strip() if char.isprintable())
    if not re.fullmatch(r"[A-Za-z][A-Za-z .'-]{0,149}", value):
        raise serializers.ValidationError('Use letters, spaces, periods, hyphens, or apostrophes only.')
    return value
