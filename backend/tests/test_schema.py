"""Schema invariants required by `docs/database-design.md` §1-§17 and §A.

These run against a real PostgreSQL database because the schema relies on
JSONB path expressions, partial indexes, and named composite CHECK constraints
that SQLite cannot enforce. Set `AGRI MIND_TEST_DATABASE=1` (or point
`DATABASE_URL` at a disposable database) before running them.

Each test wraps its work in a transaction that is rolled back, so the database
is left unchanged.
"""

from __future__ import annotations

import json
from collections.abc import Iterator
from decimal import Decimal

import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from core.database import SessionLocal
from models import (
    AIRecommendation,
    Crop,
    CropType,
    Farm,
    GrowthStage,
    KnowledgeBase,
    User,
)


def _database_available() -> bool:
    """True when the configured PostgreSQL database answers a trivial query.

    The schema tests need a real PostgreSQL because the schema relies on JSONB
    path expressions, partial indexes, and named composite CHECK constraints
    that SQLite cannot enforce. When no database is reachable they are skipped
    rather than failed, so the suite still runs on a bare checkout.
    """
    try:
        with SessionLocal() as session:
            session.execute(text("select 1"))
        return True
    except SQLAlchemyError:
        return False


_DB_AVAILABLE = _database_available()

requires_database = pytest.mark.skipif(
    not _DB_AVAILABLE,
    reason="No PostgreSQL database reachable; set DATABASE_URL to run schema tests.",
)

EXPECTED_TABLES = {
    "AIRecommendations",
    "Announcements",
    "AuditLogs",
    "CropTypes",
    "Crops",
    "Devices",
    "FarmRecords",
    "Farms",
    "GrowthStages",
    "KnowledgeBase",
    "Notifications",
    "PasswordResetTokens",
    "SyncQueue",
    "UserSessions",
    "Users",
    "WeatherAlerts",
    "WeatherCache",
}


