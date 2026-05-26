import { Order, OrderItem, OrderStatus } from '../shared/entities/order.entity';

describe('Order Entity', () => {
  describe('OrderStatus enum', () => {
    it('should have pending status', () => {
      expect(OrderStatus.PENDING).toBe('pending');
    });

    it('should have paid status', () => {
      expect(OrderStatus.PAID).toBe('paid');
    });

    it('should have shipped status', () => {
      expect(OrderStatus.SHIPPED).toBe('shipped');
    });

    it('should have cancelled status', () => {
      expect(OrderStatus.CANCELLED).toBe('cancelled');
    });

    it('should have exactly 4 status values', () => {
      const values = Object.values(OrderStatus);
      expect(values).toHaveLength(4);
    });
  });

  describe('Order entity', () => {
    it('should create order with required fields', () => {
      const order: Order = {
        id: 'test-id',
        userId: 'user-id',
        items: [],
        total: 1000,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: null as any,
      };

      expect(order.id).toBe('test-id');
      expect(order.userId).toBe('user-id');
      expect(order.total).toBe(1000);
      expect(order.status).toBe(OrderStatus.PENDING);
    });

    it('should allow items array', () => {
      const item: OrderItem = {
        id: 'item-1',
        productId: 'prod-1',
        quantity: 2,
        price: 500,
        orderId: 'order-1',
        order: {} as Order,
      };

      const order: Order = {
        id: 'order-1',
        userId: 'user-1',
        items: [item],
        total: 1000,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: null as any,
      };

      expect(order.items).toHaveLength(1);
      expect(order.items[0].productId).toBe('prod-1');
    });

    it('should handle empty items array', () => {
      const order: Order = {
        id: 'order-1',
        userId: 'user-1',
        items: [],
        total: 0,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: null as any,
      };

      expect(order.items).toHaveLength(0);
    });

    it('should handle all status types', () => {
      const statuses = [
        OrderStatus.PENDING,
        OrderStatus.PAID,
        OrderStatus.SHIPPED,
        OrderStatus.CANCELLED,
      ];

      statuses.forEach((status) => {
        const order: Order = {
          id: 'order-1',
          userId: 'user-1',
          items: [],
          total: 1000,
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: null as any,
        };

        expect(order.status).toBe(status);
      });
    });
  });

  describe('OrderItem entity', () => {
    it('should create order item with required fields', () => {
      const item: OrderItem = {
        id: 'item-1',
        productId: 'prod-1',
        quantity: 3,
        price: 1500,
        orderId: 'order-1',
        order: {} as Order,
      };

      expect(item.id).toBe('item-1');
      expect(item.productId).toBe('prod-1');
      expect(item.quantity).toBe(3);
      expect(item.price).toBe(1500);
    });

    it('should link to order', () => {
      const order: Order = {
        id: 'order-1',
        userId: 'user-1',
        items: [],
        total: 1000,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: null as any,
      };

      const item: OrderItem = {
        id: 'item-1',
        productId: 'prod-1',
        quantity: 1,
        price: 1000,
        orderId: order.id,
        order,
      };

      expect(item.order).toBe(order);
    });

    it('should support multiple items per order', () => {
      const order: Order = {
        id: 'order-1',
        userId: 'user-1',
        items: [],
        total: 3000,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: null as any,
      };

      const items: OrderItem[] = [
        { id: 'item-1', productId: 'p1', quantity: 1, price: 1000, orderId: order.id, order },
        { id: 'item-2', productId: 'p2', quantity: 2, price: 500, orderId: order.id, order },
        { id: 'item-3', productId: 'p3', quantity: 1, price: 1000, orderId: order.id, order },
      ];

      order.items = items;

      expect(order.items).toHaveLength(3);
      expect(order.total).toBe(3000);
    });
  });

  describe('Total calculation', () => {
    it('should calculate total from items', () => {
      const order: Order = {
        id: 'order-1',
        userId: 'user-1',
        items: [
          { id: 'i1', productId: 'p1', quantity: 2, price: 1000, orderId: 'o1', order: {} as Order },
          { id: 'i2', productId: 'p2', quantity: 3, price: 500, orderId: 'o1', order: {} as Order },
        ],
        total: 3500,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: null as any,
      };

      const calculatedTotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      expect(calculatedTotal).toBe(3500);
      expect(order.total).toBe(calculatedTotal);
    });

    it('should handle zero total', () => {
      const order: Order = {
        id: 'order-1',
        userId: 'user-1',
        items: [],
        total: 0,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: null as any,
      };

      expect(order.total).toBe(0);
    });

    it('should handle large total values', () => {
      const order: Order = {
        id: 'order-1',
        userId: 'user-1',
        items: [
          { id: 'i1', productId: 'p1', quantity: 999, price: 99999, orderId: 'o1', order: {} as Order },
        ],
        total: 99899001,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: null as any,
      };

      expect(order.total).toBeGreaterThan(0);
    });
  });
});
