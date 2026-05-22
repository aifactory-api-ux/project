import { createApp } from './app';
import config from './utils/env';
import { logger } from './utils/logger';
import { query, closePool } from './db';
import { seedData } from './db/seed';

const startServer = async () => {
  try {
    logger.info('Validating environment variables...', { env: config });

    logger.info('Testing database connection...');
    await query('SELECT NOW()');
    logger.info('Database connection successful');

    logger.info('Running database migrations...');
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS plants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(500) NOT NULL,
        manager_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS distribution_centers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500) NOT NULL,
        region VARCHAR(100) NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE INDEX IF NOT EXISTS idx_orders_plant_id ON orders(plant_id);
      CREATE INDEX IF NOT EXISTS idx_orders_distribution_center_id ON orders(distribution_center_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);

      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_plants_updated_at ON plants;
      CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_distribution_centers_updated_at ON distribution_centers;
      CREATE TRIGGER update_distribution_centers_updated_at BEFORE UPDATE ON distribution_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
      CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
    await query(schemaSql);
    logger.info('Database migrations completed');

    logger.info('Seeding database...');
    await seedData();
    logger.info('Database seeding completed');

    const app = createApp();

    const server = app.listen(config.PORT, () => {
      logger.info(`Server is running on port ${config.PORT}`, {
        port: config.PORT,
        nodeEnv: config.NODE_ENV,
        service: 'distroviz-api',
        version: '1.0.0',
      });
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        await closePool();
        logger.info('Database pool closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  }
};

startServer();