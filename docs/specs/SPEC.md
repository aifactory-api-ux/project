# SPEC.md

## 1. TECHNOLOGY STACK

- **Backend**
  - Node.js v20.x
  - NestJS v10.x
  - TypeScript v5.x
  - PostgreSQL v15.x
  - Redis v7.x (for caching and session management)
  - RabbitMQ v3.x (for asynchronous messaging)
- **Frontend**
  - React v18.x
  - TypeScript v5.x
  - Vite v4.x (for frontend build tooling)
- **Infrastructure & DevOps**
  - Docker v24.x
  - docker-compose v2.x
  - Kubernetes (EKS on AWS)
  - AWS RDS (PostgreSQL 15)
  - AWS ElastiCache (Redis)
  - AWS S3 (object storage for product images)
  - AWS CloudFront (CDN for static assets)
- **Testing**
  - Jest v29.x (backend and frontend unit/integration tests)
  - React Testing Library v14.x
- **Linting & Formatting**
  - ESLint v8.x
  - Prettier v3.x

---

## 2. DATA CONTRACTS

### Backend (NestJS/TypeScript) — DTOs

```typescript
// backend/shared/dto/product.dto.ts
export interface Product {
  id: string; // UUID
  name: string;
  description: string;
  price: number; // in cents
  imageUrl: string;
  stock: number;
  category: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// backend/shared/dto/user.dto.ts
export interface User {
  id: string; // UUID
  email: string;
  passwordHash: string;
  name: string;
  role: 'customer' | 'admin';
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// backend/shared/dto/order.dto.ts
export interface Order {
  id: string; // UUID
  userId: string; // UUID
  items: OrderItem[];
  total: number; // in cents
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

export interface OrderItem {
  productId: string; // UUID
  quantity: number;
  price: number; // in cents
}

// backend/shared/dto/auth.dto.ts
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

### Frontend (React/TypeScript) — Interfaces

```typescript
// frontend/src/types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// frontend/src/types/user.ts
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// frontend/src/types/order.ts
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

// frontend/src/types/auth.ts
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

---

## 3. API ENDPOINTS

### Auth Service

- **POST /api/auth/register**
  - Request: `AuthRequest`
  - Response: `AuthResponse`
- **POST /api/auth/login**
  - Request: `AuthRequest`
  - Response: `AuthResponse`
- **POST /api/auth/refresh**
  - Request:
    ```json
    { "refreshToken": "string" }
    ```
  - Response: `AuthResponse`
- **GET /api/auth/me**
  - Auth: Bearer token
  - Response: `User`

### Product Service

- **GET /api/products**
  - Query: `?category=string` (optional)
  - Response: `Product[]`
- **GET /api/products/:id**
  - Response: `Product`
- **POST /api/products**
  - Auth: Bearer token (admin only)
  - Request: `Product` (except `id`, `createdAt`, `updatedAt`)
  - Response: `Product`
- **PUT /api/products/:id**
  - Auth: Bearer token (admin only)
  - Request: Partial `Product` (fields to update)
  - Response: `Product`
- **DELETE /api/products/:id**
  - Auth: Bearer token (admin only)
  - Response:
    ```json
    { "success": true }
    ```

### Order Service

- **GET /api/orders**
  - Auth: Bearer token
  - Response: `Order[]` (for current user, or all if admin)
- **GET /api/orders/:id**
  - Auth: Bearer token
  - Response: `Order`
- **POST /api/orders**
  - Auth: Bearer token
  - Request:
    ```json
    {
      "items": [
        { "productId": "string", "quantity": number }
      ]
    }
    ```
  - Response: `Order`
- **PUT /api/orders/:id/status**
  - Auth: Bearer token (admin only)
  - Request:
    ```json
    { "status": "pending" | "paid" | "shipped" | "cancelled" }
    ```
  - Response: `Order`

### User Service

- **GET /api/users/me**
  - Auth: Bearer token
  - Response: `User`
- **GET /api/users/:id**
  - Auth: Bearer token (admin only)
  - Response: `User`
- **PUT /api/users/me**
  - Auth: Bearer token
  - Request: Partial `User` (fields to update, except `role`, `id`)
  - Response: `User`

---

## 4. FILE STRUCTURE

### PORT TABLE

| Service             | Listening Port | Path                        |
|---------------------|---------------|-----------------------------|
| auth-service        | 23001         | backend/auth-service/       |
| product-service     | 23002         | backend/product-service/    |
| order-service       | 23003         | backend/order-service/      |
| user-service        | 23004         | backend/user-service/       |
| frontend            | 24000         | frontend/                   |
| redis               | 26379         | (docker-compose only)       |
| rabbitmq            | 25672         | (docker-compose only)       |
| postgres            | 25432         | (docker-compose only)       |

### SHARED MODULES

| Shared path         | Imported by services                                 |
|---------------------|-----------------------------------------------------|
| backend/shared/     | auth-service, product-service, order-service, user-service |

### FILE TREE

