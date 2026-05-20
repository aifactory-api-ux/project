export const REQUIRED_ENV_VARS = ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET'] as const;

export interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  NODE_ENV: string;
}

export function validateEnvConfig(env: Record<string, string | undefined>): EnvConfig {
  for (const varName of REQUIRED_ENV_VARS) {
    if (!env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  const port = parseInt(env.PORT || '3000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('Invalid PORT value');
  }

  return {
    PORT: port,
    DATABASE_URL: env.DATABASE_URL!,
    REDIS_URL: env.REDIS_URL!,
    JWT_SECRET: env.JWT_SECRET!,
    NODE_ENV: env.NODE_ENV || 'development'
  };
}