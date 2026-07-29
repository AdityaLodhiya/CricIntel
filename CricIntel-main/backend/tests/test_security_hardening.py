from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient


class SecurityHardeningTests(TestCase):
    def setUp(self):
        cache.clear()

    def test_anonymous_cannot_create_player(self):
        response = APIClient().post(
            '/api/players/',
            {
                'name': 'Test Player',
                'cricsheet_identifier': 'test-player',
                'role': 'BAT',
                'batting_style': 'RH',
                'bowling_style': 'NA',
                'is_active': True,
            },
            format='json',
        )

        self.assertIn(response.status_code, (401, 403))

    def test_non_staff_user_cannot_create_player(self):
        user = get_user_model().objects.create_user(
            email='user@example.com',
            password='StrongPass123',
            is_active=True,
        )
        client = APIClient()
        client.force_authenticate(user=user)

        response = client.post(
            '/api/players/',
            {
                'name': 'Test Player',
                'cricsheet_identifier': 'test-player',
                'role': 'BAT',
                'batting_style': 'RH',
                'bowling_style': 'NA',
                'is_active': True,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 403)

    def test_password_reset_request_does_not_reveal_unknown_email(self):
        response = APIClient().post(
            '/api/auth/password-reset/',
            {'email': 'missing@example.com'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data['message'],
            'If an account with that email exists, we have sent a password reset OTP.',
        )

    def test_login_failures_use_same_message_for_unknown_email_and_wrong_password(self):
        get_user_model().objects.create_user(
            email='known@example.com',
            password='CorrectPass123',
            is_active=True,
        )
        client = APIClient()

        unknown_email = client.post(
            '/api/auth/login/',
            {'email': 'missing@example.com', 'password': 'CorrectPass123'},
            format='json',
        )
        wrong_password = client.post(
            '/api/auth/login/',
            {'email': 'known@example.com', 'password': 'WrongPass123'},
            format='json',
        )

        self.assertEqual(unknown_email.status_code, 401)
        self.assertEqual(wrong_password.status_code, 401)
        self.assertEqual(unknown_email.data, wrong_password.data)

    def test_prediction_request_rejects_unsupported_opponent_characters(self):
        user = get_user_model().objects.create_user(
            email='predictor@example.com',
            password='StrongPass123',
            is_active=True,
        )
        client = APIClient()
        client.force_authenticate(user=user)

        response = client.post(
            '/api/predict/',
            {
                'format': 'ODI',
                'opponent': '<script>alert(1)</script>',
                'match_date': '2026-08-01',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('opponent', response.data)
