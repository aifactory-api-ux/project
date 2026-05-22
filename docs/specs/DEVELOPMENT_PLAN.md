# DEVELOPMENT PLAN: Prueba Luis V4

## 1. ARCHITECTURE OVERVIEW

**Components:**
- **Backend API (Node.js + Express.js):** Single service exposing all endpoints for plants, distribution centers, orders, and metrics (KPIs, trends, volume by plant).
- **Database:** PostgreSQL 15, schema includes tables for plants, distribution_centers, orders, with appropriate constraints and indexes.
- **Cache:** Redis 7 for potential caching of metrics and trends (future scalability).
- **Infrastructure:** Dockerized services, orchestrated via docker-compose, ready for Kubernetes migration. Healthchecks, environment validation, and auto-seeding on startup.
- **Folder Structure:**
  ```
  project-root/
  ├── backend/
  │   ├── Dockerfile
  │   ├── package.json
  │   ├── tsconfig.json
  │   ├── .env.example
  │   └── src/
  │       ├── index.ts
  │       ├── app.ts
  │       ├── db/
  │       │   ├── index.ts
  │       │   ├── schema.sql
  │       │   └── seed.ts
  │       ├── routes/
  │       │   ├── plants.ts
  │       │   ├── distributionCenters.ts
  │       │   ├── orders.ts
  │       │   └── metrics.ts
  │       ├── controllers/
  │       │   ├── plantController.ts
  │       │   ├── distributionCenterController.ts
  │       │   ├── orderController.ts
  │       │   └── metricsController.ts
  │       ├── models/
  │       │   ├── Plant.ts
  │       │   ├── DistributionCenter.ts
  │       │   └── Order.ts
  │       ├── middleware/
  │       │   ├── errorHandler.ts
  │       │   └── validate.ts
  │       ├── utils/
  │       │   ├── logger.ts
  │       │   └── env.ts
  │       └── types/
  │           └── index.d.ts
  ├── docker-compose.yml
  ├── .env.example
  ├── .gitignore
  ├── .dockerignore
  ├── run.sh
  ├── README.md
  └── docs/
      └── architecture.md
  ```
- **API Endpoints:**
  - CRUD for plants: `/plants`
  - CRUD for distribution centers: `/distribution-centers`
  - CRUD for orders: `/orders`
  - Metrics: `/kpis`, `/trends`, `/volume-by-plant`
  - Health: `/health`

**Key Patterns:**
- Strict input validation and error handling.
- Auto-migration and seeding on startup.
- Structured logging.
- All configuration via environment variables, validated at startup.

## 2. ACCEPTANCE CRITERIA

1. On first startup, the backend auto-creates all DB tables and seeds with 4 plants, 5 distribution centers, and 30 orders with correct status distribution and constraints.
2. All endpoints (`/plants`, `/distribution-centers`, `/orders`, `/kpis`, `/trends`, `/volume-by-plant`) are available, validate input, and return correct data and error codes as per requirements.
3. The system runs with a single `./run.sh` command, all services report healthy, and the backend is accessible at `http://localhost:23001` with no manual setup.

## TEAM SCOPE (MANDATORY — PARSED BY THE PIPELINE)
Every executable item MUST include exactly one line at the end of the item block (after Validation):
**Role:** <role_id> (<category>)

## 3. EXECUTABLE ITEMS

### ITEM 1: Foundation — shared types, interfaces, DB schema, config, utilities
**Goal:** Create all shared code and configuration for the backend, including TypeScript interfaces, DB schema (PostgreSQL), environment validation, and utility functions. This includes all models, enums, and types used by routes/controllers, as well as the SQL schema and seed logic.
**Files to create:**
- backend/src/models/Plant.ts (create) — Plant interface/type
- backend/src/models/DistributionCenter.ts (create) — DistributionCenter interface/type
- backend/src/models/Order.ts (create) — Order interface/type, enums for status
- backend/src/types/index.d.ts (create) — Global TypeScript types
- backend/src/db/schema.sql (create) — Full PostgreSQL schema: plants, distribution_centers, orders, constraints, indexes
- backend/src/db/seed.ts (create) — Seed logic for initial data (plants, centers, orders)
- backend/src/utils/env.ts (create) — Environment variable validation
- backend/src/utils/logger.ts (create) — Structured logger utility
**Dependencies:** None
**Validation:** Run `npm run build` and verify all types compile; run `psql` and apply `schema.sql` to confirm schema is valid; run `ts-node src/db/seed.ts` and confirm tables are seeded with correct data.
**Role:** role-tl (technical_lead)

