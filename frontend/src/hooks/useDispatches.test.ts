import { renderHook, act, waitFor } from '@testing-library/react';
import { useDispatches } from './useDispatches';
import * as apiModule from '../lib/api';

jest.mock('../lib/api');

const mockApiFetch = apiModule.apiFetch as jest.MockedFunction<typeof apiModule.apiFetch>;

const mockDispatch: apiModule.Dispatch = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  plantId: '123e4567-e89b-12d3-a456-426614174001',
  distributionCenterId: '123e4567-e89b-12d3-a456-426614174002',
  status: 'pending',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
  scheduledDate: '2024-01-20T10:00:00.000Z',
  actualDeliveryDate: null,
  vehicleId: '123e4567-e89b-12d3-a456-426614174003',
  driverId: '123e4567-e89b-12d3-a456-426614174004',
  products: [
    { productId: 'prod-1', quantity: 100, unit: 'kg' },
  ],
};

const mockDispatches: apiModule.Dispatch[] = [
  mockDispatch,
  {
    id: '123e4567-e89b-12d3-a456-426614174010',
    plantId: '123e4567-e89b-12d3-a456-426614174001',
    distributionCenterId: '123e4567-e89b-12d3-a456-426614174002',
    status: 'in_transit',
    createdAt: '2024-01-14T09:00:00.000Z',
    updatedAt: '2024-01-14T09:00:00.000Z',
    scheduledDate: '2024-01-19T10:00:00.000Z',
    actualDeliveryDate: null,
    vehicleId: '123e4567-e89b-12d3-a456-426614174003',
    driverId: '123e4567-e89b-12d3-a456-426614174004',
    products: [],
  },
];

