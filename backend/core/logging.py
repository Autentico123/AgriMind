"""Structured JSON logging to stdout.

Implements the ratified convention in `docs/architecture.md` §10 (A-13):
JSON records on stdout, DEBUG only in development, INFO/WARNING/ERROR in
production. Retention is a deployment concern and remains unresolved.
"""

import json
import logging
import sys
from datetime import UTC, datetime


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, object] = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        for key, value in getattr(record, "extra_fields", {}).items():
            payload[key] = value
        return json.dumps(payload, ensure_ascii=False)


def configure_logging(level: str, app_env: str) -> None:
    if app_env != "development" and level == "DEBUG":
        level = "INFO"

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)
