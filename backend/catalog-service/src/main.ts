import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 23003;
  await app.listen(port);
  console.log(`Catalog service running on port ${port}`);
}

bootstrap();