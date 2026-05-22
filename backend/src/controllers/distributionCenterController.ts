import { DistributionCenter, CreateDistributionCenterInput, UpdateDistributionCenterInput } from '../models/DistributionCenter';
import { query } from '../db/index';

export const getAllDistributionCenters = async (page?: number, limit?: number): Promise<DistributionCenter[]> => {
  const offset = page && limit ? (page - 1) * limit : undefined;
  const queryText = limit
    ? 'SELECT id, name, address, region, capacity, created_at as "createdAt", updated_at as "updatedAt" FROM distribution_centers ORDER BY id LIMIT $1 OFFSET $2'
    : 'SELECT id, name, address, region, capacity, created_at as "createdAt", updated_at as "updatedAt" FROM distribution_centers ORDER BY id';
  
  const params = limit ? [limit, offset] : [];
  const result = await query(queryText, params);
  return result.rows as DistributionCenter[];
};

export const getDistributionCenterById = async (id: number): Promise<DistributionCenter | null> => {
  const result = await query(
    'SELECT id, name, address, region, capacity, created_at as "createdAt", updated_at as "updatedAt" FROM distribution_centers WHERE id = $1',
    [id]
  );
  return result.rows[0] as DistributionCenter | null;
};

export const createDistributionCenter = async (input: CreateDistributionCenterInput): Promise<DistributionCenter> => {
  const result = await query(
    'INSERT INTO distribution_centers (name, address, region, capacity) VALUES ($1, $2, $3, $4) RETURNING id, name, address, region, capacity, created_at as "createdAt", updated_at as "updatedAt"',
    [input.name, input.address, input.region, input.capacity]
  );
  return result.rows[0] as DistributionCenter;
};

export const updateDistributionCenter = async (id: number, input: UpdateDistributionCenterInput): Promise<DistributionCenter | null> => {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.address !== undefined) {
    updates.push(`address = $${paramIndex++}`);
    values.push(input.address);
  }
  if (input.region !== undefined) {
    updates.push(`region = $${paramIndex++}`);
    values.push(input.region);
  }
  if (input.capacity !== undefined) {
    updates.push(`capacity = $${paramIndex++}`);
    values.push(input.capacity);
  }

  if (updates.length === 0) {
    return getDistributionCenterById(id);
  }

  values.push(id);
  const result = await query(
    `UPDATE distribution_centers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING id, name, address, region, capacity, created_at as "createdAt", updated_at as "updatedAt"`,
    values
  );
  return result.rows[0] as DistributionCenter | null;
};

export const deleteDistributionCenter = async (id: number): Promise<boolean> => {
  const result = await query('DELETE FROM distribution_centers WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
};