"""FastAPI application entry point.

Routers only handle HTTP; business logic belongs in `services/`
(`docs/architecture.md` §2.3). This file wires configuration, logging, CORS and
the health probes.
"""

import logging

from fastapi import Depends, FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from core.config import get_settings
from core.database import get_db
from core.logging import configure_logging

settings = get_settings()
configure_logging(settings.log_level, settings.app_env)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="AgriMind API",
    version="0.1.0",
    description="Weather-aware farm decision support API.",
)

if settings.cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/api/v1/health", tags=["system"])
def health() -> dict[str, str]:
    """Liveness probe — does not touch the database."""
    return {"status": "ok"}


@app.get("/api/v1/health/db", tags=["system"])
def health_db(response: Response, db: Session = Depends(get_db)) -> dict[str, str]:
    """Readiness probe — confirms the database is reachable."""
    try:
        db.execute(text("select 1"))
    except SQLAlchemyError:
        logger.exception("database health check failed")
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "unavailable", "database": "unreachable"}
    return {"status": "ok", "database": "reachable"}
