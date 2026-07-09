"""
Player app tests — placeholder.
"""

from django.test import TestCase
from rest_framework.test import APIClient


class PlayerAPITestCase(TestCase):
    """TODO: Add integration tests when business logic is implemented."""

    def setUp(self):
        self.client = APIClient()

    def test_player_list_placeholder(self):
        response = self.client.get('/api/players/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('status', response.data)
