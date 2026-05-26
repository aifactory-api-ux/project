import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  postgres: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  redis: {
    host: string;
    port: number;
  };
  rabbitmq: {
    host: string;
    port: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  refreshToken: {
    secret: string;
    expiresIn: string;
  };
}

const requiredEnvVars = [
  'NODE_ENV',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'REDIS_HOST',
  'REDIS_PORT',
  'RABBITMQ_HOST',
  'RABBITMQ_PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_EXPIRES_IN',
];

class EnvValidator {
  NODE_ENV: string = 'development';
  PORT: number = 3000;
  POSTGRES_HOST: string = '';
  POSTGRES_PORT: number = 5432;
  POSTGRES_USER: string = '';
  POSTGRES_PASSWORD: string = '';
  POSTGRES_DB: string = '';
  REDIS_HOST: string = '';
  REDIS_PORT: number = 6379;
  RABBITMQ_HOST: string = '';
  RABBITMQ_PORT: number = 5672;
  JWT_SECRET: string = '';
  JWT_EXPIRES_IN: string = '1h';
  REFRESH_TOKEN_SECRET: string = '';
  REFRESH_TOKEN_EXPIRES_IN: string = '7d';
}

export const validateEnv = (): void => {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
};

export const getConfig = (): AppConfig => {
  validateEnv();

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    postgres: {
      host: process.env.POSTGRES_HOST!,
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      user: process.env.POSTGRES_USER!,
      password: process.env.POSTGRES_PASSWORD!,
      database: process.env.POSTGRES_DB!,
    },
    redis: {
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    rabbitmq: {
      host: process.env.RABBITMQ_HOST!,
      port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
    refreshToken: {
      secret: process.env.REFRESH_TOKEN_SECRET!,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    },
  };
};