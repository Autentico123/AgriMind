#!/usr/bin/env bash
# One-time local setup for all AgriMind apps.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Backend virtualenv + dependencies"
cd "$ROOT/backend"
[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt

echo "==> Admin dependencies"
cd "$ROOT/admin"
npm install

echo "==> Mobile dependencies"
cd "$ROOT/mobile"
npm install

echo "==> Done. Copy .env.example to .env and fill in real values."
