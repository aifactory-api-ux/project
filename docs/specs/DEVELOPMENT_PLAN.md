# DEVELOPMENT PLAN: Project

## 1. ARCHITECTURE OVERVIEW

**Components:**
- **Auth Service** (`backend/auth-service/`): FastAPI microservice for user registration, login, JWT issuance, and user info.
- **News Service** (`backend/news-service/`): FastAPI microservice for news ingestion, deduplication, semantic classification (via LLM), scoring, feedback, and reporting.
- **Shared** (`backend/shared/`): Shared Pydantic and SQLAlchemy models, DB connection logic, and utilities.
- **Database**: PostgreSQL 15, managed via Alembic migrations, with tables for users, news items, sources, feedback, and scoring configuration.
- **Infrastructure**: Docker Compose for local orchestration, AWS ECS/RDS for production, healthchecks, and CI/CD pipeline.

**Models:**
- User, NewsSource, NewsItem, Feedback, ScoringConfig, Token (Pydantic/SQLAlchemy)
- All enums and constants (roles, status, etc.) defined in shared/models.py

**APIs:**
- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- News: `/api/news`, `/api/news/{id}`, `/api/news` (POST), `/api/news/{id}` (PATCH/DELETE)
- Sources: `/api/sources`, `/api/sources` (POST)
- Health: `/health` on every service

**Folder Structure:**
```
project-root/
├── backend/
│   ├── shared/
│   │   ├── models.py
│   │   ├── db.py
│   │   └── utils.py
│   ├── news-service/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── news.py
│   │   │   └── sources.py
│   │   ├── crud/
│   │   │   ├── news.py
│   │   │   └── sources.py
│   │   ├── models.py
│   │   ├── dependencies.py
│   │   ├── Dockerfile
│   │   └── start.sh
│   ├── auth-service/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── auth.py
│   │   ├── crud/
│   │   │   ├── users.py
│   │   ├── models.py
│   │   ├── dependencies.py
│   │   ├── security.py
│   │   ├── Dockerfile
│   │   └── start.sh
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .dockerignore
├── run.sh
├── README.md
├── docs/
│   └── architecture.md
```

## 2. ACCEPTANCE CRITERIA

1. All backend services start via `./run.sh`, run migrations, seed the DB, and expose `/health` endpoints that return service status, name, and version.
2. Auth service supports user registration, login (JWT), and user info retrieval, with RBAC enforced on protected endpoints.
3. News service ingests news from multiple sources, deduplicates, classifies, scores, and exposes CRUD endpoints for news and sources, with feedback and scoring configuration endpoints.
4. All endpoints validate input/output using Pydantic models, return structured errors, and log in structured JSON format.
5. Infrastructure is fully containerized, with healthchecks, environment validation, and zero manual steps for local setup.

## TEAM SCOPE (MANDATORY — PARSED BY THE PIPELINE)
Every executable item MUST include exactly one line at the end of the item block (after Validation):
**Role:** <role_id> (<category>)

## 3. EXECUTABLE ITEMS

### ITEM 1: Foundation — shared models, DB schemas, config, utilities
**Goal:** Create all shared code and configuration for backend services, including Pydantic and SQLAlchemy models, DB connection logic, shared utilities, and Alembic migration scripts. This includes all models for users, news, sources, feedback, scoring config, enums, and constants. Also includes requirements.txt for all backend dependencies.
**Files to create:**
- backend/shared/models.py (create) — All Pydantic and SQLAlchemy models: User, NewsSource, NewsItem, Feedback, ScoringConfig, Token, enums/constants.
- backend/shared/db.py (create) — Shared SQLAlchemy DB connection logic, session management, and Alembic integration.
- backend/shared/utils.py (create) — Shared utility functions (e.g., deduplication, normalization, scoring helpers).
- backend/shared/config.py (create) — Environment variable validation and shared config (using pydantic-settings).
- backend/requirements.txt (create) — All Python dependencies for all backend services (fastapi, sqlalchemy, alembic, pydantic, psycopg2-binary, python-jose, redis, etc.).
- backend/alembic.ini (create) — Alembic configuration file.
- backend/alembic/env.py (create) — Alembic environment setup, imports models from shared/models.py.
- backend/alembic/versions/<timestamp>_initial.py (create) — Initial migration: creates all tables, indexes, constraints.
- backend/shared/tests/test_models.py (create) — Tests for model creation, validation, and DB roundtrip.
**Dependencies:** None
**Validation:** `pytest backend/shared/tests/` passes; `alembic upgrade head` creates all tables; importing models in both services works without error.
**Role:** role-tl (technical_lead)

