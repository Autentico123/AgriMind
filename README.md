# 🌾 AgriMind

An AI-driven, weather-aware farm decision support application for Filipino smallholder farmers, with a companion web dashboard for agricultural administrators.

AgriMind turns per-farm weather forecasts into **per-crop, localized, explainable farming advice** — and keeps working when the connection drops.

---

## Why it exists

Farmers time planting, irrigation, fertilizer application, and harvest using experience, tradition, or generic weather apps. Those forecasts show numbers, not decisions: 85% rain means something different for rice at the vegetative stage than for tomato at flowering. The result is mistimed operations, wasted inputs, and avoidable losses.

AgriMind answers the question a farmer actually has: **what should I do on this farm, for this crop, this week?**

---

## How it works

```text
One farmer → many farms → many crops
                  │
                  └─ one weather forecast per farm, shared by all its crops
                     one AI recommendation per crop
```

| Layer | Technology |
|---|---|
| Farmer mobile app | Expo (React Native + TypeScript), offline-first with SQLite cache |
| Admin web dashboard | React + Vite (TypeScript), online-only, English-only |
| Backend API | FastAPI, Pydantic v2, SQLAlchemy, Alembic |
| Cloud database | PostgreSQL (Neon) — source of truth |
| Local database | SQLite on the device — offline cache and sync outbox |
| Weather | Open-Meteo, behind a swappable `WeatherProvider` interface |
| Deployment | Docker |

### Two AI components, kept strictly separate

1. **Deterministic knowledge-base rule engine** — produces advice text, `recommendation_type`, `risk_level`, `health_status`, and `confidence_score`. Plain JSON rules resolved by crop type, category, growth stage, and priority. Same input always yields the same output, and it runs offline.
2. **scikit-learn Random Forest** — produces `predicted_harvest_date` and `predicted_yield` only. It never decides risk or health.

There is no runtime LLM, RAG, embedding store, or vector search anywhere in the advice path.

---

## Core farmer workflow

```text
Register / Login
   → Add Farm (GPS + map)
      → Fetch Farm Weather
         → Add Crops & Growth Stages
            → Generate Per-Crop AI Recommendations & Weather Risk
               → Log Farm Records & View Alerts
```

---

## Features

**Farmer mobile app**

- Authentication with email/password and Google sign-in; profile, password change, language preference
- Farm management with GPS map picker, soft delete, and Trash restore
- Crops with growth stages, health badges, and weather-risk badges
- Weather dashboard: current, hourly, 7-day, manual refresh, offline cache with stale indicator
- AI recommendations with confidence scores, a "Why?" reasoning trace, harvest/yield prediction, and full history
- Weather alerts and notifications with severity, affected crops, and unread badge
- Farm records timeline per crop
- English, Filipino, and Cebuano UI and advice
- Offline caching and queued sync with conflict reporting

**Admin web dashboard**

- Dashboard and analytics: farmers, farms, crops, health and risk distributions
- User management with activation, deactivation, and soft delete
- Knowledge base: articles plus optional weather rules with a visual threshold editor and rule preview
- Announcements and advisories with scheduling windows
- Append-only audit logs with filters and CSV export

---

## Repository layout

```text
backend/    FastAPI app — routers, schemas, services, repositories, domain engines, models
admin/      React + Vite admin dashboard
mobile/     Expo React Native farmer app
tests/      Cross-application and end-to-end tests
infra/      Deployment and infrastructure configuration
scripts/    Local development and verification scripts
```

Backend layering is one-way: `routers → services → repositories → models`. Domain engines are pure functions with no I/O.

---

## Getting started

### Prerequisites

- Node.js 20+ and npm
- Python 3.12+
- A PostgreSQL database (Neon free tier is sufficient)

### Setup

```bash
git clone <repository-url>
cd AgriMind
cp .env.example .env      # then fill in real values
scripts/setup.sh          # creates the venv and installs all dependencies
```

### Run

```bash
scripts/dev.sh backend    # http://localhost:8000  (docs at /docs)
scripts/dev.sh admin      # http://localhost:5173
scripts/dev.sh mobile     # Expo dev server
```

### Check

```bash
scripts/check.sh          # backend tests, admin typecheck + build, mobile typecheck
```

Backend health probe: `GET /api/v1/health` → `{"status":"ok"}`

---

## Configuration

All configuration comes from environment variables; the app fails fast when a required one is missing.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Neon connection string used at runtime |
| `DATABASE_URL_DIRECT` | Direct connection string used by Alembic migrations |
| `JWT_SECRET` | Signing secret, minimum 32 characters |
| `ACCESS_TOKEN_MINUTES` | Access token lifetime (default 15) |
| `REFRESH_TOKEN_DAYS` | Refresh token lifetime (default 7) |
| `APP_ENV` | `development`, `test`, or `production` |
| `LOG_LEVEL` | `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL` |
| `CORS_ORIGINS` | Allowed origins for the admin app |
| `VITE_API_BASE_URL` | API base URL for the admin build |
| `EXPO_PUBLIC_API_BASE_URL` | API base URL for the mobile app |

Never commit `.env` or real secrets.

---

## Security model

- Passwords hashed with bcrypt; never stored or logged in plaintext
- JWT access token (15 min) plus opaque refresh token (7 days) stored **hashed** in `UserSessions`
- Refresh tokens revoked on logout, password change, and password reset
- Resource ownership enforced server-side on every farmer endpoint
- `role = 'Admin'` enforced server-side on all `/api/v1/admin/*` routes; `role` is ignored in client payloads
- Inactive accounts cannot authenticate
- Admin actions recorded in append-only `AuditLogs`
- All database access goes through the ORM and repository layer

---

## Project status

Under active development. The backend, admin, and mobile applications are scaffolded; feature work is tracked phase by phase against the implementation roadmap.

| Area | Status |
|---|---|
| Repository and tooling | Complete |
| Backend foundation | In progress |
| Authentication, farms, crops, weather | Planned |
| Knowledge base engine and recommendations | Planned |
| Alerts, records, offline sync | Planned |
| Admin modules | Planned |
| Localization, integration testing, deployment | Planned |

---

## Scope boundaries

Deliberately **not** part of this system:

- Runtime LLM, generative chat, RAG, embeddings, or vector search
- Computer-vision plant disease detection or OCR
- IoT sensor integration
- E-commerce, marketplace, payments, or social features
- Offline mode or localization for the admin dashboard

---

## Documentation

The design specifications, data model, API contract, AI engine rules, and build roadmap are maintained in `docs/` and are the source of truth for behavior, data, and visuals. Implementation follows them.

---

## License

Academic capstone project. See `LICENSE` where applicable.
