import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { HealthController } from './health.controller';
import { ProductService } from './product.service';
import { Product } from '../shared/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController, HealthController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}