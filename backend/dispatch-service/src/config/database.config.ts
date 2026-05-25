import { ConfigModule } from '@nestjs/config';

export const databaseConfig = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});

export const getDatabaseConfig = () => ({
  host: process.env.DISPATCH_DB_HOST,
  port: parseInt(process.env.DISPATCH_DB_PORT, 10),
  username: process.env.DISPATCH_DB_USER,
  password: process.env.DISPATCH_DB_PASSWORD,
  database: process.env.DISPATCH_DB_NAME,
});