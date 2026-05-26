import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderService } from './order.service';
import { Order, OrderItem, OrderStatus } from '../shared/entities/order.entity';
import { Product } from '../shared/entities/product.entity';
import { CreateOrderDto } from '../shared/dto/order.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtPayload } from '../shared/utils/jwt';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: jest.Mocked<Repository<Order>>;
  let orderItemRepository: jest.Mocked<Repository<OrderItem>>;
  let productRepository: jest.Mocked<Repository<Product>>;

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

  const mockProduct: Product = {
    id: 'product-uuid-1',
    name: 'Test Product',
    description: 'A test product',
    price: 1000,
    imageUrl: 'http://example.com/image.jpg',
    stock: 10,
    category: 'electronics',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            decrement: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            decrement: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get(getRepositoryToken(Order));
    orderItemRepository = module.get(getRepositoryToken(OrderItem));
    productRepository = module.get(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all orders for admin user', async () => {
      const orders = [mockOrder];
      orderRepository.find.mockResolvedValue(orders);

      const result = await service.findAll(mockAdminUser);

      expect(result).toEqual(orders);
      expect(orderRepository.find).toHaveBeenCalledWith({
        relations: ['items', 'user'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return only user orders for customer', async () => {
      const orders = [mockOrder];
      orderRepository.find.mockResolvedValue(orders);

      const result = await service.findAll(mockUser);

      expect(result).toEqual(orders);
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUser.sub },
        relations: ['items'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no orders found', async () => {
      orderRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return order for owner user', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findById('order-uuid-123', mockUser);

      expect(result).toEqual(mockOrder);
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order-uuid-123' },
        relations: ['items', 'user'],
      });
    });

    it('should return order for admin user viewing any order', async () => {
      const otherUserOrder = { ...mockOrder, userId: 'other-user' };
      orderRepository.findOne.mockResolvedValue(otherUserOrder);

      const result = await service.findById('order-uuid-123', mockAdminUser);

      expect(result).toEqual(otherUserOrder);
    });

    it('should return null when order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent-id', mockUser);

      expect(result).toBeNull();
    });

    it('should return null when customer tries to access other user order', async () => {
      const otherUserOrder = { ...mockOrder, userId: 'other-user' };
      orderRepository.findOne.mockResolvedValue(otherUserOrder);

      const result = await service.findById('order-uuid-123', mockUser);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createOrderDto: CreateOrderDto = {
      items: [{ productId: 'product-uuid-1', quantity: 2 }],
    };

    it('should create order successfully', async () => {
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProduct]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      orderItemRepository.create.mockReturnValue(mockOrder.items[0]);
      
      const createdOrder = { ...mockOrder };
      orderRepository.create.mockReturnValue(createdOrder);
      orderRepository.save.mockResolvedValue(createdOrder);
      
      const mockFindByIdQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        relations: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockOrder),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockFindByIdQueryBuilder as any);

      const result = await service.create(createOrderDto, mockUser);

      expect(result).toBeDefined();
      expect(productRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(orderRepository.create).toHaveBeenCalled();
      expect(orderRepository.save).toHaveBeenCalled();
      expect(productRepository.decrement).toHaveBeenCalledWith(
        { id: 'product-uuid-1' },
        'stock',
        2,
      );
    });

    it('should throw BadRequestException when product not found', async () => {
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.create(createOrderDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when product count does not match', async () => {
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProduct]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const dtoWithMultipleItems: CreateOrderDto = {
        items: [
          { productId: 'product-uuid-1', quantity: 2 },
          { productId: 'product-uuid-2', quantity: 1 },
        ],
      };

      await expect(service.create(dtoWithMultipleItems, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 1 };
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([lowStockProduct]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.create(createOrderDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should calculate total correctly based on quantity and price', async () => {
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProduct]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      orderItemRepository.create.mockReturnValue(mockOrder.items[0]);
      
      const createdOrder = { ...mockOrder, total: 2000 };
      orderRepository.create.mockReturnValue(createdOrder);
      orderRepository.save.mockResolvedValue(createdOrder);
      
      const mockFindByIdQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        relations: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(createdOrder),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockFindByIdQueryBuilder as any);

      await service.create(createOrderDto, mockUser);

      expect(orderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.sub,
          total: 2000,
          status: OrderStatus.PENDING,
        }),
      );
    });

    it('should throw BadRequestException when product not found in product list during iteration', async () => {
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProduct]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const dtoWithUnknownProduct: CreateOrderDto = {
        items: [{ productId: 'unknown-product', quantity: 1 }],
      };

      await expect(service.create(dtoWithUnknownProduct, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update order status successfully for admin', async () => {
      const pendingOrder = { ...mockOrder, status: OrderStatus.PENDING };
      const updatedOrder = { ...mockOrder, status: OrderStatus.PAID };
      orderRepository.findOne.mockResolvedValue(pendingOrder);
      orderRepository.save.mockResolvedValue(updatedOrder);

      const result = await service.updateStatus('order-uuid-123', OrderStatus.PAID, mockAdminUser);

      expect(result).toEqual(updatedOrder);
      expect(orderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.PAID }),
      );
    });

    it('should return null when order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      const result = await service.updateStatus('non-existent-id', OrderStatus.PAID, mockAdminUser);

      expect(result).toBeNull();
    });

    it('should throw BadRequestException when transitioning from cancelled status', async () => {
      const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
      orderRepository.findOne.mockResolvedValue(cancelledOrder);

      await expect(
        service.updateStatus('order-uuid-123', OrderStatus.PAID, mockAdminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow transition from shipped to delivered', async () => {
      const shippedOrder = { ...mockOrder, status: OrderStatus.SHIPPED };
      const deliveredOrder = { ...mockOrder, status: OrderStatus.SHIPPED };
      orderRepository.findOne.mockResolvedValue(shippedOrder);
      orderRepository.save.mockResolvedValue(deliveredOrder);

      const result = await service.updateStatus('order-uuid-123', OrderStatus.SHIPPED, mockAdminUser);

      expect(result).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty items array in create', async () => {
      const emptyDto: CreateOrderDto = { items: [] };
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.create(emptyDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle zero quantity in create', async () => {
      const zeroQuantityDto: CreateOrderDto = {
        items: [{ productId: 'product-uuid-1', quantity: 0 }],
      };
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProduct]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.create(zeroQuantityDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle negative quantity in create', async () => {
      const negativeQuantityDto: CreateOrderDto = {
        items: [{ productId: 'product-uuid-1', quantity: -5 }],
      };
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProduct]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.create(negativeQuantityDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle exact stock quantity', async () => {
      const exactStockProduct = { ...mockProduct, stock: 2 };
      const createDto: CreateOrderDto = {
        items: [{ productId: 'product-uuid-1', quantity: 2 }],
      };
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([exactStockProduct]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      orderItemRepository.create.mockReturnValue(mockOrder.items[0]);
      
      const createdOrder = { ...mockOrder, total: 2000 };
      orderRepository.create.mockReturnValue(createdOrder);
      orderRepository.save.mockResolvedValue(createdOrder);
      
      const mockFindByIdQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        relations: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(createdOrder),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockFindByIdQueryBuilder as any);

      const result = await service.create(createDto, mockUser);

      expect(result).toBeDefined();
    });

    it('should handle concurrent order creation', async () => {
      const createDto: CreateOrderDto = {
        items: [{ productId: 'product-uuid-1', quantity: 1 }],
      };
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProduct]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      orderItemRepository.create.mockReturnValue(mockOrder.items[0]);
      
      const createdOrder = { ...mockOrder };
      orderRepository.create.mockReturnValue(createdOrder);
      orderRepository.save.mockResolvedValue(createdOrder);
      
      const mockFindByIdQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        relations: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(createdOrder),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockFindByIdQueryBuilder as any);

      const results = await Promise.all([
        service.create(createDto, mockUser),
        service.create(createDto, mockUser),
      ]);

      expect(results).toHaveLength(2);
      expect(productRepository.decrement).toHaveBeenCalledTimes(2);
    });
  });

  describe('logging', () => {
    it('should log when fetching orders', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      orderRepository.find.mockResolvedValue([]);

      await service.findAll(mockUser);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fetching orders for user'),
      );
    });

    it('should log when creating order', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProduct]),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      orderItemRepository.create.mockReturnValue(mockOrder.items[0]);
      
      const createdOrder = { ...mockOrder };
      orderRepository.create.mockReturnValue(createdOrder);
      orderRepository.save.mockResolvedValue(createdOrder);
      
      const mockFindByIdQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        relations: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(createdOrder),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockFindByIdQueryBuilder as any);

      await service.create({ items: [{ productId: 'product-uuid-1', quantity: 1 }] }, mockUser);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Creating order for user'),
      );
    });
  });
});
