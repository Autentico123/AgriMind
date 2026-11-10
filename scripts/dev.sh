#!/usr/bin/env bash
# Start one AgriMind app. Usage: scripts/dev.sh backend|admin|mobile
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="${1:-}"

case "$APP" in
  backend)
    cd "$ROOT/backend"
    exec .venv/bin/uvicorn main:app --reload --port 8000
    ;;
  admin)
    cd "$ROOT/admin"
    exec npm run dev
    ;;
  mobile)
    cd "$ROOT/mobile"
    exec npm start
    ;;
  *)
    echo "Usage: scripts/dev.sh backend|admin|mobile" >&2
    exit 1
    ;;
esac
