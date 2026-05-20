# MASTER DEVELOPMENT PLAN

> Fuente de verdad única. Los nombres de clases, fields, rutas y variables
> definidos en §1 son los ÚNICOS válidos — el coder no puede inventar nombres.

> ⚠️ **ORDEN DE IMPLEMENTACIÓN GLOBAL — NO NEGOCIABLE:**
> 1. Implementa **TODOS** los ítems marcados 🔴 TEST (de todos los waves) antes de escribir cualquier ítem 🟢 PROD.
> 2. Una vez escritos todos los tests, implementa los ítems 🟢 PROD.
> 3. Si no hay ítems 🔴 TEST, implementa los 🟢 PROD directamente.
> Razón: el código de producción debe ser escrito sabiendo qué contratos deben satisfacer los tests.

---

# §1 Contratos Globales

## §1.1 Especificación Técnica — Stack, Modelos, Estructura, Env Vars

# SPEC.md

## 1. TECHNOLOGY STACK

- **Backend**
  - Node.js v20.x
  - NestJS v10.x
  - TypeScript v5.x
- **Database**
  - PostgreSQL 15.x
- **Cache/Queue**
  - Redis 7.x
- **Frontend**
  - React 18.x
  - TypeScript v5.x
- **Containerization & Orchestration**
  - Docker 24.x
  - docker-compose 2.x
  - Kubernetes 1.28.x
- **Other**
  - dotenv v16.x (for env var management)
  - pg v8.x (PostgreSQL client for Node.js)
  - ioredis v5.x (Redis client for Node.js)

---

## 2. DATA CONTRACTS

### TypeScript Interfaces (Backend & Frontend)

```typescript
// backend/shared/models/User.ts & frontend/src/types/User.ts
export interface User {
  id: string;                // UUID
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: string;         // ISO8601
  updatedAt: string;         // ISO8601
}

// backend/shared/models/Session.ts & frontend/src/types/Session.ts
export interface Session {
  id: string;                // UUID
  userId: string;            // UUID
  token: string;
  createdAt: string;         // ISO8601
  expiresAt: string;         // ISO8601
}

// backend/shared/models/Opportunity.ts & frontend/src/types/Opportunity.ts
export interface Opportunity {
  id: string;                // UUID
  title: string;
  description: string;
  ownerId: string;           // UUID
  status: 'open' | 'closed';
  createdAt: string;         // ISO8601
  updatedAt: string;         // ISO8601
}
```

### Pydantic Models (for reference, not used in Node.js/NestJS stack)

_Not applicable. All models are defined as TypeScript interfaces above._

---

## 3. API ENDPOINTS

### Auth Service

#### POST /api/auth/register

- **Request Body:**  
  ```json
  {
    "email": "string",
    "password": "string",
    "fullName": "string"
  }
  ```
- **Response:**  
  `201 Created`
  ```json
  {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

#### POST /api/auth/login

- **Request Body:**  
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**  
  `200 OK`
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "fullName": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
  ```

#### GET /api/auth/me

- **Headers:**  
  `Authorization: Bearer <token>`
- **Response:**  
  `200 OK`
  ```json
  {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### Opportunity Service

#### GET /api/opportunities

- **Headers:**  
  `Authorization: Bearer <token>`
- **Response:**  
  `200 OK`
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "ownerId": "string",
      "status": "open" | "closed",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

#### POST /api/opportunities

- **Headers:**  
  `Authorization: Bearer <token>`
- **Request Body:**  
  ```json
  {
    "title": "string",
    "description": "string"
  }
  ```
- **Response:**  
  `201 Created`
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "ownerId": "string",
    "status": "open",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

#### GET /api/opportunities/:id

- **Headers:**  
  `Authorization: Bearer <token>`
- **Response:**  
  `200 OK`
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "ownerId": "string",
    "status": "open" | "closed",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

#### PATCH /api/opportunities/:id

- **Headers:**  
  `Authorization: Bearer <token>`
- **Request Body:**  
  ```json
  {
    "title": "string",
    "description": "string",
    "status": "open" | "closed"
  }
  ```
- **Response:**  
  `200 OK`
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "ownerId": "string",
    "status": "open" | "closed",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

#### DELETE /api/opportunities/:id

- **Headers:**  
  `Authorization: Bearer <token>`
- **Response:**  
  `204 No Content`

---

## 4. FILE STRUCTURE

### PORT TABLE

| Service              | Listening Port | Path                        |
|----------------------|---------------|-----------------------------|
| auth-service         | 23001         | backend/auth-service/       |
| opportunity-service  | 23002         | backend/opportunity-service/ |

### SHARED MODULES

| Shared path          | Imported by services                        |
|----------------------|---------------------------------------------|
| backend/shared/      | auth-service, opportunity-service           |

### FILE TREE

```
.
├── docker-compose.yml                # Multi-service orchestration (all ports 21000–65000)
├── .env.example                     # Template for environment variables
├── .gitignore                       # Git ignore rules
├── README.md                        # Project documentation
├── run.sh                           # Root-level startup script
├── backend/
│   ├── shared/                      # Shared modules (models, utils)
│   │   ├── models/
│   │   │   ├── User.ts              # User interface
│   │   │   ├── Session.ts           # Session interface
│   │   │   └── Opportunity.ts       # Opportunity interface
│   │   └── utils/
│   │       └── hash.ts              # Password hashing utilities
│   ├── auth-service/
│   │   ├── Dockerfile               # Auth service Dockerfile (EXPOSE 23001)
│   │   ├── src/
│   │   │   ├── main.ts              # NestJS bootstrap
│   │   │   ├── app.module.ts        # Root module
│   │   │   ├── auth.controller.ts   # Auth endpoints
│   │   │   ├── auth.service.ts      # Auth business logic
│   │   │   ├── session.service.ts   # Session/token logic
│   │   │   └── user.repository.ts   # User DB access
│   │   ├── test/
│   │   │   └── auth.e2e-spec.ts     # E2E tests
│   │   └── tsconfig.json            # TypeScript config
│   ├── opportunity-service/
│   │   ├── Dockerfile               # Opportunity service Dockerfile (EXPOSE 23002)
│   │   ├── src/
│   │   │   ├── main.ts              # NestJS bootstrap
│   │   │   ├── app.module.ts        # Root module
│   │   │   ├── opportunity.controller.ts # Opportunity endpoints
│   │   │   ├── opportunity.service.ts    # Business logic
│   │   │   └── opportunity.repository.ts # DB access
│   │   ├── test/
│   │   │   └── opportunity.e2e-spec.ts  # E2E tests
│   │   └── tsconfig.json            # TypeScript config
│   └── shared/
│       └── ...                      # (as above)
├── frontend/
│   ├── Dockerfile                   # Frontend Dockerfile
│   ├── public/
│   │   └── index.html               # HTML entry point
│   ├── src/
│   │   ├── main.tsx                 # React entry point
│   │   ├── App.tsx                  # Root component
│   │   ├── api/
│   │   │   ├── auth.ts              # Auth API client
│   │   │   └── opportunity.ts       # Opportunity API client
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           # Auth state hook
│   │   │   └── useOpportunities.ts  # Opportunities state hook
│   │   ├── components/
│   │   │   ├── AuthForm.tsx         # Login/register form
│   │   │   ├── OpportunityList.tsx  # List of opportunities
│   │   │   ├── OpportunityForm.tsx  # Create/edit form
│   │   │   └── Layout.tsx           # Layout wrapper
│   │   ├── types/
│   │   │   ├── User.ts              # User interface
│   │   │   ├── Session.ts           # Session interface
│   │   │   └── Opportunity.ts       # Opportunity interface
│   │   └── styles/
│   │       └── tokens.ts            # Design tokens
│   └── tsconfig.json                # TypeScript config
```

---

## 5. ENVIRONMENT VARIABLES

| Name                      | Type     | Description                                 | Example Value                |
|---------------------------|----------|---------------------------------------------|------------------------------|
| NODE_ENV                  | string   | Node environment                            | development                  |
| POSTGRES_HOST             | string   | PostgreSQL host                             | postgres                     |
| POSTGRES_PORT             | number   | PostgreSQL port (container-internal: 5432)  | 5432                         |
| POSTGRES_USER             | string   | PostgreSQL username                         | projectuser                  |
| POSTGRES_PASSWORD         | string   | PostgreSQL password                         | secretpassword               |
| POSTGRES_DB               | string   | PostgreSQL database name                    | projectdb                    |
| REDIS_HOST                | string   | Redis host                                  | redis                        |
| REDIS_PORT                | number   | Redis port (container-internal: 6379)       | 6379                         |
| JWT_SECRET                | string   | Secret for JWT signing                      | supersecretjwtkey            |
| AUTH_SERVICE_PORT         | number   | Auth service port (EXPOSE/CMD: 23001)       | 23001                        |
| OPPORTUNITY_SERVICE_PORT  | number   | Opportunity service port (EXPOSE/CMD: 23002)| 23002                        |
| FRONTEND_PORT             | number   | Frontend dev server port (EXPOSE/CMD: 3000) | 3000                         |
| API_BASE_URL              | string   | Base URL for frontend API calls             | http://localhost:23001       |

---

## 6. IMPORT CONTRACTS

### Backend Shared Models

```typescript
// User model
import { User } from '../../shared/models/User';

