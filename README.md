# CatStore - E-Commerce Platform for Cat Products

A specialized online store for cat products, built with Node.js 20, Express 4.18, PostgreSQL 15, and Redis 7.

## Prerequisites

- **Docker Engine** v24.x or higher
- **Docker Compose** v2.x or higher
- **Ports**: 23001 (backend), 25432 (postgres), 26379 (redis)

## Quick Start

```bash
./run.sh
```

This script will:
1. Create `.env` file from `.env.example` if not present
2. Validate Docker installation
3. Build and start all services
4. Wait for services to become healthy
5. Display access URLs

## Services

| Service    | Port  | URL                          |
|------------|-------|------------------------------|
| Backend API | 23001 | http://localhost:23001       |
| PostgreSQL  | 25432 | localhost:25432              |
| Redis       | 26379 | localhost:26379             |

## API Endpoints

### Health Check
```
GET /health
```

### Products
```
GET    /api/products          - List all products
GET    /api/products/:id      - Get product by ID
POST   /api/products          - Create product
PUT    /api/products/:id      - Update product
DELETE /api/products/:id      - Delete product
```

### Categories
```
GET    /api/categories         - List all categories
GET    /api/categories/:id     - Get category by ID
POST   /api/categories         - Create category
PUT    /api/categories/:id     - Update category
DELETE /api/categories/:id     - Delete category
```

### Authentication
```
POST /api/auth/register        - Register new user
POST /api/auth/login           - Login user
```

### User
```
GET /api/users/me              - Get current user (JWT required)
```

### Cart (JWT required)
```
GET    /api/cart               - Get user's cart
POST   /api/cart/items         - Add item to cart
PUT    /api/cart/items/:productId - Update cart item
DELETE /api/cart/items/:productId - Remove from cart
```

### Orders (JWT required)
```
POST /api/orders               - Create order
GET  /api/orders               - List user's orders
GET  /api/orders/:id           - Get order details
```

## Environment Variables

All environment variables are documented in `backend/.env.example`:

| Variable           | Description                     | Default                    |
|--------------------|--------------------------------|----------------------------|
| NODE_ENV           | Environment mode               | development                |
| PORT               | Backend listening port         | 23001                      |
| POSTGRES_HOST      | PostgreSQL host                | postgres                   |
| POSTGRES_PORT      | PostgreSQL port                | 5432                       |
| POSTGRES_DB        | Database name                  | catstore                   |
| POSTGRES_USER      | Database user                  | postgres                   |
| POSTGRES_PASSWORD  | Database password              | postgres123                |
| REDIS_HOST         | Redis host                     | redis                      |
| REDIS_PORT         | Redis port                     | 6379                       |
| REDIS_URL          | Redis connection URL            | redis://redis:6379         |
| JWT_SECRET         | JWT signing secret             | (must be set in production)|
| JWT_EXPIRES_IN     | JWT expiration time            | 24h                        |
| BCRYPT_SALT_ROUNDS | Password hashing rounds         | 12                         |

## Development

### Manual Start (without Docker)

1. Install dependencies:
```bash
cd backend && npm install
```

2. Set up environment:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
```

3. Run database migrations:
```bash
cd backend && npm run migration:run
```

4. Start the server:
```bash
cd backend && npm run dev
```

## Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend

# Rebuild services
docker compose up -d --build

# Restart services
docker compose restart

# Remove everything (including volumes)
docker compose down -v
```

## Architecture

- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL 15 for persistent data
- **Cache**: Redis 7 for caching and sessions
- **Containerization**: Docker with multi-stage builds

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── app.ts            # Express app
│   │   ├── server.ts         # Server entry point
│   │   ├── routes/           # API routes
│   │   ├── controllers/     # Business logic
│   │   ├── models/           # Data models
│   │   ├── middleware/       # Express middleware
│   │   ├── db/               # Database connections
│   │   ├── utils/            # Utilities
│   │   └── types/            # TypeScript types
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── run.sh
├── .gitignore
├── .dockerignore
└── README.md
```

## License

MIT
