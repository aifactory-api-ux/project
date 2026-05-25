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

export type DispatchStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled';

export interface UpdateDispatchStatusParams {
  id: string;
  status: DispatchStatus;
  actualDeliveryDate?: string;
}

interface UseUpdateDispatchStatusReturn {
  updateDispatchStatus: (params: UpdateDispatchStatusParams) => Promise<Dispatch>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useUpdateDispatchStatus(): UseUpdateDispatchStatusReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const updateDispatchStatus = useCallback(async (params: UpdateDispatchStatusParams): Promise<Dispatch> => {
    setLoading(true);
    setError(null);

    try {
      const body: { status: DispatchStatus; actualDeliveryDate?: string } = {
        status: params.status,
      };
      if (params.actualDeliveryDate) {
        body.actualDeliveryDate = params.actualDeliveryDate;
      }

      const updatedDispatch = await apiFetch<Dispatch>(`/api/dispatch/${params.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      return updatedDispatch;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update dispatch status';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateDispatchStatus,
    loading,
    error,
    reset,
  };
}