// Session model
import { Session } from '../../shared/models/Session';

// Opportunity model
import { Opportunity } from '../../shared/models/Opportunity';

// Password hashing utility
import { hashPassword, comparePassword } from '../../shared/utils/hash';
```

### Auth Service

```typescript
// Auth controller
import { AuthController } from './auth.controller';
// Auth service
import { AuthService } from './auth.service';
// Session service
import { SessionService } from './session.service';
// User repository
import { UserRepository } from './user.repository';
```

### Opportunity Service

```typescript
// Opportunity controller
import { OpportunityController } from './opportunity.controller';
// Opportunity service
import { OpportunityService } from './opportunity.service';
// Opportunity repository
import { OpportunityRepository } from './opportunity.repository';
```

### Frontend

```typescript
// API clients
import { login, register, getMe } from './api/auth';
import { getOpportunities, createOpportunity, updateOpportunity, deleteOpportunity } from './api/opportunity';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useOpportunities } from './hooks/useOpportunities';

// Types
import { User } from './types/User';
import { Session } from './types/Session';
import { Opportunity } from './types/Opportunity';

// Design tokens
import { tokens } from './styles/tokens';
```

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### React Hooks

```
useAuth() → {
  user: User | null,
  token: string | null,
  loading: boolean,
  error: string | null,
  login: (email: string, password: string) => Promise<void>,
  register: (email: string, password: string, fullName: string) => Promise<void>,
  logout: () => void
}

useOpportunities() → {
  opportunities: Opportunity[],
  loading: boolean,
  error: string | null,
  fetchOpportunities: () => Promise<void>,
  createOpportunity: (data: { title: string, description: string }) => Promise<void>,
  updateOpportunity: (id: string, data: { title?: string, description?: string, status?: 'open' | 'closed' }) => Promise<void>,
  deleteOpportunity: (id: string) => Promise<void>
}
```

### Components

```
AuthForm props: {
  mode: 'login' | 'register',
  onSubmit: (data: { email: string, password: string, fullName?: string }) => void,
  loading: boolean,
  error: string | null
}

OpportunityList props: {
  opportunities: Opportunity[],
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  deletingId: string | null
}

OpportunityForm props: {
  initialData?: { title: string, description: string },
  onSubmit: (data: { title: string, description: string }) => void,
  loading: boolean
}

Layout props: {
  children: React.ReactNode
}
```

---

## 8. FILE EXTENSION CONVENTION

- All frontend files use `.tsx` (TypeScript React).
- The project is TypeScript throughout (backend and frontend).
- **Entry point:** `/src/main.tsx` (as referenced in `public/index.html` via `<script src="/src/main.tsx">`).

---

## 9. DESIGN TOKENS

_Not included: No UI/UX Design Implementation Contract provided._

## §1.2 Contrato API (OpenAPI 3.1)
> Ref obligatoria para tests de endpoints: usa los paths, schemas y status codes exactos de aquí.

```yaml
openapi: 3.1.0
info:
  title: Derived API Contract
  version: 1.0.0
paths:
  /api/auth/login:
    post:
      operationId: post_api_auth_login
      responses:
        '201':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/auth/me:
    get:
      operationId: get_api_auth_me
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
  /api/auth/register:
    post:
      operationId: post_api_auth_register
      responses:
        '201':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/opportunities:
    get:
      operationId: get_api_opportunities
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
    post:
      operationId: post_api_opportunities
      responses:
        '201':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
  /api/opportunities/:id:
    delete:
      operationId: delete_api_opportunities_id
      responses:
        '204':
          description: Derived from SPEC.md
    get:
      operationId: get_api_opportunities_id
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
    patch:
      operationId: patch_api_opportunities_id
      responses:
        '200':
          description: Derived from SPEC.md
          content:
            application/json:
              schema:
                type: object
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
```

## §1.3 Archivos de Test y Scripts a Crear (TDD — complemento de la estructura §1.1)
> La FILE STRUCTURE de §1.1 fue generada antes de los specs TDD — no incluye `tests/` ni `run_tests.sh`.
> Los siguientes archivos son OBLIGATORIOS. Créalos en los paths exactos indicados.
> ⚠️  NUNCA usar archivos `.spec.*` co-ubicados con el source.

**Scripts de ejecución (crear y hacer chmod +x):**
- `backend/api-gateway/run_tests.sh`
- `backend/auth-service/run_tests.sh`
- `backend/catalog-service/run_tests.sh`
- `backend/notification-service/run_tests.sh`
- `backend/order-service/run_tests.sh`
- `backend/shared/run_tests.sh`
- `tests/run_tests.sh`

**Archivos de test (crear en los paths exactos):**
- `backend/api-gateway/tests/test_app_module.py`
- `backend/api-gateway/tests/test_main.py`
- `backend/auth-service/tests/test_auth_controller.py`
- `backend/auth-service/tests/test_auth_service.py`
- `backend/auth-service/tests/test_user_repository.py`
- `backend/catalog-service/tests/test_app_module.py`
- `backend/catalog-service/tests/test_main.py`
- `backend/notification-service/tests/test_app_module.py`
- `backend/notification-service/tests/test_main.py`
- `backend/order-service/tests/test_app_module.py`
- `backend/order-service/tests/test_main.py`
- `backend/shared/tests/test_config_env.py`
- `backend/shared/tests/test_db_schemas.py`
- `backend/shared/tests/test_models_Opportunity.py`
- `backend/shared/tests/test_models_Session.py`
- `backend/shared/tests/test_models_User.py`
- `tests/test_docker_compose.py`
- `tests/test_readme_md.py`
- `tests/test_run_sh.py`

---

# §2 Plan de Implementación

> **REGLA TDD OBLIGATORIA**
> 1. Escribe el ítem 🔴 TEST completo antes de tocar el ítem 🟢 PROD.
> 2. Corre los tests: deben fallar (RED). Si pasan sin código de producción, el test está mal.
> 3. Escribe el código de producción mínimo para que pasen (GREEN).
> 4. Si los tests fallan después del paso 3, corrige SOLO producción — nunca los tests.

## Wave 1

### 🟢 PROD — run_tests.sh — backend/api-gateway
> Crea el archivo `backend/api-gateway/run_tests.sh` con el siguiente contenido EXACTO (no lo modifiques ni resumas):
**Archivos:**
  - `backend/api-gateway/run_tests.sh`

**Detalle:**
```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
echo ">>> [backend/api-gateway] Installing Python test dependencies..."
pip install pytest pytest-cov pytest-asyncio httpx anyio aiosqlite     fastapi sqlalchemy pyjwt passlib bcrypt python-multipart -q 2>/dev/null || true
# Install project deps declared in requirements.txt if present
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q 2>/dev/null || true
fi
echo ">>> [backend/api-gateway] Running tests..."
# Override DB URLs to SQLite in-memory so tests run without a live database
export DATABASE_URL="sqlite+aiosqlite:///:memory:"
export ASYNC_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export DB_URL="sqlite:///:memory:"
export TEST_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export SECRET_KEY="test-secret-key"
export JWT_SECRET="test-secret-key"
# Add service dir + parent dirs to PYTHONPATH so both relative and package imports work
# This handles: microservice layout (from routes import ...) and
#               monolith layout (from app.routers.auth import ...)
export PYTHONPATH="$(pwd):$(dirname $(pwd)):$(dirname $(dirname $(pwd))):${PYTHONPATH:-}"
mkdir -p coverage
python -m pytest tests/ --tb=short -q \
  --cov=. --cov-report=term-missing \
  --cov-report=json:coverage/coverage.json \
  --no-header 2>&1 | tee /tmp/test_out_backend_api-gateway.txt
