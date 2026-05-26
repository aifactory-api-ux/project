#!/bin/bash
# composer-generated for product-service (port 23002)
set -e
cd "$(dirname "$0")"
npm install --silent 2>/dev/null || true
npx vitest run --coverage
