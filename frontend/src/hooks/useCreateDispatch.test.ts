import { renderHook, act, waitFor } from '@testing-library/react';
import { useCreateDispatch } from './useCreateDispatch';
import { apiFetch } from '../lib/api';

jest.mock('../lib/api');

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('useCreateDispatch Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDispatchCreate: import('./useCreateDispatch').DispatchCreate = {
    plantId: '550e8400-e29b-41d4-a716-446655440001',
    distributionCenterId: '550e8400-e29b-41d4-a716-446655440002',
    scheduledDate: '2024-12-20T10:00:00.000Z',
    vehicleId: '550e8400-e29b-41d4-a716-446655440003',
    driverId: '550e8400-e29b-41d4-a716-446655440004',
    products: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440005',
        quantity: 100,
        unit: 'kg',
      },
      {
        productId: '550e8400-e29b-41d4-a716-446655440006',
        quantity: 50,
        unit: 'unit',
      },
    ],
  };

  const mockCreatedDispatch: import('./useCreateDispatch').Dispatch = {
    id: '550e8400-e29b-41d4-a716-446655440099',
    plantId: mockDispatchCreate.plantId,
    distributionCenterId: mockDispatchCreate.distributionCenterId,
    status: 'pending',
    createdAt: '2024-12-19T08:00:00.000Z',
    updatedAt: '2024-12-19T08:00:00.000Z',
    scheduledDate: mockDispatchCreate.scheduledDate,
    actualDeliveryDate: null,
    vehicleId: mockDispatchCreate.vehicleId,
    driverId: mockDispatchCreate.driverId,
    products: mockDispatchCreate.products,
  };

  describe('Initial State', () => {
    it('should initialize with loading as false', () => {
      const { result } = renderHook(() => useCreateDispatch());
      expect(result.current.loading).toBe(false);
    });

    it('should initialize with error as null', () => {
      const { result } = renderHook(() => useCreateDispatch());
      expect(result.current.error).toBe(null);
    });

    it('should have createDispatch function defined', () => {
      const { result } = renderHook(() => useCreateDispatch());
      expect(result.current.createDispatch).toBeDefined();
      expect(typeof result.current.createDispatch).toBe('function');
    });

    it('should have reset function defined', () => {
      const { result } = renderHook(() => useCreateDispatch());
      expect(result.current.reset).toBeDefined();
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('createDispatch - Happy Path', () => {
    it('should successfully create a dispatch and return the created dispatch', async () => {
      mockApiFetch.mockResolvedValueOnce(mockCreatedDispatch);

      const { result } = renderHook(() => useCreateDispatch());

      let createdDispatch: import('./useCreateDispatch').Dispatch | undefined;
      await act(async () => {
        createdDispatch = await result.current.createDispatch(mockDispatchCreate);
      });

      expect(createdDispatch).toEqual(mockCreatedDispatch);
      expect(createdDispatch?.id).toBe('550e8400-e29b-41d4-a716-446655440099');
      expect(createdDispatch?.status).toBe('pending');
      expect(createdDispatch?.actualDeliveryDate).toBeNull();
    });

    it('should call apiFetch with correct parameters', async () => {
      mockApiFetch.mockResolvedValueOnce(mockCreatedDispatch);

      const { result } = renderHook(() => useCreateDispatch());

      await act(async () => {
        await result.current.createDispatch(mockDispatchCreate);
      });

      expect(mockApiFetch).toHaveBeenCalledTimes(1);
      expect(mockApiFetch).toHaveBeenCalledWith('/api/dispatch', {
        method: 'POST',
        body: JSON.stringify(mockDispatchCreate),
      });
    });

    it('should set loading to true during the API call', async () => {
      mockApiFetch.mockResolvedValueOnce(mockCreatedDispatch);

      const { result } = renderHook(() => useCreateDispatch());

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.createDispatch(mockDispatchCreate);
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading to false after successful creation', async () => {
      mockApiFetch.mockResolvedValueOnce(mockCreatedDispatch);

      const { result } = renderHook(() => useCreateDispatch());

      await act(async () => {
        await result.current.createDispatch(mockDispatchCreate);
      });

      expect(result.current.loading).toBe(false);
    });

    it('should maintain error as null after successful creation', async () => {
      mockApiFetch.mockResolvedValueOnce(mockCreatedDispatch);

      const { result } = renderHook(() => useCreateDispatch());

      await act(async () => {
        await result.current.createDispatch(mockDispatchCreate);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('createDispatch - Error Handling', () => {
    it('should set error state when API call fails with Error object', async () => {
      const errorMessage = 'Network connection failed';
      mockApiFetch.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useCreateDispatch());

      await act(async () => {
        try {
          await result.current.createDispatch(mockDispatchCreate);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should set error state when API call fails with non-Error object', async () => {
      mockApiFetch.mockRejectedValueOnce('Server error occurred');

      const { result } = renderHook(() => useCreateDispatch());

      await act(async () => {
        try {
          await result.current.createDispatch(mockDispatchCreate);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Failed to create dispatch');
    });

    it('should set error state when API call fails with null', async () => {
      mockApiFetch.mockRejectedValueOnce(null);

      const { result } = renderHook(() => useCreateDispatch());

      await act(async () => {
        try {
          await result.current.createDispatch(mockDispatchCreate);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Failed to create dispatch');
    });

    it('should set error state when API call fails with undefined', async () => {
      mockApiFetch.mockRejectedValueOnce(undefined);

      const { result } = renderHook(() => useCreateDispatch());

      await act(async () => {
        try {
          await result.current.createDispatch(mockDispatchCreate);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Failed to create dispatch');
    });

    it('should throw the original error after setting error state', async () => {
      const originalError = new Error('Validation failed');
      mockApiFetch.mockRejectedValueOnce(originalError);

      const { result } = renderHook(() => useCreateDispatch());

      let thrownError: Error | undefined;
      await act(async () => {
        try {
          await result.current.createDispatch(mockDispatchCreate);
        } catch (e) {
          thrownError = e as Error;
        }
      });

      expect(thrownError).toBe(originalError);
    });

    it('should set loading to false after failed creation', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('API error'));

      const { result } = renderHook(() => useCreateDispatch());

      await act(async () => {
        try {
          await result.current.createDispatch(mockDispatchCreate);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset error to null', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Initial error'));

      const { result } = renderHook(() => useCreateDispatch());

      await act(async () => {
        try {
          await result.current.createDispatch(mockDispatchCreate);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Initial error');

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });

    it('should not affect loading state when reset is called', async () => {
      const { result } = renderHook(() => useCreateDispatch());

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.reset();
      });

      expect(result.current.loading).toBe(false);
    });

    it('should allow clearing error and retrying', async () => {
      mockApiFetch
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce(mockCreatedDispatch);

      const { result } = renderHook(() => useCreateDispatch());

      // First attempt
      await act(async () => {
        try {
          await result.current.createDispatch(mockDispatchCreate);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('First attempt failed');

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();

      // Second attempt
      let secondResult: import('./useCreateDispatch').Dispatch | undefined;
      await act(async () => {
        secondResult = await result.current.createDispatch(mockDispatchCreate);
      });

      expect(secondResult).toEqual(mockCreatedDispatch);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle dispatch with single product', async () => {
      const singleProductDispatch: import('./useCreateDispatch').DispatchCreate = {
        ...mockDispatchCreate,
        products: [
          {
            productId: '550e8400-e29b-41d4-a716-446655440010',
            quantity: 1,
            unit: 'unit',
          },
        ],
      };

      const singleProductResponse: import('./useCreateDispatch').Dispatch = {
        ...mockCreatedDispatch,
        products: singleProductDispatch.products,
      };

      mockApiFetch.mockResolvedValueOnce(singleProductResponse);

      const { result } = renderHook(() => useCreateDispatch());

      let createdDispatch: import('./useCreateDispatch').Dispatch | undefined;
      await act(async () => {
        createdDispatch = await result.current.createDispatch(singleProductDispatch);
      });

      expect(createdDispatch?.products).toHaveLength(1);
      expect(createdDispatch?.products[0].quantity).toBe(1);
    });

    it('should handle dispatch with empty products array', async () => {
      const emptyProductsDispatch: import('./useCreateDispatch').DispatchCreate = {
        ...mockDispatchCreate,
        products: [],
      };

      const emptyProductsResponse: import('./useCreateDispatch').Dispatch = {
        ...mockCreatedDispatch,
        products: [],
      };

      mockApiFetch.mockResolvedValueOnce(emptyProductsResponse);

      const { result } = renderHook(() => useCreateDispatch());

      let createdDispatch: import('./useCreateDispatch').Dispatch | undefined;
      await act(async () => {
        createdDispatch = await result.current.createDispatch(emptyProductsDispatch);
      });

      expect(createdDispatch?.products).toHaveLength(0);
    });

    it('should handle large quantities', async () => {
      const largeQuantityDispatch: import('./useCreateDispatch').DispatchCreate = {
        ...mockDispatchCreate,
        products: [
          {
            productId: '550e8400-e29b-41d4-a716-446655440010',
            quantity: 999999999,
            unit: 'kg',
          },
        ],
      };

      mockApiFetch.mockResolvedValueOnce(mockCreatedDispatch);

      const { result } = renderHook(() => useCreateDispatch());

      await act(async () => {
        await result.current.createDispatch(largeQuantityDispatch);
      });

      expect(mockApiFetch).toHaveBeenCalledWith('/api/dispatch', {
        method: 'POST',
        body: JSON.stringify(largeQuantityDispatch),
      });
    });

    it('should handle various status values from API response', async () => {
      const statuses: Array<'pending' | 'in_transit' | 'delivered' | 'cancelled'> = [
        'pending',
        'in_transit',
        'delivered',
        'cancelled',
      ];

      for (const status of statuses) {
        mockApiFetch.mockResolvedValueOnce({
          ...mockCreatedDispatch,
          status,
        });

        const { result } = renderHook(() => useCreateDispatch());

        let createdDispatch: import('./useCreateDispatch').Dispatch | undefined;
        await act(async () => {
          createdDispatch = await result.current.createDispatch(mockDispatchCreate);
        });

        expect(createdDispatch?.status).toBe(status);
      }
    });

    it('should handle dispatch with actualDeliveryDate set', async () => {
      const dispatchWithDelivery: import('./useCreateDispatch').Dispatch = {
        ...mockCreatedDispatch,
        status: 'delivered',
        actualDeliveryDate: '2024-12-20T14:30:00.000Z',
      };

      mockApiFetch.mockResolvedValueOnce(dispatchWithDelivery);

      const { result } = renderHook(() => useCreateDispatch());

      let createdDispatch: import('./useCreateDispatch').Dispatch | undefined;
      await act(async () => {
        createdDispatch = await result.current.createDispatch(mockDispatchCreate);
      });

      expect(createdDispatch?.actualDeliveryDate).toBe('2024-12-20T14:30:00.000Z');
      expect(createdDispatch?.status).toBe('delivered');
    });
  });

  describe('State Consistency', () => {
    it('should not have stale error state after successful retry', async () => {
      mockApiFetch
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce(mockCreatedDispatch);

      const { result } = renderHook(() => useCreateDispatch());

      // First call fails
      await act(async () => {
        try {
          await result.current.createDispatch(mockDispatchCreate);
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Temporary failure');

      // Reset and retry
      act(() => {
        result.current.reset();
      });

      // Second call succeeds
      await act(async () => {
        await result.current.createDispatch(mockDispatchCreate);
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle multiple rapid createDispatch calls', async () => {
      mockApiFetch.mockResolvedValue(mockCreatedDispatch);

      const { result } = renderHook(() => useCreateDispatch());

      await act(async () => {
        Promise.all([
          result.current.createDispatch(mockDispatchCreate),
          result.current.createDispatch(mockDispatchCreate),
        ]);
      });

      expect(mockApiFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Return Type Interface Compliance', () => {
    it('should return an object with all required properties', () => {
      const { result } = renderHook(() => useCreateDispatch());

      expect(result.current).toHaveProperty('createDispatch');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('reset');

      expect(typeof result.current.createDispatch).toBe('function');
      expect(typeof result.current.loading).toBe('boolean');
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(
        true,
      );
      expect(typeof result.current.reset).toBe('function');
    });
  });
});
