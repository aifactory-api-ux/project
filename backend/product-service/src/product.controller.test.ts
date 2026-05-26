import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from '../shared/dto/product.dto';
import { JwtPayload } from '../shared/utils/jwt';

describe('ProductController', () => {
  let controller: ProductController;
  let service: jest.Mocked<ProductService>;

  const mockProduct: any = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    description: 'A test product description',
    price: 1999,
    imageUrl: 'https://example.com/image.jpg',
    stock: 10,
    category: 'electronics',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockProductService = {
    findAll: jest.fn(),
    findByCategory: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAdminPayload: JwtPayload = {
    userId: 'admin-user-id',
    email: 'admin@example.com',
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 3600000,
  };

  const mockCustomerPayload: JwtPayload = {
    userId: 'customer-user-id',
    email: 'customer@example.com',
    role: 'customer',
    iat: Date.now(),
    exp: Date.now() + 3600000,
  };

  const adminAuthHeader = 'Bearer valid-admin-token';
  const customerAuthHeader = 'Bearer valid-customer-token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get(ProductService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products when no category is provided', async () => {
      const products = [mockProduct];
      mockProductService.findAll.mockResolvedValue(products);

      const result = await controller.findAll();

      expect(result).toEqual(products);
      expect(mockProductService.findAll).toHaveBeenCalled();
      expect(mockProductService.findByCategory).not.toHaveBeenCalled();
    });

    it('should filter products by category when provided', async () => {
      const products = [mockProduct];
      mockProductService.findByCategory.mockResolvedValue(products);

      const result = await controller.findAll('electronics');

      expect(result).toEqual(products);
      expect(mockProductService.findByCategory).toHaveBeenCalledWith('electronics');
    });

    it('should return empty array when no products exist', async () => {
      mockProductService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should return empty array when no products match category', async () => {
      mockProductService.findByCategory.mockResolvedValue([]);

      const result = await controller.findAll('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      mockProductService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(mockProduct.id);

      expect(result).toEqual(mockProduct);
      expect(mockProductService.findOne).toHaveBeenCalledWith(mockProduct.id);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call service with correct id', async () => {
      mockProductService.findOne.mockResolvedValue(mockProduct);

      await controller.findOne('specific-product-id');

      expect(mockProductService.findOne).toHaveBeenCalledWith('specific-product-id');
    });
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'New Product',
      description: 'New product description',
      price: 2999,
      imageUrl: 'https://example.com/new-image.jpg',
      stock: 5,
      category: 'books',
    };

    it('should create a product when admin is authenticated', async () => {
      mockProductService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createDto, adminAuthHeader);

      expect(result).toEqual(mockProduct);
      expect(mockProductService.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw UnauthorizedException when auth header is missing', async () => {
      await expect(controller.create(createDto, '')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.create(createDto, null as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when auth header has no Bearer prefix', async () => {
      await expect(
        controller.create(createDto, 'Basic sometoken'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(
        controller.create(createDto, customerAuthHeader),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      await expect(
        controller.create(createDto, 'Bearer invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Product Name',
      price: 3999,
    };

    it('should update a product when admin is authenticated', async () => {
      const updatedProduct = { ...mockProduct, ...updateDto };
      mockProductService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(mockProduct.id, updateDto, adminAuthHeader);

      expect(result).toEqual(updatedProduct);
      expect(mockProductService.update).toHaveBeenCalledWith(mockProduct.id, updateDto);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductService.update.mockResolvedValue(null);

      await expect(
        controller.update('non-existent-id', updateDto, adminAuthHeader),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when auth header is missing', async () => {
      await expect(
        controller.update(mockProduct.id, updateDto, ''),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(
        controller.update(mockProduct.id, updateDto, customerAuthHeader),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      await expect(
        controller.update(mockProduct.id, updateDto, 'Bearer invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    it('should delete a product when admin is authenticated', async () => {
      mockProductService.delete.mockResolvedValue(true);

      const result = await controller.remove(mockProduct.id, adminAuthHeader);

      expect(result).toEqual({ success: true });
      expect(mockProductService.delete).toHaveBeenCalledWith(mockProduct.id);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductService.delete.mockResolvedValue(false);

      await expect(
        controller.remove('non-existent-id', adminAuthHeader),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when auth header is missing', async () => {
      await expect(controller.remove(mockProduct.id, '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      await expect(
        controller.remove(mockProduct.id, customerAuthHeader),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      await expect(
        controller.remove(mockProduct.id, 'Bearer invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return correct success response structure', async () => {
      mockProductService.delete.mockResolvedValue(true);

      const result = await controller.remove(mockProduct.id, adminAuthHeader);

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });
  });
});
