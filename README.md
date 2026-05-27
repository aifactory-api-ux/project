# Daily Pulse - News Intelligence Platform

Cencosud's strategic news monitoring and scoring system for competitive intelligence across Latin America.

## Overview

Daily Pulse is a multi-service platform that aggregates, classifies, and scores news from multiple sources across Chile, Argentina, Colombia, Brazil, Peru, and Uruguay. The system uses AI to prioritize news based on business relevance, strategic impact, and regional segmentation.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PostgreSQL │     │ auth-service │     │news-service │
│   (port     │     │  (port       │     │  (port       │
│   21000)    │     │   23002)     │     │   23001)     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                    docker-compose
```

## Prerequisites

- Docker 26.0.0+
- Docker Compose 2.27.0+
- 4GB RAM minimum for all services

## Quick Start

```bash
./run.sh
```

This will:
1. Create `.env` from `.env.example` if not present
2. Build Docker images for all services
3. Start PostgreSQL, auth-service, and news-service
4. Wait for all services to become healthy
5. Display access URLs and endpoints

## Services

### Auth Service (Port 23002)

Authentication and user management.

**Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user info

**Health:** `GET /health`

### News Service (Port 23001)

News ingestion, classification, and scoring.

**Endpoints:**
- `GET /api/news` - List news items (with filters)
- `GET /api/news/{id}` - Get single news item
- `POST /api/news` - Create news item (authenticated)
- `PATCH /api/news/{id}` - Update news item (authenticated)
- `DELETE /api/news/{id}` - Delete news item (authenticated)
- `GET /api/sources` - List news sources
- `POST /api/sources` - Create news source (authenticated)

**Health:** `GET /health`

### PostgreSQL (Port 21000)

Database for persistent storage.

**Default credentials:**
- User: `cencosud`
- Password: `supersecret`
- Database: `cencosud_news`

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
POSTGRES_USER=cencosud
POSTGRES_PASSWORD=supersecret
POSTGRES_DB=cencosud_news
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

AUTH_SERVICE_PORT=23002
NEWS_SERVICE_PORT=23001

JWT_SECRET_KEY=your-secret-key-at-least-32-characters-long
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
```

## Common Tasks

### Check service status

```bash
docker compose ps
```

### View logs

```bash
docker compose logs -f auth-service
docker compose logs -f news-service
```

### Restart services

```bash
docker compose restart auth-service news-service
```

### Stop all services

```bash
docker compose down
```

### Rebuild services

```bash
docker compose build --no-cache
docker compose up -d
```

### Seed initial data

```bash
docker compose exec news-service python -c "
from backend.shared.db import SessionLocal
from backend.news_service.models import NewsSourceModel
from datetime import datetime

db = SessionLocal()
sources = [
    NewsSourceModel(name='El Mercurio', url='https://www.elmercurio.cl', country='CL'),
    NewsSourceModel(name='La Tercera', url='https://www.latercera.cl', country='CL'),
    NewsSourceModel(name='Clarín', url='https://www.clarin.com', country='AR'),
]
for s in sources:
    existing = db.query(NewsSourceModel).filter(NewsSourceModel.url == s.url).first()
    if not existing:
        db.add(s)
db.commit()
db.close()
print('Seed data created')
"
```

## Testing API

### Register a user

```bash
curl -X POST http://localhost:23002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@cencosud.cl","full_name":"Test Analyst","password":"test123"}'
```

### Login

```bash
curl -X POST http://localhost:23002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@cencosud.cl","password":"test123"}'
```

### Get current user

```bash
curl http://localhost:23002/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### List news

```bash
curl "http://localhost:23001/api/news?limit=10"
```

### Create news (authenticated)

```bash
curl -X POST http://localhost:23001/api/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title":"Test News",
    "summary":"This is a test news item",
    "url":"https://example.com/news/1",
    "published_at":"2024-01-15T10:30:00",
    "source_id":1,
    "country":"CL",
    "tags":["test","news"],
    "priority":2
  }'
```

## Troubleshooting

### Services not starting

1. Check Docker is running: `docker info`
2. Check ports are available: `lsof -i :23001 -i :23002 -i :21000`
3. View logs: `docker compose logs`

### Database connection issues

1. Verify PostgreSQL is healthy: `docker compose ps postgres`
2. Check logs: `docker compose logs postgres`
3. Try connecting manually: `docker compose exec postgres psql -U cencosud -d cencosud_news`

### Clean slate

```bash
docker compose down -v
rm -f .env
./run.sh
```

## Development

### Local development without Docker

```bash
cd backend
pip install -r requirements.txt
export POSTGRES_HOST=localhost POSTGRES_USER=cencosud POSTGRES_PASSWORD=supersecret POSTGRES_DB=cencosud_news
export JWT_SECRET_KEY=dev-secret-key-at-least-32-chars
uvicorn auth-service.main:app --port 23002 &
uvicorn news-service.main:app --port 23001 &
```

## License

Proprietary - Cencosud