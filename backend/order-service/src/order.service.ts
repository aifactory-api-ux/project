import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem, OrderStatus } from '../shared/entities/order.entity';
import { Product } from '../shared/entities/product.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from '../shared/dto/order.dto';
import { JwtPayload } from '../shared/utils/jwt';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(user: JwtPayload): Promise<Order[]> {
    this.logger.log(`Fetching orders for user: ${user.sub}, role: ${user.role}`);

    if (user.role === 'admin') {
      return this.orderRepository.find({
        relations: ['items', 'user'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.orderRepository.find({
      where: { userId: user.sub },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, user: JwtPayload): Promise<Order | null> {
    this.logger.log(`Fetching order ${id} for user: ${user.sub}, role: ${user.role}`);

    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'user'],
    });

    if (!order) {
      return null;
    }

    if (user.role !== 'admin' && order.userId !== user.sub) {
      return null;
    }

    return order;
  }

  async create(dto: CreateOrderDto, user: JwtPayload): Promise<Order> {
    this.logger.log(`Creating order for user: ${user.sub}`);

    const productIds = dto.items.map((item) => item.productId);
    const products = await this.productRepository
      .createQueryBuilder('product')
      .whereInIds(productIds)
      .getMany();

    if (products.length !== dto.items.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(`Products not found: ${missingIds.join(', ')}`);
    }

    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}: available ${product.stock}, requested ${item.quantity}`,
        );
      }
      const itemPrice = product.price * item.quantity;
      total += itemPrice;

      const orderItem = this.orderItemRepository.create({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
      orderItems.push(orderItem);
    }

    const order = this.orderRepository.create({
      userId: user.sub,
      total,
      status: OrderStatus.PENDING,
      items: orderItems,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const item of dto.items) {
      await this.productRepository.decrement({ id: item.productId }, 'stock', item.quantity);
    }

    this.logger.log(`Order created: ${savedOrder.id}, total: ${total}`);

    return this.findById(savedOrder.id, user) as Promise<Order>;
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    user: JwtPayload,
  ): Promise<Order | null> {
    this.logger.log(`Updating order ${id} status to ${status} by admin ${user.sub}`);

    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      return null;
    }

    const previousStatus = order.status;
    order.status = status;
    await this.orderRepository.save(order);

    this.logger.log(`Order ${id} status updated from ${previousStatus} to ${status}`);

    return this.findById(id, user);
  }
}