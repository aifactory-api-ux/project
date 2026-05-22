# SPEC.md

## 1. TECHNOLOGY STACK

- **Backend**
  - Node.js v20.11.1
  - Express.js v4.18.2
  - PostgreSQL v15.5
  - Redis v7.2.4
- **Frontend**
  - React v18.2.0
  - TypeScript v5.3.3
- **Infrastructure**
  - Docker v24.0.7
  - Docker Compose v2.24.2
  - Kubernetes v1.29 (manifests provided for deployment)
  - GitLab CI/CD (gitlab-ci.yml)
- **Other**
  - dotenv v16.4.5 (backend)
  - pg v8.11.3 (PostgreSQL client for Node.js)
  - ioredis v5.4.1 (Redis client for Node.js)
  - cors v2.8.5 (Express CORS middleware)
  - express-validator v7.0.1 (backend validation)
  - axios v1.6.7 (frontend API calls)
  - react-router-dom v6.22.3 (frontend routing)
  - styled-components v6.1.8 (frontend styling)
  - eslint v8.56.0, prettier v3.2.5 (code quality)

---

## 2. DATA CONTRACTS

### Backend (TypeScript interface definitions)

```typescript
// backend/src/models/Branch.ts
export interface Branch {
  id: number;
  name: string;
  address: string;
  managerName: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// backend/src/models/Product.ts
export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// backend/src/models/Dispatch.ts
export interface Dispatch {
  id: number;
  branchId: number;
  productId: number;
  quantity: number;
  dispatchedAt: string; // ISO8601
  createdBy: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// backend/src/models/User.ts
export interface User {
  id: number;
  username: string;
  passwordHash: string;
  role: 'admin' | 'branch_manager';
  branchId?: number;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}
```

### Frontend (TypeScript interface definitions)

