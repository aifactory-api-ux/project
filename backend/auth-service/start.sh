#!/bin/bash
set -e

echo "Waiting for database to be ready..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
    echo "Database is unavailable - sleeping"
    sleep 2
done

echo "Database is ready!"

cd /app

echo "Running database migrations..."
python -c "from backend.shared.db import engine; from backend.shared.models import Base; Base.metadata.create_all(bind=engine)"
echo "Migrations complete"

echo "Starting auth-service..."
exec uvicorn backend.auth_service.main:app --host 0.0.0.0 --port 23002