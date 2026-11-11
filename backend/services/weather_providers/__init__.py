"""Weather provider adapters.

Each adapter implements `domain.weather.WeatherProvider`. Selection happens in
one place so the rest of the backend never names a concrete provider.
"""

from __future__ import annotations

from functools import lru_cache

from domain.weather import WeatherProvider
from services.weather_providers.fake import FakeWeatherProvider
from services.weather_providers.open_meteo import OpenMeteoProvider

__all__ = [
    "FakeWeatherProvider",
    "OpenMeteoProvider",
    "get_weather_provider",
]


@lru_cache
def get_weather_provider() -> WeatherProvider:
    """FastAPI dependency returning the configured provider.

    Open-Meteo is the only production provider; tests override this dependency
    with `FakeWeatherProvider`.
    """
    return OpenMeteoProvider()
