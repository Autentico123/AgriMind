"""Application settings loaded from the environment.

Fails fast at import time when a required variable is missing, as required by
`docs/implementation-roadmap.md` Phase 0.1.
"""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import AliasChoices, Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Environment files live at the repository root, one level above `backend/`.
_REPO_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    # `.env` holds local overrides; `.env.local` is written by `neon deploy`.
    model_config = SettingsConfigDict(
        env_file=(_REPO_ROOT / ".env", _REPO_ROOT / ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: Literal["development", "test", "production"] = "development"
    log_level: str = "INFO"

    # Runtime uses the pooled Neon connection string.
    database_url: PostgresDsn
    # Alembic uses the direct (non-pooled) connection string. Neon's CLI emits
    # this as DATABASE_URL_UNPOOLED.
    database_url_direct: PostgresDsn | None = Field(
        default=None,
        validation_alias=AliasChoices("database_url_direct", "database_url_unpooled"),
    )

    jwt_secret: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 15
    refresh_token_days: int = 7

    cors_origins: list[str] = []

    @field_validator("log_level")
    @classmethod
    def _upper_log_level(cls, value: str) -> str:
        level = value.upper()
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if level not in allowed:
            raise ValueError(f"log_level must be one of {sorted(allowed)}")
        return level

    @property
    def migration_url(self) -> str:
        """Connection string for Alembic: direct when available, else pooled."""
        return str(self.database_url_direct or self.database_url)


@lru_cache
def get_settings() -> Settings:
    return Settings()

