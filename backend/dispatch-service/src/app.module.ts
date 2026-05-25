import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchEntity } from './modules/dispatch/entities/dispatch.entity';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DISPATCH_DB_HOST'),
        port: configService.get<number>('DISPATCH_DB_PORT', 5432),
        username: configService.get<string>('DISPATCH_DB_USER'),
        password: configService.get<string>('DISPATCH_DB_PASSWORD'),
        database: configService.get<string>('DISPATCH_DB_NAME'),
        entities: [DispatchEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    DispatchModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}