### ITEM 2: Plants & Distribution Centers — CRUD endpoints and controllers
**Goal:** Implement CRUD endpoints and controllers for plants and distribution centers, including input validation, error handling, and DB integration.
**Files to create:**
- backend/src/routes/plants.ts (create) — Express router for `/plants`
- backend/src/routes/distributionCenters.ts (create) — Express router for `/distribution-centers`
- backend/src/controllers/plantController.ts (create) — Controller logic for plants
- backend/src/controllers/distributionCenterController.ts (create) — Controller logic for distribution centers
**Dependencies:** Item 1
**Validation:** Start backend, call all `/plants` and `/distribution-centers` endpoints (GET, POST, PUT, DELETE), verify correct DB changes and error codes for invalid input.
**Role:** role-be (backend_developer)

### ITEM 3: Orders — CRUD endpoints and business rules
**Goal:** Implement CRUD endpoints and controllers for orders, enforcing all business rules (quantity >= 1, status enum, delivery_date logic), input validation, and error handling.
**Files to create:**
- backend/src/routes/orders.ts (create) — Express router for `/orders`
- backend/src/controllers/orderController.ts (create) — Controller logic for orders
- backend/src/middleware/validate.ts (create) — Input validation middleware for orders
**Dependencies:** Item 1
**Validation:** Start backend, call all `/orders` endpoints (GET, POST, PUT, DELETE) with valid and invalid data, verify business rules and error codes.
**Role:** role-be (backend_developer)

### ITEM 4: Metrics — KPIs, trends, and volume endpoints
**Goal:** Implement endpoints for metrics: `/kpis`, `/trends`, `/volume-by-plant`, including query param filters, correct calculations (compliance rate, avg delivery time, etc.), and aggregation logic.
**Files to create:**
- backend/src/routes/metrics.ts (create) — Express router for `/kpis`, `/trends`, `/volume-by-plant`
- backend/src/controllers/metricsController.ts (create) — Controller logic for metrics endpoints
**Dependencies:** Item 1
**Validation:** Start backend, call `/kpis`, `/trends`, `/volume-by-plant` with and without filters, verify calculations match requirements and data is correct.
**Role:** role-be (backend_developer)

### ITEM 5: Backend App Bootstrap — Express app, DB connection, error handling, healthcheck
**Goal:** Implement backend app bootstrap: Express app setup, DB connection pooling, error handling middleware, healthcheck endpoint, and server startup.
**Files to create:**
- backend/src/app.ts (create) — Express app setup, registers all routers, error handler
- backend/src/index.ts (create) — HTTP server bootstrap, connects to DB, runs migrations/seeds, starts server on port 23001
- backend/src/db/index.ts (create) — PostgreSQL connection pool logic
- backend/src/middleware/errorHandler.ts (create) — Centralized error handler
- backend/Dockerfile (create) — Multi-stage build, non-root user, EXPOSE 23001, CMD: node dist/index.js
- backend/package.json (create) — All dependencies and scripts
- backend/tsconfig.json (create) — TypeScript config (strict mode)
- backend/.env.example (create) — Document all required env vars
- backend/README.md (create) — Backend usage and endpoints
**Dependencies:** Item 1
**Validation:** Build and run backend container, verify `/health` returns status, all routers are registered, and errors are handled gracefully.
**Role:** role-be (backend_developer)

### ITEM 6: Infrastructure & Deployment
**Goal:** Complete Docker orchestration and local setup: docker-compose for backend, PostgreSQL, Redis; healthchecks; environment templates; run script; documentation.
**Files to create:**
- docker-compose.yml (create) — Services: backend (23001), postgres (25432), redis (26379), healthchecks, depends_on
- .env.example (create) — All variables for backend, DB, Redis, with descriptions
- .gitignore (create) — Exclude node_modules, dist, .env, *.log
- .dockerignore (create) — Exclude node_modules, .git, dist, *.log
- run.sh (create) — Validates Docker, builds, starts, waits for healthy, prints backend URL
- README.md (create) — Prerequisites, setup, run instructions, endpoint summary
- docs/architecture.md (create) — System diagram and component descriptions
**Dependencies:** All previous items
**Validation:** Run `./run.sh`, confirm all containers healthy, backend accessible at `http://localhost:23001`, DB seeded, all endpoints respond.
**Role:** role-devops (devops_support)
