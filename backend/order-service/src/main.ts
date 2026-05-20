import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 23005;
  await app.listen(port);
  console.log(`Order service running on port ${port}`);
}

bootstrap();