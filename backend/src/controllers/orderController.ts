import { Order, CreateOrderInput, UpdateOrderInput } from '../models/Order';
import { query } from '../db/index';

export const getAllOrders = async (page?: number, limit?: number): Promise<Order[]> => {
  const offset = page && limit ? (page - 1) * limit : undefined;
  const queryText = limit
    ? `SELECT id, plant_id as "plantId", distribution_center_id as "distributionCenterId", status, quantity, delivery_date as "deliveryDate", created_at as "createdAt", updated_at as "updatedAt" FROM orders ORDER BY id LIMIT $1 OFFSET $2`
    : `SELECT id, plant_id as "plantId", distribution_center_id as "distributionCenterId", status, quantity, delivery_date as "deliveryDate", created_at as "createdAt", updated_at as "updatedAt" FROM orders ORDER BY id`;
  
  const params = limit ? [limit, offset] : [];
  const result = await query(queryText, params);
  return result.rows as Order[];
};

export const getOrderById = async (id: number): Promise<Order | null> => {
  const result = await query(
    `SELECT id, plant_id as "plantId", distribution_center_id as "distributionCenterId", status, quantity, delivery_date as "deliveryDate", created_at as "createdAt", updated_at as "updatedAt" FROM orders WHERE id = $1`,
    [id]
  );
  return result.rows[0] as Order | null;
};

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const status = input.status || 'pending';
  const result = await query(
    `INSERT INTO orders (plant_id, distribution_center_id, status, quantity, delivery_date) VALUES ($1, $2, $3, $4, $5) RETURNING id, plant_id as "plantId", distribution_center_id as "distributionCenterId", status, quantity, delivery_date as "deliveryDate", created_at as "createdAt", updated_at as "updatedAt"`,
    [input.plantId, input.distributionCenterId, status, input.quantity, input.deliveryDate || null]
  );
  return result.rows[0] as Order;
};

export const updateOrder = async (id: number, input: UpdateOrderInput): Promise<Order | null> => {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.plantId !== undefined) {
    updates.push(`plant_id = $${paramIndex++}`);
    values.push(input.plantId);
  }
  if (input.distributionCenterId !== undefined) {
    updates.push(`distribution_center_id = $${paramIndex++}`);
    values.push(input.distributionCenterId);
  }
  if (input.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(input.status);
  }
  if (input.quantity !== undefined) {
    updates.push(`quantity = $${paramIndex++}`);
    values.push(input.quantity);
  }
  if (input.deliveryDate !== undefined) {
    updates.push(`delivery_date = $${paramIndex++}`);
    values.push(input.deliveryDate);
  }

  if (updates.length === 0) {
    return getOrderById(id);
  }

  values.push(id);
  const result = await query(
    `UPDATE orders SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING id, plant_id as "plantId", distribution_center_id as "distributionCenterId", status, quantity, delivery_date as "deliveryDate", created_at as "createdAt", updated_at as "updatedAt"`,
    values
  );
  return result.rows[0] as Order | null;
};

export const deleteOrder = async (id: number): Promise<boolean> => {
  const result = await query('DELETE FROM orders WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
};

export const getOrdersByPlantId = async (plantId: number): Promise<Order[]> => {
  const result = await query(
    `SELECT id, plant_id as "plantId", distribution_center_id as "distributionCenterId", status, quantity, delivery_date as "deliveryDate", created_at as "createdAt", updated_at as "updatedAt" FROM orders WHERE plant_id = $1 ORDER BY id`,
    [plantId]
  );
  return result.rows as Order[];
};

export const getOrdersByDistributionCenterId = async (distributionCenterId: number): Promise<Order[]> => {
  const result = await query(
    `SELECT id, plant_id as "plantId", distribution_center_id as "distributionCenterId", status, quantity, delivery_date as "deliveryDate", created_at as "createdAt", updated_at as "updatedAt" FROM orders WHERE distribution_center_id = $1 ORDER BY id`,
    [distributionCenterId]
  );
  return result.rows as Order[];
};

export const getOrdersByStatus = async (status: string): Promise<Order[]> => {
  const result = await query(
    `SELECT id, plant_id as "plantId", distribution_center_id as "distributionCenterId", status, quantity, delivery_date as "deliveryDate", created_at as "createdAt", updated_at as "updatedAt" FROM orders WHERE status = $1 ORDER BY id`,
    [status]
  );
  return result.rows as Order[];
};