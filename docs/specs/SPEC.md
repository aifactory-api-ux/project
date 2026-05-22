# SPEC.md

## 1. TECHNOLOGY STACK

- **Backend**
  - Node.js v20.x
  - Express v4.18.x
  - PostgreSQL v15.x
  - Redis v7.x
- **Frontend**
  - React v18.x
  - TypeScript v5.x
- **Infrastructure**
  - Docker Engine v24.x
  - docker-compose v2.x

---

## 2. DATA CONTRACTS

### TypeScript Interfaces (frontend & backend shared)

```typescript
// Product
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  categoryId: number;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// Category
export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// User
export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  address: string;
  isAdmin: boolean;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// CartItem
export interface CartItem {
  productId: number;
  quantity: number;
}

// Cart
export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// Order
export interface Order {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}
```

### PostgreSQL Table Schemas

- **products**: id (PK, serial), name (varchar), description (text), price (numeric), image_url (varchar), stock (int), category_id (FK), created_at (timestamp), updated_at (timestamp)
- **categories**: id (PK, serial), name (varchar), description (text), created_at (timestamp), updated_at (timestamp)
- **users**: id (PK, serial), email (varchar), password_hash (varchar), name (varchar), address (text), is_admin (boolean), created_at (timestamp), updated_at (timestamp)
- **carts**: id (PK, serial), user_id (FK), created_at (timestamp), updated_at (timestamp)
- **cart_items**: cart_id (FK), product_id (FK), quantity (int)
- **orders**: id (PK, serial), user_id (FK), total (numeric), status (varchar), created_at (timestamp), updated_at (timestamp)
- **order_items**: order_id (FK), product_id (FK), quantity (int)

---

## 3. API ENDPOINTS

### Product Endpoints

- **GET /api/products**
  - Response: `Product[]`
- **GET /api/products/:id**
  - Response: `Product`
- **POST /api/products**
  - Request: `{ name: string; description: string; price: number; imageUrl: string; stock: number; categoryId: number }`
  - Response: `Product`
- **PUT /api/products/:id**
  - Request: `{ name?: string; description?: string; price?: number; imageUrl?: string; stock?: number; categoryId?: number }`
  - Response: `Product`
- **DELETE /api/products/:id**
  - Response: `{ success: boolean }`

### Category Endpoints

- **GET /api/categories**
  - Response: `Category[]`
- **GET /api/categories/:id**
  - Response: `Category`
- **POST /api/categories**
  - Request: `{ name: string; description: string }`
  - Response: `Category`
- **PUT /api/categories/:id**
  - Request: `{ name?: string; description?: string }`
  - Response: `Category`
- **DELETE /api/categories/:id**
  - Response: `{ success: boolean }`

### User Endpoints

- **POST /api/auth/register**
  - Request: `{ email: string; password: string; name: string; address: string }`
  - Response: `User`
- **POST /api/auth/login**
  - Request: `{ email: string; password: string }`
  - Response: `{ token: string; user: User }`
- **GET /api/users/me**
  - Auth required (JWT)
  - Response: `User`

### Cart Endpoints

- **GET /api/cart**
  - Auth required (JWT)
  - Response: `Cart`
- **POST /api/cart/items**
  - Request: `{ productId: number; quantity: number }`
  - Response: `Cart`
- **PUT /api/cart/items/:productId**
  - Request: `{ quantity: number }`
  - Response: `Cart`
- **DELETE /api/cart/items/:productId**
  - Response: `Cart`

### Order Endpoints

- **POST /api/orders**
  - Auth required (JWT)
  - Request: `{ items: CartItem[] }`
  - Response: `Order`
- **GET /api/orders**
  - Auth required (JWT)
  - Response: `Order[]`
- **GET /api/orders/:id**
  - Auth required (JWT)
  - Response: `Order`

---

## 4. FILE STRUCTURE

### PORT TABLE

| Service    | Listening Port | Path                  |
|------------|---------------|-----------------------|
| backend    | 23001         | backend/              |
| frontend   | 23002         | frontend/             |
| postgres   | 25432         | (docker-compose only) |
| redis      | 26379         | (docker-compose only) |

### FILE TREE

