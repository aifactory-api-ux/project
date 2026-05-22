# DEVELOPMENT PLAN: Project

## 1. ARCHITECTURE OVERVIEW

**System Overview:**  
A modular monolithic e-commerce backend for a cat-specialized online store, built with Node.js 20, Express 4.18, PostgreSQL 15, and Redis 7. The backend exposes RESTful endpoints for product catalog, categories, user authentication, cart, and orders, as defined in SPEC.md. All code is strictly backend-only (no frontend code), following the provided folder structure and file contracts.

**Key Components:**
- **Express API** (`backend/`): Handles all business logic and API endpoints.
- **PostgreSQL**: Stores all persistent data (products, categories, users, carts, orders).
- **Redis**: Used for caching and session/token management.
- **Docker Compose**: Orchestrates backend, database, and cache for local/dev environments.
- **Healthchecks, structured logging, env validation, error handling**: Included as enterprise baseline.

**Folder Structure (backend only):**
```
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── routes/
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── cart.ts
│   │   └── orders.ts
│   ├── models/
│   │   ├── product.ts
│   │   ├── category.ts
│   │   ├── user.ts
│   │   ├── cart.ts
│   │   └── order.ts
│   ├── controllers/
│   │   ├── productController.ts
│   │   ├── categoryController.ts
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── cartController.ts
│   │   └── orderController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── db/
│   │   ├── index.ts
│   │   └── redis.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── password.ts
│   └── types/
│       ├── product.ts
│       ├── category.ts
│       ├── user.ts
│       ├── cart.ts
│       └── order.ts
├── Dockerfile
└── .env.example
```

**API Endpoints:**  
As defined in SPEC.md §3, covering products, categories, users/auth, cart, and orders.

**Database Schema:**  
Tables: products, categories, users, carts, cart_items, orders, order_items.  
All schemas, indexes, and constraints as per SPEC.md §2.

**Infrastructure:**  
- `docker-compose.yml` at root: orchestrates backend, postgres, redis.
- Healthchecks and startup order enforced.
- `run.sh` for local dev bootstrap.

## 2. ACCEPTANCE CRITERIA

1. All API endpoints in SPEC.md §3 are implemented and respond with correct data contracts.
2. Database schema matches SPEC.md §2, is auto-initialized and seeded with sample data on startup.
3. Backend service passes healthcheck, validates environment variables, and logs in structured JSON.
4. JWT authentication and authorization enforced on protected endpoints.
5. Docker Compose brings up all services (`./run.sh`), with healthchecks and no manual steps required.
6. Error handling, input validation, and logging meet enterprise standards (no stack traces to clients).

## TEAM SCOPE (MANDATORY — PARSED BY THE PIPELINE)
Every executable item MUST include exactly one line at the end of the item block (after Validation):
**Role:** <role_id> (<category>)

---

## 3. EXECUTABLE ITEMS

### ITEM 1: Foundation — shared types, interfaces, DB schemas, config
**Goal:** Create all shared code and configuration required by the backend: TypeScript interfaces for all data contracts, database schema (SQL), environment variable validation, and shared utility functions. This includes all files in `backend/src/types/`, `backend/src/db/`, and `backend/src/utils/` that are imported by other modules.
**Files to create:**
- backend/src/types/product.ts (create) — Product interface/type
- backend/src/types/category.ts (create) — Category interface/type
- backend/src/types/user.ts (create) — User interface/type
- backend/src/types/cart.ts (create) — Cart and CartItem interfaces/types
- backend/src/types/order.ts (create) — Order interface/type
- backend/src/db/schema.sql (create) — Full PostgreSQL schema for all tables, indexes, constraints
- backend/src/db/index.ts (create) — PostgreSQL connection pool, env validation
- backend/src/db/redis.ts (create) — Redis connection, env validation
- backend/src/utils/jwt.ts (create) — JWT sign/verify helpers
- backend/src/utils/password.ts (create) — Password hashing/verification helpers
**Dependencies:** None
**Validation:**  
- `psql` can apply `schema.sql` with no errors; all tables and indexes created.
- `backend/src/db/index.ts` connects to DB using env vars; fails fast if missing.
- All types/interfaces are importable from other backend modules.
**Role:** role-tl (technical_lead)

---

### ITEM 2: Product & Category API — CRUD endpoints and logic
**Goal:** Implement all product and category endpoints as per SPEC.md §3, including controllers, models, and routes. This covers GET/POST/PUT/DELETE for `/api/products` and `/api/categories`.
**Files to create:**
- backend/src/models/product.ts (create) — Product model (DB access)
- backend/src/models/category.ts (create) — Category model (DB access)
- backend/src/controllers/productController.ts (create) — Product business logic
- backend/src/controllers/categoryController.ts (create) — Category business logic
- backend/src/routes/products.ts (create) — Express router for product endpoints
- backend/src/routes/categories.ts (create) — Express router for category endpoints
**Dependencies:** Item 1
**Validation:**  
- `GET /api/products` and `GET /api/categories` return seeded data.
- `POST`, `PUT`, `DELETE` endpoints work and persist changes in DB.
**Role:** role-be (backend_developer)

