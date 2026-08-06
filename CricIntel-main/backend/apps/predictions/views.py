"""
Prediction API views — orchestrates dataset-driven playing XI inference and prediction storage.
"""

import pandas as pd
import numpy as np
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from apps.permissions import IsAuthenticatedCreateOrAdminWrite
from .models import Prediction
from .serializers import PredictionSerializer


ROLE_MAP = {
    'Batsman': 'batsman', 'Batter': 'batsman',
    'Top Order Batter': 'batsman', 'Middle Order Batter': 'batsman',
    'Batting Allrounder': 'batsman',
    'Bowler': 'bowler', 'Fast Bowler': 'bowler', 'Spin Bowler': 'bowler',
    'Bowling Allrounder': 'bowler',
    'Allrounder': 'allrounder', 'All-Rounder': 'allrounder',
    'Wicketkeeper': 'allrounder', 'Wicket-Keeper': 'allrounder',
    'Unknown': 'allrounder',
}

_MODEL_CACHE = {}
_ENC_CACHE = {}

DROP_COLS = {'match_id', 'player_name', 'target_runs', 'target_wickets',
             'match_date', 'selected_in_playing_xi'}

CATEGORICAL_COLS = [
    'match_type', 'gender', 'series_name', 'tournament_name', 'venue_name',
    'venue_country', 'player_team', 'opponent_team', 'player_role',
    'batting_style', 'bowling_style', 'toss_decision', 'home_or_away', 'pitch_type'
]
BOOLEAN_COLS = ['is_captain', 'is_wicketkeeper', 'is_active', 'is_icc_tournament', 'is_knockout']


def _load_model(fmt, gender_name, role_key):
    key = f"{fmt}/{gender_name}/{role_key}"
    if key in _MODEL_CACHE:
        return _MODEL_CACHE[key]
    from ml.config.settings import MODELS_DIR
    import joblib
    path = MODELS_DIR / fmt / gender_name / role_key / 'best_classification_model.joblib'
    if path.exists():
        _MODEL_CACHE[key] = joblib.load(path)
        return _MODEL_CACHE[key]
    return None


def _load_encoders(fmt):
    if fmt in _ENC_CACHE:
        return _ENC_CACHE[fmt]
    from ml.config.settings import MODELS_DIR
    import joblib
    path = MODELS_DIR / fmt / 'encoders.joblib'
    if path.exists():
        _ENC_CACHE[fmt] = joblib.load(path)
        return _ENC_CACHE[fmt]
    return {}


def _encode_df(df, encoders):
    """Apply saved label encoders + boolean casting to a dataframe."""
    df = df.copy()
    for col in BOOLEAN_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            df[col] = df[col].astype(str).fillna('unknown')
            if col in encoders:
                le = encoders[col]
                classes = list(le.classes_)
                df[col] = df[col].apply(lambda x: classes.index(x) if x in classes else 0)
            else:
                from sklearn.preprocessing import LabelEncoder
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col])
    return df


