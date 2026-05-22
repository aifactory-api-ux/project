import { Order, CreateOrderInput } from '../types/order';
import * as orderModel from '../models/order';
import * as cartModel from '../models/cart';

export async function createOrder(userId: number, input: CreateOrderInput): Promise<Order> {
  validateCreateOrderInput(input);

  if (!input.items || input.items.length === 0) {
    throw new Error('Order must have at least one item');
  }

  for (const item of input.items) {
    if (!Number.isInteger(item.productId) || item.productId <= 0) {
      throw new Error('Product ID must be a positive integer');
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error('Quantity must be a positive integer');
    }

    const exists = await cartModel.productExists(item.productId);
    if (!exists) {
      throw new Error(`Product ${item.productId} not found`);
    }
  }

  return orderModel.createOrder(userId, input.items);
}

export async function getOrders(userId: number): Promise<Order[]> {
  return orderModel.findByUserId(userId);
}

export async function getOrderById(userId: number, orderId: number): Promise<Order> {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new Error('Order ID must be a positive integer');
  }

  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.userId !== userId) {
    throw new Error('Order not found');
  }

  return order;
}

function validateCreateOrderInput(input: CreateOrderInput): void {
  if (!input.items) {
    throw new Error('Items are required');
  }
  if (!Array.isArray(input.items)) {
    throw new Error('Items must be an array');
  }
}