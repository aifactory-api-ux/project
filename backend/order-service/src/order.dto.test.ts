import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateOrderDto, UpdateOrderStatusDto } from '../shared/dto/order.dto';
import { OrderStatus } from '../shared/entities/order.entity';

describe('Order DTOs', () => {
  describe('CreateOrderDto', () => {
    it('should validate valid DTO', async () => {
      const dto = plainToClass(CreateOrderDto, {
        items: [{ productId: 'prod-123', quantity: 2 }],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate DTO with multiple items', async () => {
      const dto = plainToClass(CreateOrderDto, {
        items: [
          { productId: 'prod-123', quantity: 2 },
          { productId: 'prod-456', quantity: 1 },
          { productId: 'prod-789', quantity: 5 },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject DTO without items', async () => {
      const dto = plainToClass(CreateOrderDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject DTO with empty items array', async () => {
      const dto = plainToClass(CreateOrderDto, {
        items: [],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject DTO with invalid quantity', async () => {
      const dto = plainToClass(CreateOrderDto, {
        items: [{ productId: 'prod-123', quantity: -1 }],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject DTO with zero quantity', async () => {
      const dto = plainToClass(CreateOrderDto, {
        items: [{ productId: 'prod-123', quantity: 0 }],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject DTO with missing productId', async () => {
      const dto = plainToClass(CreateOrderDto, {
        items: [{ quantity: 2 }],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateOrderStatusDto', () => {
    it('should validate valid status (pending)', async () => {
      const dto = plainToClass(UpdateOrderStatusDto, {
        status: OrderStatus.PENDING,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate valid status (paid)', async () => {
      const dto = plainToClass(UpdateOrderStatusDto, {
        status: OrderStatus.PAID,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate valid status (shipped)', async () => {
      const dto = plainToClass(UpdateOrderStatusDto, {
        status: OrderStatus.SHIPPED,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate valid status (cancelled)', async () => {
      const dto = plainToClass(UpdateOrderStatusDto, {
        status: OrderStatus.CANCELLED,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid status value', async () => {
      const dto = plainToClass(UpdateOrderStatusDto, {
        status: 'invalid-status',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing status', async () => {
      const dto = plainToClass(UpdateOrderStatusDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject null status', async () => {
      const dto = plainToClass(UpdateOrderStatusDto, {
        status: null,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty string status', async () => {
      const dto = plainToClass(UpdateOrderStatusDto, {
        status: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
