"""Open-Meteo adapter.

Everything Open-Meteo-specific lives here: the URL, the parameter names, the
response shape, and the WMO code table. Nothing above this module sees any of it
(`docs/architecture.md` §6).
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from decimal import Decimal

import httpx

from domain.weather import (
    FarmForecast,
    ForecastType,
    WeatherCondition,
    WeatherProviderError,
    WeatherReading,
)

logger = logging.getLogger(__name__)

BASE_URL = "https://api.open-meteo.com/v1/forecast"

CURRENT_FIELDS = (
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation_probability",
    "wind_speed_10m",
    "weather_code",
)

HOURLY_FIELDS = (
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation_probability",
    "wind_speed_10m",
    "weather_code",
)

DAILY_FIELDS = (
    "temperature_2m_max",
    "precipitation_probability_max",
    "wind_speed_10m_max",
    "weather_code",
)

# WMO weather interpretation codes, grouped into the stored condition strings.
# Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes).
_WMO_CONDITIONS: dict[int, WeatherCondition] = {
    0: WeatherCondition.CLEAR,
    1: WeatherCondition.PARTLY_CLOUDY,
    2: WeatherCondition.PARTLY_CLOUDY,
    3: WeatherCondition.CLOUDY,
    45: WeatherCondition.FOG,
    48: WeatherCondition.FOG,
    51: WeatherCondition.DRIZZLE,
    53: WeatherCondition.DRIZZLE,
    55: WeatherCondition.DRIZZLE,
    56: WeatherCondition.DRIZZLE,
    57: WeatherCondition.DRIZZLE,
    61: WeatherCondition.RAINY,
    63: WeatherCondition.RAINY,
    65: WeatherCondition.RAINY,
    66: WeatherCondition.RAINY,
    67: WeatherCondition.RAINY,
    80: WeatherCondition.SHOWERS,
    81: WeatherCondition.SHOWERS,
    82: WeatherCondition.SHOWERS,
    95: WeatherCondition.THUNDERSTORM,
    96: WeatherCondition.THUNDERSTORM,
    99: WeatherCondition.THUNDERSTORM,
}


def condition_from_wmo(code: int | None) -> str:
    """Map a WMO code to the stored `weather_condition` string."""
    if code is None:
        return WeatherCondition.UNKNOWN.value
    return _WMO_CONDITIONS.get(code, WeatherCondition.UNKNOWN).value


def _decimal(value: float | int | None) -> Decimal | None:
    return None if value is None else Decimal(str(round(float(value), 2)))


def _int(value: float | int | None) -> int | None:
    return None if value is None else round(float(value))


def _parse_time(value: str) -> datetime:
    """Open-Meteo returns naive ISO timestamps in the requested timezone.

    Requests always ask for UTC, so the value is treated as UTC.
    """
    parsed = datetime.fromisoformat(value)
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


class OpenMeteoProvider:
    """`WeatherProvider` backed by the Open-Meteo forecast API."""

    name = "open-meteo"

    def __init__(
        self,
        *,
        base_url: str = BASE_URL,
        timeout_seconds: float = 10.0,
        client: httpx.Client | None = None,
    ) -> None:
        self._base_url = base_url
        self._timeout = timeout_seconds
        self._client = client

    def fetch_forecast(
        self,
        latitude: Decimal,
        longitude: Decimal,
        *,
        forecast_days: int = 7,
    ) -> FarmForecast:
        params = {
            "latitude": str(latitude),
            "longitude": str(longitude),
            "current": ",".join(CURRENT_FIELDS),
            "hourly": ",".join(HOURLY_FIELDS),
            "daily": ",".join(DAILY_FIELDS),
            "timezone": "UTC",
            "forecast_days": forecast_days,
            "wind_speed_unit": "kmh",
        }

        try:
            payload = self._request(params)
        except httpx.HTTPError as exc:  # network, timeout, non-2xx
            logger.warning(
                "open-meteo request failed",
                extra={
                    "extra_fields": {"provider": self.name, "error": type(exc).__name__}
                },
            )
            raise WeatherProviderError(
                "Weather service is unavailable. Please try again later."
            ) from exc

        return self._to_forecast(payload, latitude, longitude)

    def _request(self, params: dict[str, object]) -> dict:
        if self._client is not None:
            response = self._client.get(self._base_url, params=params)
        else:
            with httpx.Client(timeout=self._timeout) as client:
                response = client.get(self._base_url, params=params)

        response.raise_for_status()
        data = response.json()

        if data.get("error"):
            raise WeatherProviderError(
                "Weather service rejected the request for this location."
            )
        return data

    def _to_forecast(
        self, payload: dict, latitude: Decimal, longitude: Decimal
    ) -> FarmForecast:
        try:
            current_block = payload["current"]
            hourly_block = payload["hourly"]
            daily_block = payload["daily"]
        except KeyError as exc:
            raise WeatherProviderError(
                "Weather service returned an incomplete forecast."
            ) from exc

        current = WeatherReading(
            forecast_date=_parse_time(current_block["time"]),
            forecast_type=ForecastType.CURRENT,
            temperature=_decimal(current_block.get("temperature_2m")),
            humidity=_int(current_block.get("relative_humidity_2m")),
            rain_probability=_int(current_block.get("precipitation_probability")),
            wind_speed=_decimal(current_block.get("wind_speed_10m")),
            weather_condition=condition_from_wmo(current_block.get("weather_code")),
        )

        hourly = tuple(
            WeatherReading(
                forecast_date=_parse_time(hourly_block["time"][i]),
                forecast_type=ForecastType.HOURLY,
                temperature=_decimal(hourly_block["temperature_2m"][i]),
                humidity=_int(hourly_block["relative_humidity_2m"][i]),
                rain_probability=_int(hourly_block["precipitation_probability"][i]),
                wind_speed=_decimal(hourly_block["wind_speed_10m"][i]),
                weather_condition=condition_from_wmo(hourly_block["weather_code"][i]),
            )
            for i in range(len(hourly_block["time"]))
        )

        daily = tuple(
            WeatherReading(
                forecast_date=_parse_time(daily_block["time"][i]),
                forecast_type=ForecastType.DAILY,
                # Daily rows carry the day's maximum; humidity is not a daily
                # aggregate in the documented schema, so it stays null.
                temperature=_decimal(daily_block["temperature_2m_max"][i]),
                humidity=None,
                rain_probability=_int(daily_block["precipitation_probability_max"][i]),
                wind_speed=_decimal(daily_block["wind_speed_10m_max"][i]),
                weather_condition=condition_from_wmo(daily_block["weather_code"][i]),
            )
            for i in range(len(daily_block["time"]))
        )

        return FarmForecast(
            latitude=latitude,
            longitude=longitude,
            current=current,
            hourly=hourly,
            daily=daily,
        )