echo ">>> [backend/api-gateway] Done."
```

Luego ejecuta: `chmod +x backend/api-gateway/run_tests.sh`

### 🟢 PROD — run_tests.sh — backend/auth-service
> Crea el archivo `backend/auth-service/run_tests.sh` con el siguiente contenido EXACTO (no lo modifiques ni resumas):
**Archivos:**
  - `backend/auth-service/run_tests.sh`

**Detalle:**
```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
echo ">>> [backend/auth-service] Installing Python test dependencies..."
pip install pytest pytest-cov pytest-asyncio httpx anyio aiosqlite     fastapi sqlalchemy pyjwt passlib bcrypt python-multipart -q 2>/dev/null || true
# Install project deps declared in requirements.txt if present
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q 2>/dev/null || true
fi
echo ">>> [backend/auth-service] Running tests..."
# Override DB URLs to SQLite in-memory so tests run without a live database
export DATABASE_URL="sqlite+aiosqlite:///:memory:"
export ASYNC_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export DB_URL="sqlite:///:memory:"
export TEST_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export SECRET_KEY="test-secret-key"
export JWT_SECRET="test-secret-key"
# Add service dir + parent dirs to PYTHONPATH so both relative and package imports work
# This handles: microservice layout (from routes import ...) and
#               monolith layout (from app.routers.auth import ...)
export PYTHONPATH="$(pwd):$(dirname $(pwd)):$(dirname $(dirname $(pwd))):${PYTHONPATH:-}"
mkdir -p coverage
python -m pytest tests/ --tb=short -q \
  --cov=. --cov-report=term-missing \
  --cov-report=json:coverage/coverage.json \
  --no-header 2>&1 | tee /tmp/test_out_backend_auth-service.txt
echo ">>> [backend/auth-service] Done."
```

Luego ejecuta: `chmod +x backend/auth-service/run_tests.sh`

### 🟢 PROD — run_tests.sh — backend/catalog-service
> Crea el archivo `backend/catalog-service/run_tests.sh` con el siguiente contenido EXACTO (no lo modifiques ni resumas):
**Archivos:**
  - `backend/catalog-service/run_tests.sh`

**Detalle:**
```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
echo ">>> [backend/catalog-service] Installing Python test dependencies..."
pip install pytest pytest-cov pytest-asyncio httpx anyio aiosqlite     fastapi sqlalchemy pyjwt passlib bcrypt python-multipart -q 2>/dev/null || true
# Install project deps declared in requirements.txt if present
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q 2>/dev/null || true
fi
echo ">>> [backend/catalog-service] Running tests..."
# Override DB URLs to SQLite in-memory so tests run without a live database
export DATABASE_URL="sqlite+aiosqlite:///:memory:"
export ASYNC_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export DB_URL="sqlite:///:memory:"
export TEST_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export SECRET_KEY="test-secret-key"
export JWT_SECRET="test-secret-key"
# Add service dir + parent dirs to PYTHONPATH so both relative and package imports work
# This handles: microservice layout (from routes import ...) and
#               monolith layout (from app.routers.auth import ...)
export PYTHONPATH="$(pwd):$(dirname $(pwd)):$(dirname $(dirname $(pwd))):${PYTHONPATH:-}"
mkdir -p coverage
python -m pytest tests/ --tb=short -q \
  --cov=. --cov-report=term-missing \
  --cov-report=json:coverage/coverage.json \
  --no-header 2>&1 | tee /tmp/test_out_backend_catalog-service.txt
echo ">>> [backend/catalog-service] Done."
```

Luego ejecuta: `chmod +x backend/catalog-service/run_tests.sh`

### 🟢 PROD — run_tests.sh — backend/notification-service
> Crea el archivo `backend/notification-service/run_tests.sh` con el siguiente contenido EXACTO (no lo modifiques ni resumas):
**Archivos:**
  - `backend/notification-service/run_tests.sh`

**Detalle:**
```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
echo ">>> [backend/notification-service] Installing Python test dependencies..."
pip install pytest pytest-cov pytest-asyncio httpx anyio aiosqlite     fastapi sqlalchemy pyjwt passlib bcrypt python-multipart -q 2>/dev/null || true
# Install project deps declared in requirements.txt if present
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q 2>/dev/null || true
fi
echo ">>> [backend/notification-service] Running tests..."
# Override DB URLs to SQLite in-memory so tests run without a live database
export DATABASE_URL="sqlite+aiosqlite:///:memory:"
export ASYNC_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export DB_URL="sqlite:///:memory:"
export TEST_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export SECRET_KEY="test-secret-key"
export JWT_SECRET="test-secret-key"
# Add service dir + parent dirs to PYTHONPATH so both relative and package imports work
# This handles: microservice layout (from routes import ...) and
#               monolith layout (from app.routers.auth import ...)
export PYTHONPATH="$(pwd):$(dirname $(pwd)):$(dirname $(dirname $(pwd))):${PYTHONPATH:-}"
mkdir -p coverage
python -m pytest tests/ --tb=short -q \
  --cov=. --cov-report=term-missing \
  --cov-report=json:coverage/coverage.json \
  --no-header 2>&1 | tee /tmp/test_out_backend_notification-service.txt
echo ">>> [backend/notification-service] Done."
```

Luego ejecuta: `chmod +x backend/notification-service/run_tests.sh`

### 🟢 PROD — run_tests.sh — backend/order-service
> Crea el archivo `backend/order-service/run_tests.sh` con el siguiente contenido EXACTO (no lo modifiques ni resumas):
**Archivos:**
  - `backend/order-service/run_tests.sh`

**Detalle:**
```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
echo ">>> [backend/order-service] Installing Python test dependencies..."
pip install pytest pytest-cov pytest-asyncio httpx anyio aiosqlite     fastapi sqlalchemy pyjwt passlib bcrypt python-multipart -q 2>/dev/null || true
# Install project deps declared in requirements.txt if present
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q 2>/dev/null || true
fi
echo ">>> [backend/order-service] Running tests..."
# Override DB URLs to SQLite in-memory so tests run without a live database
export DATABASE_URL="sqlite+aiosqlite:///:memory:"
export ASYNC_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export DB_URL="sqlite:///:memory:"
export TEST_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export SECRET_KEY="test-secret-key"
export JWT_SECRET="test-secret-key"
# Add service dir + parent dirs to PYTHONPATH so both relative and package imports work
# This handles: microservice layout (from routes import ...) and
#               monolith layout (from app.routers.auth import ...)
export PYTHONPATH="$(pwd):$(dirname $(pwd)):$(dirname $(dirname $(pwd))):${PYTHONPATH:-}"
mkdir -p coverage
python -m pytest tests/ --tb=short -q \
  --cov=. --cov-report=term-missing \
  --cov-report=json:coverage/coverage.json \
  --no-header 2>&1 | tee /tmp/test_out_backend_order-service.txt
echo ">>> [backend/order-service] Done."
```

Luego ejecuta: `chmod +x backend/order-service/run_tests.sh`

### 🟢 PROD — run_tests.sh — backend/shared
> Crea el archivo `backend/shared/run_tests.sh` con el siguiente contenido EXACTO (no lo modifiques ni resumas):
**Archivos:**
  - `backend/shared/run_tests.sh`

**Detalle:**
```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
echo ">>> [backend/shared] Installing Python test dependencies..."
pip install pytest pytest-cov pytest-asyncio httpx anyio aiosqlite     fastapi sqlalchemy pyjwt passlib bcrypt python-multipart -q 2>/dev/null || true
# Install project deps declared in requirements.txt if present
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q 2>/dev/null || true
fi
echo ">>> [backend/shared] Running tests..."
# Override DB URLs to SQLite in-memory so tests run without a live database
export DATABASE_URL="sqlite+aiosqlite:///:memory:"
export ASYNC_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export DB_URL="sqlite:///:memory:"
export TEST_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export SECRET_KEY="test-secret-key"
export JWT_SECRET="test-secret-key"
# Add service dir + parent dirs to PYTHONPATH so both relative and package imports work
# This handles: microservice layout (from routes import ...) and
#               monolith layout (from app.routers.auth import ...)
export PYTHONPATH="$(pwd):$(dirname $(pwd)):$(dirname $(dirname $(pwd))):${PYTHONPATH:-}"
mkdir -p coverage
python -m pytest tests/ --tb=short -q \
  --cov=. --cov-report=term-missing \
  --cov-report=json:coverage/coverage.json \
  --no-header 2>&1 | tee /tmp/test_out_backend_shared.txt
