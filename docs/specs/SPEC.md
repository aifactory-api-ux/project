# SPEC.md

## 1. TECHNOLOGY STACK

- **Backend**
  - Node.js v20.x
  - NestJS v10.x
  - TypeScript v5.x
  - PostgreSQL v15.x (database)
  - Redis v7.x (cache/session)
- **Frontend**
  - React v18.x
  - TypeScript v5.x
- **Infrastructure**
  - Docker v24.x
  - docker-compose v2.x
  - Kubernetes (YAML manifests, version-agnostic)
- **Other**
  - dotenv v16.x (env var management)
  - pg v8.x (PostgreSQL client for Node.js)
  - ioredis v5.x (Redis client for Node.js)

---

## 2. DATA CONTRACTS

### Backend (NestJS/TypeScript)

```typescript
// backend/src/modules/dispatch/dto/dispatch.dto.ts
export class DispatchDto {
  id: string; // UUID
  plantId: string; // UUID
  distributionCenterId: string; // UUID
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
  scheduledDate: string; // ISO8601
  actualDeliveryDate: string | null; // ISO8601 or null
  vehicleId: string; // UUID
  driverId: string; // UUID
  products: ProductDispatchDto[];
}

export class ProductDispatchDto {
  productId: string; // UUID
  quantity: number;
  unit: string; // e.g. 'kg', 'unit'
}

export class DispatchCreateDto {
  plantId: string;
  distributionCenterId: string;
  scheduledDate: string; // ISO8601
  vehicleId: string;
  driverId: string;
  products: ProductDispatchCreateDto[];
}

export class ProductDispatchCreateDto {
  productId: string;
  quantity: number;
  unit: string;
}
```

### Frontend (React/TypeScript)

```typescript
// frontend/src/types/dispatch.ts
export interface Dispatch {
  id: string;
  plantId: string;
  distributionCenterId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  scheduledDate: string;
  actualDeliveryDate: string | null;
  vehicleId: string;
  driverId: string;
  products: ProductDispatch[];
}

export interface ProductDispatch {
  productId: string;
  quantity: number;
  unit: string;
}

export interface DispatchCreate {
  plantId: string;
  distributionCenterId: string;
  scheduledDate: string;
  vehicleId: string;
  driverId: string;
  products: ProductDispatchCreate[];
}

export interface ProductDispatchCreate {
  productId: string;
  quantity: number;
  unit: string;
}
```

---

## 3. API ENDPOINTS

### Dispatch Management

#### Create Dispatch
- **POST** `/api/dispatch`
  - **Request Body:** `DispatchCreateDto`
  - **Response:** `DispatchDto`

#### Get All Dispatches
- **GET** `/api/dispatch`
  - **Query Params:** `status?: string`, `plantId?: string`, `distributionCenterId?: string`
  - **Response:** `DispatchDto[]`

#### Get Dispatch by ID
- **GET** `/api/dispatch/:id`
  - **Response:** `DispatchDto`

#### Update Dispatch Status
- **PATCH** `/api/dispatch/:id/status`
  - **Request Body:**
    ```typescript
    {
      status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
      actualDeliveryDate?: string; // ISO8601, required if status is 'delivered'
    }
    ```
  - **Response:** `DispatchDto`

#### Delete Dispatch
- **DELETE** `/api/dispatch/:id`
  - **Response:** `{ success: boolean }`

---

## 4. FILE STRUCTURE

### PORT TABLE

| Service           | Listening Port | Path                        |
|-------------------|---------------|-----------------------------|
| dispatch-service  | 23001         | backend/dispatch-service/    |
| frontend          | 24001         | frontend/                   |
| redis             | 26379         | (docker image)              |
| postgres          | 25432         | (docker image)              |

### SHARED MODULES

| Shared path         | Imported by services         |
|---------------------|-----------------------------|
| backend/shared/     | dispatch-service            |

### FILE TREE

