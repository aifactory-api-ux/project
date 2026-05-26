# DEVELOPMENT PLAN: Project

## 1. ARCHITECTURE OVERVIEW

**Architecture:**  
- Microservices (NestJS/Node.js 20, TypeScript 5)
- PostgreSQL 15 per service (RDS in prod)
- Redis 7 for caching/session (ElastiCache in prod)
- RabbitMQ 3.x for async messaging
- AWS S3 for product images (integration stubbed for MVP)
- Dockerized, orchestrated with docker-compose (local) and Kubernetes (EKS in prod)
- API Gateway (future), direct REST for MVP

**Services:**  
- **auth-service** (port 23001): User registration, login, JWT, refresh, user info
- **product-service** (port 23002): Product CRUD, category filtering
- **order-service** (port 23003): Order creation, status, history
- **user-service** (port 23004): User profile, admin user management

**Shared:**  
- DTOs/interfaces for Product, User, Order, Auth
- JWT utilities
- Shared config/constants

**Database:**  
- Each service has its own DB schema (PostgreSQL)
- Models: User, Product, Order, OrderItem, Category, Payment, Notification

**Infrastructure:**  
- docker-compose.yml for all services, Redis, RabbitMQ, Postgres
- .env.example for all required variables
- run.sh for local orchestration
- README.md for setup

**Testing:**  
- Jest for backend unit/integration tests
- E2E test per service

**Folder Structure:**  
- backend/auth-service/
- backend/product-service/
- backend/order-service/
- backend/user-service/
- backend/shared/
- frontend/ (not in scope for backend-only phase)
- docker-compose.yml, .env.example, run.sh, README.md at root

## 2. ACCEPTANCE CRITERIA

1. All backend services start via `./run.sh`, pass healthchecks, and expose their documented REST endpoints.
2. Each service auto-initializes its database schema and seeds with 3–5 example records on first run.
3. All endpoints validate input, enforce RBAC (where required), and return correct responses as per SPEC.md.
4. JWT authentication and role-based access are enforced on all protected endpoints.
5. All services log in structured JSON format and fail fast if required environment variables are missing.
6. E2E tests for each service pass: happy path and error cases for each endpoint.
7. Infrastructure scripts (.env.example, run.sh, docker-compose.yml) enable zero-manual-steps local setup.

## TEAM SCOPE (MANDATORY — PARSED BY THE PIPELINE)
Every executable item MUST include exactly one line at the end of the item block (after Validation):
**Role:** <role_id> (<category>)

---

## 3. EXECUTABLE ITEMS

### ITEM 1: Foundation — shared types, DTOs, DB schemas, config, utilities
**Goal:**  
Establish all shared code and contracts for the backend microservices.  
Includes:  
- DTOs/interfaces for Product, User, Order, Auth (as per SPEC.md)
- JWT utility functions
- Shared config (env validation, constants)
- Database entity definitions for User, Product, Order, OrderItem, Category, Payment, Notification (TypeORM entities)
- Shared error classes

**Files to create:**
- backend/shared/dto/product.dto.ts
- backend/shared/dto/user.dto.ts
- backend/shared/dto/order.dto.ts
- backend/shared/dto/auth.dto.ts
- backend/shared/utils/jwt.ts
- backend/shared/config/env.ts
- backend/shared/entities/product.entity.ts
- backend/shared/entities/user.entity.ts
- backend/shared/entities/order.entity.ts
- backend/shared/entities/category.entity.ts
- backend/shared/entities/payment.entity.ts
- backend/shared/entities/notification.entity.ts

**Tests required:**
- backend/shared/tests/jwt.util.test.ts (JWT sign/verify/expiration)
- backend/shared/tests/env.test.ts (env validation, missing/invalid vars)
- backend/shared/tests/entities.test.ts (entity instantiation, relations)

**Dependencies:** None

**Validation:**  
- `npm run test` in backend/shared passes all tests  
- All DTOs/interfaces match SPEC.md  
- All entities instantiate and relate as per ERD

**Role:** role-tl (technical_lead)

---

### ITEM 2: Auth Service — registration, login, JWT, refresh, user info
**Goal:**  
Implement the authentication service with endpoints:  
- POST /api/auth/register (register new user)
- POST /api/auth/login (login, issue JWT/refresh)
- POST /api/auth/refresh (refresh tokens)
- GET /api/auth/me (current user info, JWT required)

**Files to create:**
- backend/auth-service/Dockerfile (EXPOSE 23001, multi-stage, non-root, COPY ../shared)
- backend/auth-service/src/main.ts (NestJS bootstrap)
- backend/auth-service/src/app.module.ts (imports, config)
- backend/auth-service/src/auth.controller.ts (all endpoints)
- backend/auth-service/src/auth.service.ts (business logic)
- backend/auth-service/src/user.entity.ts (import from shared)
- backend/auth-service/test/auth.e2e-spec.ts (Jest E2E tests)
- backend/auth-service/package.json
- backend/auth-service/tsconfig.json
- backend/auth-service/nest-cli.json

