import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['DATABASE_URL'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Required environment variable ${varName} is not set`);
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
  return res;
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export const closePool = async () => {
  await pool.end();
};

export default pool;