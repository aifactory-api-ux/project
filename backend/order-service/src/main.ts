import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { validateEnv } from '../shared/config/env';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    validateEnv();
  } catch (error) {
    logger.error(`Failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT || 23003;
  await app.listen(port);
  logger.log(`Order service running on port ${port}`);
  logger.log(`Health check: GET /health`);
}

bootstrap();