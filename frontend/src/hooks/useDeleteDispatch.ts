import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

interface DeleteDispatchResponse {
  success: boolean;
}

interface UseDeleteDispatchReturn {
  deleteDispatch: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useDeleteDispatch(): UseDeleteDispatchReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const deleteDispatch = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await apiFetch<DeleteDispatchResponse>(`/api/dispatch/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete dispatch';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteDispatch,
    loading,
    error,
    reset,
  };
}