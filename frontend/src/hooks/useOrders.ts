import { useState, useCallback } from 'react';
import { Order, CreateOrderInput } from '../types/order';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:23001';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<Order[] | null>;
  fetchOrderById: (id: number) => Promise<Order | null>;
  createOrder: (data: CreateOrderInput) => Promise<Order | null>;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }, []);

  const fetchOrders = useCallback(async (): Promise<Order[] | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }
      const data: Order[] = await response.json();
      setOrders(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching orders';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const fetchOrderById = useCallback(async (id: number): Promise<Order | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`);
      }
      const data: Order = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching order';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const createOrder = useCallback(async (data: CreateOrderInput): Promise<Order | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
      }
      const newOrder: Order = await response.json();
      setOrders((prev) => [...prev, newOrder]);
      return newOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error creating order';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder,
  };
}