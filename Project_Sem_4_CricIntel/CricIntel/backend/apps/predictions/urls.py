from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PredictionViewSet

router = DefaultRouter()
router.register(r'', PredictionViewSet, basename='prediction')

urlpatterns = [
    path('', include(router.urls)),
]