echo ">>> [backend/shared] Done."
```

Luego ejecuta: `chmod +x backend/shared/run_tests.sh`

### 🟢 PROD — run_tests.sh — tests
> Crea el archivo `tests/run_tests.sh` con el siguiente contenido EXACTO (no lo modifiques ni resumas):
**Archivos:**
  - `tests/run_tests.sh`

**Detalle:**
```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
echo ">>> [tests] Installing Python test dependencies..."
pip install pytest pytest-cov pytest-asyncio httpx anyio aiosqlite     fastapi sqlalchemy pyjwt passlib bcrypt python-multipart -q 2>/dev/null || true
# Install project deps declared in requirements.txt if present
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q 2>/dev/null || true
fi
echo ">>> [tests] Running tests..."
# Override DB URLs to SQLite in-memory so tests run without a live database
export DATABASE_URL="sqlite+aiosqlite:///:memory:"
export ASYNC_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export DB_URL="sqlite:///:memory:"
export TEST_DATABASE_URL="sqlite+aiosqlite:///:memory:"
export SECRET_KEY="test-secret-key"
export JWT_SECRET="test-secret-key"
# Add service dir + parent dirs to PYTHONPATH so both relative and package imports work
# This handles: microservice layout (from routes import ...) and
#               monolith layout (from app.routers.auth import ...)
export PYTHONPATH="$(pwd):$(dirname $(pwd)):$(dirname $(dirname $(pwd))):${PYTHONPATH:-}"
mkdir -p coverage
python -m pytest tests/ --tb=short -q \
  --cov=. --cov-report=term-missing \
  --cov-report=json:coverage/coverage.json \
  --no-header 2>&1 | tee /tmp/test_out_tests.txt
echo ">>> [tests] Done."
```

Luego ejecuta: `chmod +x tests/run_tests.sh`

### 🔴 TEST — Tests: backend/shared/models/User.ts
> Ref: §1.1 (modelos de `backend/shared/models/User.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/shared/tests/test_models_User.py`

**Casos de prueba (implementar todos):**
- `test_user_interface_accepts_valid_fields`: User interface should accept all required fields with correct types as per SPEC.md.
  - Input: `{'id': 'uuid-string', 'email': 'user@example.com', 'passwordHash': 'hashedpassword', 'fullName': 'Test User', 'createdAt': '2024-01-01T00:00:00Z', 'updatedAt': '2024-01-01T00:00:00Z'}`
  - Expected: `{'valid': True}`
- `test_user_interface_missing_required_field_raises_error`: User interface should raise a validation error if a required field (e.g., email) is missing.
  - Input: `{'id': 'uuid-string', 'passwordHash': 'hashedpassword', 'fullName': 'Test User', 'createdAt': '2024-01-01T00:00:00Z', 'updatedAt': '2024-01-01T00:00:00Z'}`
  - Expected: `{'valid': False, 'error_field': 'email'}`
- `test_user_interface_invalid_uuid_format`: User interface should reject an id that is not a valid UUID string.
  - Input: `{'id': 'not-a-uuid', 'email': 'user@example.com', 'passwordHash': 'hashedpassword', 'fullName': 'Test User', 'createdAt': '2024-01-01T00:00:00Z', 'updatedAt': '2024-01-01T00:00:00Z'}`
  - Expected: `{'valid': False, 'error_field': 'id'}`

### 🔴 TEST — Tests: backend/shared/models/Session.ts
> Ref: §1.1 (modelos de `backend/shared/models/Session.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/shared/tests/test_models_Session.py`

**Casos de prueba (implementar todos):**
- `test_session_interface_accepts_valid_fields`: Session interface should accept all required fields with correct types as per SPEC.md.
  - Input: `{'id': 'uuid-string', 'userId': 'uuid-string', 'token': 'sometoken', 'createdAt': '2024-01-01T00:00:00Z', 'expiresAt': '2024-01-02T00:00:00Z'}`
  - Expected: `{'valid': True}`
- `test_session_interface_missing_token_raises_error`: Session interface should raise a validation error if the token field is missing.
  - Input: `{'id': 'uuid-string', 'userId': 'uuid-string', 'createdAt': '2024-01-01T00:00:00Z', 'expiresAt': '2024-01-02T00:00:00Z'}`
  - Expected: `{'valid': False, 'error_field': 'token'}`
- `test_session_interface_expired_date_format`: Session interface should reject expiresAt if not in ISO8601 format.
  - Input: `{'id': 'uuid-string', 'userId': 'uuid-string', 'token': 'sometoken', 'createdAt': '2024-01-01T00:00:00Z', 'expiresAt': 'not-a-date'}`
  - Expected: `{'valid': False, 'error_field': 'expiresAt'}`

### 🔴 TEST — Tests: backend/shared/models/Opportunity.ts
> Ref: §1.1 (modelos de `backend/shared/models/Opportunity.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/shared/tests/test_models_Opportunity.py`

**Casos de prueba (implementar todos):**
- `test_opportunity_interface_accepts_valid_fields`: Opportunity interface should accept all required fields with correct types and enum values.
  - Input: `{'id': 'uuid-string', 'title': 'Opportunity Title', 'description': 'Opportunity Description', 'ownerId': 'uuid-string', 'status': 'open', 'createdAt': '2024-01-01T00:00:00Z', 'updatedAt': '2024-01-01T00:00:00Z'}`
  - Expected: `{'valid': True}`
- `test_opportunity_interface_invalid_status_enum`: Opportunity interface should reject status values not in ['open', 'closed'].
  - Input: `{'id': 'uuid-string', 'title': 'Opportunity Title', 'description': 'Opportunity Description', 'ownerId': 'uuid-string', 'status': 'pending', 'createdAt': '2024-01-01T00:00:00Z', 'updatedAt': '2024-01-01T00:00:00Z'}`
  - Expected: `{'valid': False, 'error_field': 'status'}`
- `test_opportunity_interface_missing_title_raises_error`: Opportunity interface should raise a validation error if the title field is missing.
  - Input: `{'id': 'uuid-string', 'description': 'Opportunity Description', 'ownerId': 'uuid-string', 'status': 'open', 'createdAt': '2024-01-01T00:00:00Z', 'updatedAt': '2024-01-01T00:00:00Z'}`
  - Expected: `{'valid': False, 'error_field': 'title'}`

### 🔴 TEST — Tests: backend/shared/db/schemas.sql
> Ref: §1.1 (modelos de `backend/shared/db/schemas.sql`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/shared/tests/test_db_schemas.py`

**Casos de prueba (implementar todos):**
- `test_user_table_schema_matches_spec`: The users table must have columns id (UUID, PK), email (unique), password_hash, full_name, created_at, updated_at, with correct types and constraints.
  - Expected: `{'table': 'users', 'columns': [{'name': 'id', 'type': 'UUID', 'primary_key': True}, {'name': 'email', 'type': 'TEXT', 'unique': True}, {'name': 'password_hash', 'type': 'TEXT'}, {'name': 'full_name', 'type': 'TEXT'}, {'name': 'created_at', 'type': 'TIMESTAMP'}, {'name': 'updated_at', 'type': 'TIMESTAMP'}]}`
- `test_opportunities_table_schema_and_indexes`: The opportunities table must have columns id (UUID, PK), title, description, owner_id (FK), status (enum), created_at, updated_at, and an index on owner_id.
  - Expected: `{'table': 'opportunities', 'columns': [{'name': 'id', 'type': 'UUID', 'primary_key': True}, {'name': 'title', 'type': 'TEXT'}, {'name': 'description', 'type': 'TEXT'}, {'name': 'owner_id', 'type': 'UUID', 'foreign_key': 'users.id'}, {'name': 'status', 'type': 'TEXT'}, {'name': 'created_at', 'type': 'TIMESTAMP'}, {'name': 'updated_at', 'type': 'TIMESTAMP'}], 'indexes': [{'columns': ['owner_id']}]}`
- `test_sessions_table_schema_and_expiry_constraint`: The sessions table must have columns id (UUID, PK), user_id (FK), token, created_at, expires_at, and a constraint that expires_at > created_at.
  - Expected: `{'table': 'sessions', 'columns': [{'name': 'id', 'type': 'UUID', 'primary_key': True}, {'name': 'user_id', 'type': 'UUID', 'foreign_key': 'users.id'}, {'name': 'token', 'type': 'TEXT'}, {'name': 'created_at', 'type': 'TIMESTAMP'}, {'name': 'expires_at', 'type': 'TIMESTAMP'}], 'constraints': [{'check': 'expires_at > created_at'}]}`

