import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  Headers,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from '../shared/dto/product.dto';
import { verifyJwt, JwtPayload } from '../shared/utils/jwt';

@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    if (category) {
      return this.productService.findByCategory(category);
    }
    return this.productService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductDto: CreateProductDto,
    @Headers('authorization') authHeader: string,
  ) {
    const payload = this.extractToken(authHeader);
    if (!payload) {
      throw new UnauthorizedException('Invalid or missing authorization header');
    }
    if (payload.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.productService.create(createProductDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Headers('authorization') authHeader: string,
  ) {
    const payload = this.extractToken(authHeader);
    if (!payload) {
      throw new UnauthorizedException('Invalid or missing authorization header');
    }
    if (payload.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    const product = await this.productService.update(id, updateProductDto);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    const payload = this.extractToken(authHeader);
    if (!payload) {
      throw new UnauthorizedException('Invalid or missing authorization header');
    }
    if (payload.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    const deleted = await this.productService.delete(id);
    if (!deleted) {
      throw new NotFoundException('Product not found');
    }
    return { success: true };
  }

  private extractToken(authHeader: string): JwtPayload | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    try {
      return verifyJwt(token);
    } catch {
      return null;
    }
  }
}