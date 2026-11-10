"""FastAPI application entry point.

Routers only handle HTTP; business logic belongs in `services/`
(`docs/architecture.md` §2.3). This file wires configuration, logging, CORS and
the health probe used by Phase 0 acceptance checks.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
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
    """Liveness probe for local development and deployment checks."""
    return {"status": "ok"}