```
.
├── docker-compose.yml                # Multi-service orchestration (all ports 21000+)
├── .env.example                      # Template for all required environment variables
├── .gitignore                        # Ignore node_modules, build, .env, etc.
├── README.md                         # Project overview and setup instructions
├── run.sh                            # Root-level startup script for local dev
├── backend/
│   ├── shared/                       # Shared DTOs, utils, and constants
│   │   ├── dto/
│   │   │   ├── product.dto.ts        # Product interface
│   │   │   ├── user.dto.ts           # User interface
│   │   │   ├── order.dto.ts          # Order and OrderItem interfaces
│   │   │   └── auth.dto.ts           # AuthRequest/AuthResponse interfaces
│   │   └── utils/
│   │       └── jwt.ts                # JWT utility functions
│   ├── auth-service/
│   │   ├── Dockerfile                # Docker build for auth-service (EXPOSE 23001)
│   │   ├── src/
│   │   │   ├── main.ts               # NestJS bootstrap
│   │   │   ├── app.module.ts         # Root module
│   │   │   ├── auth.controller.ts    # Auth endpoints
│   │   │   ├── auth.service.ts       # Auth logic
│   │   │   ├── user.entity.ts        # User entity/model
│   │   │   └── ...                   # Other modules/services
│   │   └── test/
│   │       └── auth.e2e-spec.ts      # E2E tests
│   ├── product-service/
│   │   ├── Dockerfile                # Docker build for product-service (EXPOSE 23002)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.entity.ts
│   │   │   └── ...
│   │   └── test/
│   │       └── product.e2e-spec.ts
│   ├── order-service/
│   │   ├── Dockerfile                # Docker build for order-service (EXPOSE 23003)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.entity.ts
│   │   │   └── ...
│   │   └── test/
│   │       └── order.e2e-spec.ts
│   ├── user-service/
│   │   ├── Dockerfile                # Docker build for user-service (EXPOSE 23004)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.entity.ts
│   │   │   └── ...
│   │   └── test/
│   │       └── user.e2e-spec.ts
│   └── shared/
│       ├── dto/
│       │   ├── product.dto.ts
│       │   ├── user.dto.ts
│       │   ├── order.dto.ts
│       │   └── auth.dto.ts
│       └── utils/
│           └── jwt.ts
├── frontend/
│   ├── Dockerfile                    # Docker build for frontend (EXPOSE 24000)
│   ├── public/
│   │   └── index.html                # Entry HTML file
│   ├── src/
│   │   ├── main.tsx                  # Entry point for React app
│   │   ├── App.tsx                   # Root component
│   │   ├── api/
│   │   │   ├── auth.ts               # Auth API client
│   │   │   ├── products.ts           # Product API client
│   │   │   ├── orders.ts             # Order API client
│   │   │   └── users.ts              # User API client
│   │   ├── hooks/
│   │   │   ├── useAuth.ts            # Auth state hook
│   │   │   ├── useProducts.ts        # Product state hook
│   │   │   ├── useOrders.ts          # Order state hook
│   │   │   └── useUser.ts            # User state hook
│   │   ├── components/
│   │   │   ├── ProductList.tsx       # Product list UI
│   │   │   ├── ProductCard.tsx       # Product card UI
│   │   │   ├── ProductForm.tsx       # Product create/edit form
│   │   │   ├── OrderList.tsx         # Order list UI
│   │   │   ├── OrderDetails.tsx      # Order details UI
│   │   │   ├── AuthForm.tsx          # Login/register form
│   │   │   └── UserProfile.tsx       # User profile UI
│   │   ├── types/
│   │   │   ├── product.ts
│   │   │   ├── user.ts
│   │   │   ├── order.ts
│   │   │   └── auth.ts
│   │   ├── styles/
│   │   │   ├── tokens.ts             # Design tokens (see §9)
│   │   │   └── global.css
│   │   └── utils/
│   │       └── storage.ts            # LocalStorage/session helpers
│   └── test/
│       ├── App.test.tsx
│       └── components/
│           ├── ProductList.test.tsx
│           └── OrderList.test.tsx
```

---

## 5. ENVIRONMENT VARIABLES

