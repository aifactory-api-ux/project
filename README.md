# Project Backend API

A NestJS-based backend microservices project with authentication and opportunity management.

## Prerequisites

- Docker 24.x or higher
- docker-compose 2.x or higher
- Node.js 20.x (for local development)
- PostgreSQL 15.x (provided via Docker)
- Redis 7.x (provided via Docker)

## Installation

1. Clone the repository

2. Create environment file:
```bash
cp .env.example .env
```

3. Start services:
```bash
./run.sh
```

## Services

### Auth Service (Port 23001)
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login and get JWT token
- GET /api/auth/me - Get current user profile
- POST /api/auth/logout - Logout current session

### Opportunity Service (Port 23002)
- GET /api/opportunities - List all opportunities
- POST /api/opportunities - Create a new opportunity
- GET /api/opportunities/:id - Get opportunity by ID
- PATCH /api/opportunities/:id - Update opportunity
- DELETE /api/opportunities/:id - Delete opportunity

## API Examples

### Register
```bash
curl -X POST http://localhost:23001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "fullName": "Test User"}'
```

### Login
```bash
curl -X POST http://localhost:23001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Get Opportunities (Authenticated)
```bash
curl http://localhost:23002/api/opportunities \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Troubleshooting

### Port conflicts
If you get port binding errors, ensure ports 23001, 23002, 25432, and 26379 are available.

### Missing environment variables
Ensure .env file exists with all required variables: DATABASE_URL, REDIS_URL, JWT_SECRET.

### Docker not running
Ensure Docker daemon is running: `docker info`