@pytest.fixture()
def db() -> Iterator[Session]:
    """Session whose work is rolled back after the test."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture()
def seeded(db: Session) -> dict[str, int]:
    """Create the minimum rows a crop needs, inside the rolled-back transaction."""
    user = User(
        first_name="Test",
        last_name="Farmer",
        email="schema-test@example.test",
        auth_provider="Local",
        password_hash="not-a-real-hash",
        role="Farmer",
        status="Active",
        preferred_language="en",
    )
    crop_type = CropType(crop_name="Rice", default_growing_days=120)
    db.add_all([user, crop_type])
    db.flush()

    stage = GrowthStage(
        crop_type_id=crop_type.crop_type_id,
        stage_name="Vegetative",
        sequence_order=1,
        is_risk_sensitive=True,
    )
    db.add(stage)
    db.flush()

    farm = Farm(
        user_id=user.user_id,
        farm_name="North Farm",
        latitude=Decimal("9.94000000"),
        longitude=Decimal("124.27000000"),
    )
    db.add(farm)
    db.flush()

    crop = Crop(
        farm_id=farm.farm_id,
        crop_type_id=crop_type.crop_type_id,
        planting_date="2026-07-20",
        growth_stage_id=stage.growth_stage_id,
    )
    db.add(crop)
    db.flush()

    return {
        "user_id": user.user_id,
        "crop_type_id": crop_type.crop_type_id,
        "growth_stage_id": stage.growth_stage_id,
        "farm_id": farm.farm_id,
        "crop_id": crop.crop_id,
    }


def _rule(**overrides: object) -> KnowledgeBase:
    defaults: dict[str, object] = {
        "category": "Irrigation",
        "title": "Skip irrigation when rain is likely",
        "content": "Rain supplies the water for this cycle.",
        "conditions": [
            [{"metric": "rain_probability", "operator": "gte", "value": 60}]
        ],
        "action_key": "SKIP_IRRIGATION",
        "status": "Published",
    }
    defaults.update(overrides)
    return KnowledgeBase(**defaults)


@requires_database
def test_all_documented_tables_exist(db: Session) -> None:
    rows = db.execute(
        text(
            "select table_name from information_schema.tables "
            "where table_schema = 'public' and table_type = 'BASE TABLE'"
        )
    ).scalars()
    present = set(rows)
    assert present >= EXPECTED_TABLES, f"missing: {sorted(EXPECTED_TABLES - present)}"


@requires_database
def test_named_composite_constraints_exist(db: Session) -> None:
    rows = db.execute(
        text(
            "select conname from pg_constraint "
            "where conname in ('users_auth_credential','kb_rule_complete',"
            "'kb_action_matches_category','kb_conditions_shape')"
        )
    ).scalars()
    assert set(rows) == {
        "users_auth_credential",
        "kb_rule_complete",
        "kb_action_matches_category",
        "kb_conditions_shape",
    }


@pytest.mark.parametrize(
    ("description", "overrides"),
    [
        ("conditions without action_key", {"action_key": None}),
        ("action_key without conditions", {"conditions": None}),
    ],
)
@requires_database
def test_kb_rule_complete(
    db: Session, seeded: dict[str, int], description: str, overrides: dict
) -> None:
    db.add(_rule(crop_type_id=seeded["crop_type_id"], **overrides))
    with pytest.raises(IntegrityError, match="kb_rule_complete"):
        db.flush()


@requires_database
def test_kb_action_matches_category(db: Session, seeded: dict[str, int]) -> None:
    db.add(
        _rule(
            crop_type_id=seeded["crop_type_id"],
            category="Fertilizer",
            action_key="SKIP_IRRIGATION",
        )
    )
    with pytest.raises(IntegrityError, match="kb_action_matches_category"):
        db.flush()


@pytest.mark.parametrize(
    "condition",
    [
        {"metric": "soil_ph", "operator": "gte", "value": 6},
        {"metric": "rain_probability", "operator": "equals", "value": 60},
    ],
)
@requires_database
def test_kb_conditions_shape(
    db: Session, seeded: dict[str, int], condition: dict
) -> None:
    db.add(_rule(crop_type_id=seeded["crop_type_id"], conditions=[[condition]]))
    with pytest.raises(IntegrityError, match="kb_conditions_shape"):
        db.flush()


@requires_database
def test_valid_rule_is_accepted(db: Session, seeded: dict[str, int]) -> None:
    rule = _rule(crop_type_id=seeded["crop_type_id"])
    db.add(rule)
    db.flush()
    assert rule.knowledge_id is not None
    assert json.dumps(rule.conditions).startswith("[[{")


@pytest.mark.parametrize(
    ("description", "fields"),
    [
        ("Local without password", {"auth_provider": "Local", "password_hash": None}),
        (
            "Google with password",
            {"auth_provider": "Google", "google_sub": "sub-1", "password_hash": "h"},
        ),
        (
            "Google as Admin",
            {"auth_provider": "Google", "google_sub": "sub-2", "role": "Admin"},
        ),
    ],
)
@requires_database
def test_users_auth_credential(db: Session, description: str, fields: dict) -> None:
    base = {
        "first_name": "A",
        "last_name": "B",
        "email": f"credential-{abs(hash(description))}@example.test",
        "role": "Farmer",
        "status": "Active",
        "preferred_language": "en",
    }
    base.update(fields)
    db.add(User(**base))
    with pytest.raises(IntegrityError, match="users_auth_credential"):
        db.flush()


@pytest.mark.parametrize(
    ("column", "value", "constraint"),
    [
        ("role", "Superuser", "role_values"),
        ("preferred_language", "fr", "language_values"),
        ("status", "Pending", "status_values"),
    ],
)
@requires_database
def test_user_enum_checks(
    db: Session, column: str, value: str, constraint: str
) -> None:
    fields = {
        "first_name": "A",
        "last_name": "B",
        "email": f"enum-{column}-{value}@example.test",
        "auth_provider": "Local",
        "password_hash": "h",
        "role": "Farmer",
        "status": "Active",
        "preferred_language": "en",
    }
    fields[column] = value
    db.add(User(**fields))
    with pytest.raises(IntegrityError, match=constraint):
        db.flush()


@pytest.mark.parametrize("confidence", [Decimal("1.01"), Decimal("-0.01")])
@requires_database
def test_confidence_score_range(
    db: Session, seeded: dict[str, int], confidence: Decimal
) -> None:
    db.add(
        AIRecommendation(
            crop_id=seeded["crop_id"],
            recommendation_type="Irrigation",
            recommendation_text="Irrigate.",
            confidence_score=confidence,
        )
    )
    with pytest.raises(IntegrityError, match="confidence_score_range"):
        db.flush()


@requires_database
def test_crop_enum_checks(db: Session, seeded: dict[str, int]) -> None:
    crop = db.get(Crop, seeded["crop_id"])
    assert crop is not None
    crop.risk_level = "Severe"
    with pytest.raises(IntegrityError, match="risk_level_values"):
        db.flush()


@requires_database
def test_farm_name_unique_per_active_farm(db: Session, seeded: dict[str, int]) -> None:
    db.add(
        Farm(
            user_id=seeded["user_id"],
            farm_name="North Farm",
            latitude=Decimal("9.94000000"),
            longitude=Decimal("124.27000000"),
        )
    )
    with pytest.raises(IntegrityError, match="uq_farms_user_id_farm_name_active"):
        db.flush()
