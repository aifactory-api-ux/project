import { query } from '../db/index';
import { Product, CreateProductInput, UpdateProductInput } from '../types/product';

export async function findAll(): Promise<Product[]> {
  const result = await query<{
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    stock: number;
    categoryId: number;
    createdAt: Date;
    updatedAt: Date;
  }>('SELECT id, name, description, price, image_url as "imageUrl", stock, category_id as "categoryId", created_at as "createdAt", updated_at as "updatedAt" FROM products ORDER BY id');

  return result.rows.map(row => ({
    ...row,
    price: parseFloat(String(row.price)),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function findById(id: number): Promise<Product | null> {
  const result = await query<{
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    stock: number;
    categoryId: number;
    createdAt: Date;
    updatedAt: Date;
  }>('SELECT id, name, description, price, image_url as "imageUrl", stock, category_id as "categoryId", created_at as "createdAt", updated_at as "updatedAt" FROM products WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    price: parseFloat(String(row.price)),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function create(input: CreateProductInput): Promise<Product> {
  const result = await query<{
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    stock: number;
    categoryId: number;
    createdAt: Date;
    updatedAt: Date;
  }>(
    `INSERT INTO products (name, description, price, image_url, stock, category_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id, name, description, price, image_url as "imageUrl", stock, category_id as "categoryId", created_at as "createdAt", updated_at as "updatedAt"`,
    [input.name, input.description, input.price, input.imageUrl, input.stock, input.categoryId]
  );

  const row = result.rows[0];
  return {
    ...row,
    price: parseFloat(String(row.price)),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function update(id: number, input: UpdateProductInput): Promise<Product | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(input.description);
  }
  if (input.price !== undefined) {
    fields.push(`price = $${paramIndex++}`);
    values.push(input.price);
  }
  if (input.imageUrl !== undefined) {
    fields.push(`image_url = $${paramIndex++}`);
    values.push(input.imageUrl);
  }
  if (input.stock !== undefined) {
    fields.push(`stock = $${paramIndex++}`);
    values.push(input.stock);
  }
  if (input.categoryId !== undefined) {
    fields.push(`category_id = $${paramIndex++}`);
    values.push(input.categoryId);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<{
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    stock: number;
    categoryId: number;
    createdAt: Date;
    updatedAt: Date;
  }>(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, description, price, image_url as "imageUrl", stock, category_id as "categoryId", created_at as "createdAt", updated_at as "updatedAt"`,
    values
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    price: parseFloat(String(row.price)),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function remove(id: number): Promise<boolean> {
  const result = await query('DELETE FROM products WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}