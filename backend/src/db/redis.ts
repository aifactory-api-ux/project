import { createClient, RedisClientType } from 'redis';

const requiredEnvVars = ['REDIS_HOST', 'REDIS_PORT'];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (client && client.isOpen) {
    return client;
  }

  client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          console.error(JSON.stringify({
            level: 'error',
            message: 'Redis max reconnection attempts reached',
            retries,
            timestamp: new Date().toISOString(),
          }));
          return new Error('Redis max reconnection attempts reached');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  client.on('error', (err) => {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Redis client error',
      error: err.message,
      timestamp: new Date().toISOString(),
    }));
  });

  client.on('connect', () => {
    console.log(JSON.stringify({
      level: 'info',
      message: 'Redis client connected',
      timestamp: new Date().toISOString(),
    }));
  });

  client.on('reconnecting', () => {
    console.log(JSON.stringify({
      level: 'info',
      message: 'Redis client reconnecting',
      timestamp: new Date().toISOString(),
    }));
  });

  await client.connect();
  return client;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const redisClient = await getRedisClient();
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (client && client.isOpen) {
    await client.quit();
    client = null;
  }
}

export const redisClient = {
  getClient: getRedisClient,
  healthCheck,
  close: closeRedis,
};

export default redisClient;