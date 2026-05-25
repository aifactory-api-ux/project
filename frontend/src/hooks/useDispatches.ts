import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface ProductDispatch {
  productId: string;
  quantity: number;
  unit: string;
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
  products: ProductDispatch[];
}

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

interface UseDispatchesFilters {
  status?: string;
  plantId?: string;
  distributionCenterId?: string;
}

interface UseDispatchesReturn {
  dispatches: Dispatch[];
  loading: boolean;
  error: string | null;
  createDispatch: (data: DispatchCreate) => Promise<void>;
  updateDispatchStatus: (
    id: string,
    status: 'pending' | 'in_transit' | 'delivered' | 'cancelled',
    actualDeliveryDate?: string
  ) => Promise<void>;
  deleteDispatch: (id: string) => Promise<void>;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

export function useDispatches(filters?: UseDispatchesFilters): UseDispatchesReturn {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQueryString = useCallback((f: UseDispatchesFilters) => {
    const params = new URLSearchParams();
    if (f.status) params.append('status', f.status);
    if (f.plantId) params.append('plantId', f.plantId);
    if (f.distributionCenterId) params.append('distributionCenterId', f.distributionCenterId);
    const query = params.toString();
    return query ? `?${query}` : '';
  }, []);

  const fetchDispatches = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const queryString = buildQueryString(filters || {});
      const data = await apiFetch<Dispatch[]>(`/api/dispatch${queryString}`);
      setDispatches(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dispatches';
      setError(message);
      setDispatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildQueryString, filters]);

  const refresh = useCallback(async () => {
    await fetchDispatches(true);
  }, [fetchDispatches]);

  const createDispatch = useCallback(async (data: DispatchCreate) => {
    setError(null);
    try {
      const newDispatch = await apiFetch<Dispatch>('/api/dispatch', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setDispatches((prev) => [newDispatch, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create dispatch';
      setError(message);
      throw err;
    }
  }, []);

  const updateDispatchStatus = useCallback(
    async (
      id: string,
      status: 'pending' | 'in_transit' | 'delivered' | 'cancelled',
      actualDeliveryDate?: string
    ) => {
      setError(null);
      try {
        const body: { status: string; actualDeliveryDate?: string } = { status };
        if (actualDeliveryDate) {
          body.actualDeliveryDate = actualDeliveryDate;
        }
        const updated = await apiFetch<Dispatch>(`/api/dispatch/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        setDispatches((prev) =>
          prev.map((d) => (d.id === id ? updated : d))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update dispatch status';
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteDispatch = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiFetch<{ success: boolean }>(`/api/dispatch/${id}`, {
        method: 'DELETE',
      });
      setDispatches((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete dispatch';
      setError(message);
      throw err;
    }
  }, []);

  return {
    dispatches,
    loading,
    error,
    createDispatch,
    updateDispatchStatus,
    deleteDispatch,
    refreshing,
    refresh,
  };
}