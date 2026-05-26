import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController, HealthController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderItem } from '../shared/entities/order.entity';
import { Product } from '../shared/entities/product.entity';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product])],
  controllers: [OrderController, HealthController],
  providers: [OrderService, JwtAuthGuard, RolesGuard],
  exports: [OrderService],
})
export class OrderModule {}