"""Smoke tests for the Phase 0 backend skeleton."""

import pytest
from fastapi.testclient import TestClient

from core.config import Settings


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/agrimind")
    monkeypatch.setenv("JWT_SECRET", "test-secret-that-is-long-enough-for-validation")
    from main import app

    return TestClient(app)


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_settings_fail_fast_without_database_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("JWT_SECRET", "test-secret-that-is-long-enough-for-validation")
    with pytest.raises(Exception):
        Settings(_env_file=None)