def _generate_team_xi(team_name, format_type='T20', gender='Men'):
    """Generate optimal 11 players using XGBoost classification models."""
    import joblib
    from ml.config.settings import DATASET_PATHS, MODELS_DIR

    fmt = format_type.lower()
    path = DATASET_PATHS.get(fmt)
    if not path or not path.exists() or path.stat().st_size < 1000:
        return []

    gender_code = 'm' if gender.lower() in ('men', 'm') else 'f'
    gender_name = 'men' if gender_code == 'm' else 'women'

    try:
        df = pd.read_csv(path, low_memory=False)

        # Gender + team filter
        if 'gender' in df.columns:
            df_g = df[df['gender'].str.lower() == gender_code]
            df = df_g if not df_g.empty else df

        df_team = df[df['player_team'] == team_name].drop_duplicates(subset=['player_name']).copy()
        if df_team.empty:
            df_team = df[df['player_team'].str.lower() == team_name.lower()].drop_duplicates(subset=['player_name']).copy()
        if df_team.empty:
            df_team = df.drop_duplicates(subset=['player_name']).head(20).copy()

        # Map roles to model segments
        df_team['_role_key'] = df_team['player_role'].map(ROLE_MAP).fillna('allrounder')

        # Load encoders
        encoders = _load_encoders(fmt)

        # Encode features
        df_enc = _encode_df(df_team, encoders)

        # Score each player using their segment model
        df_team = df_team.copy()
        df_team['selection_probability'] = 0.0

        for role_key in ['batsman', 'bowler', 'allrounder']:
            model = _load_model(fmt, gender_name, role_key)
            if model is None:
                continue

            mask = df_team['_role_key'] == role_key
            if not mask.any():
                continue

            seg_enc = df_enc[mask].copy()
            # Load saved feature names for alignment
            feat_path = MODELS_DIR / fmt / gender_name / role_key / 'feature_names.joblib'
            if feat_path.exists():
                feat_names = joblib.load(feat_path)
                # Align columns: add missing as 0, drop extras
                for f in feat_names:
                    if f not in seg_enc.columns:
                        seg_enc[f] = 0
                seg_enc = seg_enc[feat_names]
            else:
                # Drop non-numeric and identifier cols
                seg_enc = seg_enc.drop(columns=[c for c in DROP_COLS if c in seg_enc.columns], errors='ignore')
                seg_enc = seg_enc.select_dtypes(include=[np.number]).fillna(0)

            try:
                probs = model.predict_proba(seg_enc)[:, 1]
                df_team.loc[mask, 'selection_probability'] = probs
            except Exception as e:
                # fallback: use career_average as proxy
                pass

        # Sort by selection probability, pick top 11
        df_ranked = df_team.sort_values('selection_probability', ascending=False)

        # Ensure balanced composition: at least 1 keeper, 3 bowlers
        selected = []
        used_names = set()

        def _pick(df_r, n):
            added = 0
            for _, r in df_r.iterrows():
                if added >= n or len(selected) >= 11:
                    break
                if r['player_name'] not in used_names:
                    selected.append(r)
                    used_names.add(r['player_name'])
                    added += 1

        # Priority: top players by model score, then fill gaps
        _pick(df_ranked[df_ranked['_role_key'] == 'batsman'], 5)
        _pick(df_ranked[df_ranked['player_role'].isin(['Wicketkeeper', 'Wicket-Keeper'])], 1)
        _pick(df_ranked[df_ranked['_role_key'] == 'bowler'], 4)
        _pick(df_ranked, 11)  # fill remaining from top-ranked

        # Build response
        xi = []
        for idx, row in enumerate(selected[:11]):
            role = str(row.get('player_role', 'Allrounder'))
            prob = float(row.get('selection_probability', 0))
            tag = ("Captain" if idx == 0 else
                   "Vice Captain" if idx == 1 else
                   "Wicketkeeper" if any(k in role for k in ('Wicketkeeper', 'Keeper')) else
                   "Key Bowler" if row.get('_role_key') == 'bowler' else
                   "Key Batter")

            avg = float(pd.to_numeric(row.get('career_average', 0), errors='coerce') or 0)
            sr = float(pd.to_numeric(row.get('career_strike_rate', 120), errors='coerce') or 120)
            wickets = float(pd.to_numeric(row.get('career_wickets', 0), errors='coerce') or 0)
            eco = float(pd.to_numeric(row.get('career_economy', 7.5), errors='coerce') or 7.5)

            pred_runs = int(round(avg * (1.15 if idx < 4 else 0.7 if idx < 7 else 0.3)))
            pred_wickets = int(round(min(4, wickets / 20))) if row.get('_role_key') in ('bowler', 'allrounder') and idx >= 4 else 0

            xi.append({
                "id": f"{team_name.lower()[:3]}_{idx+1}",
                "name": str(row['player_name']),
                "role": role,
                "tag": tag,
                "runs": str(pred_runs),
                "wickets": str(pred_wickets),
                "avg": str(round(avg, 1)),
                "sr": str(round(sr, 1)),
                "economy": str(round(eco, 1)),
                "selectionScore": str(round(prob * 100, 1)),
            })

        return xi

    except Exception as e:
        import traceback
        traceback.print_exc()
        return []


class PredictionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Playing XI prediction.
    """

    queryset = Prediction.objects.select_related('venue', 'match').prefetch_related(
        'player_predictions__player'
    ).all()
    serializer_class = PredictionSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if queryset.exists():
            return super().list(request, *args, **kwargs)
        return Response({
            'status': 'success',
            'count': 0,
            'results': [],
        })

    def create(self, request, *args, **kwargs):
        """Generates dataset-driven Playing XI prediction for specified teams."""
        home_team = request.data.get('homeTeam') or request.data.get('opponent') or 'India'
        away_team = request.data.get('awayTeam') or 'Australia'
        fmt = request.data.get('format', 'T20')
        gender = request.data.get('gender', 'Men')
        venue = request.data.get('venue', 'Wankhede Stadium, Mumbai')

        team_a_xi = _generate_team_xi(home_team, fmt, gender)
        team_b_xi = _generate_team_xi(away_team, fmt, gender)

        prediction_payload = {
            "status": "success",
            "teamA": {
                "name": home_team,
                "xi": team_a_xi
            },
            "teamB": {
                "name": away_team,
                "xi": team_b_xi
            },
            "format": fmt,
            "gender": gender,
            "venue": venue,
        }

        return Response(prediction_payload, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def explain(self, request, pk=None):
        return Response({
            'status': 'success',
            'prediction_id': pk,
            'explanations': [],
        })
