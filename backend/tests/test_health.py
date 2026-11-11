"""Smoke tests for the application skeleton and configuration."""

import pytest
from fastapi.testclient import TestClient

from core.config import Settings


@pytest.fixture()
def client() -> TestClient:
    from main import app

    return TestClient(app)


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_db_reports_reachable(client: TestClient) -> None:
    response = client.get("/api/v1/health/db")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "reachable"}


def test_settings_fail_fast_without_database_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("JWT_SECRET", "test-secret-that-is-long-enough-for-validation")
    with pytest.raises(Exception):
        Settings(_env_file=None)


def test_settings_reject_short_jwt_secret(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/agrimind")
    monkeypatch.setenv("JWT_SECRET", "too-short")
    with pytest.raises(Exception):
        Settings(_env_file=None)


def test_migration_url_prefers_unpooled(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql://u:p@host-pooler.neon.tech/db")
    monkeypatch.setenv("DATABASE_URL_UNPOOLED", "postgresql://u:p@host.neon.tech/db")
    monkeypatch.setenv("JWT_SECRET", "test-secret-that-is-long-enough-for-validation")
    settings = Settings(_env_file=None)
    assert "pooler" not in settings.migration_url
