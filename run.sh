#!/bin/bash
set -e

echo ">>> Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker before proceeding."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Error: docker-compose is not installed. Please install docker-compose before proceeding."
    exit 1
fi

COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

echo ">>> Starting services..."
$COMPOSE_CMD up --build -d

echo ">>> Waiting for services to be healthy..."
sleep 5

auth_healthy=false
opportunity_healthy=false
postgres_healthy=false
redis_healthy=false

for i in {1..30}; do
    if $COMPOSE_CMD exec -T postgres pg_isready -U projectuser -d projectdb &> /dev/null; then
        postgres_healthy=true
        echo ">>> Postgres is ready"
        break
    fi
    sleep 2
done

for i in {1..30}; do
    if $COMPOSE_CMD exec -T redis redis-cli ping &> /dev/null; then
        redis_healthy=true
        echo ">>> Redis is ready"
        break
    fi
    sleep 2
done

for i in {1..15}; do
    if curl -sf http://localhost:23001/health &> /dev/null; then
        auth_healthy=true
        echo ">>> Auth service is healthy"
        break
    fi
    sleep 2
done

for i in {1..15}; do
    if curl -sf http://localhost:23002/health &> /dev/null; then
        opportunity_healthy=true
        echo ">>> Opportunity service is healthy"
        break
    fi
    sleep 2
done

if [ "$postgres_healthy" = true ] && [ "$redis_healthy" = true ] && [ "$auth_healthy" = true ] && [ "$opportunity_healthy" = true ]; then
    echo ""
    echo "========================================"
    echo "Application is running!"
    echo "Auth service:    http://localhost:23001"
    echo "Opportunity service: http://localhost:23002"
    echo "========================================"
else
    echo "Warning: Some services may not be fully healthy yet"
    echo "Auth service:    $auth_healthy"
    echo "Opportunity service: $opportunity_healthy"
    echo "Postgres: $postgres_healthy"
    echo "Redis: $redis_healthy"
fi