---

### ITEM 3: User & Auth API — registration, login, JWT, user profile
**Goal:** Implement user registration, login (JWT), and profile endpoints as per SPEC.md §3. Includes password hashing, JWT issuance, and protected `/api/users/me`.
**Files to create:**
- backend/src/models/user.ts (create) — User model (DB access)
- backend/src/controllers/authController.ts (create) — Auth logic (register, login)
- backend/src/controllers/userController.ts (create) — User logic (profile)
- backend/src/routes/auth.ts (create) — Express router for auth endpoints
- backend/src/routes/users.ts (create) — Express router for user endpoints
- backend/src/middleware/auth.ts (create) — JWT middleware for protected routes
**Dependencies:** Item 1
**Validation:**  
- `POST /api/auth/register` creates user, hashes password.
- `POST /api/auth/login` returns JWT and user object.
- `GET /api/users/me` returns user profile when JWT is valid.
**Role:** role-be (backend_developer)

---

### ITEM 4: Cart API — cart CRUD, add/update/remove items
**Goal:** Implement all cart endpoints as per SPEC.md §3, including cart creation, item addition, update, and removal. Handles per-user cart logic, integrates with Redis for caching if needed.
**Files to create:**
- backend/src/models/cart.ts (create) — Cart model (DB access)
- backend/src/controllers/cartController.ts (create) — Cart business logic
- backend/src/routes/cart.ts (create) — Express router for cart endpoints
**Dependencies:** Item 1
**Validation:**  
- `POST /api/cart/items` adds item to cart for authenticated user.
- `PUT /api/cart/items/:productId` updates quantity.
- `DELETE /api/cart/items/:productId` removes item.
- `GET /api/cart` returns current cart for user.
**Role:** role-be (backend_developer)

---

### ITEM 5: Order API — order creation, listing, detail
**Goal:** Implement all order endpoints as per SPEC.md §3, including order creation from cart, listing user orders, and order detail. Handles order status and total calculation.
**Files to create:**
- backend/src/models/order.ts (create) — Order model (DB access)
- backend/src/controllers/orderController.ts (create) — Order business logic
- backend/src/routes/orders.ts (create) — Express router for order endpoints
**Dependencies:** Item 1
**Validation:**  
- `POST /api/orders` creates order from cart items.
- `GET /api/orders` lists user orders.
- `GET /api/orders/:id` returns order detail.
**Role:** role-be (backend_developer)

---

### ITEM 6: Backend Core — Express app, server, error handling, logging
**Goal:** Assemble the Express app, register all routers, implement error handling middleware, healthcheck endpoint, and structured logging. Bootstrap the HTTP server on the correct port.
**Files to create:**
- backend/src/app.ts (create) — Express app entry point, registers all routers and middleware
- backend/src/server.ts (create) — HTTP server bootstrap, listens on port 23001
- backend/src/middleware/errorHandler.ts (create) — Centralized error handler
- backend/Dockerfile (create) — Multi-stage build, non-root user, EXPOSE 23001, runs `node dist/server.js`
- backend/.env.example (create) — All required env vars with descriptions and examples
**Dependencies:** Items 1–5
**Validation:**  
- `GET /health` returns `{status: "ok", service: "backend", version: "1.0.0"}`.
- All routers are registered and respond.
- Errors are logged in structured JSON, not leaked to clients.
- Docker image builds and runs, exposing port 23001.
**Role:** role-be (backend_developer)

---

### ITEM 7: Infrastructure & Deployment
**Goal:** Provide complete Docker orchestration and documentation for local development and deployment. Includes docker-compose, healthchecks, startup script, and project documentation.
**Files to create:**
- docker-compose.yml (create) — Orchestrates backend, postgres, redis, with healthchecks and depends_on
- .env.example (create) — Root-level env vars for all services, with descriptions
- .gitignore (create) — Exclude node_modules, dist, .env, logs, etc.
- .dockerignore (create) — Exclude node_modules, .git, logs, dist
- run.sh (create) — Validates Docker, builds images, starts services, waits for health, prints access URL
- README.md (create) — Prerequisites, setup, run instructions, endpoint summary
- docs/architecture.md (create) — System diagram and component descriptions
**Dependencies:** Items 1–6
**Validation:**  
- `./run.sh` completes with all services healthy.
- Backend accessible at `http://localhost:23001/health`.
- All endpoints respond as documented.
**Role:** role-devops (devops_support)
