import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<Order>;
  createOrder: (data: { items: Array<{ productId: string; quantity: number }> }) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<Order>;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Order[]>('/api/orders');
      setOrders(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrder = useCallback(async (id: string): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Order>(`/api/orders/${id}`);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch order';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (data: { items: Array<{ productId: string; quantity: number }> }): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<Order>('/api/orders', data);
      setOrders(prev => [...prev, response]);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: Order['status']): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put<Order>(`/api/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o.id === id ? response : o));
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrderStatus,
  };
}