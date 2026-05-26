import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../shared/entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../shared/dto/product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    this.logger.log('Finding all products');
    return this.productRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByCategory(category: string): Promise<Product[]> {
    this.logger.log(`Finding products by category: ${category}`);
    return this.productRepository.find({
      where: { category },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product | null> {
    this.logger.log(`Finding product: ${id}`);
    return this.productRepository.findOne({ where: { id } });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    this.logger.log(`Creating product: ${createProductDto.name}`);

    const product = this.productRepository.create({
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      imageUrl: createProductDto.imageUrl,
      stock: createProductDto.stock,
      category: createProductDto.category,
    });

    const saved = await this.productRepository.save(product);
    this.logger.log(`Product created: ${saved.id}`);
    return saved;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product | null> {
    this.logger.log(`Updating product: ${id}`);

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      return null;
    }

    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }
    if (updateProductDto.description !== undefined) {
      product.description = updateProductDto.description;
    }
    if (updateProductDto.price !== undefined) {
      product.price = updateProductDto.price;
    }
    if (updateProductDto.imageUrl !== undefined) {
      product.imageUrl = updateProductDto.imageUrl;
    }
    if (updateProductDto.stock !== undefined) {
      product.stock = updateProductDto.stock;
    }
    if (updateProductDto.category !== undefined) {
      product.category = updateProductDto.category;
    }

    const updated = await this.productRepository.save(product);
    this.logger.log(`Product updated: ${updated.id}`);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    this.logger.log(`Deleting product: ${id}`);

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      return false;
    }

    await this.productRepository.remove(product);
    this.logger.log(`Product deleted: ${id}`);
    return true;
  }
}