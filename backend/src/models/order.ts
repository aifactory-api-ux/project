import { query, transaction } from '../db/index';
import { Order, OrderStatus, CartItem } from '../types/order';
import pg from 'pg';

interface OrderRow {
  id: number;
  userId: number;
  total: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItemRow {
  productId: number;
  quantity: number;
}

interface ProductRow {
  id: number;
  price: string;
  stock: number;
}

export async function createOrder(userId: number, items: CartItem[]): Promise<Order> {
  return transaction(async (client: pg.PoolClient) => {
    const productIds = items.map(item => item.productId);
    const placeholders = productIds.map((_, i) => `$2${i === 0 ? '' : `, $${i + 2}`}`).join(', ');

    const productsResult = await client.query<ProductRow>(
      `SELECT id, price, stock FROM products WHERE id IN (${placeholders})`,
      productIds
    );

    const productMap = new Map<number, { price: string; stock: number }>();
    for (const row of productsResult.rows) {
      productMap.set(row.id, { price: row.price, stock: row.stock });
    }

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for product ${item.productId}`);
      }
    }

    let total = 0;
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      total += parseFloat(product.price) * item.quantity;
    }

    const orderResult = await client.query<OrderRow>(
      `INSERT INTO orders (user_id, total, status, created_at, updated_at)
       VALUES ($1, $2, 'pending', NOW(), NOW())
       RETURNING id, user_id as "userId", total, status, created_at as "createdAt", updated_at as "updatedAt"`,
      [userId, total]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
        [order.id, item.productId, item.quantity]
      );

      const product = productMap.get(item.productId)!;
      await client.query(
        'UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity, item.productId]
      );
    }

    return {
      id: order.id,
      userId: order.userId,
      items,
      total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  });
}

export async function findByUserId(userId: number): Promise<Order[]> {
  const ordersResult = await query<OrderRow>(
    `SELECT id, user_id as "userId", total, status, created_at as "createdAt", updated_at as "updatedAt"
     FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );

  const orders: Order[] = [];
  for (const row of ordersResult.rows) {
    const items = await getOrderItems(row.id);
    orders.push({
      id: row.id,
      userId: row.userId,
      items,
      total: parseFloat(row.total),
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }

  return orders;
}

export async function findById(orderId: number): Promise<Order | null> {
  const orderResult = await query<OrderRow>(
    `SELECT id, user_id as "userId", total, status, created_at as "createdAt", updated_at as "updatedAt"
     FROM orders WHERE id = $1`,
    [orderId]
  );

  if (orderResult.rowCount === 0) {
    return null;
  }

  const row = orderResult.rows[0];
  const items = await getOrderItems(row.id);

  return {
    id: row.id,
    userId: row.userId,
    items,
    total: parseFloat(row.total),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function getOrderItems(orderId: number): Promise<CartItem[]> {
  const itemsResult = await query<OrderItemRow>(
    'SELECT product_id as "productId", quantity FROM order_items WHERE order_id = $1',
    [orderId]
  );
  return itemsResult.rows;
}