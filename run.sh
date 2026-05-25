#!/bin/bash
set -e

cd "$(dirname "$0")"

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env created from .env.example"
fi

if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed. Please install Docker to continue."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "✗ Docker daemon is not running. Please start Docker to continue."
    exit 1
fi

echo "Building and starting DistroViz services..."

docker-compose up --build -d

echo ""
echo "========================================"
echo "  DistroViz is running!"
echo "========================================"
echo "  Backend API:    http://localhost:${DISPATCH_API_PORT:-23001}"
echo "  Health Check:   http://localhost:${DISPATCH_API_PORT:-23001}/health"
echo "  PostgreSQL:     localhost:${POSTGRES_PORT:-25432}"
echo "  Redis:          localhost:${REDIS_PORT:-26379}"
echo "========================================"
echo ""
echo "Run 'docker-compose logs -f' to view logs"
echo "Run 'docker-compose down' to stop services"