"""AI recommendation history with per-row context snapshots.

Mirrors `database-design.md` §8.
"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.farms import Crop
    from models.knowledge import KnowledgeBase


class AIRecommendation(Base):
    """One recommendation row; the newest per crop is the current advice (§8)."""

    __tablename__ = "AIRecommendations"

    recommendation_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    crop_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Crops.crop_id", ondelete="CASCADE"), nullable=False
    )
    weather_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("WeatherCache.weather_id", ondelete="SET NULL")
    )
    recommendation_type: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation_text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    model_version: Mapped[str | None] = mapped_column(String(100))
    template_version: Mapped[str | None] = mapped_column(String(50))

    temperature_snapshot: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    humidity_snapshot: Mapped[int | None] = mapped_column(Integer)
    rain_probability_snapshot: Mapped[int | None] = mapped_column(Integer)
    wind_speed_snapshot: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    weather_condition_snapshot: Mapped[str | None] = mapped_column(String(100))
    growth_stage_snapshot: Mapped[str | None] = mapped_column(String(100))
    health_status_snapshot: Mapped[str | None] = mapped_column(Text)
    risk_level_snapshot: Mapped[str | None] = mapped_column(Text)

    predicted_harvest_date: Mapped[date | None] = mapped_column(Date)
    predicted_yield: Mapped[Decimal | None] = mapped_column(Numeric(8, 2))

    knowledge_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("KnowledgeBase.knowledge_id", ondelete="SET NULL")
    )
    knowledge_source: Mapped[str | None] = mapped_column(String(255))
    reasoning: Mapped[str | None] = mapped_column(Text)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    crop: Mapped[Crop] = relationship(back_populates="recommendations")
    knowledge: Mapped[KnowledgeBase | None] = relationship()

    __table_args__ = (
        CheckConstraint(
            "recommendation_type IN "
            "('Planting','Irrigation','Fertilizer','Harvest','Weather Risk','General Advice')",
            name="recommendation_type_values",
        ),
        CheckConstraint(
            "confidence_score >= 0 AND confidence_score <= 1",
            name="confidence_score_range",
        ),
        CheckConstraint(
            "health_status_snapshot IS NULL OR "
            "health_status_snapshot IN ('Healthy','At Risk','Critical')",
            name="recommendation_health_snapshot_values",
        ),
        CheckConstraint(
            "risk_level_snapshot IS NULL OR "
            "risk_level_snapshot IN ('Low','Moderate','High','Extreme')",
            name="recommendation_risk_snapshot_values",
        ),
        # Recommendation history lookup (§A.5): newest first per crop.
        Index(
            "ix_airecommendations_crop_generated",
            "crop_id",
            text("generated_at DESC"),
        ),
        Index("ix_airecommendations_weather_id", "weather_id"),
    )
