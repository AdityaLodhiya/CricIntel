from django.test import TestCase
from rest_framework.test import APIClient


class AnalyticsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_analytics_list_placeholder(self):
        response = self.client.get('/api/analytics/')
        self.assertEqual(response.status_code, 200)
