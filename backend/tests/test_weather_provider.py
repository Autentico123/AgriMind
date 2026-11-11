"""Weather provider seam.

Proves the domain never sees provider shapes, the fake is deterministic, the
adapter maps Open-Meteo correctly, and provider failures surface as a typed
error rather than a raw HTTP exception (`docs/architecture.md` §6).
"""

from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal

import httpx
import pytest

from domain.weather import (
    FarmForecast,
    ForecastType,
    WeatherCondition,
    WeatherProvider,
    WeatherProviderError,
    WeatherReading,
)
from services.weather_providers import FakeWeatherProvider, OpenMeteoProvider
from services.weather_providers.open_meteo import condition_from_wmo

LAT = Decimal("9.94000000")
LON = Decimal("124.27000000")


def _payload() -> dict:
    return {
        "latitude": 9.94,
        "longitude": 124.27,
        "timezone": "UTC",
        "current": {
            "time": "2026-08-13T08:00",
            "temperature_2m": 29.0,
            "relative_humidity_2m": 88,
            "precipitation_probability": 85,
            "wind_speed_10m": 18.0,
            "weather_code": 63,
        },
        "hourly": {
            "time": ["2026-08-13T08:00", "2026-08-13T09:00"],
            "temperature_2m": [29.0, 28.0],
            "relative_humidity_2m": [88, 90],
            "precipitation_probability": [90, 85],
            "wind_speed_10m": [18.0, 17.0],
            "weather_code": [63, 80],
        },
        "daily": {
            "time": ["2026-08-13", "2026-08-14"],
            "temperature_2m_max": [31.0, 32.0],
            "precipitation_probability_max": [90, 40],
            "wind_speed_10m_max": [20.0, 15.0],
            "weather_code": [63, 3],
        },
    }


def _client(payload: dict | None = None, *, status: int = 200) -> httpx.Client:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(status, json=payload or _payload())

    return httpx.Client(transport=httpx.MockTransport(handler))


# ── Domain contract ──────────────────────────────────────────────────────


def test_fake_provider_is_deterministic() -> None:
    provider = FakeWeatherProvider()
    first = provider.fetch_forecast(LAT, LON)
    second = provider.fetch_forecast(LAT, LON)
    assert first == second


def test_fake_provider_returns_current_hourly_daily() -> None:
    forecast = FakeWeatherProvider().fetch_forecast(LAT, LON, forecast_days=7)
    assert forecast.current.forecast_type is ForecastType.CURRENT
    assert all(r.forecast_type is ForecastType.HOURLY for r in forecast.hourly)
    assert all(r.forecast_type is ForecastType.DAILY for r in forecast.daily)
    assert len(forecast.daily) == 7
    assert forecast.current.rain_probability == 85
    assert forecast.current.weather_condition == WeatherCondition.RAINY.value


def test_fake_provider_can_fail() -> None:
    with pytest.raises(WeatherProviderError):
        FakeWeatherProvider(should_fail=True).fetch_forecast(LAT, LON)


def test_reading_rejects_out_of_range_values() -> None:
    with pytest.raises(ValueError, match="rain_probability"):
        WeatherReading(
            forecast_date=datetime.now(UTC),
            forecast_type=ForecastType.CURRENT,
            temperature=Decimal("29"),
            humidity=80,
            rain_probability=140,
            wind_speed=Decimal("10"),
            weather_condition="Rainy",
        )


def test_reading_rejects_negative_wind() -> None:
    with pytest.raises(ValueError, match="wind_speed"):
        WeatherReading(
            forecast_date=datetime.now(UTC),
            forecast_type=ForecastType.CURRENT,
            temperature=Decimal("29"),
            humidity=80,
            rain_probability=50,
            wind_speed=Decimal("-1"),
            weather_condition="Rainy",
        )


def test_fake_provider_satisfies_protocol() -> None:
    assert isinstance(FakeWeatherProvider(), WeatherProvider)


# ── WMO mapping ──────────────────────────────────────────────────────────


@pytest.mark.parametrize(
    ("code", "expected"),
    [
        (0, "Sunny"),
        (2, "Partly Cloudy"),
        (3, "Cloudy"),
        (45, "Fog"),
        (61, "Rainy"),
        (80, "Showers"),
        (95, "Thunderstorm"),
        (99, "Thunderstorm"),
        (None, "Unknown"),
        (1234, "Unknown"),
    ],
)
def test_condition_from_wmo(code: int | None, expected: str) -> None:
    assert condition_from_wmo(code) == expected


# ── Open-Meteo adapter ───────────────────────────────────────────────────


def test_open_meteo_maps_response_to_domain() -> None:
    provider = OpenMeteoProvider(client=_client())
    forecast = provider.fetch_forecast(LAT, LON)

    assert isinstance(forecast, FarmForecast)
    assert forecast.current.temperature == Decimal("29.00")
    assert forecast.current.humidity == 88
    assert forecast.current.rain_probability == 85
    assert forecast.current.wind_speed == Decimal("18.00")
    assert forecast.current.weather_condition == "Rainy"
    assert forecast.current.forecast_date == datetime(2026, 8, 13, 8, 0, tzinfo=UTC)

    assert len(forecast.hourly) == 2
    assert forecast.hourly[1].weather_condition == "Showers"
    assert len(forecast.daily) == 2
    assert forecast.daily[0].temperature == Decimal("31.00")
    assert forecast.daily[0].humidity is None


def test_open_meteo_sends_documented_parameters() -> None:
    captured: dict[str, str] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured.update(dict(request.url.params))
        return httpx.Response(200, json=_payload())

    provider = OpenMeteoProvider(
        client=httpx.Client(transport=httpx.MockTransport(handler))
    )
    provider.fetch_forecast(LAT, LON, forecast_days=7)

    assert captured["timezone"] == "UTC"
    assert captured["forecast_days"] == "7"
    assert captured["wind_speed_unit"] == "kmh"
    assert "precipitation_probability" in captured["current"]
    assert "weather_code" in captured["hourly"]
    assert "precipitation_probability_max" in captured["daily"]


def test_open_meteo_wraps_http_errors() -> None:
    provider = OpenMeteoProvider(client=_client(status=503))
    with pytest.raises(WeatherProviderError, match="unavailable"):
        provider.fetch_forecast(LAT, LON)


def test_open_meteo_wraps_network_errors() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("boom")

    provider = OpenMeteoProvider(
        client=httpx.Client(transport=httpx.MockTransport(handler))
    )
    with pytest.raises(WeatherProviderError):
        provider.fetch_forecast(LAT, LON)


def test_open_meteo_rejects_error_payload() -> None:
    provider = OpenMeteoProvider(
        client=_client({"error": True, "reason": "bad parameter"})
    )
    with pytest.raises(WeatherProviderError):
        provider.fetch_forecast(LAT, LON)


def test_open_meteo_rejects_incomplete_payload() -> None:
    provider = OpenMeteoProvider(client=_client({"current": {}}))
    with pytest.raises(WeatherProviderError, match="incomplete"):
        provider.fetch_forecast(LAT, LON)
