"""Deterministic fake provider for tests and offline development.

Fixtures are fixed so assertions on weather-driven behaviour stay reproducible
(`AGENTS.md` §13: `WeatherProvider` fake seam).
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from decimal import Decimal

from domain.weather import (
    FarmForecast,
    ForecastType,
    WeatherCondition,
    WeatherProviderError,
    WeatherReading,
)

# A rainy day in Bohol, matching the prototype's demo values.
RAINY_CURRENT = WeatherReading(
    forecast_date=datetime(2026, 8, 13, 8, 0, tzinfo=UTC),
    forecast_type=ForecastType.CURRENT,
    temperature=Decimal("29.00"),
    humidity=88,
    rain_probability=85,
    wind_speed=Decimal("18.00"),
    weather_condition=WeatherCondition.RAINY.value,
)


def _hourly(base: datetime, count: int = 5) -> tuple[WeatherReading, ...]:
    readings = []
    for i in range(count):
        readings.append(
            WeatherReading(
                forecast_date=base + timedelta(hours=i),
                forecast_type=ForecastType.HOURLY,
                temperature=Decimal("29.00") - Decimal(i),
                humidity=88,
                rain_probability=max(0, 90 - i * 20),
                wind_speed=Decimal("18.00"),
                weather_condition=WeatherCondition.RAINY.value,
            )
        )
    return tuple(readings)


def _daily(base: datetime, count: int = 7) -> tuple[WeatherReading, ...]:
    return tuple(
        WeatherReading(
            forecast_date=base + timedelta(days=i),
            forecast_type=ForecastType.DAILY,
            temperature=Decimal("27.00") + Decimal(i),
            humidity=None,
            rain_probability=max(0, 90 - i * 12),
            wind_speed=Decimal("18.00"),
            weather_condition=WeatherCondition.RAINY.value,
        )
        for i in range(count)
    )


class FakeWeatherProvider:
    """Returns a fixed forecast, or raises when configured to fail."""

    name = "fake"

    def __init__(self, *, should_fail: bool = False) -> None:
        self.should_fail = should_fail
        self.call_count = 0

    def fetch_forecast(
        self,
        latitude: Decimal,
        longitude: Decimal,
        *,
        forecast_days: int = 7,
    ) -> FarmForecast:
        self.call_count += 1
        if self.should_fail:
            raise WeatherProviderError(
                "Weather service is unavailable. Please try again later."
            )

        base = RAINY_CURRENT.forecast_date
        return FarmForecast(
            latitude=latitude,
            longitude=longitude,
            current=RAINY_CURRENT,
            hourly=_hourly(base),
            daily=_daily(base, forecast_days),
        )
