import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface ProductDispatchCreate {
  productId: string;
  quantity: number;
  unit: string;
}

export interface DispatchCreate {
  plantId: string;
  distributionCenterId: string;
  scheduledDate: string;
  vehicleId: string;
  driverId: string;
  products: ProductDispatchCreate[];
}

export interface Dispatch {
  id: string;
  plantId: string;
  distributionCenterId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  scheduledDate: string;
  actualDeliveryDate: string | null;
  vehicleId: string;
  driverId: string;
  products: ProductDispatchCreate[];
}

interface UseCreateDispatchReturn {
  createDispatch: (data: DispatchCreate) => Promise<Dispatch>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useCreateDispatch(): UseCreateDispatchReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const createDispatch = useCallback(async (data: DispatchCreate): Promise<Dispatch> => {
    setLoading(true);
    setError(null);

    try {
      const newDispatch = await apiFetch<Dispatch>('/api/dispatch', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return newDispatch;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create dispatch';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createDispatch,
    loading,
    error,
    reset,
  };
}