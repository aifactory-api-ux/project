import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  const configService = app.get(ConfigService);
  
  const requiredVars = ['DISPATCH_DB_HOST', 'DISPATCH_DB_PORT', 'DISPATCH_DB_USER', 'DISPATCH_DB_PASSWORD', 'DISPATCH_DB_NAME'];
  for (const varName of requiredVars) {
    if (!configService.get(varName)) {
      throw new Error(`Required environment variable ${varName} is missing`);
    }
  }
  
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });
  
  const port = configService.get<number>('DISPATCH_API_PORT', 23001);
  const host = '0.0.0.0';
  
  await app.listen(port, host);
  
  logger.log(`Dispatch service running on http://${host}:${port}`);
  logger.log(`Health check: http://${host}:${port}/health`);
}

bootstrap();