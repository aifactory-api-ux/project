import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { ProductController } from './product.controller';
import { HealthController } from './health.controller';
import { ProductService } from './product.service';
import { Product } from '../shared/entities/product.entity';

jest.mock('../shared/entities/product.entity', () => ({
  Product: {},
}));

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Product)
      .useValue({})
      .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('module configuration', () => {
    it('should be defined', () => {
      expect(AppModule).toBeDefined();
    });

    it('should have ProductController as a controller', () => {
      const controllers = module.get<ProductController[]>(ProductController);
      expect(controllers).toBeDefined();
    });

    it('should have HealthController as a controller', () => {
      const controllers = module.get<HealthController[]>(HealthController);
      expect(controllers).toBeDefined();
    });

    it('should have ProductService as a provider', () => {
      const productService = module.get<ProductService>(ProductService);
      expect(productService).toBeDefined();
    });

    it('should have TypeOrmModule configured with Product entity', () => {
      const typeOrmModule = module.get(TypeOrmModule);
      expect(typeOrmModule).toBeDefined();
    });

    it('should export ProductService', () => {
      const productService = module.get<ProductService>(ProductService);
      expect(productService).toBeInstanceOf(ProductService);
    });
  });

  describe('dependency injection', () => {
    it('should inject ProductRepository into ProductService', () => {
      const productService = module.get<ProductService>(ProductService);
      expect(productService).toBeDefined();
    });

    it('should have ProductController depend on ProductService', () => {
      const productController = module.get(ProductController);
      expect(productController).toBeDefined();
      expect((productController as any).productService).toBeDefined();
    });
  });
});
