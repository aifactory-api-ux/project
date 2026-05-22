import { Plant, CreatePlantInput, UpdatePlantInput } from '../models/Plant';
import { query } from '../db/index';

export const getAllPlants = async (page?: number, limit?: number): Promise<Plant[]> => {
  const offset = page && limit ? (page - 1) * limit : undefined;
  const queryText = limit
    ? 'SELECT id, name, location, manager_name as "managerName", created_at as "createdAt", updated_at as "updatedAt" FROM plants ORDER BY id LIMIT $1 OFFSET $2'
    : 'SELECT id, name, location, manager_name as "managerName", created_at as "createdAt", updated_at as "updatedAt" FROM plants ORDER BY id';
  
  const params = limit ? [limit, offset] : [];
  const result = await query(queryText, params);
  return result.rows as Plant[];
};

export const getPlantById = async (id: number): Promise<Plant | null> => {
  const result = await query(
    'SELECT id, name, location, manager_name as "managerName", created_at as "createdAt", updated_at as "updatedAt" FROM plants WHERE id = $1',
    [id]
  );
  return result.rows[0] as Plant | null;
};

export const createPlant = async (input: CreatePlantInput): Promise<Plant> => {
  const result = await query(
    'INSERT INTO plants (name, location, manager_name) VALUES ($1, $2, $3) RETURNING id, name, location, manager_name as "managerName", created_at as "createdAt", updated_at as "updatedAt"',
    [input.name, input.location, input.managerName]
  );
  return result.rows[0] as Plant;
};

export const updatePlant = async (id: number, input: UpdatePlantInput): Promise<Plant | null> => {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.location !== undefined) {
    updates.push(`location = $${paramIndex++}`);
    values.push(input.location);
  }
  if (input.managerName !== undefined) {
    updates.push(`manager_name = $${paramIndex++}`);
    values.push(input.managerName);
  }

  if (updates.length === 0) {
    return getPlantById(id);
  }

  values.push(id);
  const result = await query(
    `UPDATE plants SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING id, name, location, manager_name as "managerName", created_at as "createdAt", updated_at as "updatedAt"`,
    values
  );
  return result.rows[0] as Plant | null;
};

export const deletePlant = async (id: number): Promise<boolean> => {
  const result = await query('DELETE FROM plants WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
};