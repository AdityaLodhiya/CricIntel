# CricIntel

**AI Powered Indian Playing XI Prediction System**

CricIntel predicts the best Indian Playing XI for upcoming international cricket matches across Test, ODI, and T20I formats.

## Project Status

**Phase: Foundation** — Project scaffold only. No ML, prediction logic, or business logic implemented yet.

## Architecture

CricIntel follows **Clean Architecture** with five distinct layers:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Frontend | `frontend/` | UI, navigation, API calls, state |
| Backend | `backend/apps/` | REST APIs, serializers, orchestration |
| Machine Learning | `backend/ml/` | Feature engineering, training, prediction |
| Data | `backend/datasets/`, `backend/database/` | Raw/processed data, DB scripts |
| Pipelines | `backend/pipelines/` | Offline training & online inference |

## Tech Stack

- **Frontend:** React, React Router, Axios, Recharts
- **Backend:** Python, Django, Django REST Framework
- **Database:** PostgreSQL
- **ML (future):** Random Forest, XGBoost, SHAP, Joblib
- **Data Sources:** Cricsheet JSON, OpenWeatherMap API

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints (Placeholders)

| Endpoint | Description |
|----------|-------------|
| `/api/players/` | Player listing and details |
| `/api/matches/` | Match listing and details |
| `/api/venues/` | Venue listing and details |
| `/api/predict/` | Playing XI prediction |
| `/api/weather/` | Weather cache |
| `/api/analytics/` | Format statistics |

## Directory Structure

See [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md) for detailed structure.

## TODO

- [ ] Implement Cricsheet data parsing pipeline
- [ ] Build feature engineering modules
- [ ] Train format-specific models (Test, ODI, T20I)
- [ ] Implement team optimizer
- [ ] Add SHAP explainability
- [ ] Integrate OpenWeatherMap API
- [ ] Build prediction UI workflow
- [ ] Add authentication (future phase)

## License

Proprietary — CricIntel Project