```
.
├── backend/                           # Express API source code
│   ├── src/
│   │   ├── app.ts                     # Express app entry point
│   │   ├── server.ts                  # HTTP server bootstrap (EXPOSE 23001)
│   │   ├── routes/
│   │   │   ├── products.ts            # Product endpoints
│   │   │   ├── categories.ts          # Category endpoints
│   │   │   ├── auth.ts                # Auth endpoints
│   │   │   ├── users.ts               # User endpoints
│   │   │   ├── cart.ts                # Cart endpoints
│   │   │   └── orders.ts              # Order endpoints
│   │   ├── models/
│   │   │   ├── product.ts             # Product model
│   │   │   ├── category.ts            # Category model
│   │   │   ├── user.ts                # User model
│   │   │   ├── cart.ts                # Cart model
│   │   │   └── order.ts               # Order model
│   │   ├── controllers/
│   │   │   ├── productController.ts   # Product logic
│   │   │   ├── categoryController.ts  # Category logic
│   │   │   ├── authController.ts      # Auth logic
│   │   │   ├── userController.ts      # User logic
│   │   │   ├── cartController.ts      # Cart logic
│   │   │   └── orderController.ts     # Order logic
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT middleware
│   │   │   └── errorHandler.ts        # Error handling
│   │   ├── db/
│   │   │   ├── index.ts               # DB connection (PostgreSQL)
│   │   │   └── redis.ts               # Redis connection
│   │   ├── utils/
│   │   │   ├── jwt.ts                 # JWT helpers
│   │   │   └── password.ts            # Password hashing
│   │   └── types/
│   │       ├── product.ts             # Product TypeScript types
│   │       ├── category.ts            # Category TypeScript types
│   │       ├── user.ts                # User TypeScript types
│   │       ├── cart.ts                # Cart TypeScript types
│   │       └── order.ts               # Order TypeScript types
│   ├── Dockerfile                     # Backend Dockerfile (EXPOSE 23001)
│   └── .env.example                   # Backend env vars template
├── frontend/                          # React app source code
│   ├── public/
│   │   └── index.html                 # HTML entry point (loads /src/main.tsx)
│   ├── src/
│   │   ├── main.tsx                   # React entry point
│   │   ├── App.tsx                    # App root
│   │   ├── api/
│   │   │   ├── products.ts            # Product API client
│   │   │   ├── categories.ts          # Category API client
│   │   │   ├── auth.ts                # Auth API client
│   │   │   ├── cart.ts                # Cart API client
│   │   │   └── orders.ts              # Order API client
│   │   ├── hooks/
│   │   │   ├── useProducts.ts         # Product state hook
│   │   │   ├── useCategories.ts       # Category state hook
│   │   │   ├── useAuth.ts             # Auth state hook
│   │   │   ├── useCart.ts             # Cart state hook
│   │   │   └── useOrders.ts           # Order state hook
│   │   ├── components/
│   │   │   ├── ProductList.tsx        # Product list UI
│   │   │   ├── ProductCard.tsx        # Product card UI
│   │   │   ├── CategoryList.tsx       # Category list UI
│   │   │   ├── Cart.tsx               # Cart UI
│   │   │   ├── OrderList.tsx          # Order list UI
│   │   │   ├── LoginForm.tsx          # Login form
│   │   │   ├── RegisterForm.tsx       # Register form
│   │   │   └── Navbar.tsx             # Navigation bar
│   │   ├── styles/
│   │   │   └── tokens.ts              # Design tokens (see §9)
│   │   ├── types/
│   │   │   ├── product.ts             # Product TypeScript types
│   │   │   ├── category.ts            # Category TypeScript types
│   │   │   ├── user.ts                # User TypeScript types
│   │   │   ├── cart.ts                # Cart TypeScript types
│   │   │   └── order.ts               # Order TypeScript types
│   ├── Dockerfile                     # Frontend Dockerfile (EXPOSE 23002)
│   └── .env.example                   # Frontend env vars template
├── docker-compose.yml                 # Multi-service orchestration
├── run.sh                             # Startup script for local dev
├── .gitignore                         # Git ignore rules
├── README.md                          # Project documentation
```

