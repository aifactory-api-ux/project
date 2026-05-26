# 🐱 CatShop - E-Commerce Platform for Cat Products

A microservices-based e-commerce platform specializing in cat products, built with NestJS, React, and PostgreSQL.

## 🏗️ Architecture

- **Backend**: NestJS (Node.js 20) microservices
  - Auth Service (port 23001) - Authentication, registration, JWT
  - Product Service (port 23002) - Product CRUD, category filtering
  - Order Service (port 23003) - Order creation, status management
  - User Service (port 23004) - User profile, admin management
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Messaging**: RabbitMQ 3.x
- **Container**: Docker with docker-compose orchestration

## 🚀 Quick Start

### Prerequisites

- Docker 24.x
- docker-compose 2.x

### Launch Platform

```bash
./run.sh
```

This script will:
1. Create `.env` from `.env.example` if not present
2. Check Docker installation and status
3. Build and start all services
4. Verify service health

### Manual Start

```bash
docker-compose up --build -d
```

## 📡 API Endpoints

### Auth Service (port 23001)

| Method | Endpoint        | Description           |
|--------|-----------------|-----------------------|
| POST   | /api/auth/register | User registration |
| POST   | /api/auth/login    | User login        |
| POST   | /api/auth/refresh  | Refresh token    |
| GET    | /api/auth/me       | Get current user |

### Product Service (port 23002)

| Method | Endpoint           | Description            |
|--------|-------------------|------------------------|
| GET    | /api/products     | List products (filter by category) |
| GET    | /api/products/:id | Get product by ID      |
| POST   | /api/products     | Create product (admin) |
| PUT    | /api/products/:id  | Update product (admin  |
| DELETE | /api/products/:id | Delete product (admin) |

### Order Service (port 23003)

| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| GET    | /api/orders           | List orders            |
| GET    | /api/orders/:id       | Get order by ID        |
| POST   | /api/orders           | Create order           |
| PUT    | /api/orders/:id/status | Update order status   |

### User Service (port 23004)

| Method | Endpoint        | Description                |
|--------|-----------------|----------------------------|
| GET    | /api/users/me   | Get current user profile   |
| GET    | /api/users/:id  | Get user by ID (admin)      |
| PUT    | /api/users/me   | Update current user profile |

## 🛠️ Services

### Health Checks

- Auth Service: `http://localhost:23001/health`
- Product Service: `http://localhost:23002/health`
- Order Service: `http://localhost:23003/health`
- User Service: `http://localhost:23004/health`

### Management Interfaces

- RabbitMQ Management: http://localhost:15672 (guest/guest)
- PostgreSQL: localhost:25432
- Redis: localhost:26379

## 🧪 Testing

```bash
# Run all service tests
docker-compose exec auth-service npm test
docker-compose exec product-service npm test
docker-compose exec order-service npm test
docker-compose exec user-service npm test
```

## 📁 Project Structure

```
.
├── backend/
│   ├── auth-service/       # Authentication microservice
│   ├── product-service/    # Product management microservice
│   ├── order-service/      # Order management microservice
│   ├── user-service/       # User management microservice
│   └── shared/             # Shared DTOs, entities, utilities
├── docker-compose.yml      # Docker orchestration
├── .env.example            # Environment variables template
├── run.sh                  # Startup script
└── README.md
```

## 🔒 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable           | Description                      | Default                |
|-------------------|----------------------------------|------------------------|
| POSTGRES_USER     | PostgreSQL username              | postgres               |
| POSTGRES_PASSWORD | PostgreSQL password              | postgres               |
| POSTGRES_DB       | PostgreSQL database name         | catshop                |
| REDIS_HOST        | Redis host                       | redis                  |
| REDIS_PORT        | Redis port                       | 6379                   |
| RABBITMQ_HOST     | RabbitMQ host                    | rabbitmq               |
| RABBITMQ_PORT     | RabbitMQ port                    | 5672                   |
| JWT_SECRET        | JWT signing secret               | (required)             |
| JWT_EXPIRES_IN    | JWT expiration time              | 1h                     |
| REFRESH_TOKEN_SECRET | Refresh token secret         | (required)             |
| REFRESH_TOKEN_EXPIRES_IN | Refresh token expiration | 7d                  |

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Rebuild services
docker-compose up --build -d

# Stop and remove volumes
docker-compose down -v
```

## 📜 License

MIT