```typescript
// frontend/src/types/Branch.ts
export interface Branch {
  id: number;
  name: string;
  address: string;
  managerName: string;
  createdAt: string;
  updatedAt: string;
}

// frontend/src/types/Product.ts
export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// frontend/src/types/Dispatch.ts
export interface Dispatch {
  id: number;
  branchId: number;
  productId: number;
  quantity: number;
  dispatchedAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// frontend/src/types/User.ts
export interface User {
  id: number;
  username: string;
  role: 'admin' | 'branch_manager';
  branchId?: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. API ENDPOINTS

### Authentication

- **POST /api/auth/login**
  - Request body:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  - Response:
    ```json
    {
      "token": "string",
      "user": { /* User */ }
    }
    ```

- **POST /api/auth/logout**
  - Request body: _none_
  - Response:
    ```json
    { "success": true }
    ```

### Branches

- **GET /api/branches**
  - Response:
    ```json
    { "branches": [ /* Branch[] */ ] }
    ```

- **GET /api/branches/:id**
  - Response:
    ```json
    { "branch": /* Branch */ }
    ```

- **POST /api/branches**
  - Request body:
    ```json
    {
      "name": "string",
      "address": "string",
      "managerName": "string"
    }
    ```
  - Response:
    ```json
    { "branch": /* Branch */ }
    ```

- **PUT /api/branches/:id**
  - Request body:
    ```json
    {
      "name": "string",
      "address": "string",
      "managerName": "string"
    }
    ```
  - Response:
    ```json
    { "branch": /* Branch */ }
    ```

- **DELETE /api/branches/:id**
  - Response:
    ```json
    { "success": true }
    ```

### Products

- **GET /api/products**
  - Response:
    ```json
    { "products": [ /* Product[] */ ] }
    ```

- **GET /api/products/:id**
  - Response:
    ```json
    { "product": /* Product */ }
    ```

- **POST /api/products**
  - Request body:
    ```json
    {
      "name": "string",
      "sku": "string",
      "description": "string"
    }
    ```
  - Response:
    ```json
    { "product": /* Product */ }
    ```

- **PUT /api/products/:id**
  - Request body:
    ```json
    {
      "name": "string",
      "sku": "string",
      "description": "string"
    }
    ```
  - Response:
    ```json
    { "product": /* Product */ }
    ```

- **DELETE /api/products/:id**
  - Response:
    ```json
    { "success": true }
    ```

### Dispatches

- **GET /api/dispatches**
  - Query params: `branchId?: number`, `productId?: number`, `fromDate?: string`, `toDate?: string`
  - Response:
    ```json
    { "dispatches": [ /* Dispatch[] */ ] }
    ```

- **GET /api/dispatches/:id**
  - Response:
    ```json
    { "dispatch": /* Dispatch */ }
    ```

- **POST /api/dispatches**
  - Request body:
    ```json
    {
      "branchId": 1,
      "productId": 1,
      "quantity": 100,
      "dispatchedAt": "2024-06-01T12:00:00Z"
    }
    ```
  - Response:
    ```json
    { "dispatch": /* Dispatch */ }
    ```

- **PUT /api/dispatches/:id**
  - Request body:
    ```json
    {
      "branchId": 1,
      "productId": 1,
      "quantity": 100,
      "dispatchedAt": "2024-06-01T12:00:00Z"
    }
    ```
  - Response:
    ```json
    { "dispatch": /* Dispatch */ }
    ```

- **DELETE /api/dispatches/:id**
  - Response:
    ```json
    { "success": true }
    ```

### Users

- **GET /api/users**
  - Response:
    ```json
    { "users": [ /* User[] */ ] }
    ```

- **GET /api/users/:id**
  - Response:
    ```json
    { "user": /* User */ }
    ```

- **POST /api/users**
  - Request body:
    ```json
    {
      "username": "string",
      "password": "string",
      "role": "admin" | "branch_manager",
      "branchId": 1
    }
    ```
  - Response:
    ```json
    { "user": /* User */ }
    ```

- **PUT /api/users/:id**
  - Request body:
    ```json
    {
      "username": "string",
      "password": "string",
      "role": "admin" | "branch_manager",
      "branchId": 1
    }
    ```
  - Response:
    ```json
    { "user": /* User */ }
    ```

- **DELETE /api/users/:id**
  - Response:
    ```json
    { "success": true }
    ```

---

## 4. FILE STRUCTURE

### PORT TABLE

| Service      | Listening Port | Path                    |
|--------------|---------------|-------------------------|
| api-server   | 23001         | backend/                |
| redis        | 26379         | (Docker image)          |
| postgres     | 25432         | (Docker image)          |
| frontend     | 24000         | frontend/               |

### FILE TREE

```
.
├── backend/
│   ├── Dockerfile                # Docker build for backend API server (EXPOSE 23001)
│   ├── package.json              # Node.js dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── .env.example              # Backend environment variables template
│   ├── src/
│   │   ├── index.ts              # Backend entry point (listens on 23001)
│   │   ├── app.ts                # Express app setup
│   │   ├── routes/
│   │   │   ├── auth.ts           # Auth endpoints
│   │   │   ├── branches.ts       # Branch endpoints
│   │   │   ├── products.ts       # Product endpoints
│   │   │   ├── dispatches.ts     # Dispatch endpoints
│   │   │   └── users.ts          # User endpoints
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── branchController.ts
│   │   │   ├── productController.ts
│   │   │   ├── dispatchController.ts
│   │   │   └── userController.ts
│   │   ├── models/
│   │   │   ├── Branch.ts         # Branch interface
│   │   │   ├── Product.ts        # Product interface
│   │   │   ├── Dispatch.ts       # Dispatch interface
│   │   │   └── User.ts           # User interface
│   │   ├── db/
│   │   │   ├── index.ts          # DB connection (PostgreSQL)
│   │   │   └── redis.ts          # Redis connection
│   │   ├── middleware/
│   │   │   ├── auth.ts           # Auth middleware (JWT)
│   │   │   └── errorHandler.ts   # Error handling middleware
│   │   ├── utils/
│   │   │   ├── jwt.ts            # JWT utilities
│   │   │   └── validators.ts     # Express-validator schemas
│   │   └── types/
│   │       └── index.d.ts        # Global TypeScript types
│   └── README.md                 # Backend documentation
├── frontend/
│   ├── Dockerfile                # Docker build for frontend (EXPOSE 24000)
│   ├── package.json              # React/TypeScript dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── .env.example              # Frontend environment variables template
│   ├── public/
│   │   ├── index.html            # HTML entry point (loads /src/main.tsx)
│   │   └── favicon.ico
│   ├── src/
│   │   ├── main.tsx              # React entry point
│   │   ├── App.tsx               # Main App component
│   │   ├── api/
│   │   │   ├── axios.ts          # Axios instance with baseURL
│   │   │   ├── auth.ts           # Auth API functions
│   │   │   ├── branches.ts       # Branch API functions
│   │   │   ├── products.ts       # Product API functions
│   │   │   ├── dispatches.ts     # Dispatch API functions
│   │   │   └── users.ts          # User API functions
│   │   ├── types/
│   │   │   ├── Branch.ts         # Branch interface
│   │   │   ├── Product.ts        # Product interface
│   │   │   ├── Dispatch.ts       # Dispatch interface
│   │   │   └── User.ts           # User interface
│   │   ├── hooks/
│   │   │   ├── useAuth.ts        # Auth state hook
│   │   │   ├── useBranches.ts    # Branches state hook
│   │   │   ├── useProducts.ts    # Products state hook
│   │   │   ├── useDispatches.ts  # Dispatches state hook
│   │   │   └── useUsers.ts       # Users state hook
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── LogoutButton.tsx
│   │   │   ├── Branch/
│   │   │   │   ├── BranchList.tsx
│   │   │   │   ├── BranchForm.tsx
│   │   │   │   └── BranchDetails.tsx
│   │   │   ├── Product/
│   │   │   │   ├── ProductList.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   └── ProductDetails.tsx
│   │   │   ├── Dispatch/
│   │   │   │   ├── DispatchList.tsx
│   │   │   │   ├── DispatchForm.tsx
│   │   │   │   └── DispatchDetails.tsx
│   │   │   ├── User/
│   │   │   │   ├── UserList.tsx
│   │   │   │   ├── UserForm.tsx
│   │   │   │   └── UserDetails.tsx
│   │   │   └── Layout/
│   │   │       ├── Navbar.tsx
│   │   │       └── Sidebar.tsx
│   │   ├── styles/
│   │   │   ├── tokens.ts         # Design tokens (see §9)
│   │   │   └── global.ts         # Global styled-components styles
│   │   └── pages/
│   │       ├── Dashboard.tsx
│   │       ├── Branches.tsx
│   │       ├── Products.tsx
│   │       ├── Dispatches.tsx
│   │       └── Users.tsx
│   └── README.md                 # Frontend documentation
├── docker-compose.yml            # Multi-service orchestration (see PORT TABLE)
├── .gitignore                    # Ignore node_modules, build, .env, etc.
├── README.md                     # Project overview and setup
├── run.sh                        # Startup script for local development
└── k8s/
    ├── backend-deployment.yaml   # Kubernetes deployment for backend
    ├── frontend-deployment.yaml  # Kubernetes deployment for frontend
    ├── postgres-deployment.yaml  # Kubernetes deployment for PostgreSQL
    ├── redis-deployment.yaml     # Kubernetes deployment for Redis
    └── ingress.yaml              # Ingress configuration
