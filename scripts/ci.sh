#!/usr/bin/env bash
# Install dependencies, then run every check.
#
# Used by CI (`.github/workflows/ci.yml`) and safe to run locally. It creates
# the backend virtualenv if missing and installs app dependencies from the
# lockfiles, so a clean checkout is verified exactly as CI sees it.
#
# Pass --skip-install to reuse already-installed dependencies (CI does this
# after its migration step has already provisioned the virtualenv).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
status=0
skip_install=0

for arg in "$@"; do
  case "$arg" in
    --skip-install) skip_install=1 ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

if [ "$skip_install" -eq 0 ]; then
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
fi

echo "==> Backend lint"
cd "$ROOT/backend"
.venv/bin/ruff check . || status=1
.venv/bin/ruff format --check . || status=1

echo "==> Backend tests"
# Schema tests need a real PostgreSQL. When none is configured they skip
# rather than fail, so the suite still runs on a bare checkout.
.venv/bin/python -m pytest -q || status=1

echo "==> Migration drift"
.venv/bin/alembic check || status=1

echo "==> Admin lint"
cd "$ROOT/admin"
npm run lint || status=1

echo "==> Admin typecheck + build"
npx tsc --noEmit -p tsconfig.app.json || status=1
npm run build || status=1

echo "==> Mobile lint"
cd "$ROOT/mobile"
npm run lint || status=1

echo "==> Mobile typecheck"
npx tsc --noEmit || status=1

exit "$status"