| Name                        | Type     | Description                                              | Example Value                  |
|-----------------------------|----------|----------------------------------------------------------|-------------------------------|
| NODE_ENV                    | string   | Node environment ("development", "production")           | development                   |
| POSTGRES_HOST               | string   | PostgreSQL host (service name in docker-compose)         | postgres                      |
| POSTGRES_PORT               | number   | PostgreSQL port (container-internal)                     | 5432                          |
| POSTGRES_USER               | string   | PostgreSQL username                                      | project_user                  |
| POSTGRES_PASSWORD           | string   | PostgreSQL password                                      | supersecret                   |
| POSTGRES_DB                 | string   | PostgreSQL database name                                 | project_db                    |
| REDIS_HOST                  | string   | Redis host                                               | redis                         |
| REDIS_PORT                  | number   | Redis port (container-internal)                          | 6379                          |
| RABBITMQ_HOST               | string   | RabbitMQ host                                            | rabbitmq                      |
| RABBITMQ_PORT               | number   | RabbitMQ port (container-internal)                       | 5672                          |
| JWT_SECRET                  | string   | Secret key for JWT signing                               | myjwtsecret                   |
| JWT_EXPIRES_IN              | string   | JWT expiration (e.g., "1h", "7d")                        | 1h                            |
| REFRESH_TOKEN_SECRET        | string   | Secret for refresh tokens                                | myrefreshsecret               |
| REFRESH_TOKEN_EXPIRES_IN    | string   | Refresh token expiration                                 | 7d                            |
| AWS_ACCESS_KEY_ID           | string   | AWS access key for S3/CloudFront                         | AKIA...                       |
| AWS_SECRET_ACCESS_KEY       | string   | AWS secret key for S3/CloudFront                         | ...                           |
| AWS_REGION                  | string   | AWS region                                               | us-east-1                     |
| S3_BUCKET_NAME              | string   | S3 bucket for product images                             | project-product-images        |
| FRONTEND_URL                | string   | Public URL of the frontend                               | http://localhost:24000        |
| BACKEND_AUTH_URL            | string   | Auth service base URL                                    | http://localhost:23001        |
| BACKEND_PRODUCT_URL         | string   | Product service base URL                                 | http://localhost:23002        |
| BACKEND_ORDER_URL           | string   | Order service base URL                                   | http://localhost:23003        |
| BACKEND_USER_URL            | string   | User service base URL                                    | http://localhost:23004        |
| PORT                        | number   | Service listening port (per service, see PORT TABLE)     | 23001                         |

---

## 6. IMPORT CONTRACTS

### Backend

- `from backend.shared.dto.product import Product`
- `from backend.shared.dto.user import User`
- `from backend.shared.dto.order import Order, OrderItem`
- `from backend.shared.dto.auth import AuthRequest, AuthResponse`
- `from backend.shared.utils.jwt import signJwt, verifyJwt, decodeJwt`

### Frontend

- `import { Product } from '../types/product'`
- `import { User } from '../types/user'`
- `import { Order, OrderItem } from '../types/order'`
- `import { AuthRequest, AuthResponse } from '../types/auth'`
- `import { useAuth } from '../hooks/useAuth'`
- `import { useProducts } from '../hooks/useProducts'`
- `import { useOrders } from '../hooks/useOrders'`
- `import { useUser } from '../hooks/useUser'`
- `import { tokens } from '../styles/tokens'`
- `import { getToken, setToken, clearToken } from '../utils/storage'`

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### Shared State Primitives (React Hooks)

- `useAuth() → { user, accessToken, refreshToken, loading, error, login, register, logout, refresh }`
- `useProducts() → { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct }`
- `useOrders() → { orders, loading, error, fetchOrders, createOrder, updateOrderStatus }`
- `useUser() → { user, loading, error, fetchUser, updateUser }`

### Reusable Component Props

- `ProductList` props: `{ products: Product[], onSelect: (id: string) => void }`
- `ProductCard` props: `{ product: Product, onAddToCart?: (id: string) => void, onEdit?: (id: string) => void, onDelete?: (id: string) => void }`
- `ProductForm` props: `{ product?: Product, onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void, loading: boolean }`
- `OrderList` props: `{ orders: Order[], onSelect: (id: string) => void }`
- `OrderDetails` props: `{ order: Order, onStatusChange?: (status: Order['status']) => void }`
- `AuthForm` props: `{ onSubmit: (data: AuthRequest) => void, loading: boolean, error?: string, mode: 'login' | 'register' }`
- `UserProfile` props: `{ user: User, onUpdate: (data: Partial<Omit<User, 'id' | 'role'>>) => void, loading: boolean }`

---

## 8. FILE EXTENSION CONVENTION

- All frontend files use `.tsx` (TypeScript React).
- The project is TypeScript throughout (backend and frontend).
- Entry point: `/src/main.tsx` (as referenced in `public/index.html` via `<script type="module" src="/src/main.tsx"></script>`).

---

## 9. DESIGN TOKENS

```typescript
export const tokens = {
  colors: {
    primary: '#6C63FF',
    secondary: '#FFB830',
    accent: '#FF6584',
    background: '#F8F9FB',
    surface: '#FFFFFF',
    text: '#22223B',
    muted: '#9A8C98',
    border: '#E0E0E0',
    success: '#4BB543',
    error: '#FF3333',
    warning: '#FFB830',
    info: '#3ABFF8'
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSizeBase: '1rem',
    fontSizeSm: '0.875rem',
    fontSizeLg: '1.25rem',
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
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px rgba(60,60,60,0.07)',
    md: '0 2px 8px rgba(60,60,60,0.10)',
    lg: '0 4px 16px rgba(60,60,60,0.13)'
  }
};
```

---

**All sections above are comprehensive and must be implemented verbatim. No field, endpoint, or file may be omitted or renamed. All code, configuration, and documentation must strictly follow the contracts and conventions defined in this specification.**