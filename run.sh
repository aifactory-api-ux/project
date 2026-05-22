#!/bin/bash

set -e

echo "=========================================="
echo "  CatStore E-Commerce - Startup Script"
echo "=========================================="

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env created from .env.example"
else
    echo "✓ .env already exists"
fi

if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "✗ Docker Compose is not installed or not in PATH"
    exit 1
fi

DOCKER_COMPOSE_CMD="docker compose"
if ! command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
fi

echo "✓ Docker and Docker Compose found"

cd "$(dirname "$0")"

echo ""
echo "Building and starting services..."
$DOCKER_COMPOSE_CMD up -d --build

echo ""
echo "Waiting for services to be healthy..."

MAX_WAIT=120
ELAPSED=0
INTERVAL=5

while [ $ELAPSED -lt $MAX_WAIT ]; do
    BACKEND_HEALTH=$($DOCKER_COMPOSE_CMD exec -T backend wget -qO- http://localhost:23001/health 2>/dev/null || echo "unhealthy")

    if echo "$BACKEND_HEALTH" | grep -q "ok"; then
        echo ""
        echo "=========================================="
        echo "✓ All services are healthy!"
        echo "=========================================="
        echo ""
        echo "  Backend API:  http://localhost:23001"
        echo "  Health Check: http://localhost:23001/health"
        echo ""
        echo "  PostgreSQL:   localhost:25432"
        echo "  Redis:        localhost:26379"
        echo ""
        echo "=========================================="
        echo "  Press Ctrl+C to stop services"
        echo "=========================================="
        $DOCKER_COMPOSE_CMD logs -f
        exit 0
    fi

    echo "  Waiting for backend... ($ELAPSED/${MAX_WAIT}s)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

echo ""
echo "✗ Services failed to become healthy within ${MAX_WAIT} seconds"
echo ""
echo "Backend logs:"
$DOCKER_COMPOSE_CMD logs backend
echo ""
echo "Postgres logs:"
$DOCKER_COMPOSE_CMD logs postgres
echo ""
echo "Redis logs:"
$DOCKER_COMPOSE_CMD logs redis

exit 1
