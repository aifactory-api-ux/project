# DEVELOPMENT PLAN: Project

## 1. ARCHITECTURE OVERVIEW

**Components:**
- **Backend:** Single NestJS service (`dispatch-service`) for dispatch/order management, using PostgreSQL for persistence and Redis for caching/session.
- **Shared Modules:** DTOs and utilities shared between backend modules.
- **Infrastructure:** Docker Compose for orchestration, with healthchecks and environment variable management. Local deployment only (no cloud).
- **Database:** PostgreSQL 15.x, with auto-migration and seed data for plants, distribution centers, and dispatches.
- **Cache:** Redis 7.x for session/cache.
- **Frontend:** (Not in scope for this phase; backend-only plan.)

**Models:**
- **DispatchDto, DispatchCreateDto, ProductDispatchDto, ProductDispatchCreateDto** (see SPEC.md §2)
- **Database schema:** dispatches, product_dispatches, plants, distribution_centers, vehicles, drivers (minimal for foreign keys).

**API Endpoints (SPEC.md §3):**
- POST `/api/dispatch`
- GET `/api/dispatch`
- GET `/api/dispatch/:id`
- PATCH `/api/dispatch/:id/status`
- DELETE `/api/dispatch/:id`

**Folder Structure (SPEC.md §4):**
- backend/dispatch-service/src/modules/dispatch/...
- backend/shared/dto/, backend/shared/utils/
- backend/dispatch-service/src/config/
- backend/dispatch-service/Dockerfile
- docker-compose.yml, .env.example, run.sh, README.md, .gitignore, .dockerignore

## 2. ACCEPTANCE CRITERIA

1. The backend service exposes all dispatch management endpoints as specified, with correct request/response DTOs and validation.
2. Database schema is auto-migrated and seeded with 4 plants, 5 distribution centers, and 30 dispatches on startup; no manual DB setup required.
3. All services start via `./run.sh`, pass healthchecks, and are accessible at the documented ports; environment variables are validated at startup.

## TEAM SCOPE (MANDATORY — PARSED BY THE PIPELINE)
Every executable item MUST include exactly one line at the end of the item block (after Validation):
**Role:** <role_id> (<category>)

## 3. EXECUTABLE ITEMS

### ITEM 1: Foundation — shared types, DTOs, DB schema, config, and utilities
**Goal:** Create all shared code and configuration required by backend modules, including DTOs, utility functions, and the complete database schema (SQL). This includes:
- All DTOs for dispatch and product-dispatch (as per SPEC.md §2)
- Shared product DTO
- Date/time utility functions
- Environment variable validation and shared config
- Complete SQL schema for all required tables and indexes (dispatches, product_dispatches, plants, distribution_centers, vehicles, drivers)
**Files to create:**
- backend/shared/dto/product.dto.ts
- backend/shared/utils/date.ts
- backend/dispatch-service/src/modules/dispatch/dto/dispatch.dto.ts
- backend/dispatch-service/src/modules/dispatch/dto/product-dispatch.dto.ts
- backend/dispatch-service/src/modules/dispatch/entities/dispatch.entity.ts
- backend/dispatch-service/src/config/database.config.ts
- backend/dispatch-service/src/config/redis.config.ts
- backend/dispatch-service/src/db/schema.sql
**Dependencies:** None
**Validation:** All DTOs/interfaces are importable and used by backend modules; running the schema SQL creates all required tables and indexes without error.
**Role:** role-tl (technical_lead)

### ITEM 2: Dispatch Service — API endpoints, business logic, healthcheck
**Goal:** Implement the dispatch management module in NestJS, exposing all endpoints as per SPEC.md §3:
- POST `/api/dispatch` (create dispatch)
- GET `/api/dispatch` (list dispatches, with filters)
- GET `/api/dispatch/:id` (get dispatch by ID)
- PATCH `/api/dispatch/:id/status` (update status)
- DELETE `/api/dispatch/:id` (delete dispatch)
- GET `/health` (service healthcheck)
Includes: controller, service, module definition, and integration with DB and Redis configs. Implements input validation, error handling, and structured logging.
**Files to create:**
- backend/dispatch-service/src/main.ts
- backend/dispatch-service/src/app.module.ts
- backend/dispatch-service/src/modules/dispatch/dispatch.controller.ts
- backend/dispatch-service/src/modules/dispatch/dispatch.service.ts
- backend/dispatch-service/src/modules/dispatch/dispatch.module.ts
**Dependencies:** Item 1
**Validation:** All endpoints respond as per SPEC.md; healthcheck returns status 200 with service/version; logs are structured; invalid input returns 400 with error message.
**Role:** role-be (backend_developer)

### ITEM 3: Dispatch Service — Dockerfile, TypeScript config, and E2E test stub
**Goal:** Containerize the dispatch-service for local deployment, ensuring production-ready build and correct port exposure. Provide TypeScript config for strict type checking. Include E2E test stub (no test code, just file for future use).
**Files to create:**
- backend/dispatch-service/Dockerfile (multi-stage, EXPOSE 23001, runs on correct port, copies shared/ modules)
- backend/dispatch-service/tsconfig.json (strict mode, paths for shared modules)
- backend/dispatch-service/test/dispatch.e2e-spec.ts (empty stub, as per SPEC.md)
**Dependencies:** Item 1
**Validation:** `docker build` and `docker run` start the service on port 23001; TypeScript compiles with no errors; E2E test file exists for future use.
**Role:** role-be (backend_developer)

### ITEM 4: Infrastructure & Deployment (Docker Compose, env, orchestration)
**Goal:** Provide complete orchestration for local deployment, including:
- docker-compose.yml (dispatch-service, postgres, redis; correct ports, healthchecks, depends_on with service_healthy)
- .env.example (all required variables, with descriptions and example values)
- .gitignore (excludes node_modules, dist, .env, etc.)
- .dockerignore (excludes node_modules, .git, dist, logs)
- run.sh (checks Docker, builds, starts, waits for healthy, prints access URL)
- README.md (setup, run, endpoints, troubleshooting)
- docs/architecture.md (system diagram and component descriptions)
**Files to create:**
- docker-compose.yml
- .env.example
- .gitignore
- .dockerignore
- run.sh
- README.md
- docs/architecture.md
**Dependencies:** Items 1, 2, 3
**Validation:** `./run.sh` completes without errors; all services healthy; backend accessible at http://localhost:23001/api/dispatch; healthcheck endpoint responds; seed data present in DB.
**Role:** role-devops (devops_support)
