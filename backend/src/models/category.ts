import { query } from '../db/index';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/category';

export async function findAll(): Promise<Category[]> {
  const result = await query<{
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }>('SELECT id, name, description, created_at as "createdAt", updated_at as "updatedAt" FROM categories ORDER BY id');

  return result.rows.map(row => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function findById(id: number): Promise<Category | null> {
  const result = await query<{
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }>('SELECT id, name, description, created_at as "createdAt", updated_at as "updatedAt" FROM categories WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function create(input: CreateCategoryInput): Promise<Category> {
  const result = await query<{
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }>(
    `INSERT INTO categories (name, description, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     RETURNING id, name, description, created_at as "createdAt", updated_at as "updatedAt"`,
    [input.name, input.description]
  );

  const row = result.rows[0];
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function update(id: number, input: UpdateCategoryInput): Promise<Category | null> {
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

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<{
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }>(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, description, created_at as "createdAt", updated_at as "updatedAt"`,
    values
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function remove(id: number): Promise<boolean> {
  const result = await query('DELETE FROM categories WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}