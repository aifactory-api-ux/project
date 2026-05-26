import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductService } from './product.service';
import { Product } from '../shared/entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../shared/dto/product.dto';

describe('ProductService', () => {
  let service: ProductService;
  let repository: jest.Mocked<Repository<Product>>;

  const mockProduct: Product = {
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

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get(getRepositoryToken(Product));

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of products ordered by createdAt DESC', async () => {
      const products = [mockProduct];
      mockRepository.find.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no products exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findByCategory', () => {
    it('should return products filtered by category', async () => {
      const products = [mockProduct];
      mockRepository.find.mockResolvedValue(products);

      const result = await service.findByCategory('electronics');

      expect(result).toEqual(products);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { category: 'electronics' },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no products match category', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByCategory('clothing');

      expect(result).toEqual([]);
    });

    it('should handle special characters in category name', async () => {
      const products = [mockProduct];
      mockRepository.find.mockResolvedValue(products);

      const result = await service.findByCategory('electronics/gadgets');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { category: 'electronics/gadgets' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(mockProduct.id);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
    });

    it('should return null when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });

    it('should call findOne with correct id parameter', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      await service.findOne('test-id-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
      });
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

    it('should create and return a new product', async () => {
      const newProduct = { ...mockProduct, ...createDto };
      mockRepository.create.mockReturnValue(newProduct as Product);
      mockRepository.save.mockResolvedValue(newProduct as Product);

      const result = await service.create(createDto);

      expect(result).toEqual(newProduct);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        description: createDto.description,
        price: createDto.price,
        imageUrl: createDto.imageUrl,
        stock: createDto.stock,
        category: createDto.category,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(newProduct);
    });

    it('should call repository create and save with correct data', async () => {
      mockRepository.create.mockReturnValue(mockProduct as Product);
      mockRepository.save.mockResolvedValue(mockProduct as Product);

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Product Name',
      price: 3999,
    };

    it('should update and return the product when found', async () => {
      const updatedProduct = { ...mockProduct, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockProduct as Product);
      mockRepository.save.mockResolvedValue(updatedProduct as Product);

      const result = await service.update(mockProduct.id, updateDto);

      expect(result).toEqual(updatedProduct);
    });

    it('should return null when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update('non-existent-id', updateDto);

      expect(result).toBeNull();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const partialUpdate: UpdateProductDto = { name: 'Only Name Updated' };
      const updatedProduct = { ...mockProduct, name: 'Only Name Updated' };
      mockRepository.findOne.mockResolvedValue({ ...mockProduct } as Product);
      mockRepository.save.mockResolvedValue(updatedProduct as Product);

      await service.update(mockProduct.id, partialUpdate);

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should update description when provided', async () => {
      const updateWithDescription: UpdateProductDto = {
        description: 'New description',
      };
      mockRepository.findOne.mockResolvedValue({ ...mockProduct } as Product);
      mockRepository.save.mockResolvedValue({ ...mockProduct, description: 'New description' } as Product);

      await service.update(mockProduct.id, updateWithDescription);

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should update stock when provided', async () => {
      const updateWithStock: UpdateProductDto = { stock: 100 };
      mockRepository.findOne.mockResolvedValue({ ...mockProduct } as Product);
      mockRepository.save.mockResolvedValue({ ...mockProduct, stock: 100 } as Product);

      await service.update(mockProduct.id, updateWithStock);

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should update category when provided', async () => {
      const updateWithCategory: UpdateProductDto = { category: 'furniture' };
      mockRepository.findOne.mockResolvedValue({ ...mockProduct } as Product);
      mockRepository.save.mockResolvedValue({ ...mockProduct, category: 'furniture' } as Product);

      await service.update(mockProduct.id, updateWithCategory);

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should update imageUrl when provided', async () => {
      const updateWithImage: UpdateProductDto = {
        imageUrl: 'https://example.com/updated.jpg',
      };
      mockRepository.findOne.mockResolvedValue({ ...mockProduct } as Product);
      mockRepository.save.mockResolvedValue({
        ...mockProduct,
        imageUrl: 'https://example.com/updated.jpg',
      } as Product);

      await service.update(mockProduct.id, updateWithImage);

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should update all fields when all provided', async () => {
      const fullUpdate: UpdateProductDto = {
        name: 'Fully Updated',
        description: 'Completely new description',
        price: 9999,
        imageUrl: 'https://new-image.com/img.jpg',
        stock: 50,
        category: 'toys',
      };
      mockRepository.findOne.mockResolvedValue({ ...mockProduct } as Product);
      mockRepository.save.mockResolvedValue({ ...mockProduct, ...fullUpdate } as Product);

      await service.update(mockProduct.id, fullUpdate);

      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should return true when product is deleted successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct as Product);
      mockRepository.remove.mockResolvedValue(mockProduct as Product);

      const result = await service.delete(mockProduct.id);

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('should return false when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.delete('non-existent-id');

      expect(result).toBe(false);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should not call remove when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await service.delete('non-existent-id');

      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
