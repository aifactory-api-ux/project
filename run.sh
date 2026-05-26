#!/bin/bash
set -e

if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env from .env.example"
fi

if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker to continue."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo "Error: docker-compose is not available. Please install docker-compose to continue."
    exit 1
fi

echo "Checking Docker..."
docker version > /dev/null 2>&1 || { echo "Docker is not running. Please start Docker daemon."; exit 1; }

echo "Building and starting services..."
docker-compose up --build -d

echo ""
echo "Waiting for services to be healthy..."

sleep 5

check_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "$name is healthy"
            return 0
        fi
        echo "Waiting for $name... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "Warning: $name health check timeout"
    return 1
}

check_service "http://localhost:23001/health" "Auth Service"
check_service "http://localhost:23002/health" "Product Service"
check_service "http://localhost:23003/health" "Order Service"
check_service "http://localhost:23004/health" "User Service"

echo ""
echo "=========================================="
echo "  CatShop E-Commerce Platform"
echo "=========================================="
echo ""
echo "Services:"
echo "  - Auth Service:     http://localhost:23001"
echo "  - Product Service: http://localhost:23002"
echo "  - Order Service:   http://localhost:23003"
echo "  - User Service:    http://localhost:23004"
echo ""
echo "Management:"
echo "  - RabbitMQ:        http://localhost:15672"
echo "  - Postgres:        localhost:25432"
echo "  - Redis:           localhost:26379"
echo ""
echo "=========================================="
echo "Run 'docker-compose logs -f [service]' to view logs"
echo "Run 'docker-compose down' to stop services"
echo "=========================================="
