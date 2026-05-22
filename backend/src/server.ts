import { createApp } from './app';
import db, { closePool as closeDbPool, query } from './db/index';
import redisClient, { closeRedis } from './db/redis';

const PORT = parseInt(process.env.PORT || '23001', 10);

async function startServer(): Promise<void> {
  console.log(JSON.stringify({
    level: 'info',
    message: 'Starting server',
    port: PORT,
    timestamp: new Date().toISOString(),
  }));

  try {
    await query('SELECT 1');
    console.log(JSON.stringify({
      level: 'info',
      message: 'Database connection verified',
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Failed to connect to database',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }));
    process.exit(1);
  }

  try {
    await redisClient.ping();
    console.log(JSON.stringify({
      level: 'info',
      message: 'Redis connection verified',
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Failed to connect to Redis',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }));
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log(JSON.stringify({
      level: 'info',
      message: `Server listening on port ${PORT}`,
      port: PORT,
      timestamp: new Date().toISOString(),
    }));
  });

  process.on('SIGTERM', async () => {
    console.log(JSON.stringify({
      level: 'info',
      message: 'SIGTERM received, shutting down gracefully',
      timestamp: new Date().toISOString(),
    }));
    server.close(async () => {
      try {
        await closeDbPool();
        await closeRedis();
        console.log(JSON.stringify({
          level: 'info',
          message: 'Server shut down complete',
          timestamp: new Date().toISOString(),
        }));
        process.exit(0);
      } catch (error) {
        console.error(JSON.stringify({
          level: 'error',
          message: 'Error during shutdown',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }));
        process.exit(1);
      }
    });
  });

  process.on('SIGINT', async () => {
    console.log(JSON.stringify({
      level: 'info',
      message: 'SIGINT received, shutting down gracefully',
      timestamp: new Date().toISOString(),
    }));
    server.close(async () => {
      try {
        await closeDbPool();
        await closeRedis();
        console.log(JSON.stringify({
          level: 'info',
          message: 'Server shut down complete',
          timestamp: new Date().toISOString(),
        }));
        process.exit(0);
      } catch (error) {
        console.error(JSON.stringify({
          level: 'error',
          message: 'Error during shutdown',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }));
        process.exit(1);
      }
    });
  });
}

startServer().catch((error) => {
  console.error(JSON.stringify({
    level: 'error',
    message: 'Failed to start server',
    error: error instanceof Error ? error.message : 'Unknown error',
    timestamp: new Date().toISOString(),
  }));
  process.exit(1);
});