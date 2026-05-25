import { renderHook, act } from '@testing-library/react';
import { useUpdateDispatchStatus, Dispatch, UpdateDispatchStatusParams } from '../../src/hooks/useUpdateDispatchStatus';
import * as api from '../../src/lib/api';

jest.mock('../../src/lib/api', () => ({
  apiFetch: jest.fn(),
}));

describe('useUpdateDispatchStatus', () => {
  const mockDispatch: Dispatch = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    plantId: 'plant-123',
    distributionCenterId: 'dc-123',
    status: 'delivered',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    scheduledDate: '2024-01-01T12:00:00.000Z',
    actualDeliveryDate: '2024-01-02T15:30:00.000Z',
    vehicleId: 'vehicle-123',
    driverId: 'driver-123',
    products: [{ productId: 'prod-1', quantity: 10, unit: 'kg' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with loading false', () => {
      const { result } = renderHook(() => useUpdateDispatchStatus());
      expect(result.current.loading).toBe(false);
    });

    it('should start with error null', () => {
      const { result } = renderHook(() => useUpdateDispatchStatus());
      expect(result.current.error).toBeNull();
    });
  });

  describe('updateDispatchStatus', () => {
    it('should update dispatch status successfully', async () => {
      (api.apiFetch as jest.Mock).mockResolvedValueOnce(mockDispatch);

      const { result } = renderHook(() => useUpdateDispatchStatus());

      let response: Dispatch | undefined;
      await act(async () => {
        response = await result.current.updateDispatchStatus({
          id: '123e4567-e89b-12d3-a456-426614174000',
          status: 'delivered',
          actualDeliveryDate: '2024-01-02T15:30:00.000Z',
        });
      });

      expect(response).toEqual(mockDispatch);
      expect(api.apiFetch).toHaveBeenCalledWith(
        '/api/dispatch/123e4567-e89b-12d3-a456-426614174000/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            status: 'delivered',
            actualDeliveryDate: '2024-01-02T15:30:00.000Z',
          }),
        })
      );
    });

    it('should set loading to true during request', async () => {
      let resolvePromise: (value: Dispatch) => void;
      (api.apiFetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      const { result } = renderHook(() => useUpdateDispatchStatus());

      const updatePromise = act(async () => {
        const promise = result.current.updateDispatchStatus({
          id: 'test-id',
          status: 'pending',
        });
        return promise;
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!(mockDispatch);
        await updatePromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should set loading to false after successful request', async () => {
      (api.apiFetch as jest.Mock).mockResolvedValueOnce(mockDispatch);

      const { result } = renderHook(() => useUpdateDispatchStatus());

      await act(async () => {
        await result.current.updateDispatchStatus({
          id: 'test-id',
          status: 'in_transit',
        });
      });

      expect(result.current.loading).toBe(false);
    });

    it('should set loading to false after failed request', async () => {
      (api.apiFetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useUpdateDispatchStatus());

      await act(async () => {
        try {
          await result.current.updateDispatchStatus({
            id: 'test-id',
            status: 'cancelled',
          });
        } catch {}
      });

      expect(result.current.loading).toBe(false);
    });

    it('should set error state on API failure', async () => {
      const errorMessage = 'Failed to update dispatch status';
      (api.apiFetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useUpdateDispatchStatus());

      await act(async () => {
        try {
          await result.current.updateDispatchStatus({
            id: 'test-id',
            status: 'in_transit',
          });
        } catch {}
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should throw error and set error state when API throws non-Error object', async () => {
      (api.apiFetch as jest.Mock).mockRejectedValueOnce('Unknown error');

      const { result } = renderHook(() => useUpdateDispatchStatus());

      await act(async () => {
        await expect(
          result.current.updateDispatchStatus({
            id: 'test-id',
            status: 'in_transit',
          })
        ).rejects.toThrow();
      });

      expect(result.current.error).toBe('Failed to update dispatch status');
    });

    it('should not include actualDeliveryDate in body when not provided', async () => {
      (api.apiFetch as jest.Mock).mockResolvedValueOnce(mockDispatch);

      const { result } = renderHook(() => useUpdateDispatchStatus());

      await act(async () => {
        await result.current.updateDispatchStatus({
          id: 'test-id',
          status: 'in_transit',
        });
      });

      expect(api.apiFetch).toHaveBeenCalledWith(
        '/api/dispatch/test-id/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'in_transit' }),
        })
      );
    });

    it('should include actualDeliveryDate in body when provided', async () => {
      (api.apiFetch as jest.Mock).mockResolvedValueOnce(mockDispatch);

      const { result } = renderHook(() => useUpdateDispatchStatus());

      await act(async () => {
        await result.current.updateDispatchStatus({
          id: 'test-id',
          status: 'delivered',
          actualDeliveryDate: '2024-01-02T15:30:00.000Z',
        });
      });

      expect(api.apiFetch).toHaveBeenCalledWith(
        '/api/dispatch/test-id/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            status: 'delivered',
            actualDeliveryDate: '2024-01-02T15:30:00.000Z',
          }),
        })
      );
    });

    it('should handle all valid status values', async () => {
      const statuses: Array<'pending' | 'in_transit' | 'delivered' | 'cancelled'> = [
        'pending',
        'in_transit',
        'delivered',
        'cancelled',
      ];

      for (const status of statuses) {
        jest.clearAllMocks();
        const dispatchWithStatus = { ...mockDispatch, status };
        (api.apiFetch as jest.Mock).mockResolvedValueOnce(dispatchWithStatus);

        const { result } = renderHook(() => useUpdateDispatchStatus());

        await act(async () => {
          const response = await result.current.updateDispatchStatus({
            id: 'test-id',
            status,
          });
          expect(response.status).toBe(status);
        });
      }
    });

    it('should clear previous error before making new request', async () => {
      (api.apiFetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Previous error'))
        .mockResolvedValueOnce(mockDispatch);

      const { result } = renderHook(() => useUpdateDispatchStatus());

      await act(async () => {
        try {
          await result.current.updateDispatchStatus({
            id: 'test-id',
            status: 'in_transit',
          });
        } catch {}
      });

      expect(result.current.error).toBe('Previous error');

      await act(async () => {
        await result.current.updateDispatchStatus({
          id: 'test-id',
          status: 'delivered',
        });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should clear error state', async () => {
      (api.apiFetch as jest.Mock).mockRejectedValueOnce(new Error('Some error'));

      const { result } = renderHook(() => useUpdateDispatchStatus());

      await act(async () => {
        try {
          await result.current.updateDispatchStatus({
            id: 'test-id',
            status: 'cancelled',
          });
        } catch {}
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });

    it('should not affect loading state when calling reset', () => {
      const { result } = renderHook(() => useUpdateDispatchStatus());

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.reset();
      });

      expect(result.current.loading).toBe(false);
    });

    it('should be callable multiple times without issues', () => {
      const { result } = renderHook(() => useUpdateDispatchStatus());

      act(() => {
        result.current.reset();
      });
      act(() => {
        result.current.reset();
      });
      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('return interface', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => useUpdateDispatchStatus());

      expect(result.current).toHaveProperty('updateDispatchStatus');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('reset');
    });

    it('should have updateDispatchStatus as async function', async () => {
      (api.apiFetch as jest.Mock).mockResolvedValueOnce(mockDispatch);

      const { result } = renderHook(() => useUpdateDispatchStatus());

      const returnValue = result.current.updateDispatchStatus({
        id: 'test-id',
        status: 'pending',
      });

      expect(returnValue).toBeInstanceOf(Promise);
      await act(async () => {
        await returnValue;
      });
    });
  });
});
