import { query } from '../db/index';

export interface KPIS {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  complianceRate: number;
  avgDeliveryTime: number;
  totalQuantity: number;
  avgQuantityPerOrder: number;
}

export interface TrendData {
  month: number;
  year: number;
  delivered: number;
  inTransit: number;
  pending: number;
  cancelled: number;
  total: number;
}

export interface VolumeByPlant {
  plantId: number;
  plantName: string;
  totalOrders: number;
  totalQuantity: number;
  deliveredOrders: number;
  inTransitOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

export const getKPIs = async (fromDate?: string, toDate?: string): Promise<KPIS> => {
  let whereClause = '';
  const params: string[] = [];

  if (fromDate && toDate) {
    whereClause = 'WHERE created_at >= $1 AND created_at <= $2';
    params.push(fromDate, toDate);
  } else if (fromDate) {
    whereClause = 'WHERE created_at >= $1';
    params.push(fromDate);
  } else if (toDate) {
    whereClause = 'WHERE created_at <= $1';
    params.push(toDate);
  }

  const statusResult = await query(
    `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'in_transit') as in_transit,
      COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
      COALESCE(SUM(quantity), 0) as total_quantity
    FROM orders ${whereClause}`,
    params
  );

  const row = statusResult.rows[0];
  const totalOrders = parseInt(row.total) || 0;

  if (totalOrders === 0) {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      inTransitOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      complianceRate: 0,
      avgDeliveryTime: 0,
      totalQuantity: 0,
      avgQuantityPerOrder: 0,
    };
  }

  const deliveredCount = parseInt(row.delivered) || 0;
  const complianceRate = totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;

  let avgDeliveryQuery = `SELECT 
    COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400), 0) as avg_days
    FROM orders ${whereClause} ${whereClause ? 'AND' : 'WHERE'} status = 'delivered'`;
  
  if (fromDate && toDate) {
    avgDeliveryQuery = `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400), 0) as avg_days FROM orders WHERE status = 'delivered' AND created_at >= $1 AND created_at <= $2`;
  } else if (fromDate) {
    avgDeliveryQuery = `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400), 0) as avg_days FROM orders WHERE status = 'delivered' AND created_at >= $1`;
  } else if (toDate) {
    avgDeliveryQuery = `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400), 0) as avg_days FROM orders WHERE status = 'delivered' AND created_at <= $1`;
  }

  const avgResult = await query(avgDeliveryQuery, params);
  const avgDeliveryTime = parseFloat(avgResult.rows[0].avg_days) || 0;

  return {
    totalOrders,
    pendingOrders: parseInt(row.pending) || 0,
    inTransitOrders: parseInt(row.in_transit) || 0,
    deliveredOrders: deliveredCount,
    cancelledOrders: parseInt(row.cancelled) || 0,
    complianceRate: Math.round(complianceRate * 100) / 100,
    avgDeliveryTime: Math.round(avgDeliveryTime * 100) / 100,
    totalQuantity: parseInt(row.total_quantity) || 0,
    avgQuantityPerOrder: Math.round((parseInt(row.total_quantity) || 0) / totalOrders * 100) / 100,
  };
};

export const getTrends = async (fromDate?: string, toDate?: string): Promise<TrendData[]> => {
  let whereClause = '';
  const params: string[] = [];

  if (fromDate && toDate) {
    whereClause = 'WHERE created_at >= $1 AND created_at <= $2';
    params.push(fromDate, toDate);
  } else if (fromDate) {
    whereClause = 'WHERE created_at >= $1';
    params.push(fromDate);
  } else if (toDate) {
    whereClause = 'WHERE created_at <= $1';
    params.push(toDate);
  }

  const result = await query(
    `SELECT 
      EXTRACT(MONTH FROM created_at)::int as month,
      EXTRACT(YEAR FROM created_at)::int as year,
      COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
      COUNT(*) FILTER (WHERE status = 'in_transit') as in_transit,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
      COUNT(*) as total
    FROM orders
    ${whereClause}
    GROUP BY EXTRACT(MONTH FROM created_at), EXTRACT(YEAR FROM created_at)
    ORDER BY year, month`,
    params
  );

  return result.rows.map((row) => ({
    month: parseInt(row.month),
    year: parseInt(row.year),
    delivered: parseInt(row.delivered) || 0,
    inTransit: parseInt(row.in_transit) || 0,
    pending: parseInt(row.pending) || 0,
    cancelled: parseInt(row.cancelled) || 0,
    total: parseInt(row.total) || 0,
  }));
};

export const getVolumeByPlant = async (plantId?: number): Promise<VolumeByPlant[]> => {
  let whereClause = '';
  const params: (number | string)[] = [];

  if (plantId) {
    whereClause = 'WHERE o.plant_id = $1';
    params.push(plantId);
  }

  const result = await query(
    `SELECT 
      p.id as plant_id,
      p.name as plant_name,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(o.quantity), 0) as total_quantity,
      COUNT(o.id) FILTER (WHERE o.status = 'delivered') as delivered_orders,
      COUNT(o.id) FILTER (WHERE o.status = 'in_transit') as in_transit_orders,
      COUNT(o.id) FILTER (WHERE o.status = 'pending') as pending_orders,
      COUNT(o.id) FILTER (WHERE o.status = 'cancelled') as cancelled_orders
    FROM plants p
    LEFT JOIN orders o ON p.id = o.plant_id
    ${whereClause}
    GROUP BY p.id, p.name
    ORDER BY p.id`,
    params
  );

  return result.rows.map((row) => ({
    plantId: parseInt(row.plant_id),
    plantName: row.plant_name,
    totalOrders: parseInt(row.total_orders) || 0,
    totalQuantity: parseInt(row.total_quantity) || 0,
    deliveredOrders: parseInt(row.delivered_orders) || 0,
    inTransitOrders: parseInt(row.in_transit_orders) || 0,
    pendingOrders: parseInt(row.pending_orders) || 0,
    cancelledOrders: parseInt(row.cancelled_orders) || 0,
  }));
};

export const validateDateRange = (fromDate?: string, toDate?: string): void => {
  if (fromDate && isNaN(Date.parse(fromDate))) {
    throw new Error('Invalid fromDate format. Use ISO8601 format.');
  }
  if (toDate && isNaN(Date.parse(toDate))) {
    throw new Error('Invalid toDate format. Use ISO8601 format.');
  }
  if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
    throw new Error('fromDate must be before or equal to toDate');
  }
};