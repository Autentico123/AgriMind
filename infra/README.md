# AgriMind — Infrastructure

Deployment and container configuration for AgriMind.

## Planned contents

| File | Purpose |
|---|---|
| `Dockerfile.backend` | FastAPI image; runs migrations before start |
| `Dockerfile.admin` | Builds the Vite admin app and serves the static bundle |
| `docker-compose.yml` | Local stack: backend + admin against a PostgreSQL instance |

## Deployment topology

- **Backend:** FastAPI in Docker, connected to PostgreSQL via `DATABASE_URL`; migrations run before start.
- **Admin:** static Vite build served over HTTPS, talking to the backend.
- **Mobile:** Expo build for Android/iOS; SQLite ships inside the app.
- **Database:** Neon serverless PostgreSQL — pooled connection for runtime, direct connection for migrations.

## Rules

- Never bake secrets into images; inject configuration through environment variables at runtime.
- Keep the runtime connection pooled (`pool_pre_ping=True`, `connect_timeout=10`) and use the direct
  connection string only for Alembic.
- This directory holds deployment configuration only — application code stays in `backend/`, `admin/`,
  and `mobile/`.
