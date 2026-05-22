#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✓ .env created from .env.example"
    else
        echo "✗ .env.example not found. Cannot create .env"
        exit 1
    fi
else
    echo "✓ .env already exists"
fi

if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "✗ Docker daemon is not running. Please start Docker first."
    exit 1
fi

echo "✓ Docker is available"

echo "Building and starting services..."
docker compose up -d --build

echo ""
echo "Waiting for services to become healthy..."

wait_for_postgres() {
    local max_attempts=30
    local attempt=1

    echo "  Waiting for postgres... (attempt $attempt/$max_attempts)"
    while [ $attempt -le $max_attempts ]; do
        if docker compose exec -T postgres pg_isready -U distroviz -d distroviz > /dev/null 2>&1; then
            return 0
        fi
        echo "  Waiting for postgres... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    return 1
}

wait_for_redis() {
    local max_attempts=30
    local attempt=1

    echo "  Waiting for redis... (attempt $attempt/$max_attempts)"
    while [ $attempt -le $max_attempts ]; do
        if docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
            return 0
        fi
        echo "  Waiting for redis... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    return 1
}

wait_for_backend() {
    local max_attempts=30
    local attempt=1

    echo "  Waiting for backend... (attempt $attempt/$max_attempts)"
    while [ $attempt -le $max_attempts ]; do
        if curl -sf http://localhost:23001/health > /dev/null 2>&1; then
            return 0
        fi
        echo "  Waiting for backend... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    return 1
}

if ! wait_for_postgres; then
    echo "✗ Postgres failed to start"
    docker compose logs postgres
    exit 1
fi
echo "✓ Postgres is healthy"

if ! wait_for_redis; then
    echo "✗ Redis failed to start"
    docker compose logs redis
    exit 1
fi
echo "✓ Redis is healthy"

if ! wait_for_backend; then
    echo "✗ Backend failed to start"
    docker compose logs backend
    exit 1
fi
echo "✓ Backend is healthy"

BACKEND_URL="http://localhost:23001"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  DistroViz is running!"
echo ""
echo "  Backend API:   $BACKEND_URL"
echo "  Health Check:  $BACKEND_URL/health"
echo ""
echo "  API Endpoints:"
echo "    - Plants:            $BACKEND_URL/api/plants"
echo "    - Distribution Ctr:  $BACKEND_URL/api/distribution-centers"
echo "    - Orders:           $BACKEND_URL/api/orders"
echo "    - Metrics:          $BACKEND_URL/api/metrics"
echo ""
echo "  Database:       localhost:25432"
echo "  Redis:          localhost:26379"
echo ""
echo "  View logs:      docker compose logs -f"
echo "  Stop services:  docker compose down"
echo "════════════════════════════════════════════════════════════"
echo ""

docker compose ps