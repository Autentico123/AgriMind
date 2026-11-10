"""Application settings loaded from the environment.

Fails fast at import time when a required variable is missing, as required by
`docs/implementation-roadmap.md` Phase 0.1.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: Literal["development", "test", "production"] = "development"
    log_level: str = "INFO"

    # Runtime uses the pooled Neon connection string.
    database_url: PostgresDsn
    # Alembic uses the direct (non-pooled) connection string.
    database_url_direct: PostgresDsn | None = None

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


@lru_cache
def get_settings() -> Settings:
    return Settings()
