# DistroViz

Digitalization of the finished product distribution monitoring process for a manufacturing company.

## Overview

DistroViz is a web dashboard that consolidates key metrics such as orders by status, delivery times, and fulfillment rate. The system enables logistics and operations teams to visualize the status of dispatches from plants to distribution centers in real-time.

## Architecture

- **Backend:** Node.js 20, NestJS, TypeScript
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Containerization:** Docker, Docker Compose

## Services

| Service           | Port  | Description                     |
|-------------------|-------|---------------------------------|
| dispatch-service  | 23001 | REST API for dispatch management|
| postgres          | 25432 | PostgreSQL database             |
| redis             | 26379 | Redis cache                     |

## Quick Start

```bash
./run.sh
```

This will:
1. Create `.env` from `.env.example` if not present
2. Check Docker installation
3. Build and start all services
4. Display service URLs

## API Endpoints

- `GET /api/dispatch` - List all dispatches (with optional filters)
- `POST /api/dispatch` - Create new dispatch
- `GET /api/dispatch/:id` - Get dispatch by ID
- `PATCH /api/dispatch/:id/status` - Update dispatch status
- `DELETE /api/dispatch/:id` - Delete dispatch
- `GET /health` - Health check

## Environment Variables

| Variable              | Default          | Description                    |
|-----------------------|------------------|--------------------------------|
| DISPATCH_DB_HOST      | postgres         | PostgreSQL host                |
| DISPATCH_DB_PORT      | 5432             | PostgreSQL port                |
| DISPATCH_DB_USER      | distroviz        | PostgreSQL username            |
| DISPATCH_DB_PASSWORD  | secretpassword   | PostgreSQL password            |
| DISPATCH_DB_NAME      | distroviz        | Database name                  |
| DISPATCH_REDIS_HOST   | redis            | Redis host                    |
| DISPATCH_REDIS_PORT   | 6379             | Redis port                    |
| DISPATCH_API_PORT     | 23001            | Backend API port              |
| POSTGRES_PORT         | 25432            | PostgreSQL exposed port       |
| REDIS_PORT            | 26379            | Redis exposed port            |

## Development

View logs:
```bash
docker-compose logs -f
```

Stop services:
```bash
docker-compose down
```

Rebuild:
```bash
docker-compose up --build -d
```