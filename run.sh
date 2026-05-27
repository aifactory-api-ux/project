#!/bin/bash
set -e

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env created from .env.example"
fi

if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker to continue."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "ERROR: Docker daemon is not running. Please start Docker to continue."
    exit 1
fi

echo "Building Docker images..."
docker compose build --no-cache

echo "Starting services..."
docker compose up -d

echo ""
echo "Waiting for services to become healthy..."

max_attempts=60
attempt=0

auth_healthy=false
news_healthy=false

while [ $attempt -lt $max_attempts ]; do
    attempt=$((attempt + 1))

    if [ "$auth_healthy" = false ]; then
        if docker compose exec -T auth-service python -c "import urllib.request; urllib.request.urlopen('http://localhost:23002/health')" 2>/dev/null; then
            auth_healthy=true
            echo "✓ auth-service is healthy"
        fi
    fi

    if [ "$news_healthy" = false ]; then
        if docker compose exec -T news-service python -c "import urllib.request; urllib.request.urlopen('http://localhost:23001/health')" 2>/dev/null; then
            news_healthy=true
            echo "✓ news-service is healthy"
        fi
    fi

    if [ "$auth_healthy" = true ] && [ "$news_healthy" = true ]; then
        break
    fi

    if [ $((attempt % 10)) -eq 0 ]; then
        echo "Still waiting... (attempt $attempt/$max_attempts)"
    fi

    sleep 2
done

echo ""
echo "=========================================="
echo "       DAILY PULSE - SERVICES READY       "
echo "=========================================="
echo ""
echo "Auth Service:   http://localhost:23002"
echo "News Service:   http://localhost:23001"
echo "PostgreSQL:     localhost:21000"
echo ""
echo "Health endpoints:"
echo "  Auth:  http://localhost:23002/health"
echo "  News:  http://localhost:23001/health"
echo ""
echo "API Endpoints:"
echo "  Auth:  http://localhost:23002/api/auth/login"
echo "         http://localhost:23002/api/auth/register"
echo "         http://localhost:23002/api/auth/me"
echo ""
echo "  News:  http://localhost:23001/api/news"
echo "         http://localhost:23001/api/sources"
echo ""
echo "To view logs: docker compose logs -f [auth-service|news-service]"
echo "To stop:     docker compose down"
echo "=========================================="

if [ "$auth_healthy" = false ] || [ "$news_healthy" = false ]; then
    echo ""
    echo "WARNING: Some services may not be fully healthy yet."
    echo "Run 'docker compose ps' to check status."
fi