### ITEM 2: Auth Service — registration, login, JWT, user info
**Goal:** Implement the authentication microservice with endpoints for user registration (`POST /api/auth/register`), login (`POST /api/auth/login`), and user info (`GET /api/auth/me`). Enforce RBAC, JWT issuance/validation, password hashing, and healthcheck. Use shared models and config from Item 1.
**Files to create:**
- backend/auth-service/main.py (create) — FastAPI app entrypoint, includes `/health` endpoint.
- backend/auth-service/api/auth.py (create) — Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
- backend/auth-service/crud/users.py (create) — User CRUD logic: create, get, authenticate, password hashing.
- backend/auth-service/models.py (create) — SQLAlchemy models for users (imports from shared/models.py).
- backend/auth-service/dependencies.py (create) — FastAPI dependencies: get_current_user, role checks, DB session.
- backend/auth-service/security.py (create) — JWT encode/decode, password hashing (bcrypt), token utilities.
- backend/auth-service/tests/test_auth.py (create) — Tests: registration, login, JWT validation, RBAC error cases.
- backend/auth-service/Dockerfile (create) — Multi-stage build, EXPOSE 23002, CMD: `uvicorn main:app --host 0.0.0.0 --port 23002`
- backend/auth-service/start.sh (create) — Wait for DB, run migrations, seed users if empty, start service.
**Dependencies:** Item 1
**Validation:** `pytest backend/auth-service/tests/` passes; `curl localhost:23002/health` returns status; registration/login/me endpoints work with JWT.
**Role:** role-be-auth (backend_developer)

### ITEM 3: News Service — ingestion, deduplication, classification, scoring, CRUD
**Goal:** Implement the news microservice with endpoints for news CRUD (`/api/news`, `/api/news/{id}`), source CRUD (`/api/sources`), feedback, and scoring config. Includes ingestion from RSS/APIs, deduplication, semantic classification (LLM API integration), scoring, and healthcheck. Uses shared models and config from Item 1.
**Files to create:**
- backend/news-service/main.py (create) — FastAPI app entrypoint, includes `/health` endpoint.
- backend/news-service/api/news.py (create) — Endpoints: `/api/news` (GET/POST), `/api/news/{id}` (GET/PATCH/DELETE), feedback, scoring config.
- backend/news-service/api/sources.py (create) — Endpoints: `/api/sources` (GET/POST).
- backend/news-service/crud/news.py (create) — News CRUD logic, ingestion, deduplication, classification, scoring.
- backend/news-service/crud/sources.py (create) — Source CRUD logic.
- backend/news-service/models.py (create) — SQLAlchemy models for news, sources (imports from shared/models.py).
- backend/news-service/dependencies.py (create) — FastAPI dependencies: get_current_user, role checks, DB session.
- backend/news-service/tests/test_news.py (create) — Tests: news CRUD, ingestion, deduplication, scoring, error cases.
- backend/news-service/Dockerfile (create) — Multi-stage build, EXPOSE 23001, CMD: `uvicorn main:app --host 0.0.0.0 --port 23001`
- backend/news-service/start.sh (create) — Wait for DB, run migrations, seed news/sources if empty, start service.
**Dependencies:** Item 1
**Validation:** `pytest backend/news-service/tests/` passes; `curl localhost:23001/health` returns status; news CRUD and ingestion endpoints work, deduplication and scoring logic tested.
**Role:** role-be-news (backend_developer)

### ITEM 4: Infrastructure & Deployment
**Goal:** Provide complete Docker orchestration and documentation for local and production deployment. Includes docker-compose.yml with all services, healthchecks, environment variable templates, run script, ignore files, and architecture docs.
**Files to create:**
- docker-compose.yml (create) — Orchestrates all backend services, PostgreSQL, Redis (if used), with healthchecks and depends_on:service_healthy.
- .env.example (create) — All required environment variables, descriptions, and example values.
- .gitignore (create) — Exclude Python, Node, build, and secret files.
- .dockerignore (create) — Exclude build artifacts, .git, logs.
- run.sh (create) — Validates Docker, builds images, starts all services, waits for healthy, prints access URLs.
- README.md (create) — Setup instructions, endpoints, troubleshooting, and test commands.
- docs/architecture.md (create) — System diagram, component descriptions, deployment flow.
**Dependencies:** Items 1, 2, 3
**Validation:** `./run.sh` completes with all services healthy, endpoints accessible, and seed data present; README instructions work end-to-end.
**Role:** role-devops (devops_support)