### 🔴 TEST — Tests: backend/shared/config/env.ts
> Ref: §1.1 (modelos de `backend/shared/config/env.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/shared/tests/test_config_env.py`

**Casos de prueba (implementar todos):**
- `test_env_config_accepts_valid_env_vars`: Config loader should accept all required environment variables and validate their types.
  - Input: `{'PORT': '23001', 'DATABASE_URL': 'postgresql://user:pass@localhost:5432/db', 'REDIS_URL': 'redis://localhost:6379/0', 'JWT_SECRET': 'supersecret'}`
  - Expected: `{'valid': True}`
- `test_env_config_missing_required_var_raises_error`: Config loader should raise an error if a required environment variable (e.g., DATABASE_URL) is missing.
  - Input: `{'PORT': '23001', 'REDIS_URL': 'redis://localhost:6379/0', 'JWT_SECRET': 'supersecret'}`
  - Expected: `{'valid': False, 'error_field': 'DATABASE_URL'}`
- `test_env_config_invalid_port_type_raises_error`: Config loader should raise an error if PORT is not a valid integer.
  - Input: `{'PORT': 'not-a-number', 'DATABASE_URL': 'postgresql://user:pass@localhost:5432/db', 'REDIS_URL': 'redis://localhost:6379/0', 'JWT_SECRET': 'supersecret'}`
  - Expected: `{'valid': False, 'error_field': 'PORT'}`

### 🔴 TEST — Tests: docker-compose.yml
> Ref: §1.1 (modelos de `docker-compose.yml`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `tests/test_docker_compose.py`

**Casos de prueba (implementar todos):**
- `test_all_services_defined_with_correct_ports_and_dependencies`: docker-compose.yml must define all required services (auth-service, opportunity-service, postgres, redis) with correct ports, depends_on, and healthchecks.
  - Expected: `{'services': [{'name': 'auth-service', 'ports': ['23001:23001'], 'depends_on': ['postgres', 'redis'], 'healthcheck': True}, {'name': 'opportunity-service', 'ports': ['23002:23002'], 'depends_on': ['postgres', 'redis'], 'healthcheck': True}, {'name': 'postgres', 'image': 'postgres:15', 'healthcheck': True}, {'name': 'redis', 'image': 'redis:7', 'healthcheck': True}]}`
- `test_missing_environment_variables_fails_validation`: docker-compose.yml must fail validation if required environment variables are missing for any service.
  - Input: `{'env': {}}`
  - Expected: `{'validation_error': True}`
- `test_healthchecks_block_service_start_until_dependencies_healthy`: Services must not start accepting traffic until their dependencies (postgres, redis) are healthy according to healthchecks.
  - Expected: `{'service_start_blocked_until_healthy': True}`

### 🔴 TEST — Tests: run.sh
> Ref: §1.1 (modelos de `run.sh`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `tests/test_run_sh.py`

**Casos de prueba (implementar todos):**
- `test_run_sh_validates_docker_and_docker_compose_installed`: run.sh must check that Docker and docker-compose are installed before proceeding.
  - Input: `{'docker_installed': False, 'docker_compose_installed': False}`
  - Expected: `{'error_message': 'Docker and docker-compose are required'}`
- `test_run_sh_waits_for_services_to_be_healthy`: run.sh must wait until all services report healthy before printing the application URL.
  - Expected: `{'waits_for_health': True, 'prints_url': True}`
- `test_run_sh_prints_correct_url_on_success`: run.sh must print the correct application URL (including port) after all services are healthy.
  - Expected: `{'printed_url': 'http://localhost:23001'}`

### 🔴 TEST — Tests: README.md
> Ref: §1.1 (modelos de `README.md`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `tests/test_readme_md.py`

**Casos de prueba (implementar todos):**
- `test_readme_contains_prerequisites_and_installation_steps`: README.md must include a section listing prerequisites (Docker, docker-compose, Node.js, etc.) and installation steps.
  - Expected: `{'contains_sections': ['Prerequisites', 'Installation', 'Usage']}`
- `test_readme_lists_all_api_endpoints_with_methods_and_examples`: README.md must document all API endpoints, HTTP methods, and example requests/responses as per API contract.
  - Expected: `{'endpoints_documented': ['/api/auth/register', '/api/auth/login', '/api/auth/me', '/api/opportunities', '/api/opportunities/:id']}`
- `test_readme_troubleshooting_section_covers_common_errors`: README.md must include a troubleshooting section that covers common errors (e.g., port conflicts, missing env vars, Docker issues).
  - Expected: `{'contains_section': 'Troubleshooting', 'covers_errors': ['port conflict', 'missing environment variables', 'Docker not running']}`

### 🟢 PROD — Foundation — shared types, interfaces, DB schemas, config
> Crear todos los modelos, interfaces, enums y utilidades compartidas en TypeScript para ser importados por todos los servicios. Definir el esquema SQL inicial para PostgreSQL, incluyendo índices y constraints. Proveer configuración y validación de variables de entorno compartidas.
**Archivos:**



### 🟢 PROD — Infrastructure & Deployment (REQUIRED — PROJECT MUST RUN)
> Orquestación completa con Docker Compose: todos los servicios, PostgreSQL, Redis, healthchecks, dependencias, variables de entorno, arranque automatizado, documentación y scripts de uso.
**Archivos:**
  - `docker-compose.yml`  
  - `run.sh`  
  - `README.md`


## Wave 2

### 🔴 TEST — Tests: backend/auth-service/src/auth.controller.ts
> Ref: §1.1 (modelos de `backend/auth-service/src/auth.controller.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/auth-service/tests/test_auth_controller.py`

**Casos de prueba (implementar todos):**
- `test_register_valid_input_returns_201_and_user_fields`: POST /api/auth/register with valid email, password, and fullName returns 201 and user fields (id, email, fullName, createdAt, updatedAt)
  - Input: `{'method': 'POST', 'path': '/api/auth/register', 'json': {'email': 'newuser@example.com', 'password': 'StrongPassw0rd!', 'fullName': 'New User'}}`
  - Expected: `{'status_code': 201, 'json_fields': ['id', 'email', 'fullName', 'createdAt', 'updatedAt']}`
- `test_register_missing_email_returns_422`: POST /api/auth/register without email returns 422 Unprocessable Entity
  - Input: `{'method': 'POST', 'path': '/api/auth/register', 'json': {'password': 'StrongPassw0rd!', 'fullName': 'No Email'}}`
  - Expected: `{'status_code': 422}`
- `test_register_duplicate_email_returns_409`: POST /api/auth/register with an email that already exists returns 409 Conflict
  - Input: `{'method': 'POST', 'path': '/api/auth/register', 'json': {'email': 'existing@example.com', 'password': 'AnotherPass123!', 'fullName': 'Duplicate User'}}`
  - Expected: `{'status_code': 409}`
- `test_login_valid_credentials_returns_200_and_token_and_user`: POST /api/auth/login with valid credentials returns 200, token, and user object
  - Input: `{'method': 'POST', 'path': '/api/auth/login', 'json': {'email': 'existing@example.com', 'password': 'CorrectPassword!'}}`
  - Expected: `{'status_code': 200, 'json_fields': ['token', 'user']}`
- `test_login_invalid_password_returns_401`: POST /api/auth/login with wrong password returns 401 Unauthorized
  - Input: `{'method': 'POST', 'path': '/api/auth/login', 'json': {'email': 'existing@example.com', 'password': 'WrongPassword'}}`
  - Expected: `{'status_code': 401}`
- `test_login_missing_email_returns_422`: POST /api/auth/login without email returns 422 Unprocessable Entity
  - Input: `{'method': 'POST', 'path': '/api/auth/login', 'json': {'password': 'SomePassword'}}`
  - Expected: `{'status_code': 422}`
- `test_me_with_valid_token_returns_user_profile`: GET /api/auth/me with valid Authorization header returns 200 and user profile fields
  - Input: `{'method': 'GET', 'path': '/api/auth/me', 'headers': {'Authorization': 'Bearer <valid_token>'}}`
  - Expected: `{'status_code': 200, 'json_fields': ['id', 'email', 'fullName', 'createdAt', 'updatedAt']}`
- `test_me_with_missing_token_returns_401`: GET /api/auth/me without Authorization header returns 401 Unauthorized
  - Input: `{'method': 'GET', 'path': '/api/auth/me'}`
  - Expected: `{'status_code': 401}`
- `test_me_with_invalid_token_returns_401`: GET /api/auth/me with invalid Authorization token returns 401 Unauthorized
  - Input: `{'method': 'GET', 'path': '/api/auth/me', 'headers': {'Authorization': 'Bearer invalidtoken'}}`
  - Expected: `{'status_code': 401}`
- `test_logout_with_valid_token_returns_204`: POST /api/auth/logout with valid Authorization header returns 204 No Content
  - Input: `{'method': 'POST', 'path': '/api/auth/logout', 'headers': {'Authorization': 'Bearer <valid_token>'}}`
  - Expected: `{'status_code': 204}`

### 🔴 TEST — Tests: backend/auth-service/src/auth.service.ts
> Ref: §1.1 (modelos de `backend/auth-service/src/auth.service.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/auth-service/tests/test_auth_service.py`

**Casos de prueba (implementar todos):**
- `test_hash_password_generates_different_hashes_for_same_password`: hash_password should generate different hashes for the same password due to salting
  - Input: `{'password': 'MySecret123!'}`
  - Expected: `{'hashes_are_different': True}`
- `test_verify_password_returns_true_for_correct_password`: verify_password returns True when given correct password and hash
  - Input: `{'password': 'MySecret123!', 'hash': '<hash_of_MySecret123!>'}`
  - Expected: `{'result': True}`
- `test_verify_password_returns_false_for_wrong_password`: verify_password returns False when given incorrect password and hash
  - Input: `{'password': 'WrongPassword', 'hash': '<hash_of_MySecret123!>'}`
  - Expected: `{'result': False}`
- `test_generate_jwt_contains_user_id_and_email`: generate_jwt returns a JWT containing user id and email claims
  - Input: `{'user': {'id': 'uuid-123', 'email': 'user@example.com'}}`
  - Expected: `{'jwt_contains': ['id', 'email']}`
- `test_validate_jwt_with_valid_token_returns_payload`: validate_jwt returns payload for a valid token
  - Input: `{'token': '<valid_jwt_token>'}`
  - Expected: `{'payload_fields': ['id', 'email']}`
- `test_validate_jwt_with_invalid_token_raises_exception`: validate_jwt raises exception for an invalid token
  - Input: `{'token': 'invalid.token.value'}`
  - Expected: `{'raises': 'InvalidTokenError'}`
- `test_rbac_allows_admin_to_manage_users`: RBAC logic allows user with 'admin' role to perform user management actions
  - Input: `{'user': {'id': 'uuid-admin', 'email': 'admin@example.com', 'roles': ['admin']}, 'action': 'delete_user'}`
  - Expected: `{'allowed': True}`
- `test_rbac_denies_non_admin_to_manage_users`: RBAC logic denies user without 'admin' role from performing user management actions
  - Input: `{'user': {'id': 'uuid-user', 'email': 'user@example.com', 'roles': ['user']}, 'action': 'delete_user'}`
  - Expected: `{'allowed': False}`

### 🔴 TEST — Tests: backend/auth-service/src/user.repository.ts
> Ref: §1.1 (modelos de `backend/auth-service/src/user.repository.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/auth-service/tests/test_user_repository.py`

**Casos de prueba (implementar todos):**
- `test_create_user_persists_user_and_returns_user_object`: create_user persists a new user and returns the user object with all fields
  - Input: `{'email': 'repo_user@example.com', 'passwordHash': 'hashedpassword', 'fullName': 'Repo User'}`
  - Expected: `{'fields': ['id', 'email', 'passwordHash', 'fullName', 'createdAt', 'updatedAt']}`
- `test_get_user_by_email_returns_correct_user`: get_user_by_email returns the correct user object for a given email
  - Input: `{'email': 'repo_user@example.com'}`
  - Expected: `{'fields': ['id', 'email', 'passwordHash', 'fullName', 'createdAt', 'updatedAt']}`
- `test_get_user_by_email_returns_none_for_nonexistent_email`: get_user_by_email returns None when the email does not exist
  - Input: `{'email': 'nonexistent@example.com'}`
  - Expected: `{'result': None}`
- `test_update_user_updates_fields_and_returns_updated_user`: update_user updates user fields and returns the updated user object
  - Input: `{'user_id': 'uuid-123', 'update_fields': {'fullName': 'Updated Name'}}`
  - Expected: `{'fields': ['id', 'email', 'passwordHash', 'fullName', 'createdAt', 'updatedAt'], 'fullName': 'Updated Name'}`
- `test_delete_user_removes_user_from_database`: delete_user removes the user from the database and subsequent get_user_by_id returns None
  - Input: `{'user_id': 'uuid-123'}`
  - Expected: `{'result': None}`

### 🔴 TEST — Tests: backend/catalog-service/src/main.ts
> Ref: §1.1 (modelos de `backend/catalog-service/src/main.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/catalog-service/tests/test_main.py`

**Casos de prueba (implementar todos):**
- `test_application_starts_and_responds_to_health_check`: Ensure the NestJS application boots and responds to a basic health check endpoint.
  - Expected: `{'status_code': 200, 'fields': ['status']}`
- `test_application_fails_on_invalid_env_vars`: Application should fail to start if required environment variables are missing or invalid.
  - Input: `{'env': {'DATABASE_URL': ''}}`
  - Expected: `{'exception': 'EnvironmentError'}`
- `test_application_logs_startup_message`: Application should log a startup message indicating the service is running.
  - Expected: `{'log_contains': 'Nest application successfully started'}`

### 🔴 TEST — Tests: backend/catalog-service/src/app.module.ts
> Ref: §1.1 (modelos de `backend/catalog-service/src/app.module.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/catalog-service/tests/test_app_module.py`

**Casos de prueba (implementar todos):**
- `test_app_module_imports_all_required_modules`: AppModule should import and configure all required modules for products, categories, and stock management.
  - Expected: `{'modules_imported': ['ProductsModule', 'CategoriesModule', 'StockModule']}`
- `test_app_module_raises_on_missing_dependency`: AppModule should raise an error if a required dependency (e.g., database module) is missing.
  - Input: `{'mock_missing_module': 'DatabaseModule'}`
  - Expected: `{'exception': 'ModuleNotFoundError'}`
- `test_app_module_provides_global_configuration`: AppModule should provide global configuration and environment variables to all submodules.
  - Input: `{'env': {'NODE_ENV': 'test'}}`
  - Expected: `{'config_accessible': True}`

### 🔴 TEST — Tests: backend/order-service/src/main.ts
> Ref: §1.1 (modelos de `backend/order-service/src/main.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/order-service/tests/test_main.py`

**Casos de prueba (implementar todos):**
- `test_create_order_with_valid_items_and_stock_returns_201`: POST /orders with valid items and sufficient stock returns 201 Created and order details with status 'creado'.
  - Input: `{'endpoint': '/orders', 'method': 'POST', 'headers': {'Authorization': 'Bearer <valid_token>'}, 'json': {'items': [{'productId': 'prod-1', 'quantity': 2}, {'productId': 'prod-2', 'quantity': 1}]}}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'userId', 'items', 'status', 'createdAt', 'updatedAt'], 'status': 'creado'}`
- `test_create_order_with_insufficient_stock_returns_400`: POST /orders with items exceeding available stock returns 400 Bad Request with error message.
  - Input: `{'endpoint': '/orders', 'method': 'POST', 'headers': {'Authorization': 'Bearer <valid_token>'}, 'json': {'items': [{'productId': 'prod-1', 'quantity': 9999}]}}`
  - Expected: `{'status_code': 400, 'fields': ['detail'], 'detail': 'Insufficient stock for productId prod-1'}`
- `test_create_order_missing_items_field_returns_422`: POST /orders without 'items' field returns 422 Unprocessable Entity.
  - Input: `{'endpoint': '/orders', 'method': 'POST', 'headers': {'Authorization': 'Bearer <valid_token>'}, 'json': {}}`
  - Expected: `{'status_code': 422}`
- `test_get_order_by_id_returns_order_details`: GET /orders/:id with valid order ID returns 200 OK and order details.
  - Input: `{'endpoint': '/orders/{order_id}', 'method': 'GET', 'headers': {'Authorization': 'Bearer <valid_token>'}, 'order_id': '<existing_order_id>'}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'userId', 'items', 'status', 'createdAt', 'updatedAt']}`
- `test_get_order_by_invalid_id_returns_404`: GET /orders/:id with non-existent order ID returns 404 Not Found.
  - Input: `{'endpoint': '/orders/nonexistent-id', 'method': 'GET', 'headers': {'Authorization': 'Bearer <valid_token>'}}`
  - Expected: `{'status_code': 404}`
- `test_update_order_status_to_pagado_returns_200_and_status_updated`: PATCH /orders/:id/status with valid transition to 'pagado' returns 200 OK and updated status.
  - Input: `{'endpoint': '/orders/{order_id}/status', 'method': 'PATCH', 'headers': {'Authorization': 'Bearer <valid_token>'}, 'order_id': '<existing_order_id>', 'json': {'status': 'pagado'}}`
  - Expected: `{'status_code': 200, 'fields': ['id', 'status'], 'status': 'pagado'}`
- `test_update_order_status_invalid_transition_returns_400`: PATCH /orders/:id/status with invalid status transition returns 400 Bad Request.
  - Input: `{'endpoint': '/orders/{order_id}/status', 'method': 'PATCH', 'headers': {'Authorization': 'Bearer <valid_token>'}, 'order_id': '<existing_order_id>', 'json': {'status': 'creado'}}`
  - Expected: `{'status_code': 400, 'fields': ['detail'], 'detail': 'Invalid status transition'}`
- `test_add_item_to_existing_order_returns_201_and_item_added`: POST /orders/:id/items with valid item and sufficient stock returns 201 Created and item details.
  - Input: `{'endpoint': '/orders/{order_id}/items', 'method': 'POST', 'headers': {'Authorization': 'Bearer <valid_token>'}, 'order_id': '<existing_order_id>', 'json': {'productId': 'prod-3', 'quantity': 1}}`
  - Expected: `{'status_code': 201, 'fields': ['id', 'orderId', 'productId', 'quantity', 'createdAt', 'updatedAt']}`
- `test_add_item_to_order_with_insufficient_stock_returns_400`: POST /orders/:id/items with insufficient stock returns 400 Bad Request.
  - Input: `{'endpoint': '/orders/{order_id}/items', 'method': 'POST', 'headers': {'Authorization': 'Bearer <valid_token>'}, 'order_id': '<existing_order_id>', 'json': {'productId': 'prod-3', 'quantity': 9999}}`
  - Expected: `{'status_code': 400, 'fields': ['detail'], 'detail': 'Insufficient stock for productId prod-3'}`
- `test_get_order_history_by_user_returns_list_of_orders`: GET /orders/history for authenticated user returns 200 OK and list of orders.
  - Input: `{'endpoint': '/orders/history', 'method': 'GET', 'headers': {'Authorization': 'Bearer <valid_token>'}}`
  - Expected: `{'status_code': 200, 'fields': ['orders'], 'orders_type': 'list'}`

### 🔴 TEST — Tests: backend/order-service/src/app.module.ts
> Ref: §1.1 (modelos de `backend/order-service/src/app.module.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/order-service/tests/test_app_module.py`

**Casos de prueba (implementar todos):**
- `test_app_module_imports_order_module_and_dependencies`: AppModule should import OrderModule and all required dependencies without errors.
  - Expected: `{'result': 'AppModule initializes successfully'}`
- `test_app_module_fails_on_missing_dependency`: AppModule initialization fails with ImportError if a required dependency is missing.
  - Input: `{'missing_dependency': 'OrderModule'}`
  - Expected: `{'raises': 'ImportError'}`
- `test_app_module_provides_global_configuration`: AppModule should provide global configuration (e.g., database, cache) to all submodules.
  - Expected: `{'result': 'Global configuration is accessible in submodules'}`

### 🔴 TEST — Tests: backend/notification-service/src/main.ts
> Ref: §1.1 (modelos de `backend/notification-service/src/main.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/notification-service/tests/test_main.py`

**Casos de prueba (implementar todos):**
- `test_bootstrap_nestjs_app_starts_successfully`: The NestJS application should bootstrap and start listening on the configured port without errors.
  - Expected: `{'status_code': 0, 'output': 'Application started'}`
- `test_bootstrap_with_missing_env_vars_fails`: If required environment variables (e.g., REDIS_URL, RABBITMQ_URL) are missing, the application should fail to start and log an error.
  - Input: `{'env': {}}`
  - Expected: `{'status_code': 1, 'error_message': 'Missing required environment variables'}`
- `test_bootstrap_with_invalid_port_env_var`: If the PORT environment variable is set to an invalid value (e.g., a string), the application should fail to start and log an error.
  - Input: `{'env': {'PORT': 'not_a_number'}}`
  - Expected: `{'status_code': 1, 'error_message': 'Invalid PORT value'}`

### 🔴 TEST — Tests: backend/notification-service/src/app.module.ts
> Ref: §1.1 (modelos de `backend/notification-service/src/app.module.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/notification-service/tests/test_app_module.py`

**Casos de prueba (implementar todos):**
- `test_app_module_imports_notification_controllers_and_services`: AppModule should import and provide NotificationController and NotificationService.
  - Expected: `{'imports': ['NotificationController', 'NotificationService']}`
- `test_app_module_registers_redis_and_rabbitmq_providers`: AppModule should register Redis and RabbitMQ providers for queue integration.
  - Expected: `{'providers': ['RedisProvider', 'RabbitMQProvider']}`
- `test_app_module_uses_mock_rabbitmq_if_no_credentials`: If RabbitMQ credentials are missing, AppModule should use a mock provider for RabbitMQ integration.
  - Input: `{'env': {'RABBITMQ_URL': ''}}`
  - Expected: `{'providers': ['MockRabbitMQProvider']}`
- `test_app_module_fails_on_missing_redis_url`: If REDIS_URL is missing from the environment, AppModule initialization should fail with a configuration error.
  - Input: `{'env': {'REDIS_URL': ''}}`
  - Expected: `{'error_message': 'REDIS_URL is required'}`

### 🔴 TEST — Tests: backend/api-gateway/src/main.ts
> Ref: §1.1 (modelos de `backend/api-gateway/src/main.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-gateway/tests/test_main.py`

**Casos de prueba (implementar todos):**
- `test_health_endpoint_returns_200_and_status_ok`: GET /health must return 200 OK with a JSON body containing status: 'ok'.
  - Input: `{'method': 'GET', 'path': '/health'}`
  - Expected: `{'status_code': 200, 'json': {'status': 'ok'}}`
- `test_health_endpoint_returns_503_when_downstream_unavailable`: GET /health must return 503 Service Unavailable if a downstream service is unreachable.
  - Input: `{'method': 'GET', 'path': '/health', 'simulate_downstream_failure': True}`
  - Expected: `{'status_code': 503, 'json_contains': ['status']}`
- `test_structured_logging_on_request`: Each incoming request must produce a structured log entry containing method, path, status_code, and request_id.
  - Input: `{'method': 'GET', 'path': '/health'}`
  - Expected: `{'log_entry_fields': ['method', 'path', 'status_code', 'request_id']}`

### 🔴 TEST — Tests: backend/api-gateway/src/app.module.ts
> Ref: §1.1 (modelos de `backend/api-gateway/src/app.module.ts`) · §1.2 (endpoints del módulo)
**Archivo a crear:** `backend/api-gateway/tests/test_app_module.py`

**Casos de prueba (implementar todos):**
- `test_routing_to_auth_service_login`: POST /api/auth/login with valid credentials must route to auth-service and return 200 with token and user fields.
  - Input: `{'method': 'POST', 'path': '/api/auth/login', 'json': {'email': 'user@example.com', 'password': 'ValidPass123'}}`
  - Expected: `{'status_code': 200, 'json_fields': ['token', 'user']}`
- `test_jwt_validation_required_for_protected_opportunities_routes`: GET /api/opportunities without Authorization header must return 401 Unauthorized.
  - Input: `{'method': 'GET', 'path': '/api/opportunities'}`
  - Expected: `{'status_code': 401}`
- `test_jwt_validation_invalid_token_returns_401`: GET /api/opportunities with an invalid JWT in Authorization header must return 401 Unauthorized.
  - Input: `{'method': 'GET', 'path': '/api/opportunities', 'headers': {'Authorization': 'Bearer invalid.jwt.token'}}`
  - Expected: `{'status_code': 401}`
- `test_rbac_for_opportunity_delete_requires_owner_role`: DELETE /api/opportunities/:id by a user without owner privileges must return 403 Forbidden.
  - Input: `{'method': 'DELETE', 'path': '/api/opportunities/uuid-1234', 'headers': {'Authorization': 'Bearer valid_non_owner_token'}}`
  - Expected: `{'status_code': 403}`
- `test_rate_limiting_exceeded_returns_429`: When rate limit is exceeded, any endpoint must return 429 Too Many Requests.
  - Input: `{'method': 'GET', 'path': '/api/opportunities', 'headers': {'Authorization': 'Bearer valid_token'}, 'simulate_rate_limit_exceeded': True}`
  - Expected: `{'status_code': 429}`
- `test_fallback_error_returns_502_on_microservice_down`: If a downstream microservice is unavailable, the gateway must return 502 Bad Gateway.
  - Input: `{'method': 'POST', 'path': '/api/opportunities', 'headers': {'Authorization': 'Bearer valid_token'}, 'json': {'title': 'Test', 'description': 'Test desc'}, 'simulate_downstream_failure': True}`
  - Expected: `{'status_code': 502}`
- `test_invalid_route_returns_404`: Requesting a non-existent route must return 404 Not Found.
  - Input: `{'method': 'GET', 'path': '/api/unknown/route'}`
  - Expected: `{'status_code': 404}`
- `test_register_route_validation_error_returns_400`: POST /api/auth/register with missing required fields must return 400 Bad Request.
  - Input: `{'method': 'POST', 'path': '/api/auth/register', 'json': {'email': 'user@example.com'}}`
  - Expected: `{'status_code': 400}`
- `test_patch_opportunity_requires_valid_status_value`: PATCH /api/opportunities/:id with invalid status value must return 400 Bad Request.
  - Input: `{'method': 'PATCH', 'path': '/api/opportunities/uuid-1234', 'headers': {'Authorization': 'Bearer valid_token'}, 'json': {'status': 'invalid_status'}}`
  - Expected: `{'status_code': 400}`

### 🟢 PROD — Auth Service — registro, login, JWT, gestión de usuarios
> Implementar el microservicio de autenticación y usuarios: endpoints de registro (/auth/register), login (/auth/login), perfil (/auth/me), logout (/auth/logout), y CRUD de usuarios. Validación de entrada, hashing seguro de contraseñas, emisión y validación de JWT, RBAC básico.
**Archivos:**
  - `backend/auth-service/src/main.ts`  
  - `backend/auth-service/src/app.module.ts`  
  - `backend/auth-service/src/auth.controller.ts`  
  - `backend/auth-service/src/auth.service.ts`  
  - `backend/auth-service/src/user.repository.ts`


### 🟢 PROD — Catalog Service — productos y categorías (CRUD, stock)
> Implementar el microservicio de catálogo: endpoints CRUD para productos (/products) y categorías (/categories), búsqueda y filtrado, gestión de stock. Validación de entrada, control de relaciones (producto-categoría), y RBAC para operaciones protegidas.
**Archivos:**
  - `backend/catalog-service/src/main.ts`  
  - `backend/catalog-service/src/app.module.ts`


### 🟢 PROD — Order Service — pedidos, items, estados, historial
> Implementar el microservicio de pedidos: endpoints CRUD para órdenes (/orders), items de orden (/orders/:id/items), gestión de estados (creado, pagado, enviado, entregado), historial de pedidos por usuario, y validación de stock al crear órdenes.
**Archivos:**
  - `backend/order-service/src/main.ts`  
  - `backend/order-service/src/app.module.ts`


### 🟢 PROD — Notification Service — envío y consulta de notificaciones
> Implementar el microservicio de notificaciones: endpoints para enviar notificaciones (correo, push) y consultar historial. Integración con Redis para colas y RabbitMQ (mock si no hay credenciales). RBAC para acceso a historial.
**Archivos:**
  - `backend/notification-service/src/main.ts`  
  - `backend/notification-service/src/app.module.ts`


### 🟢 PROD — API Gateway — enrutamiento, autenticación, RBAC, health
> Implementar el API Gateway (NestJS): enrutamiento a microservicios, validación de JWT, RBAC, rate limiting, logging estructurado, endpoint /health, y fallback de errores.
**Archivos:**
  - `backend/api-gateway/src/main.ts`  
  - `backend/api-gateway/src/app.module.ts`


---

# §3 Reglas de Infraestructura (obligatorias)

## §3.1 Dockerfiles y docker-compose.yml — OBLIGATORIOS
⚠️ **Estos archivos son MANDATORIOS independientemente del plan de ítems. OpenCode DEBE crearlos.**

**Para cada servicio del proyecto (backend, frontend, workers):**
- Crea `<servicio>/Dockerfile` con `WORKDIR /app` (NUNCA rutas absolutas con UUID)
- El `docker build` debe funcionar en cualquier máquina sin modificaciones
- Multi-stage build si aplica (builder + runner para minimizar imagen final)

**docker-compose.yml en la raíz del proyecto (SIEMPRE crear o actualizar):**
- Un servicio por cada componente del sistema (backend, frontend, db, redis, etc.)
- `build: context: ./<servicio>` apuntando al directorio con su Dockerfile
- Puertos del host: SIEMPRE en el rango **21000–65000** (§3.3)
- Variables de entorno via `env_file` o `environment:` (nunca hardcodeadas)
- Dependencias entre servicios via `depends_on`
- Volumen para la base de datos si aplica

## §3.2 Base de Datos — Auto-Init Obligatorio
Si el proyecto usa base de datos relacional (PostgreSQL, MySQL, SQLite, MariaDB, etc.),
el backend DEBE ejecutar esta secuencia automáticamente al arrancar el contenedor:

1. **Esperar a que la DB esté lista** — retry loop o wait-for-it, nunca asumir que está disponible
2. **Correr migraciones** — `alembic upgrade head` / `prisma migrate deploy` / `knex migrate:latest` / etc.
3. **Seed de datos de ejemplo** — solo si la tabla principal está vacía (idempotente, nunca duplica al reiniciar)
   - Insertar **3–5 registros realistas** por entidad principal
   - El seed usa los mismos modelos/schemas del proyecto — nunca SQL crudo hardcodeado
   - Patrón Python: `if db.query(Model).count() == 0: db.add_all([...]); db.commit()`
   - Patrón Node: `const count = await prisma.model.count(); if (count === 0) { await prisma.model.createMany({...}) }`

Resultado: después de `./run.sh` la app tiene datos de ejemplo listos, sin pasos manuales.

## §3.3 Puertos de Servicio
- Rango obligatorio para **todos** los puertos del host en docker-compose.yml: **21000–65000**.
- Aplica a TODOS los servicios: backends, frontends Y bases de datos / infraestructura.
- El puerto interno del contenedor se mantiene en el default de la tecnología:
  | Tecnología | Puerto interno | Ejemplo host mapping |
  |-----------|---------------|----------------------|
  | PostgreSQL | 5432 | `'25432:5432'` |
  | MySQL      | 3306 | `'23306:3306'` |
  | Redis      | 6379 | `'26379:6379'` |
  | MongoDB    | 27017 | `'37017:27017'` |
  | Backend API | (PORT TABLE §1.1) | `'23001:23001'` |
- NUNCA exponer 3000, 5000, 5432, 6379, 8000, 8080, 8443 en el lado del host.
- El Tech Lead remapeará automáticamente cualquier puerto fuera del rango 21000–65000.

## §3.4 Frontend — Entry Point
- `index.html` en la RAÍZ del proyecto (mismo nivel que `package.json` y `vite.config.*` o `next.config.*`)
- NUNCA solo en `public/` — los bundlers (Vite, Webpack, Parcel) requieren el entry point en la raíz
- Entry point Vite/React: `<script type='module' src='/src/main.jsx'></script>`

## §3.5 Integración API — Patrón Obligatorio (agnóstico a tecnología)
⚠️ **NUNCA** uses variables de entorno con URLs absolutas (`VITE_API_URL=http://localhost:8000`,
`NEXT_PUBLIC_API_URL=http://...`). Las env vars de build-time se incrustan en el bundle JS
y NO funcionan dentro de Docker — el contenedor no tiene acceso a `localhost` del host.

### Patrón correcto: URLs relativas + proxy en el servidor web del contenedor
1. El cliente HTTP del frontend usa **rutas relativas** sin hostname ni puerto:
   - ✅ `fetch('/api/plants')` — correcto
   - ❌ `fetch('http://localhost:8000/api/plants')` — PROHIBIDO
   - ❌ `fetch(import.meta.env.VITE_API_URL + '/api/plants')` — PROHIBIDO
2. El servidor web del contenedor frontend **proxia `/api/*` al backend por nombre de servicio Docker**:
   - nginx: `location /api/ { proxy_pass http://<servicio>:<puerto-interno>/api/; }`
   - Next.js: `rewrites` en `next.config.js` → `{ source: '/api/:path*', destination: 'http://<servicio>:<puerto-interno>/api/:path*' }`
   - Caddy: `reverse_proxy /api/* <servicio>:<puerto-interno>`
3. Para múltiples microservicios: un bloque de proxy por prefijo de ruta.
4. El `docker-compose.yml` del servicio frontend NUNCA incluye `VITE_API_URL` ni `NEXT_PUBLIC_API_URL`.
- Nunca hardcodear URLs, tokens ni secrets en código fuente

## §3.6 Criterios de Finalización
- Todos los archivos listados en §2 deben existir en disco
- Código completo y funcional — sin TODOs ni stubs
- Tests corriendo y pasando antes del commit final
- `git add -A && git commit -m 'feat: implement project'`

## §3.7 Configuración de Test Tooling (requerida por ítems 🔴 TEST del §2)

### pytest
- Test files → `{service_root}/tests/test_*.py` (never co-located with source)
- `requirements.txt` MUST include: `pytest`, `pytest-cov`, `pytest-asyncio`, `httpx`
- Run: `python -m pytest tests/ --tb=short -q --cov=. --cov-report=term-missing`