**Dependencies:** Item 1

**Validation:**  
- `docker build .` and `docker run` expose service on 23001  
- All endpoints respond as per SPEC.md  
- E2E tests pass: register, login, refresh, me, error cases

**Role:** role-be-auth (backend_developer)

---

### ITEM 3: Product Service — product CRUD, category filtering
**Goal:**  
Implement the product service with endpoints:  
- GET /api/products (list, filter by category)
- GET /api/products/:id (detail)
- POST /api/products (admin only, create)
- PUT /api/products/:id (admin only, update)
- DELETE /api/products/:id (admin only, delete)

**Files to create:**
- backend/product-service/Dockerfile (EXPOSE 23002, multi-stage, non-root, COPY ../shared)
- backend/product-service/src/main.ts
- backend/product-service/src/app.module.ts
- backend/product-service/src/product.controller.ts
- backend/product-service/src/product.service.ts
- backend/product-service/src/product.entity.ts (import from shared)
- backend/product-service/test/product.e2e-spec.ts
- backend/product-service/package.json
- backend/product-service/tsconfig.json
- backend/product-service/nest-cli.json

**Dependencies:** Item 1

**Validation:**  
- `docker build .` and `docker run` expose service on 23002  
- All endpoints respond as per SPEC.md  
- E2E tests pass: list, filter, create, update, delete, error cases

**Role:** role-be-product (backend_developer)

---

### ITEM 4: Order Service — order creation, status, history
**Goal:**  
Implement the order service with endpoints:  
- GET /api/orders (user's orders, or all if admin)
- GET /api/orders/:id (order detail)
- POST /api/orders (create order)
- PUT /api/orders/:id/status (admin only, update status)

**Files to create:**
- backend/order-service/Dockerfile (EXPOSE 23003, multi-stage, non-root, COPY ../shared)
- backend/order-service/src/main.ts
- backend/order-service/src/app.module.ts
- backend/order-service/src/order.controller.ts
- backend/order-service/src/order.service.ts
- backend/order-service/src/order.entity.ts (import from shared)
- backend/order-service/test/order.e2e-spec.ts
- backend/order-service/package.json
- backend/order-service/tsconfig.json
- backend/order-service/nest-cli.json

**Dependencies:** Item 1

**Validation:**  
- `docker build .` and `docker run` expose service on 23003  
- All endpoints respond as per SPEC.md  
- E2E tests pass: create, get, update status, error cases

**Role:** role-be-order (backend_developer)

---

### ITEM 5: User Service — user profile, admin user management
**Goal:**  
Implement the user service with endpoints:  
- GET /api/users/me (current user profile)
- GET /api/users/:id (admin only, user detail)
- PUT /api/users/me (update own profile)

**Files to create:**
- backend/user-service/Dockerfile (EXPOSE 23004, multi-stage, non-root, COPY ../shared)
- backend/user-service/src/main.ts
- backend/user-service/src/app.module.ts
- backend/user-service/src/user.controller.ts
- backend/user-service/src/user.service.ts
- backend/user-service/src/user.entity.ts (import from shared)
- backend/user-service/test/user.e2e-spec.ts
- backend/user-service/package.json
- backend/user-service/tsconfig.json
- backend/user-service/nest-cli.json

**Dependencies:** Item 1

**Validation:**  
- `docker build .` and `docker run` expose service on 23004  
- All endpoints respond as per SPEC.md  
- E2E tests pass: get profile, update, admin get, error cases

**Role:** role-be-user (backend_developer)

---

### ITEM 6: Infrastructure & Deployment — orchestration, scripts, docs
**Goal:**  
Provide complete local orchestration and documentation for all backend services.  
Includes:  
- docker-compose.yml (all services, Redis, RabbitMQ, Postgres, healthchecks, depends_on)
- .env.example (all required env vars, descriptions, example values)
- .gitignore (node_modules, dist, .env, etc.)
- .dockerignore (node_modules, .git, dist, *.log)
- run.sh (checks Docker, builds, starts, waits for healthy, prints URLs)
- README.md (setup, run, test, endpoints)
- docs/architecture.md (system diagram, component descriptions)

**Files to create:**
- docker-compose.yml
- .env.example
- .gitignore
- .dockerignore
- run.sh
- README.md
- docs/architecture.md

**Dependencies:** Items 1–5

**Validation:**  
- `./run.sh` completes without errors  
- All services report healthy  
- All endpoints accessible at documented ports  
- README instructions work as written

**Role:** role-devops (devops_support)
