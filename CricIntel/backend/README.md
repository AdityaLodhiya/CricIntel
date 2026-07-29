# CricIntel Backend

Django REST API backend for the CricIntel Playing XI prediction system.

## Architecture

This backend follows **Clean Architecture** with strict layer separation:

```
apps/          → Layer 2: REST APIs, serializers, orchestration
ml/            → Layer 3: Feature engineering, training, prediction (no Django imports)
datasets/      → Layer 4: Raw, processed, and feature data storage
pipelines/     → Layer 5: Offline training and online inference orchestration
database/      → Layer 4: DB migration scripts, seeds, backups
```

## Django Apps

| App | Purpose |
|-----|---------|
| `players` | Indian player registry and profiles |
| `matches` | International match records |
| `venues` | Cricket stadium/ground data |
| `performances` | Per-player per-match statistics |
| `predictions` | Playing XI prediction requests and results |
| `weather` | Cached weather data from OpenWeatherMap |
| `analytics` | Aggregated format-level statistics |

## Setup

```bash
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Configure PostgreSQL credentials
python manage.py migrate
python manage.py runserver
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/players/` | Player CRUD |
| GET/POST | `/api/matches/` | Match CRUD |
| GET/POST | `/api/venues/` | Venue CRUD |
| GET/POST | `/api/predict/` | Playing XI prediction |
| GET/POST | `/api/weather/` | Weather cache |
| GET/POST | `/api/analytics/` | Format statistics |

## ML Pipeline

### Offline (Training)

```
parse_cricsheet → build_player_stats → build_features → train_models → evaluate_models
```

### Online (Inference)

```
load_models → predict_xi → team_optimizer → explain_prediction
```

## TODO

- [ ] Wire PredictionViewSet.create() to pipelines.online.predict_xi
- [ ] Add Django migrations for all models
- [ ] Implement Cricsheet parser
- [ ] Build feature engineering pipeline
- [ ] Train format-specific models
