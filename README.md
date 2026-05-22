# DistroViz

Dashboard web para la visualización de la distribución de producto terminado desde una fábrica hacia sus sucursales.

## Stack Tecnológico

- **Backend:** Node.js 20, Express.js
- **Base de Datos:** PostgreSQL 15
- **Cache:** Redis 7
- **Frontend:** React 18 (separate repository)
- **Infraestructura:** Docker, Docker Compose

## Prerequisites

- Docker v24.0.7+
- Docker Compose v2.24.2+

## Quick Start

```bash
./run.sh
```

Este comando:
1. Crea automáticamente `.env` desde `.env.example` (si no existe)
2. Verifica que Docker esté disponible
3. Construye e inicia todos los servicios
4. Espera a que todos los servicios estén healthy
5. Muestra las URLs de acceso

## Services

| Service   | Port  | Description                    |
|-----------|-------|--------------------------------|
| backend   | 23001 | API REST Node.js/Express       |
| postgres  | 25432 | PostgreSQL 15 database         |
| redis     | 26379 | Redis 7 cache                  |

## API Endpoints

### Health Check
```bash
curl http://localhost:23001/health
```

### Plants
```bash
GET    /api/plants           # List all plants
GET    /api/plants/:id       # Get plant by ID
POST   /api/plants           # Create plant
PUT    /api/plants/:id       # Update plant
DELETE /api/plants/:id       # Delete plant
```

### Distribution Centers
```bash
GET    /api/distribution-centers           # List all distribution centers
GET    /api/distribution-centers/:id       # Get distribution center by ID
POST   /api/distribution-centers            # Create distribution center
PUT    /api/distribution-centers/:id       # Update distribution center
DELETE /api/distribution-centers/:id       # Delete distribution center
```

### Orders
```bash
GET    /api/orders           # List all orders
GET    /api/orders/:id       # Get order by ID
POST   /api/orders           # Create order
PUT    /api/orders/:id       # Update order
DELETE /api/orders/:id       # Delete order
```

### Metrics
```bash
GET    /api/metrics/kpis           # Get KPI metrics
GET    /api/metrics/trends          # Get trend data (last 6 months)
GET    /api/metrics/volume-by-plant # Get volume grouped by plant
```

## Environment Variables

El archivo `.env.example` contiene todas las variables requeridas:

| Variable        | Descripción                           | Valor por defecto                                    |
|-----------------|---------------------------------------|------------------------------------------------------|
| POSTGRES_USER   | Usuario de PostgreSQL                 | distroviz                                            |
| POSTGRES_PASSWORD | Contraseña de PostgreSQL             | distrovizpass                                         |
| POSTGRES_DB     | Nombre de la base de datos            | distroviz                                             |
| PORT            | Puerto del servidor backend           | 23001                                                |
| DATABASE_URL    | Connection string de PostgreSQL       | postgres://distroviz:distrovizpass@postgres:5432/distroviz |
| REDIS_URL       | URL de Redis                          | redis://redis:6379                                    |
| JWT_SECRET      | Clave secreta para JWT                | (cambiar en producción)                               |
| JWT_EXPIRES_IN  | Tiempo de expiración del token        | 1d                                                   |
| NODE_ENV        | Entorno de ejecución                   | development                                          |

## Comandos Docker Compose

```bash
# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down

# Reiniciar servicios
docker compose restart

# Rebuild sin cache
docker compose up -d --build --no-cache
```

## Base de Datos

El backend ejecuta automáticamente:
- Migraciones (creación de tablas)
- Seed de datos iniciales (4 plantas, 5 centros de distribución, 30 órdenes)

### Conectar a PostgreSQL

```bash
docker compose exec postgres psql -U distroviz -d distroviz
```

## Desarrollo

### Estructura del Proyecto

```
├── backend/
│   ├── src/
│   │   ├── controllers/   # Controladores de rutas
│   │   ├── db/           # Schema y seed de BD
│   │   ├── middleware/    # Middleware Express
│   │   ├── models/       # Modelos de datos
│   │   ├── routes/       # Definición de rutas
│   │   ├── types/        # Tipos TypeScript
│   │   ├── utils/        # Utilidades
│   │   ├── app.ts        # Configuración Express
│   │   └── index.ts      # Punto de entrada
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── run.sh
├── .env.example
├── .gitignore
└── .dockerignore
```

## Seguridad

- No exponer `.env` en el repositorio
- Usar secretos fuertes en producción
- Configurar CORS apropiadamente para producción