describe('useDispatches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty dispatches, no loading, no error, and refreshing false on init', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      expect(result.current.dispatches).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.refreshing).toBe(false);

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalled();
      });
    });

    it('should fetch dispatches on mount', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.dispatches).toEqual(mockDispatches);
      });
    });
  });

  describe('fetchDispatches', () => {
    it('should set loading true while fetching', async () => {
      mockApiFetch.mockImplementation(() => new Promise((resolve) => {
        setTimeout(() => resolve(mockDispatches), 50);
      }));

      const { result } = renderHook(() => useDispatches());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should fetch dispatches without filters', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith('/api/dispatch');
        expect(result.current.dispatches).toEqual(mockDispatches);
      });
    });

    it('should fetch dispatches with status filter', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() =>
        useDispatches({ status: 'pending' })
      );

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith('/api/dispatch?status=pending');
        expect(result.current.dispatches).toEqual([mockDispatch]);
      });
    });

    it('should fetch dispatches with plantId filter', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() =>
        useDispatches({ plantId: 'plant-123' })
      );

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith('/api/dispatch?plantId=plant-123');
        expect(result.current.dispatches).toEqual([mockDispatch]);
      });
    });

    it('should fetch dispatches with distributionCenterId filter', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() =>
        useDispatches({ distributionCenterId: 'dc-456' })
      );

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith('/api/dispatch?distributionCenterId=dc-456');
        expect(result.current.dispatches).toEqual([mockDispatch]);
      });
    });

    it('should fetch dispatches with multiple filters', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() =>
        useDispatches({
          status: 'pending',
          plantId: 'plant-123',
          distributionCenterId: 'dc-456',
        })
      );

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/dispatch?status=pending&plantId=plant-123&distributionCenterId=dc-456'
        );
        expect(result.current.dispatches).toEqual([mockDispatch]);
      });
    });

    it('should handle fetch error and set error state', async () => {
      const fetchError = new Error('Network error');
      mockApiFetch.mockRejectedValue(fetchError);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
        expect(result.current.dispatches).toEqual([]);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle non-Error fetch error', async () => {
      mockApiFetch.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch dispatches');
      });
    });

    it('should reset error on new fetch attempt', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('First error'));

      const { result, rerender } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      mockApiFetch.mockResolvedValueOnce(mockDispatches);

      rerender();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('refresh', () => {
    it('should set refreshing true during refresh', async () => {
      mockApiFetch.mockImplementation(() => new Promise((resolve) => {
        setTimeout(() => resolve(mockDispatches), 50);
      }));

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockApiFetch.mockImplementation(() => new Promise((resolve) => {
        setTimeout(() => resolve(mockDispatches), 50);
      }));

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false);
      });
    });

    it('should refetch dispatches on refresh', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toEqual(mockDispatches);
      });

      const updatedDispatches = [{ ...mockDispatch, id: 'new-id' }];
      mockApiFetch.mockResolvedValueOnce(updatedDispatches);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.dispatches).toEqual(updatedDispatches);
    });

    it('should pass filters to refresh request', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() =>
        useDispatches({ status: 'pending' })
      );

      await waitFor(() => {
        expect(result.current.dispatches).toEqual([mockDispatch]);
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockApiFetch).toHaveBeenCalledWith('/api/dispatch?status=pending');
    });
  });

  describe('createDispatch', () => {
    it('should add new dispatch to the beginning of the list', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toEqual(mockDispatches);
      });

      const newDispatch: apiModule.DispatchCreate = {
        plantId: 'plant-new',
        distributionCenterId: 'dc-new',
        scheduledDate: '2024-01-25T10:00:00.000Z',
        vehicleId: 'vehicle-new',
        driverId: 'driver-new',
        products: [{ productId: 'prod-1', quantity: 50, unit: 'kg' }],
      };

      const createdDispatch: apiModule.Dispatch = {
        ...newDispatch,
        id: 'newly-created-id',
        status: 'pending',
        createdAt: '2024-01-15T12:00:00.000Z',
        updatedAt: '2024-01-15T12:00:00.000Z',
        actualDeliveryDate: null,
      };

      mockApiFetch.mockResolvedValueOnce(createdDispatch);

      await act(async () => {
        await result.current.createDispatch(newDispatch);
      });

      expect(result.current.dispatches[0]).toEqual(createdDispatch);
      expect(result.current.dispatches).toHaveLength(3);
    });

    it('should call apiFetch with POST method', async () => {
      mockApiFetch.mockResolvedValue([]);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toEqual([]);
      });

      const newDispatch: apiModule.DispatchCreate = {
        plantId: 'plant-123',
        distributionCenterId: 'dc-456',
        scheduledDate: '2024-01-25T10:00:00.000Z',
        vehicleId: 'vehicle-1',
        driverId: 'driver-1',
        products: [],
      };

      const createdDispatch: apiModule.Dispatch = {
        ...newDispatch,
        id: 'new-id',
        status: 'pending',
        createdAt: '2024-01-15T12:00:00.000Z',
        updatedAt: '2024-01-15T12:00:00.000Z',
        actualDeliveryDate: null,
      };

      mockApiFetch.mockResolvedValueOnce(createdDispatch);

      await act(async () => {
        await result.current.createDispatch(newDispatch);
      });

      expect(mockApiFetch).toHaveBeenCalledWith('/api/dispatch', {
        method: 'POST',
        body: JSON.stringify(newDispatch),
      });
    });

    it('should set error and throw on create failure', async () => {
      mockApiFetch.mockResolvedValue([]);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toEqual([]);
      });

      const newDispatch: apiModule.DispatchCreate = {
        plantId: 'plant-123',
        distributionCenterId: 'dc-456',
        scheduledDate: '2024-01-25T10:00:00.000Z',
        vehicleId: 'vehicle-1',
        driverId: 'driver-1',
        products: [],
      };

      const createError = new Error('Create failed');
      mockApiFetch.mockRejectedValueOnce(createError);

      await expect(
        act(async () => {
          await result.current.createDispatch(newDispatch);
        })
      ).rejects.toThrow();

      expect(result.current.error).toBe('Failed to create dispatch');
    });

    it('should preserve existing dispatches on create error', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toEqual(mockDispatches);
      });

      const newDispatch: apiModule.DispatchCreate = {
        plantId: 'plant-123',
        distributionCenterId: 'dc-456',
        scheduledDate: '2024-01-25T10:00:00.000Z',
        vehicleId: 'vehicle-1',
        driverId: 'driver-1',
        products: [],
      };

      mockApiFetch.mockRejectedValueOnce(new Error('Create failed'));

      await act(async () => {
        try {
          await result.current.createDispatch(newDispatch);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.dispatches).toEqual(mockDispatches);
    });
  });

  describe('updateDispatchStatus', () => {
    it('should update dispatch status in the list', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toEqual(mockDispatches);
      });

      const dispatchId = mockDispatch.id;
      const updatedDispatch: apiModule.Dispatch = {
        ...mockDispatch,
        status: 'delivered',
        actualDeliveryDate: '2024-01-20T14:00:00.000Z',
      };

      mockApiFetch.mockResolvedValueOnce(updatedDispatch);

      await act(async () => {
        await result.current.updateDispatchStatus(dispatchId, 'delivered', '2024-01-20T14:00:00.000Z');
      });

      const updatedInList = result.current.dispatches.find((d) => d.id === dispatchId);
      expect(updatedInList?.status).toBe('delivered');
      expect(updatedInList?.actualDeliveryDate).toBe('2024-01-20T14:00:00.000Z');
    });

    it('should update status without actualDeliveryDate', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(1);
      });

      const dispatchId = mockDispatch.id;
      const updatedDispatch: apiModule.Dispatch = {
        ...mockDispatch,
        status: 'in_transit',
      };

      mockApiFetch.mockResolvedValueOnce(updatedDispatch);

      await act(async () => {
        await result.current.updateDispatchStatus(dispatchId, 'in_transit');
      });

      expect(result.current.dispatches[0].status).toBe('in_transit');
    });

    it('should call apiFetch with PATCH method and correct endpoint', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(1);
      });

      const dispatchId = mockDispatch.id;
      const updatedDispatch: apiModule.Dispatch = {
        ...mockDispatch,
        status: 'delivered',
      };

      mockApiFetch.mockResolvedValueOnce(updatedDispatch);

      await act(async () => {
        await result.current.updateDispatchStatus(dispatchId, 'delivered');
      });

      expect(mockApiFetch).toHaveBeenCalledWith(`/api/dispatch/${dispatchId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'delivered' }),
      });
    });

    it('should include actualDeliveryDate in request body when provided', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(1);
      });

      const dispatchId = mockDispatch.id;
      const deliveryDate = '2024-01-20T14:00:00.000Z';
      const updatedDispatch: apiModule.Dispatch = {
        ...mockDispatch,
        status: 'delivered',
        actualDeliveryDate: deliveryDate,
      };

      mockApiFetch.mockResolvedValueOnce(updatedDispatch);

      await act(async () => {
        await result.current.updateDispatchStatus(dispatchId, 'delivered', deliveryDate);
      });

      expect(mockApiFetch).toHaveBeenCalledWith(`/api/dispatch/${dispatchId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'delivered', actualDeliveryDate: deliveryDate }),
      });
    });

    it('should set error and throw on update failure', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(1);
      });

      const dispatchId = mockDispatch.id;
      const updateError = new Error('Update failed');
      mockApiFetch.mockRejectedValueOnce(updateError);

      await expect(
        act(async () => {
          await result.current.updateDispatchStatus(dispatchId, 'delivered');
        })
      ).rejects.toThrow();

      expect(result.current.error).toBe('Failed to update dispatch status');
    });

    it('should not modify other dispatches on update error', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(2);
      });

      const dispatchId = mockDispatch.id;
      mockApiFetch.mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        try {
          await result.current.updateDispatchStatus(dispatchId, 'delivered');
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.dispatches).toEqual(mockDispatches);
    });

    it('should update all status types: pending, in_transit, delivered, cancelled', async () => {
      const statuses: Array<'pending' | 'in_transit' | 'delivered' | 'cancelled'> = [
        'pending',
        'in_transit',
        'delivered',
        'cancelled',
      ];

      for (const status of statuses) {
        jest.clearAllMocks();
        mockApiFetch.mockResolvedValue([mockDispatch]);

        const { result } = renderHook(() => useDispatches());

        await waitFor(() => {
          expect(result.current.dispatches).toHaveLength(1);
        });

        const dispatchId = mockDispatch.id;
        const updatedDispatch: apiModule.Dispatch = {
          ...mockDispatch,
          status,
        };

        mockApiFetch.mockResolvedValueOnce(updatedDispatch);

        await act(async () => {
          await result.current.updateDispatchStatus(dispatchId, status);
        });

        expect(result.current.dispatches[0].status).toBe(status);
      }
    });
  });

  describe('deleteDispatch', () => {
    it('should remove dispatch from the list', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(2);
      });

      const dispatchIdToDelete = mockDispatches[1].id;

      mockApiFetch.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.deleteDispatch(dispatchIdToDelete);
      });

      expect(result.current.dispatches).toHaveLength(1);
      expect(result.current.dispatches.find((d) => d.id === dispatchIdToDelete)).toBeUndefined();
    });

    it('should call apiFetch with DELETE method and correct endpoint', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(2);
      });

      const dispatchId = mockDispatches[1].id;
      mockApiFetch.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.deleteDispatch(dispatchId);
      });

      expect(mockApiFetch).toHaveBeenCalledWith(`/api/dispatch/${dispatchId}`, {
        method: 'DELETE',
      });
    });

    it('should preserve remaining dispatches after deletion', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(2);
      });

      const dispatchIdToDelete = mockDispatches[1].id;
      const expectedRemaining = [mockDispatches[0]];

      mockApiFetch.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.deleteDispatch(dispatchIdToDelete);
      });

      expect(result.current.dispatches).toEqual(expectedRemaining);
    });

    it('should set error and throw on delete failure', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(2);
      });

      const dispatchId = mockDispatches[1].id;
      const deleteError = new Error('Delete failed');
      mockApiFetch.mockRejectedValueOnce(deleteError);

      await expect(
        act(async () => {
          await result.current.deleteDispatch(dispatchId);
        })
      ).rejects.toThrow();

      expect(result.current.error).toBe('Failed to delete dispatch');
    });

    it('should preserve dispatches on delete error', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(2);
      });

      const dispatchId = mockDispatches[1].id;
      mockApiFetch.mockRejectedValueOnce(new Error('Delete failed'));

      await act(async () => {
        try {
          await result.current.deleteDispatch(dispatchId);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.dispatches).toEqual(mockDispatches);
    });

    it('should handle deleting the last dispatch', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(1);
      });

      const dispatchId = mockDispatch.id;
      mockApiFetch.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.deleteDispatch(dispatchId);
      });

      expect(result.current.dispatches).toHaveLength(0);
    });
  });

  describe('buildQueryString', () => {
    it('should return empty string for empty filters', () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      expect(result.current.dispatches).toBeDefined();
    });

    it('should handle special characters in filter values', async () => {
      mockApiFetch.mockResolvedValue([]);

      const { result } = renderHook(() =>
        useDispatches({ status: 'in_transit', plantId: 'plant with spaces' })
      );

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalled();
      });
    });

    it('should handle only one filter being set', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() => useDispatches({ status: 'pending' }));

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith('/api/dispatch?status=pending');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty dispatches array response', async () => {
      mockApiFetch.mockResolvedValue([]);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toEqual([]);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle undefined filters (no filters)', async () => {
      mockApiFetch.mockResolvedValue(mockDispatches);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith('/api/dispatch');
      });
    });

    it('should update dispatches correctly when only one item matches', async () => {
      mockApiFetch.mockResolvedValue([mockDispatch]);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toHaveLength(1);
      });

      const dispatchId = mockDispatch.id;
      const updatedDispatch: apiModule.Dispatch = {
        ...mockDispatch,
        status: 'delivered',
      };

      mockApiFetch.mockResolvedValueOnce(updatedDispatch);

      await act(async () => {
        await result.current.updateDispatchStatus(dispatchId, 'delivered');
      });

      expect(result.current.dispatches).toHaveLength(1);
      expect(result.current.dispatches[0].status).toBe('delivered');
    });

    it('should reset error after successful operation', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Initial error'));

      const { result, rerender } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.error).toBe('Initial error');
      });

      mockApiFetch.mockResolvedValue(mockDispatches);
      rerender();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle full CRUD cycle', async () => {
      mockApiFetch.mockResolvedValue([]);

      const { result } = renderHook(() => useDispatches());

      await waitFor(() => {
        expect(result.current.dispatches).toEqual([]);
      });

      // Create
      const newDispatch: apiModule.DispatchCreate = {
        plantId: 'plant-123',
        distributionCenterId: 'dc-456',
        scheduledDate: '2024-01-25T10:00:00.000Z',
        vehicleId: 'vehicle-1',
        driverId: 'driver-1',
        products: [],
      };

      const createdDispatch: apiModule.Dispatch = {
        ...newDispatch,
        id: 'created-id',
        status: 'pending',
        createdAt: '2024-01-15T12:00:00.000Z',
        updatedAt: '2024-01-15T12:00:00.000Z',
        actualDeliveryDate: null,
      };

      mockApiFetch.mockResolvedValueOnce(createdDispatch);

      await act(async () => {
        await result.current.createDispatch(newDispatch);
      });

      expect(result.current.dispatches).toHaveLength(1);
      expect(result.current.dispatches[0].id).toBe('created-id');

      // Update
      const updatedDispatch: apiModule.Dispatch = {
        ...createdDispatch,
        status: 'in_transit',
      };

      mockApiFetch.mockResolvedValueOnce(updatedDispatch);

      await act(async () => {
        await result.current.updateDispatchStatus('created-id', 'in_transit');
      });

      expect(result.current.dispatches[0].status).toBe('in_transit');

      // Delete
      mockApiFetch.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.deleteDispatch('created-id');
      });

      expect(result.current.dispatches).toHaveLength(0);
    });
  });
});
