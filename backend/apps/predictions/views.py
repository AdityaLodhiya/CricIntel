"""
Prediction API views — orchestrates ML pipeline calls (future).

Layer 2 responsibility: receive request, delegate to online pipeline, persist result.
"""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Prediction
from .serializers import PredictionRequestSerializer, PredictionSerializer


class PredictionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Playing XI prediction.

    TODO: Orchestrate backend.pipelines.online.predict_xi on POST.
    TODO: Persist Prediction and PlayerPrediction records on completion.
    """

    queryset = Prediction.objects.select_related('venue', 'match').prefetch_related(
        'player_predictions__player'
    ).all()
    serializer_class = PredictionSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if queryset.exists():
            return super().list(request, *args, **kwargs)
        return Response({
            'status': 'placeholder',
            'message': 'Prediction API — Coming Soon',
            'count': 0,
            'results': [],
        })

    def create(self, request, *args, **kwargs):
        """Placeholder prediction endpoint — returns stub JSON."""
        input_serializer = PredictionRequestSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data

        return Response({
            'status': 'placeholder',
            'message': 'Playing XI Prediction — Coming Soon',
            'request': {
                'format': data['format'],
                'opponent': data['opponent'],
                'venue_id': data.get('venue_id'),
                'match_date': str(data['match_date']),
            },
            'playing_xi': [],
            'player_predictions': [],
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def explain(self, request, pk=None):
        """Placeholder for SHAP-based explanation retrieval."""
        return Response({
            'status': 'placeholder',
            'message': 'Prediction explanation — Coming Soon',
            'prediction_id': pk,
            'explanations': [],
        })
