import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'catstore',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres123',
});

const initSQL = `
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image_url VARCHAR(500),
  stock INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1
);

INSERT INTO categories (name, description) VALUES
  ('Food', 'Premium cat food and treats'),
  ('Toys', 'Interactive and fun cat toys'),
  ('Grooming', 'Brushes, combs, and grooming supplies'),
  ('Bedding', 'Cozy beds and blankets'),
  ('Accessories', 'Collars, leashes, and accessories')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, stock, category_id) VALUES
  ('Premium Cat Food', 'High-quality cat food for daily nutrition', 49.99, 'https://placekitten.com/400/300', 100, 1),
  ('Organic Cat Treats', 'Healthy treats made with real chicken', 19.99, 'https://placekitten.com/401/300', 150, 1),
  ('Feather Wand Toy', 'Interactive feather wand for playtime', 14.99, 'https://placekitten.com/402/300', 75, 2),
  ('Laser Pointer', 'Automatic laser pointer for endless fun', 24.99, 'https://placekitten.com/403/300', 50, 2),
  ('Cat Brush', 'Gentle grooming brush for soft fur', 29.99, 'https://placekitten.com/404/300', 60, 3),
  ('Nail Clippers', 'Professional-grade nail clippers', 15.99, 'https://placekitten.com/405/300', 80, 3),
  ('Cozy Cat Bed', 'Ultra-soft bed for maximum comfort', 79.99, 'https://placekitten.com/406/300', 40, 4),
  ('Heated Cat Bed', 'Self-warming heated bed', 99.99, 'https://placekitten.com/407/300', 30, 4),
  ('Cat Collar', 'Adjustable collar with bell', 12.99, 'https://placekitten.com/408/300', 120, 5),
  ('Cat Carrier', 'Ventilated carrier for travel', 59.99, 'https://placekitten.com/409/300', 35, 5)
ON CONFLICT DO NOTHING;
`;

async function migrate(): Promise<void> {
  console.log(JSON.stringify({
    level: 'info',
    message: 'Running database migrations',
    timestamp: new Date().toISOString(),
  }));

  try {
    await pool.query(initSQL);
    console.log(JSON.stringify({
      level: 'info',
      message: 'Database migrations completed successfully',
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Migration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }));
    throw error;
  } finally {
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error(JSON.stringify({
    level: 'error',
    message: 'Migration script failed',
    error: error instanceof Error ? error.message : 'Unknown error',
    timestamp: new Date().toISOString(),
  }));
  process.exit(1);
});