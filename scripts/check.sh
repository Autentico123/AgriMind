#!/usr/bin/env bash
# Run all available checks for the current repository state.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
status=0

echo "==> Backend tests"
cd "$ROOT/backend"
.venv/bin/python -m pytest -q || status=1

echo "==> Admin typecheck + build"
cd "$ROOT/admin"
npx tsc --noEmit -p tsconfig.app.json || status=1
npm run build || status=1

echo "==> Mobile typecheck"
cd "$ROOT/mobile"
npx tsc --noEmit || status=1

exit "$status"
