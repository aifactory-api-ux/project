# SPEC.md

## 1. TECHNOLOGY STACK

- **Backend**
  - Python 3.11
  - FastAPI 0.110.0
  - Uvicorn 0.29.0
  - SQLAlchemy 2.0.29
  - Pydantic 2.6.4
  - psycopg2-binary 2.9.9
- **Database**
  - PostgreSQL 15
- **Frontend**
  - React 18.2.0
  - TypeScript 5.4.2
  - Vite 5.2.0
  - Axios 1.6.7
  - React Router DOM 6.22.3
- **Infrastructure**
  - Docker 26.0.0
  - Docker Compose 2.27.0
  - AWS ECS (deployment target)
- **Shared**
  - Node.js 20.11.1 (for frontend build)
  - Yarn 4.2.2

---

## 2. DATA CONTRACTS

### Python (Pydantic Models)

```python
# backend/shared/models.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class NewsSource(BaseModel):
    id: int
    name: str
    url: str

class NewsItem(BaseModel):
    id: int
    title: str
    summary: str
    url: str
    published_at: datetime
    source: NewsSource
    country: str
    tags: List[str]
    priority: int

class NewsItemCreate(BaseModel):
    title: str
    summary: str
    url: str
    published_at: datetime
    source_id: int
    country: str
    tags: List[str]
    priority: int

class NewsItemUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    url: Optional[str] = None
    published_at: Optional[datetime] = None
    source_id: Optional[int] = None
    country: Optional[str] = None
    tags: Optional[List[str]] = None
    priority: Optional[int] = None

class User(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
```

### TypeScript (Frontend Interfaces)

```typescript
// frontend/src/types/models.ts

export interface NewsSource {
  id: number;
  name: string;
  url: string;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  url: string;
  published_at: string; // ISO 8601
  source: NewsSource;
  country: string;
  tags: string[];
  priority: number;
}

export interface NewsItemCreate {
  title: string;
  summary: string;
  url: string;
  published_at: string; // ISO 8601
  source_id: number;
  country: string;
  tags: string[];
  priority: number;
}

export interface NewsItemUpdate {
  title?: string;
  summary?: string;
  url?: string;
  published_at?: string;
  source_id?: number;
  country?: string;
  tags?: string[];
  priority?: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}
```

---

## 3. API ENDPOINTS

### Auth

- **POST /api/auth/login**
  - Request: `{ "email": string, "password": string }`
  - Response: `Token`

- **POST /api/auth/register**
  - Request: `UserCreate`
  - Response: `User`

- **GET /api/auth/me**
  - Auth: Bearer token
  - Response: `User`

---

### News

- **GET /api/news**
  - Query params: `country?: string`, `tag?: string`, `priority?: int`, `limit?: int`, `offset?: int`
  - Response: `{ items: NewsItem[], total: int }`

- **GET /api/news/{id}**
  - Response: `NewsItem`

- **POST /api/news**
  - Auth: Bearer token
  - Request: `NewsItemCreate`
  - Response: `NewsItem`

- **PATCH /api/news/{id}**
  - Auth: Bearer token
  - Request: `NewsItemUpdate`
  - Response: `NewsItem`

- **DELETE /api/news/{id}**
  - Auth: Bearer token
  - Response: `{ "ok": true }`

---

### News Sources

- **GET /api/sources**
  - Response: `NewsSource[]`

- **POST /api/sources**
  - Auth: Bearer token
  - Request: `{ name: string, url: string }`
  - Response: `NewsSource`

---

## 4. FILE STRUCTURE

### PORT TABLE

| Service             | Listening Port | Path                        |
|---------------------|---------------|-----------------------------|
| news-service        | 23001         | backend/news-service/       |
| auth-service        | 23002         | backend/auth-service/       |

### SHARED MODULES

| Shared path         | Imported by services           |
|---------------------|-------------------------------|
| backend/shared/     | news-service, auth-service    |

---

### File Tree

