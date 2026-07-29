from django.test import TestCase
from rest_framework.test import APIClient


class MatchAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_match_list_placeholder(self):
        response = self.client.get('/api/matches/')
        self.assertEqual(response.status_code, 200)
