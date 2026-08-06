from django.test import TestCase
from rest_framework.test import APIClient


class WeatherAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_weather_list_placeholder(self):
        response = self.client.get('/api/weather/')
        self.assertEqual(response.status_code, 200)
