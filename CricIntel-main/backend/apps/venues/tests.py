from django.test import TestCase
from rest_framework.test import APIClient


class VenueAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_venue_list_placeholder(self):
        response = self.client.get('/api/venues/')
        self.assertEqual(response.status_code, 200)
