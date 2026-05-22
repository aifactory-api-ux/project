import { createApp } from './app';
import { db } from './db/index';
import { redisClient } from './db/redis';

const PORT = parseInt(process.env.PORT || '23001', 10);

async function startServer(): Promise<void> {
  console.log(JSON.stringify({
    level: 'info',
    message: 'Starting server',
    port: PORT,
    timestamp: new Date().toISOString(),
  }));

  try {
    const dbHealthy = await db.healthCheck();
    if (!dbHealthy) {
      throw new Error('Database health check failed');
    }
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
    const redisHealthy = await redisClient.healthCheck();
    if (!redisHealthy) {
      throw new Error('Redis health check failed');
    }
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
        await db.closePool();
        await redisClient.close();
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
        await db.closePool();
        await redisClient.close();
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