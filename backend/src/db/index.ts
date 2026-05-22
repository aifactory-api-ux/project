import { Pool, QueryResult, PoolClient } from 'pg';
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

export const query = async <T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>> => {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
  return res;
};

export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  return client;
};

export const transaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};

export default pool;