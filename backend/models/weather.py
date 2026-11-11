"""Weather cache and derived severe-weather alerts.

Mirrors `database-design.md` §6 and §7.
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.farms import Farm


class WeatherCache(Base):
    """Shared weather rows for one farm (§6)."""

    __tablename__ = "WeatherCache"

    weather_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    farm_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Farms.farm_id", ondelete="CASCADE"), nullable=False
    )
    forecast_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    forecast_type: Mapped[str] = mapped_column(Text, nullable=False)
    temperature: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    humidity: Mapped[int | None] = mapped_column(Integer)
    rain_probability: Mapped[int | None] = mapped_column(Integer)
    wind_speed: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    weather_condition: Mapped[str | None] = mapped_column(String(100))
    last_synced: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    farm: Mapped[Farm] = relationship()

    __table_args__ = (
        CheckConstraint(
            "forecast_type IN ('Current','Hourly','Daily')",
            name="forecast_type_values",
        ),
        Index(
            "ix_weathercache_farm_type_date",
            "farm_id",
            "forecast_type",
            "forecast_date",
        ),
        Index("ix_weathercache_farm_expires", "farm_id", "expires_at"),
    )


class WeatherAlert(Base):
    """Severe-weather alerts derived from a stored forecast (§7)."""

    __tablename__ = "WeatherAlerts"

    alert_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    weather_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("WeatherCache.weather_id", ondelete="RESTRICT"),
        nullable=False,
    )
    farm_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Farms.farm_id", ondelete="CASCADE"), nullable=False
    )
    alert_type: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str | None] = mapped_column(String(200))
    message: Mapped[str | None] = mapped_column(Text)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "alert_type IN ('Heavy Rain','Flood','Strong Wind','Thunderstorm','Heat Wave')",
            name="alert_type_values",
        ),
        CheckConstraint(
            "severity IN ('Low','Moderate','High','Extreme')",
            name="alert_severity_values",
        ),
        Index("ix_weatheralerts_farm_starts", "farm_id", "starts_at"),
        Index("ix_weatheralerts_weather_id", "weather_id"),
    )
