import { Controller, Get, Post, Put, Body, Param, Headers, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../shared/dto/order.dto';
import { Order } from '../shared/entities/order.entity';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../shared/entities/user.entity';

@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getOrders(@Request() req): Promise<Order[]> {
    return this.orderService.findAll(req.user);
  }

  @Get(':id')
  async getOrderById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<Order> {
    const order = await this.orderService.findById(id, req.user);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req,
  ): Promise<Order> {
    return this.orderService.create(createOrderDto, req.user);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @Request() req,
  ): Promise<Order> {
    const order = await this.orderService.updateStatus(id, updateStatusDto.status, req.user);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }
}

@Controller('health')
export class HealthController {
  @Get()
  healthCheck(): { status: string; service: string; version: string } {
    return {
      status: 'ok',
      service: 'order-service',
      version: '1.0.0',
    };
  }
}