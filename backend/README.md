# AgriMind — Backend API

FastAPI service for AgriMind. Pydantic v2 schemas, SQLAlchemy ORM, Alembic migrations, PostgreSQL on Neon.

## Structure

```text
routers/        HTTP only — paths, auth dependencies, status codes, schema validation
schemas/        Pydantic request/response models
services/       business logic, ownership checks, transactions, orchestration
repositories/   all SQL; one per aggregate; no business rules
domain/         pure deterministic engines (RuleEngine, RiskEngine, AIResultValidator)
models/         SQLAlchemy entities mirroring the database design
core/           configuration and logging
tests/          unit and integration tests
```

Dependency direction is one-way: `routers → services → repositories → models`. `domain/` imports nothing from outer layers.

## Commands

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload --port 8000   # docs at /docs
.venv/bin/python -m pytest -q
```

Health probe: `GET /api/v1/health`

## Configuration

Settings load from environment variables and fail fast when required values are missing. See the repository `.env.example`.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled runtime connection string |
| `DATABASE_URL_DIRECT` | Direct connection string for Alembic |
| `JWT_SECRET` | Signing secret, minimum 32 characters |
| `APP_ENV` | `development`, `test`, `production` |
| `LOG_LEVEL` | Log verbosity; DEBUG is downgraded outside development |

## Rules

- Routers never import repositories; repositories never import services.
- Validate every input server-side with Pydantic.
- Enforce authentication, role, and ownership on every endpoint.
- Never return or log passwords, token hashes, or secrets.
- Logs are structured JSON on stdout.