```
.
├── docker-compose.yml                # Multi-service orchestration
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── README.md                        # Project documentation
├── run.sh                           # Root startup script
├── backend/
│   ├── shared/                      # Shared modules (DTOs, utils)
│   │   ├── dto/                     # Shared DTOs
│   │   │   └── product.dto.ts       # Product DTO definition
│   │   └── utils/                   # Shared utility functions
│   │       └── date.ts              # Date/time helpers
│   └── dispatch-service/
│       ├── Dockerfile               # Service Dockerfile (EXPOSE 23001)
│       ├── src/
│       │   ├── main.ts              # NestJS entry point
│       │   ├── app.module.ts        # Root module
│       │   ├── modules/
│       │   │   └── dispatch/
│       │   │       ├── dispatch.controller.ts   # API controller
│       │   │       ├── dispatch.service.ts      # Business logic
│       │   │       ├── dispatch.module.ts       # Module definition
│       │   │       ├── dto/
│       │   │       │   ├── dispatch.dto.ts      # DTOs for dispatch
│       │   │       │   └── product-dispatch.dto.ts # Product-dispatch DTO
│       │   │       └── entities/
│       │   │           └── dispatch.entity.ts   # ORM entity
│       │   └── config/
│       │       ├── database.config.ts           # PostgreSQL config
│       │       └── redis.config.ts              # Redis config
│       ├── test/
│       │   └── dispatch.e2e-spec.ts             # E2E tests
│       └── tsconfig.json                        # TypeScript config
├── frontend/
│   ├── Dockerfile                   # Frontend Dockerfile (EXPOSE 24001)
│   ├── public/
│   │   └── index.html               # HTML entry point
│   ├── src/
│   │   ├── main.tsx                 # React entry point
│   │   ├── App.tsx                  # Root component
│   │   ├── api/
│   │   │   └── dispatch.ts          # API client for dispatch endpoints
│   │   ├── hooks/
│   │   │   └── useDispatches.ts     # React hook for dispatch state
│   │   ├── components/
│   │   │   ├── DispatchList.tsx     # List of dispatches
│   │   │   ├── DispatchForm.tsx     # Create/edit dispatch form
│   │   │   └── DispatchStatusBadge.tsx # Status badge component
│   │   ├── types/
│   │   │   └── dispatch.ts          # TypeScript interfaces for dispatch
│   │   └── styles/
│   │       └── tokens.ts            # Design tokens (if provided)
│   └── tsconfig.json                # TypeScript config
```

---

## 5. ENVIRONMENT VARIABLES

| Name                        | Type     | Description                                         | Example Value                |
|-----------------------------|----------|-----------------------------------------------------|-----------------------------|
| NODE_ENV                    | string   | Node environment                                    | production                  |
| DISPATCH_DB_HOST            | string   | PostgreSQL host for dispatch-service                | postgres                    |
| DISPATCH_DB_PORT            | number   | PostgreSQL port (container-internal)                | 5432                        |
| DISPATCH_DB_USER            | string   | PostgreSQL username                                 | distroviz                   |
| DISPATCH_DB_PASSWORD        | string   | PostgreSQL password                                 | secretpassword              |
| DISPATCH_DB_NAME            | string   | PostgreSQL database name                            | distroviz                   |
| DISPATCH_REDIS_HOST         | string   | Redis host for dispatch-service                     | redis                       |
| DISPATCH_REDIS_PORT         | number   | Redis port (container-internal)                     | 6379                        |
| DISPATCH_API_PORT           | number   | Port dispatch-service listens on (container)         | 23001                       |
| FRONTEND_PORT               | number   | Port frontend listens on (container)                 | 24001                       |
| FRONTEND_API_URL            | string   | Base URL for backend API (from frontend)             | http://localhost:23001/api  |

---

## 6. IMPORT CONTRACTS

### Backend

- `from shared.dto.product import ProductDto`
- `from shared.utils.date import formatDate, parseDate`
- `from modules.dispatch.dto.dispatch import DispatchDto, DispatchCreateDto, ProductDispatchDto, ProductDispatchCreateDto`
- `from modules.dispatch.dispatch.service import DispatchService`
- `from modules.dispatch.dispatch.controller import DispatchController`
- `from config.database import databaseConfig`
- `from config.redis import redisConfig`

### Frontend

- `import { Dispatch, DispatchCreate, ProductDispatch, ProductDispatchCreate } from '../types/dispatch'`
- `import { useDispatches } from '../hooks/useDispatches'`
- `import { tokens } from '../styles/tokens'`
- `import { DispatchList } from '../components/DispatchList'`
- `import { DispatchForm } from '../components/DispatchForm'`
- `import { DispatchStatusBadge } from '../components/DispatchStatusBadge'`

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### Shared State Primitives

```
React hook: useDispatches() → {
  dispatches: Dispatch[],
  loading: boolean,
  error: string | null,
  createDispatch: (data: DispatchCreate) => Promise<void>,
  updateDispatchStatus: (id: string, status: 'pending' | 'in_transit' | 'delivered' | 'cancelled', actualDeliveryDate?: string) => Promise<void>,
  deleteDispatch: (id: string) => Promise<void>,
  refreshing: boolean,
  refresh: () => Promise<void>
}
```

### Reusable Components

```
DispatchList props/inputs: {
  dispatches: Dispatch[],
  onStatusChange: (id: string, status: 'pending' | 'in_transit' | 'delivered' | 'cancelled', actualDeliveryDate?: string) => void,
  onDelete: (id: string) => void,
  loading: boolean
}

DispatchForm props/inputs: {
  onSubmit: (data: DispatchCreate) => void,
  loading: boolean
}

DispatchStatusBadge props/inputs: {
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
}
```

---

## 8. FILE EXTENSION CONVENTION

- All frontend files use `.tsx` (TypeScript React).
- The project is TypeScript throughout (backend and frontend).
- **Entry point:** `/src/main.tsx` (as referenced in `public/index.html` via `<script src="/src/main.tsx">`).

---

## 9. DESIGN TOKENS

*No UI/UX Design Implementation Contract provided. This section intentionally omitted as per instructions.*