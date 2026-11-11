"""Database engine and session management.

Uses the pooled Neon connection string at runtime, with `pool_pre_ping` and a
short connect timeout so a suspended Neon branch cold-starts cleanly instead of
hanging (`docs/architecture.md` §9, `docs/database-design.md` §18.1).
"""

from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from core.config import get_settings

_settings = get_settings()

engine: Engine = create_engine(
    str(_settings.database_url),
    pool_pre_ping=True,
    connect_args={"connect_timeout": 10},
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """FastAPI dependency yielding a scoped session per request."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