---

## 5. ENVIRONMENT VARIABLES

### backend/.env.example

```
PORT=23001
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/project
REDIS_URL=redis://redis:6379
JWT_SECRET=supersecretkey
```

- `PORT` (number): Express server port. Example: `23001`
- `DATABASE_URL` (string): PostgreSQL connection string. Example: `postgresql://postgres:postgres@postgres:5432/project`
- `REDIS_URL` (string): Redis connection string. Example: `redis://redis:6379`
- `JWT_SECRET` (string): JWT signing secret. Example: `supersecretkey`

### frontend/.env.example

```
VITE_API_URL=http://localhost:23001/api
```

- `VITE_API_URL` (string): Base URL for backend API. Example: `http://localhost:23001/api`

---

## 6. IMPORT CONTRACTS

### Backend

- `from src/models/product import Product`
- `from src/models/category import Category`
- `from src/models/user import User`
- `from src/models/cart import Cart`
- `from src/models/order import Order`
- `from src/controllers/productController import getProducts, getProductById, createProduct, updateProduct, deleteProduct`
- `from src/controllers/categoryController import getCategories, getCategoryById, createCategory, updateCategory, deleteCategory`
- `from src/controllers/authController import register, login`
- `from src/controllers/userController import getMe`
- `from src/controllers/cartController import getCart, addItemToCart, updateCartItem, removeCartItem`
- `from src/controllers/orderController import createOrder, getOrders, getOrderById`
- `from src/middleware/auth import authenticateJWT`
- `from src/middleware/errorHandler import errorHandler`
- `from src/db/index import db`
- `from src/db/redis import redisClient`
- `from src/utils/jwt import signToken, verifyToken`
- `from src/utils/password import hashPassword, comparePassword`

### Frontend

- `import { Product } from '../types/product'`
- `import { Category } from '../types/category'`
- `import { User } from '../types/user'`
- `import { Cart, CartItem } from '../types/cart'`
- `import { Order } from '../types/order'`
- `import { useProducts } from '../hooks/useProducts'`
- `import { useCategories } from '../hooks/useCategories'`
- `import { useAuth } from '../hooks/useAuth'`
- `import { useCart } from '../hooks/useCart'`
- `import { useOrders } from '../hooks/useOrders'`
- `import { tokens } from '../styles/tokens'`

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### React Hooks

- `useProducts() → { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct }`
- `useCategories() → { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory }`
- `useAuth() → { user, token, loading, error, login, register, logout }`
- `useCart() → { cart, loading, error, addItem, updateItem, removeItem, clearCart }`
- `useOrders() → { orders, loading, error, createOrder, fetchOrders }`

### Components

- `ProductList` props: `{ products: Product[], onAddToCart: (productId: number) => void }`
- `ProductCard` props: `{ product: Product, onAddToCart: (productId: number) => void }`
- `CategoryList` props: `{ categories: Category[], onSelect: (categoryId: number) => void }`
- `Cart` props: `{ cart: Cart, onUpdateItem: (productId: number, quantity: number) => void, onRemoveItem: (productId: number) => void, onCheckout: () => void }`
- `OrderList` props: `{ orders: Order[] }`
- `LoginForm` props: `{ onSubmit: (email: string, password: string) => void, loading: boolean, error: string | null }`
- `RegisterForm` props: `{ onSubmit: (data: { email: string, password: string, name: string, address: string }) => void, loading: boolean, error: string | null }`
- `Navbar` props: `{ user: User | null, onLogout: () => void }`

---

## 8. FILE EXTENSION CONVENTION

- All frontend files use `.tsx` (TypeScript React).
- The project is TypeScript throughout (backend and frontend).
- Entry point: `/src/main.tsx` (referenced in `public/index.html` as `<script src="/src/main.tsx">`).

---

## 9. DESIGN TOKENS

```typescript
export const tokens = {
  colors: {
    primary: '#3B82F6',
    secondary: '#F59E42',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#1F2937',
    muted: '#6B7280',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E42'
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSizeBase: '1rem',
    fontWeightRegular: 400,
    fontWeightBold: 700,
    lineHeightBase: 1.5
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'
  }
};
```
