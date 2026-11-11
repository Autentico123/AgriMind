#!/usr/bin/env bash
# Install dependencies, then run every check.
#
# Used by CI (`.github/workflows/ci.yml`) and safe to run locally. It creates
# the backend virtualenv if missing and installs app dependencies from the
# lockfiles, so a clean checkout is verified exactly as CI sees it.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
status=0

echo "==> Backend dependencies"
cd "$ROOT/backend"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install --quiet --upgrade pip
.venv/bin/pip install --quiet -r requirements.txt

echo "==> Admin dependencies"
cd "$ROOT/admin"
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

echo "==> Mobile dependencies"
cd "$ROOT/mobile"
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

echo "==> Backend tests"
cd "$ROOT/backend"
# Schema tests need a real PostgreSQL. When none is configured they skip
# rather than fail, so the suite still runs on a bare checkout.
.venv/bin/python -m pytest -q || status=1

echo "==> Admin typecheck + build"
cd "$ROOT/admin"
npx tsc --noEmit -p tsconfig.app.json || status=1
npm run build || status=1

echo "==> Mobile typecheck"
cd "$ROOT/mobile"
npx tsc --noEmit || status=1

exit "$status"
