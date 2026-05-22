import * as dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  NODE_ENV: string;
}

const requiredVars: (keyof EnvConfig)[] = ['PORT', 'DATABASE_URL', 'REDIS_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'NODE_ENV'];

const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const config: EnvConfig = {
  PORT: parseInt(process.env.PORT || '23001', 10),
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

if (isNaN(config.PORT) || config.PORT <= 0) {
  throw new Error('PORT must be a positive integer');
}

export default config;