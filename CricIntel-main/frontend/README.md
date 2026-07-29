# CricIntel Frontend

React SPA for the CricIntel Playing XI prediction system.

## Tech Stack

- React 18
- React Router 6
- Axios
- Recharts (charts — future phase)
- Vite (build tool)

## Architecture

Layer 1 — UI only. No ML logic. All data via REST API calls to Django backend.

```
src/
├── pages/       → Route-level page components
├── components/  → Reusable UI components (Navbar, Footer)
├── layouts/     → Page layout wrappers
├── services/    → Axios API client and endpoint services
├── hooks/       → Custom React hooks
├── context/     → Global state (prediction context)
├── routes/      → React Router configuration
├── utils/       → Helper functions
└── styles/      → Global styles (future phase)
```

## Setup

```bash
npm install
npm run dev
```

Dev server runs at http://localhost:5173 with API proxy to http://localhost:8000.

## Pages

| Route | Page | Status |
|-------|------|--------|
| `/` | Home | Coming Soon |
| `/predict` | Predict XI | Coming Soon |
| `/results` | Results | Coming Soon |
| `/players/:id` | Player Details | Coming Soon |
| `/about` | About | Coming Soon |
| `*` | 404 | Coming Soon |

## TODO

- [ ] Implement prediction form (format, opponent, venue, date)
- [ ] Display prediction results with Recharts
- [ ] Player detail page with stats
- [ ] Add global styling and responsive design