```
.
├── docker-compose.yml                # Multi-service orchestration (all ports 21000+)
├── .env.example                     # Template for all required environment variables
├── .gitignore                       # Ignore Python, Node, and build artifacts
├── README.md                        # Project overview and setup instructions
├── run.sh                           # Root-level startup script for local dev
├── backend/
│   ├── shared/
│   │   ├── models.py                # Pydantic models shared across services
│   │   ├── db.py                    # Shared DB connection logic
│   │   └── utils.py                 # Shared utility functions
│   ├── news-service/
│   │   ├── main.py                  # FastAPI app entrypoint (EXPOSE 23001)
│   │   ├── api/
│   │   │   ├── news.py              # News endpoints
│   │   │   └── sources.py           # News source endpoints
│   │   ├── crud/
│   │   │   ├── news.py              # News CRUD logic
│   │   │   └── sources.py           # Source CRUD logic
│   │   ├── models.py                # SQLAlchemy models for news-service
│   │   ├── dependencies.py          # FastAPI dependencies
│   │   ├── Dockerfile               # Service Dockerfile (EXPOSE 23001)
│   │   └── start.sh                 # Service startup script
│   ├── auth-service/
│   │   ├── main.py                  # FastAPI app entrypoint (EXPOSE 23002)
│   │   ├── api/
│   │   │   ├── auth.py              # Auth endpoints (login, register, me)
│   │   ├── crud/
│   │   │   ├── users.py             # User CRUD logic
│   │   ├── models.py                # SQLAlchemy models for auth-service
│   │   ├── dependencies.py          # FastAPI dependencies
│   │   ├── security.py              # JWT and password hashing logic
│   │   ├── Dockerfile               # Service Dockerfile (EXPOSE 23002)
│   │   └── start.sh                 # Service startup script
├── frontend/
│   ├── public/
│   │   ├── index.html               # HTML entrypoint (script src="/src/main.tsx")
│   ├── src/
│   │   ├── main.tsx                 # React app entrypoint
│   │   ├── App.tsx                  # Root component with router
│   │   ├── api/
│   │   │   ├── news.ts              # News API client
│   │   │   ├── auth.ts              # Auth API client
│   │   │   └── sources.ts           # Sources API client
│   │   ├── hooks/
│   │   │   ├── useNews.ts           # News state hook
│   │   │   ├── useAuth.ts           # Auth state hook
│   │   │   └── useSources.ts        # Sources state hook
│   │   ├── components/
│   │   │   ├── NewsList.tsx         # News list display
│   │   │   ├── NewsForm.tsx         # News create/edit form
│   │   │   ├── NewsItemCard.tsx     # Single news item card
│   │   │   ├── SourceSelect.tsx     # Source dropdown
│   │   │   ├── LoginForm.tsx        # Login form
│   │   │   ├── RegisterForm.tsx     # Registration form
│   │   │   └── UserMenu.tsx         # User dropdown/menu
│   │   ├── pages/
│   │   │   ├── NewsFeed.tsx         # Main news feed page
│   │   │   ├── NewsDetail.tsx       # News detail page
│   │   │   ├── Login.tsx            # Login page
│   │   │   ├── Register.tsx         # Register page
│   │   │   └── NotFound.tsx         # 404 page
│   │   ├── types/
│   │   │   └── models.ts            # TypeScript interfaces (see §2)
│   │   ├── styles/
│   │   │   ├── tokens.ts            # Design tokens (see §9)
│   │   │   └── global.css           # Global CSS
│   │   └── utils/
│   │       └── auth.ts              # Token storage helpers
│   ├── Dockerfile                   # Frontend Dockerfile (EXPOSE 23100)
│   └── start.sh                     # Frontend startup script
```

---

## 5. ENVIRONMENT VARIABLES

| Name                        | Type    | Description                                         | Example Value                |
|-----------------------------|---------|-----------------------------------------------------|-----------------------------|
| POSTGRES_HOST               | string  | PostgreSQL host (Docker service name or IP)         | postgres                    |
| POSTGRES_PORT               | int     | PostgreSQL port (container-internal, default 5432)  | 5432                        |
| POSTGRES_DB                 | string  | PostgreSQL database name                            | cencosud_news               |
| POSTGRES_USER               | string  | PostgreSQL username                                 | cencosud                    |
| POSTGRES_PASSWORD           | string  | PostgreSQL password                                 | supersecret                 |
| NEWS_SERVICE_PORT           | int     | Port for news-service FastAPI app                   | 23001                       |
| AUTH_SERVICE_PORT           | int     | Port for auth-service FastAPI app                   | 23002                       |
| FRONTEND_PORT               | int     | Port for frontend React app                         | 23100                       |
| JWT_SECRET_KEY              | string  | Secret key for JWT signing                          | change_this_secret          |
| JWT_ALGORITHM               | string  | JWT signing algorithm                               | HS256                       |
| ACCESS_TOKEN_EXPIRE_MINUTES | int     | JWT access token expiration (minutes)               | 60                          |
| CORS_ORIGINS                | string  | Comma-separated list of allowed CORS origins        | http://localhost:23100      |
| AWS_REGION                  | string  | AWS region for deployment                           | us-east-1                   |
| AWS_ACCESS_KEY_ID           | string  | AWS access key ID                                   | AKIA...                     |
| AWS_SECRET_ACCESS_KEY       | string  | AWS secret access key                               | ...                         |

