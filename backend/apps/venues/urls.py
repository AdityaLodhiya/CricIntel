from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import VenueViewSet

router = DefaultRouter()
router.register(r'', VenueViewSet, basename='venue')

urlpatterns = [
    path('', include(router.urls)),
]
