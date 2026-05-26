import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { HealthController } from './order.controller';
import { Order, OrderStatus } from '../shared/entities/order.entity';
import { JwtPayload } from '../shared/utils/jwt';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;

  const mockOrder: Order = {
    id: 'order-uuid-123',
    userId: 'user-uuid-456',
    items: [
      {
        id: 'item-uuid-1',
        productId: 'product-uuid-1',
        quantity: 2,
        price: 1000,
        orderId: 'order-uuid-123',
        order: {} as Order,
      },
    ],
    total: 2000,
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: null as any,
  };

  const mockUser: JwtPayload = {
    sub: 'user-uuid-456',
    email: 'user@example.com',
    role: 'customer',
  };

  const mockAdminUser: JwtPayload = {
    sub: 'admin-uuid-789',
    email: 'admin@example.com',
    role: 'admin',
  };

  const mockRequest = (user: JwtPayload) => ({ user });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should return all orders for admin', async () => {
      const orders = [mockOrder];
      orderService.findAll.mockResolvedValue(orders);

      const result = await controller.getOrders(mockRequest(mockAdminUser));

      expect(result).toEqual(orders);
      expect(orderService.findAll).toHaveBeenCalledWith(mockAdminUser);
    });

    it('should return user orders for customer', async () => {
      const orders = [mockOrder];
      orderService.findAll.mockResolvedValue(orders);

      const result = await controller.getOrders(mockRequest(mockUser));

      expect(result).toEqual(orders);
      expect(orderService.findAll).toHaveBeenCalledWith(mockUser);
    });

    it('should return empty array when no orders', async () => {
      orderService.findAll.mockResolvedValue([]);

      const result = await controller.getOrders(mockRequest(mockUser));

      expect(result).toEqual([]);
    });
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      orderService.findById.mockResolvedValue(mockOrder);

      const result = await controller.getOrderById('order-uuid-123', mockRequest(mockUser));

      expect(result).toEqual(mockOrder);
      expect(orderService.findById).toHaveBeenCalledWith('order-uuid-123', mockUser);
    });

    it('should throw NotFoundException when order not found', async () => {
      orderService.findById.mockResolvedValue(null);

      await expect(
        controller.getOrderById('non-existent-id', mockRequest(mockUser)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should pass correct user context for authorization', async () => {
      orderService.findById.mockResolvedValue(mockOrder);

      await controller.getOrderById('order-uuid-123', mockRequest(mockUser));

      expect(orderService.findById).toHaveBeenCalledWith('order-uuid-123', mockUser);
    });
  });

  describe('createOrder', () => {
    const createOrderDto = {
      items: [{ productId: 'product-uuid-1', quantity: 2 }],
    };

    it('should create order successfully', async () => {
      orderService.create.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(createOrderDto, mockRequest(mockUser));

      expect(result).toEqual(mockOrder);
      expect(orderService.create).toHaveBeenCalledWith(createOrderDto, mockUser);
    });

    it('should pass user context to service', async () => {
      orderService.create.mockResolvedValue(mockOrder);

      await controller.createOrder(createOrderDto, mockRequest(mockUser));

      expect(orderService.create).toHaveBeenCalledWith(createOrderDto, mockUser);
    });

    it('should handle order with multiple items', async () => {
      const multiItemOrder = {
        ...mockOrder,
        items: [
          { id: 'item-1', productId: 'p1', quantity: 1, price: 1000, orderId: 'o1', order: {} as Order },
          { id: 'item-2', productId: 'p2', quantity: 3, price: 500, orderId: 'o1', order: {} as Order },
        ],
        total: 2500,
      };
      orderService.create.mockResolvedValue(multiItemOrder);

      const multiItemDto = {
        items: [
          { productId: 'p1', quantity: 1 },
          { productId: 'p2', quantity: 3 },
        ],
      };

      const result = await controller.createOrder(multiItemDto, mockRequest(mockUser));

      expect(result).toEqual(multiItemOrder);
    });
  });

  describe('updateOrderStatus', () => {
    const updateStatusDto = { status: OrderStatus.PAID };

    it('should update order status successfully for admin', async () => {
      const paidOrder = { ...mockOrder, status: OrderStatus.PAID };
      orderService.updateStatus.mockResolvedValue(paidOrder);

      const result = await controller.updateOrderStatus(
        'order-uuid-123',
        updateStatusDto,
        mockRequest(mockAdminUser),
      );

      expect(result).toEqual(paidOrder);
      expect(orderService.updateStatus).toHaveBeenCalledWith(
        'order-uuid-123',
        OrderStatus.PAID,
        mockAdminUser,
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      orderService.updateStatus.mockResolvedValue(null);

      await expect(
        controller.updateOrderStatus('non-existent-id', updateStatusDto, mockRequest(mockAdminUser)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle status transition to shipped', async () => {
      const shippedOrder = { ...mockOrder, status: OrderStatus.SHIPPED };
      orderService.updateStatus.mockResolvedValue(shippedOrder);

      const result = await controller.updateOrderStatus(
        'order-uuid-123',
        { status: OrderStatus.SHIPPED },
        mockRequest(mockAdminUser),
      );

      expect(result).toEqual(shippedOrder);
    });

    it('should handle status transition to cancelled', async () => {
      const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
      orderService.updateStatus.mockResolvedValue(cancelledOrder);

      const result = await controller.updateOrderStatus(
        'order-uuid-123',
        { status: OrderStatus.CANCELLED },
        mockRequest(mockAdminUser),
      );

      expect(result).toEqual(cancelledOrder);
    });
  });

  describe('edge cases', () => {
    it('should handle very long order ID', async () => {
      const longId = 'a'.repeat(100);
      orderService.findById.mockResolvedValue(null);

      await expect(
        controller.getOrderById(longId, mockRequest(mockUser)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle special characters in order ID', async () => {
      const specialId = 'order-uuid-123<script>alert(1)</script>';
      orderService.findById.mockResolvedValue(null);

      await expect(
        controller.getOrderById(specialId, mockRequest(mockUser)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle empty request user', async () => {
      const emptyRequest = { user: undefined } as any;
      orderService.findAll.mockResolvedValue([]);

      await controller.getOrders(emptyRequest);

      expect(orderService.findAll).toHaveBeenCalled();
    });

    it('should handle duplicate order creation requests', async () => {
      orderService.create.mockResolvedValue(mockOrder);
      const createDto = { items: [{ productId: 'p1', quantity: 1 }] };

      const results = await Promise.all([
        controller.createOrder(createDto, mockRequest(mockUser)),
        controller.createOrder(createDto, mockRequest(mockUser)),
      ]);

      expect(results).toHaveLength(2);
    });
  });
});

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('healthCheck', () => {
    it('should return healthy status', () => {
      const result = controller.healthCheck();

      expect(result).toEqual({
        status: 'ok',
        service: 'order-service',
        version: '1.0.0',
      });
    });

    it('should return string status', () => {
      const result = controller.healthCheck();

      expect(typeof result.status).toBe('string');
      expect(result.status).toBe('ok');
    });

    it('should return correct service name', () => {
      const result = controller.healthCheck();

      expect(result.service).toBe('order-service');
    });

    it('should return version number', () => {
      const result = controller.healthCheck();

      expect(result.version).toBe('1.0.0');
    });

    it('should always return same response', () => {
      const result1 = controller.healthCheck();
      const result2 = controller.healthCheck();

      expect(result1).toEqual(result2);
    });
  });
});
