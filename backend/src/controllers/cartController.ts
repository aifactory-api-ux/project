import { Cart, CartItem, AddCartItemInput, UpdateCartItemInput } from '../types/cart';
import * as cartModel from '../models/cart';

export async function getCart(userId: number): Promise<Cart> {
  return cartModel.getOrCreateForUser(userId);
}

export async function addItemToCart(userId: number, input: AddCartItemInput): Promise<Cart> {
  validateAddItemInput(input);

  const exists = await cartModel.productExists(input.productId);
  if (!exists) {
    throw new Error('Product not found');
  }

  const stock = await cartModel.getProductStock(input.productId);
  if (stock < input.quantity) {
    throw new Error('Not enough stock available');
  }

  const cart = await cartModel.getOrCreateForUser(userId);
  return cartModel.addItem(cart.id, input.productId, input.quantity);
}

export async function updateCartItem(userId: number, productId: number, input: UpdateCartItemInput): Promise<Cart> {
  validateUpdateItemInput(input);

  const exists = await cartModel.productExists(productId);
  if (!exists) {
    throw new Error('Product not found');
  }

  const stock = await cartModel.getProductStock(productId);
  if (stock < input.quantity) {
    throw new Error('Not enough stock available');
  }

  const cart = await cartModel.getOrCreateForUser(userId);
  try {
    return await cartModel.updateItem(cart.id, productId, input.quantity);
  } catch (error) {
    if (error instanceof Error && error.message === 'Cart item not found') {
      throw new Error('Cart item not found');
    }
    throw error;
  }
}

export async function removeCartItem(userId: number, productId: number): Promise<void> {
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error('Product ID must be a positive integer');
  }

  const cart = await cartModel.getOrCreateForUser(userId);
  await cartModel.removeItem(cart.id, productId);
}

function validateAddItemInput(input: AddCartItemInput): void {
  if (!Number.isInteger(input.productId) || input.productId <= 0) {
    throw new Error('Product ID must be a positive integer');
  }
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error('Quantity must be a positive integer');
  }
}

function validateUpdateItemInput(input: UpdateCartItemInput): void {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error('Quantity must be a positive integer');
  }
}