```

---

## 5. ENVIRONMENT VARIABLES

### Backend (.env.example)

| Name                | Type   | Description                                 | Example Value           |
|---------------------|--------|---------------------------------------------|------------------------|
| PORT                | number | Express listening port                      | 23001                  |
| DATABASE_URL        | string | PostgreSQL connection string                | postgres://user:pass@postgres:5432/distroviz |
| REDIS_URL           | string | Redis connection string                     | redis://redis:6379     |
| JWT_SECRET          | string | JWT signing secret                          | supersecretkey         |
| JWT_EXPIRES_IN      | string | JWT expiration duration                     | 1d                     |
| NODE_ENV            | string | Node environment                            | development            |

### Frontend (.env.example)

| Name                | Type   | Description                                 | Example Value           |
|---------------------|--------|---------------------------------------------|------------------------|
| VITE_API_URL        | string | Base URL for backend API                    | http://localhost:23001 |

---

## 6. IMPORT CONTRACTS

### Backend

- `from src/models/Branch import Branch`
- `from src/models/Product import Product`
- `from src/models/Dispatch import Dispatch`
- `from src/models/User import User`
- `from src/db/index import db` (PostgreSQL client instance)
- `from src/db/redis import redisClient`
- `from src/middleware/auth import authenticate, authorize`
- `from src/middleware/errorHandler import errorHandler`
- `from src/utils/jwt import signToken, verifyToken`
- `from src/utils/validators import validateBranch, validateProduct, validateDispatch, validateUser`

### Frontend

- `import { Branch } from '../types/Branch'`
- `import { Product } from '../types/Product'`
- `import { Dispatch } from '../types/Dispatch'`
- `import { User } from '../types/User'`
- `import { useAuth } from '../hooks/useAuth'`
- `import { useBranches } from '../hooks/useBranches'`
- `import { useProducts } from '../hooks/useProducts'`
- `import { useDispatches } from '../hooks/useDispatches'`
- `import { useUsers } from '../hooks/useUsers'`
- `import { tokens } from '../styles/tokens'`
- `import { Navbar } from '../components/Layout/Navbar'`
- `import { Sidebar } from '../components/Layout/Sidebar'`

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### Shared State Primitives (React hooks)

- `useAuth() → { user, token, login, logout, loading, error }`
- `useBranches() → { branches, loading, error, createBranch, updateBranch, deleteBranch, fetchBranches }`
- `useProducts() → { products, loading, error, createProduct, updateProduct, deleteProduct, fetchProducts }`
- `useDispatches() → { dispatches, loading, error, createDispatch, updateDispatch, deleteDispatch, fetchDispatches }`
- `useUsers() → { users, loading, error, createUser, updateUser, deleteUser, fetchUsers }`

### Reusable Component Props

- `LoginForm` props: `{ onSubmit: (data: { username: string; password: string }) => void, loading: boolean, error: string | null }`
- `LogoutButton` props: `{ onLogout: () => void }`
- `BranchList` props: `{ branches: Branch[], onEdit: (id: number) => void, onDelete: (id: number) => void, loading: boolean }`
- `BranchForm` props: `{ branch?: Branch, onSubmit: (data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>) => void, loading: boolean }`
- `BranchDetails` props: `{ branch: Branch }`
- `ProductList` props: `{ products: Product[], onEdit: (id: number) => void, onDelete: (id: number) => void, loading: boolean }`
- `ProductForm` props: `{ product?: Product, onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void, loading: boolean }`
- `ProductDetails` props: `{ product: Product }`
- `DispatchList` props: `{ dispatches: Dispatch[], onEdit: (id: number) => void, onDelete: (id: number) => void, loading: boolean }`
- `DispatchForm` props: `{ dispatch?: Dispatch, onSubmit: (data: Omit<Dispatch, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => void, loading: boolean }`
- `DispatchDetails` props: `{ dispatch: Dispatch }`
- `UserList` props: `{ users: User[], onEdit: (id: number) => void, onDelete: (id: number) => void, loading: boolean }`
- `UserForm` props: `{ user?: User, onSubmit: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void, loading: boolean }`
- `UserDetails` props: `{ user: User }`
- `Navbar` props: `{ user: User | null, onLogout: () => void }`
- `Sidebar` props: `{ currentPage: string, onNavigate: (page: string) => void }`

---

## 8. FILE EXTENSION CONVENTION

- **Frontend files:** `.tsx` (TypeScript React)
- **Project language:** TypeScript (all frontend and backend source files use `.ts`/`.tsx`)
- **Entry point:** `/src/main.tsx` (as referenced in `public/index.html` via `<script src="/src/main.tsx">`)

---

## 9. DESIGN TOKENS

```typescript
export const tokens = {
  colors: {
    primary: '#2D6A4F',
    secondary: '#40916C',
    accent: '#F9C74F',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    error: '#D90429',
    textPrimary: '#212529',
    textSecondary: '#495057',
    border: '#CED4DA'
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSizeBase: '1rem',
    fontWeightRegular: 400,
    fontWeightBold: 700,
    lineHeightBase: 1.5
  },
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px rgba(44, 62, 80, 0.05)',
    md: '0 2px 8px rgba(44, 62, 80, 0.10)',
    lg: '0 4px 16px rgba(44, 62, 80, 0.15)'
  }
};
```
**All React components must import tokens from `frontend/src/styles/tokens.ts` and use these values for colors, spacing, typography, border radius, and shadows.**