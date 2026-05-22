-- PostgreSQL schema for DistroViz

-- Plants table
CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    manager_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Distribution Centers table
CREATE TABLE IF NOT EXISTS distribution_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    region VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    plant_id INTEGER NOT NULL REFERENCES plants(id) ON DELETE RESTRICT,
    distribution_center_id INTEGER NOT NULL REFERENCES distribution_centers(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    delivery_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_plant_id ON orders(plant_id);
CREATE INDEX IF NOT EXISTS idx_orders_distribution_center_id ON orders(distribution_center_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_distribution_centers_updated_at ON distribution_centers;
CREATE TRIGGER update_distribution_centers_updated_at BEFORE UPDATE ON distribution_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();