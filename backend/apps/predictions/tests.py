from django.test import TestCase
from rest_framework.test import APIClient


class PredictionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_predict_placeholder(self):
        response = self.client.post('/api/predict/', {
            'format': 'ODI',
            'opponent': 'Australia',
            'match_date': '2026-07-15',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'placeholder')
