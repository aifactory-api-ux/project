#!/bin/bash
# composer-generated for user-service (port 23004)
set -e
cd "$(dirname "$0")"
npm install --silent 2>/dev/null || true
npx vitest run --coverage
