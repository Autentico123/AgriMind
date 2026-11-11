"""Weather value objects and the provider interface.

Pure domain types with no I/O and no provider-specific shapes. Open-Meteo's
response format stops at the adapter; everything above this line works with
these objects (`docs/architecture.md` §6, `docs/ai-engine.md` §2).
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from typing import Protocol, runtime_checkable


class ForecastType(StrEnum):
    """Mirrors the `WeatherCache.forecast_type` CHECK enum."""

    CURRENT = "Current"
    HOURLY = "Hourly"
    DAILY = "Daily"


class WeatherCondition(StrEnum):
    """Stored `weather_condition` values.

    Derived from the provider's WMO code. The mapping lives in the adapter so a
    provider change never reaches the domain.
    """

    CLEAR = "Sunny"
    PARTLY_CLOUDY = "Partly Cloudy"
    CLOUDY = "Cloudy"
    FOG = "Fog"
    DRIZZLE = "Drizzle"
    RAINY = "Rainy"
    SHOWERS = "Showers"
    THUNDERSTORM = "Thunderstorm"
    STRONG_WIND = "Strong Wind"
    UNKNOWN = "Unknown"


@dataclass(frozen=True, slots=True)
class WeatherReading:
    """One forecast entry for a farm, in the units stored in `WeatherCache`."""

    forecast_date: datetime
    forecast_type: ForecastType
    temperature: Decimal | None
    humidity: int | None
    rain_probability: int | None
    wind_speed: Decimal | None
    weather_condition: str

    def __post_init__(self) -> None:
        if self.rain_probability is not None and not 0 <= self.rain_probability <= 100:
            raise ValueError("rain_probability must be between 0 and 100")
        if self.humidity is not None and not 0 <= self.humidity <= 100:
            raise ValueError("humidity must be between 0 and 100")
        if self.wind_speed is not None and self.wind_speed < 0:
            raise ValueError("wind_speed cannot be negative")


@dataclass(frozen=True, slots=True)
class FarmForecast:
    """The full forecast for one farm: current, hourly and daily entries."""

    latitude: Decimal
    longitude: Decimal
    current: WeatherReading
    hourly: tuple[WeatherReading, ...]
    daily: tuple[WeatherReading, ...]

    def all_readings(self) -> tuple[WeatherReading, ...]:
        return (self.current, *self.hourly, *self.daily)


class WeatherProviderError(RuntimeError):
    """Raised when a provider cannot supply a forecast.

    Carries a user-safe message; the underlying cause is logged, never returned
    to a client (`AGENTS.md` §17).
    """


@runtime_checkable
class WeatherProvider(Protocol):
    """Boundary every weather integration implements.

    A provider answers one question: given a coordinate, what is the forecast?
    It does not cache, persist, or decide freshness — `WeatherService` owns that
    (`docs/architecture.md` §3.1).
    """

    name: str

    def fetch_forecast(
        self,
        latitude: Decimal,
        longitude: Decimal,
        *,
        forecast_days: int = 7,
    ) -> FarmForecast:
        """Return current, hourly and daily readings for the coordinate."""
        ...
