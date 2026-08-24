# CricIntel

<div align="center">

# CricIntel
### AI-Powered Cricket Analytics & Prediction Platform

**Historical cricket data → Machine learning → Match insights**

![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=111827)
![XGBoost](https://img.shields.io/badge/XGBoost-ML-189AB4?style=for-the-badge)
![REST API](https://img.shields.io/badge/REST-API-FF6B35?style=for-the-badge)
![Joblib](https://img.shields.io/badge/Joblib-Models-7B2CBF?style=for-the-badge)

**T20 • ODI • Test**

</div>

---

## Overview

**CricIntel** is a full-stack cricket analytics and machine learning platform that turns historical cricket data into practical match and player insights.

The platform combines a **React frontend**, **Django REST backend**, historical cricket datasets, and **15 trained XGBoost models**.

Instead of treating machine learning as an isolated notebook, CricIntel connects the complete pipeline:

```text
Historical Cricket Data
        ↓
Data Processing & Feature Engineering
        ↓
Offline ML Training
        ↓
Saved Joblib Models
        ↓
Django REST APIs
        ↓
React Frontend
        ↓
Predictions & Analytics
```

The system supports **T20, ODI, and Test cricket** with modules for Playing XI prediction, player performance, team matchups, venue intelligence, analytics, fixtures, and player profiles.

---

## Key Numbers

| Metric | Coverage |
|---|---:|
| Cricket Formats | **3** |
| XGBoost Models | **15** |
| Historical Matches | **8,000+** |
| Players | **3,000+** |
| Venues | **500+** |
| Runtime Model Retraining | **None** |

> Models are trained offline and saved as `.joblib` artifacts. Normal application runtime loads the trained models for inference instead of retraining them.

---

# Core Features

## 1. AI Playing XI Prediction

The main prediction module generates an optimal Playing XI using historical player information and match context.

The pipeline can use information such as:

- Recent form
- Career performance
- Opponent history
- Venue history
- Player role
- Batting and bowling characteristics
- Match format
- Match context

The ML predictions are combined with team-selection constraints to produce a balanced XI.

### Predicted Performance

Depending on the format and available model:

- Player selection probability
- Runs
- Wickets
- Strike rate
- Economy

The final XI is presented with player roles and selection information through the React interface.

---

## 2. Player Analytics

Player profiles provide historical performance information including:

- Batting average
- Strike rate
- Bowling economy
- Wickets
- Recent performance
- Opponent-related statistics
- Format-specific performance

---

## 3. Matchups

The Matchups module provides historical team and player comparison data.

It can analyze:

- Head-to-head performance
- Historical matchup statistics
- Runs
- Balls faced
- Dismissals
- Team dominance
- Venue-specific matchup context
- Performance splits

If sufficient historical data does not exist, the application can show an appropriate empty state rather than fabricate a result.

---

## 4. Venue Intelligence

Venue Intelligence focuses on how grounds have historically behaved.

Depending on available historical data, the module provides:

- First-innings average
- Second-innings average
- Bat-first win probability
- Bowl-first win probability
- Pace vs spin performance
- Venue trends
- Toss recommendation
- Historical scoring patterns

---

## 5. Historical Analytics

The Analytics module provides interactive visualizations across T20, ODI, and Test cricket.

It can be used to examine:

- Performance trends
- Format comparisons
- Batting statistics
- Bowling statistics
- Historical distributions
- Player/team performance patterns
- Heatmaps and comparative visualizations

Charts are populated through backend APIs rather than frontend-only demonstration datasets.

---

## 6. Fixtures

The Fixtures module presents available fixture information and connects selected matches with the prediction workflow.

A fixture can be used as the starting point for configuring a Playing XI prediction without manually entering every match parameter.

---

## 7. Dashboard

The Dashboard provides a high-level view of:

- Players in the dataset
- Venues covered
- Matches covered
- Model information
- Recent predictions
- Key cricket insights
- Navigation to major analytics modules

Dashboard statistics are retrieved from backend services rather than being hardcoded into the frontend.

---

# Machine Learning Architecture

CricIntel uses **XGBoost** for its machine learning components.

The system contains **15 independent trained models across three formats**.

```text
                    CricIntel ML System
                           │
          ┌────────────────┼────────────────┐
          │                │                │
         T20              ODI              Test
          │                │                │
      5 Models         5 Models         5 Models
```

The architecture separates model training from application runtime.

### Offline Training

```text
Dataset
   ↓
Cleaning
   ↓
Feature Engineering
   ↓
Train / Validation
   ↓
XGBoost Training
   ↓
Model Evaluation
   ↓
.joblib Model + Metadata
```

### Runtime Inference

```text
User Input
   ↓
Django API
   ↓
Feature Preparation
   ↓
Load .joblib Model
   ↓
XGBoost Inference
   ↓
Prediction / Analytics
   ↓
JSON Response
   ↓
React UI
```

The application does not retrain models during normal runtime.

---

# Data Pipeline

CricIntel is built around historical cricket data for:

- T20
- ODI
- Test

A simplified pipeline is:

```text
Raw Cricket Data
      ↓
Data Cleaning
      ↓
Match-Level Processing
      ↓
Player-Level Aggregation
      ↓
Feature Engineering
      ↓
Format-Specific Datasets
      ↓
Machine Learning
      ↓
Backend Analytics & Prediction
```

The project also contains synthetic datasets for workflows where they are explicitly configured, while production prediction and analytics flows use the configured final datasets.

---

# Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS
- Plotly / interactive visualization components

### Backend
- Python
- Django
- Django REST Framework
- REST APIs

### Machine Learning
- XGBoost
- Scikit-learn
- Pandas
- NumPy
- Joblib

### Data
- CSV
- JSON
- Historical cricket match data
- Player, match, venue, and performance datasets

### Development
- Git
- GitHub
- npm
- Python virtual environments

---

# Project Architecture

```text
CricIntel/
│
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── analytics/
│   │   ├── matches/
│   │   ├── players/
│   │   ├── predictions/
│   │   └── visualizations/
│   │
│   ├── ml/
│   │   ├── models/
│   │   └── config/
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   ├── package.json
│   └── vite.config.*
│
├── Dataset/
│   └── ...
│
└── README.md
```

---

# Backend API Layer

Major API groups include:

### Authentication

```text
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/verify-otp/
POST /api/auth/resend-otp/
POST /api/auth/forgot-password/
POST /api/auth/reset-password/
GET  /api/auth/me/
```

### Prediction

```text
GET  /api/predict/
POST /api/predict/
```

### Players

```text
GET /api/players/
GET /api/players/:id/
GET /api/players/:id/stats/
```

### Matches

```text
GET /api/matches/upcoming/
```

### Visualizations

```text
GET /api/visualizations/analytics/
GET /api/visualizations/matchup-radar/
GET /api/visualizations/venue-stats/
GET /api/visualizations/prediction-analysis/
```

### Model Information

```text
GET /api/analytics/model-info/
```

Routes can vary with the current backend configuration.

---

# Model Metadata

CricIntel stores model evaluation information separately from serialized model artifacts.

A metadata record can contain information such as:

```json
{
  "model": "XGBoost",
  "format": "T20",
  "accuracy": 88.52,
  "training_date": "YYYY-MM-DD",
  "dataset": "production_dataset"
}
```

The dashboard reads persisted model metadata rather than retraining or recalculating model performance during normal application runtime.

---

# Frontend ↔ Backend Flow

```text
React
  │
  │ HTTP / REST
  ▼
Django REST Framework
  │
  ├── Dataset Services
  ├── ML Inference
  ├── Analytics
  ├── Player Services
  ├── Venue Services
  └── Match Services
  │
  ▼
Historical Data + ML Models
```

The frontend focuses on interaction, state, visualization, and presentation.

The backend handles data access, feature preparation, ML inference, statistical calculations, and API responses.

---

# Playing XI Prediction Workflow

```text
1. User selects format
          ↓
2. User selects teams
          ↓
3. User selects venue
          ↓
4. Frontend sends prediction request
          ↓
5. Django validates request
          ↓
6. Candidate players are prepared
          ↓
7. Features are generated
          ↓
8. Pre-trained XGBoost models are loaded
          ↓
9. Predictions are generated
          ↓
10. Team selection constraints are applied
          ↓
11. Final Playing XI is returned
          ↓
12. React displays the result
```

---

# Validation & Quality

The system has been tested for:

- Model loading
- Inference stability
- Preprocessing consistency
- JSON serialization
- Prediction determinism
- Feature perturbation
- Boundary conditions
- Historical holdout evaluation
- Frontend/backend integration

Reported model metrics should always be interpreted according to the dataset, split strategy, target definition, and evaluation methodology used during training.

---

# Authentication

CricIntel includes:

- User registration
- Login
- OTP verification
- OTP resend
- Password recovery
- JWT authentication
- Authenticated user profile

The authentication flow is integrated between the React frontend and Django backend.

---

# Installation

## Prerequisites

Install:

- Python 3.x
- Node.js
- npm
- Git

## 1. Clone

```bash
git clone https://github.com/AdityaLodhiya/CricIntel.git
cd CricIntel
```

## 2. Backend

```bash
cd backend
python -m venv venv
```

### Windows

```bash
venv\Scriptsctivate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start Django:

```bash
python manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000/
```

## 3. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite normally serves the frontend at:

```text
http://localhost:5173/
```

---

# Environment Variables

Use a local `.env` file for secrets required by the current configuration.

Example:

```env
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=your_email
```

Never commit passwords, API keys, SMTP credentials, secret keys, or other sensitive values.

---

# Running the Application

### Terminal 1 — Backend

```bash
cd backend
venv\Scriptsctivate
python manage.py runserver
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Open the frontend URL provided by Vite.

---

# Development Principles

### Real data over fabricated data
Application statistics should come from datasets or backend calculations.

### Train offline, infer online
Models are trained separately and loaded during runtime.

### Backend owns data logic
Aggregations and ML inference should not be unnecessarily duplicated in React.

### Clear loading states
The UI distinguishes between:

```text
Loading
Success
Empty
Error
```

rather than using fake zero values.

### Minimal architectural changes
Working modules should not be rewritten without a clear reason.

---

# Future Improvements

Potential extensions include:

- Live cricket data integration
- Real-time weather integration
- Player injury and availability data
- More granular ball-by-ball matchup modeling
- Additional cricket formats and leagues
- Automated model retraining pipelines
- Model monitoring and drift detection
- Cloud deployment and scalable inference
- Advanced explainability using SHAP

---

# Contributors

**Aditya Lodhiya**  
Computer Science Student, LJ University

CricIntel was developed as a collaborative academic/project initiative.

---

# License

This project is currently intended for educational and portfolio purposes.

If the repository is distributed publicly, add an appropriate license file according to the intended usage.

---

<div align="center">

### CricIntel

**Historical Data × Machine Learning × Cricket Analytics**

</div>
