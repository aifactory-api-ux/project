# DistroViz Backend

Backend API for DistroViz distribution visualization platform.

## Stack

- Node.js 20 + Express.js 4
- PostgreSQL 15
- Redis 7
- TypeScript 5

## Getting Started

### Prerequisites

- Node.js 20.x
- PostgreSQL 15.x
- Redis 7.x

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure the environment variables:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## API Endpoints

### Health Check

- `GET /health` - Returns service health status

### Plants

- `GET /api/plants` - Get all plants (supports pagination: ?page=1&limit=10)
- `GET /api/plants/:id` - Get plant by ID
- `POST /api/plants` - Create new plant
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant

### Distribution Centers

- `GET /api/distribution-centers` - Get all distribution centers (supports pagination)
- `GET /api/distribution-centers/:id` - Get distribution center by ID
- `POST /api/distribution-centers` - Create new distribution center
- `PUT /api/distribution-centers/:id` - Update distribution center
- `DELETE /api/distribution-centers/:id` - Delete distribution center

## Data Models

### Plant

```json
{
  "id": 1,
  "name": "Planta Norte",
  "location": "Av. Industrial 1234, Monterrey, NL",
  "managerName": "Carlos Rodríguez",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

### Distribution Center

```json
{
  "id": 1,
  "name": "Centro Distribución Norte",
  "address": "Calle Logística 111, Monterrey, NL",
  "region": "Norte",
  "capacity": 50000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

## License

MIT