import { ConfigModule } from '@nestjs/config';

export const redisConfig = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});

export const getRedisConfig = () => ({
  host: process.env.DISPATCH_REDIS_HOST,
  port: parseInt(process.env.DISPATCH_REDIS_PORT, 10),
});