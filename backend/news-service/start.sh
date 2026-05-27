#!/bin/bash
set -e

echo "Waiting for database to be ready..."
max_attempts=30
attempt=0
while ! nc -z "$POSTGRES_HOST" "$POSTGRES_PORT"; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "Database not available after $max_attempts attempts"
        exit 1
    fi
    echo "Database unavailable, retrying in 2 seconds..."
    sleep 2
done

echo "Database is ready!"

echo "Starting news-service..."
cd /app
exec python -m uvicorn backend.news_service.main:app --host 0.0.0.0 --port 23001
