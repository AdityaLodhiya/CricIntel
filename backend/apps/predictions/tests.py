from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


class PredictionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='prediction-test@example.com',
            password='StrongPass123',
            is_active=True,
        )
        self.client.force_authenticate(user=self.user)

    def test_predict_placeholder(self):
        response = self.client.post('/api/predict/', {
            'format': 'ODI',
            'opponent': 'Australia',
            'match_date': '2026-07-15',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'placeholder')
