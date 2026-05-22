import { query } from '../db/index';
import { Cart, CartItem } from '../types/cart';
import { Product } from '../types/product';

interface CartRow {
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CartItemRow {
  productId: number;
  quantity: number;
}

interface ProductRow {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function findByUserId(userId: number): Promise<Cart | null> {
  const cartResult = await query<CartRow>(
    'SELECT id, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt" FROM carts WHERE user_id = $1',
    [userId]
  );

  if (cartResult.rowCount === 0) {
    return null;
  }

  const cart = cartResult.rows[0];
  const items = await getCartItems(cart.id);

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  };
}

export async function findById(cartId: number): Promise<Cart | null> {
  const cartResult = await query<CartRow>(
    'SELECT id, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt" FROM carts WHERE id = $1',
    [cartId]
  );

  if (cartResult.rowCount === 0) {
    return null;
  }

  const cart = cartResult.rows[0];
  const items = await getCartItems(cart.id);

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  };
}

export async function createForUser(userId: number): Promise<Cart> {
  const result = await query<CartRow>(
    `INSERT INTO carts (user_id, created_at, updated_at)
     VALUES ($1, NOW(), NOW())
     RETURNING id, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"`,
    [userId]
  );

  const cart = result.rows[0];
  return {
    id: cart.id,
    userId: cart.userId,
    items: [],
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  };
}

export async function getOrCreateForUser(userId: number): Promise<Cart> {
  const existing = await findByUserId(userId);
  if (existing) {
    return existing;
  }
  return createForUser(userId);
}

async function getCartItems(cartId: number): Promise<CartItem[]> {
  const itemsResult = await query<CartItemRow>(
    'SELECT product_id as "productId", quantity FROM cart_items WHERE cart_id = $1',
    [cartId]
  );
  return itemsResult.rows;
}

export async function addItem(cartId: number, productId: number, quantity: number): Promise<Cart> {
  const existingItem = await query<CartItemRow>(
    'SELECT product_id as "productId", quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cartId, productId]
  );

  if (existingItem.rowCount && existingItem.rowCount > 0) {
    await query(
      'UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3',
      [quantity, cartId, productId]
    );
  } else {
    await query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
      [cartId, productId, quantity]
    );
  }

  await query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);
  return (await findById(cartId))!;
}

export async function updateItem(cartId: number, productId: number, quantity: number): Promise<Cart> {
  const result = await query(
    'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
    [quantity, cartId, productId]
  );

  if (result.rowCount === 0) {
    throw new Error('Cart item not found');
  }

  await query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);
  return (await findById(cartId))!;
}

export async function removeItem(cartId: number, productId: number): Promise<Cart> {
  const result = await query(
    'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cartId, productId]
  );

  if (result.rowCount === 0) {
    throw new Error('Cart item not found');
  }

  await query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);
  return (await findById(cartId))!;
}

export async function clearCart(cartId: number): Promise<void> {
  await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  await query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);
}

export async function productExists(productId: number): Promise<boolean> {
  const result = await query<ProductRow>(
    'SELECT id FROM products WHERE id = $1',
    [productId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getProductStock(productId: number): Promise<number> {
  const result = await query<{ stock: number }>(
    'SELECT stock FROM products WHERE id = $1',
    [productId]
  );
  if (result.rowCount === 0) {
    return 0;
  }
  return result.rows[0].stock;
}