---

## 6. IMPORT CONTRACTS

### Backend

- `from shared.models import NewsItem, NewsItemCreate, NewsItemUpdate, NewsSource, User, UserCreate, Token`
- `from shared.db import get_db_session`
- `from shared.utils import hash_password, verify_password`
- `from news-service.crud.news import create_news_item, get_news_items, get_news_item, update_news_item, delete_news_item`
- `from news-service.crud.sources import create_source, get_sources`
- `from news-service.api.news import router as news_router`
- `from news-service.api.sources import router as sources_router`
- `from auth-service.crud.users import create_user, get_user_by_email, authenticate_user`
- `from auth-service.api.auth import router as auth_router`
- `from auth-service.security import create_access_token, get_current_user, verify_password, hash_password`

### Frontend

- `import { NewsItem, NewsItemCreate, NewsItemUpdate, NewsSource, User, UserCreate, Token } from '../types/models'`
- `import { useNews } from '../hooks/useNews'`
- `import { useAuth } from '../hooks/useAuth'`
- `import { useSources } from '../hooks/useSources'`
- `import { tokens } from '../styles/tokens'`
- `import { createNews, fetchNews, updateNews, deleteNews } from '../api/news'`
- `import { login, register, getMe } from '../api/auth'`
- `import { fetchSources, createSource } from '../api/sources'`

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### Shared State Primitives

- **useNews() →**
  ```typescript
  {
    news: NewsItem[];
    total: number;
    loading: boolean;
    error: string | null;
    fetchNews: (params?: { country?: string; tag?: string; priority?: number; limit?: number; offset?: number }) => Promise<void>;
    createNews: (data: NewsItemCreate) => Promise<NewsItem>;
    updateNews: (id: number, data: NewsItemUpdate) => Promise<NewsItem>;
    deleteNews: (id: number) => Promise<void>;
    deletingId: number | null;
  }
  ```

- **useAuth() →**
  ```typescript
  {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: UserCreate) => Promise<void>;
    logout: () => void;
    token: string | null;
  }
  ```

- **useSources() →**
  ```typescript
  {
    sources: NewsSource[];
    loading: boolean;
    error: string | null;
    fetchSources: () => Promise<void>;
    createSource: (data: { name: string; url: string }) => Promise<NewsSource>;
  }
  ```

---

### Reusable Component Props

- **NewsList props:** `{ news: NewsItem[], onDelete: (id: number) => void, deletingId: number | null }`
- **NewsForm props:** `{ onSubmit: (data: NewsItemCreate | NewsItemUpdate) => void, loading: boolean, initialData?: NewsItem }`
- **NewsItemCard props:** `{ newsItem: NewsItem, onEdit: () => void, onDelete: () => void, deleting: boolean }`
- **SourceSelect props:** `{ sources: NewsSource[], value: number | null, onChange: (id: number) => void }`
- **LoginForm props:** `{ onSubmit: (email: string, password: string) => void, loading: boolean, error: string | null }`
- **RegisterForm props:** `{ onSubmit: (data: UserCreate) => void, loading: boolean, error: string | null }`
- **UserMenu props:** `{ user: User, onLogout: () => void }`

---

## 8. FILE EXTENSION CONVENTION

- All frontend files use `.tsx` (TypeScript React).
- The project is TypeScript-first for the frontend; no `.jsx` or `.js` files in `src/`.
- Entry point: `/src/main.tsx` (as referenced in `public/index.html` via `<script type="module" src="/src/main.tsx"></script>`).

---

## 9. DESIGN TOKENS

```typescript
// frontend/src/styles/tokens.ts

export const tokens = {
  colors: {
    primary: '#0057B8',
    secondary: '#FFD100',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#222222',
    muted: '#6B7280',
    error: '#E53E3E',
    success: '#38A169',
    warning: '#F6AD55',
    info: '#3182CE'
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
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
    6: '1.5rem',
    8: '2rem',
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
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'
  }
};
```
