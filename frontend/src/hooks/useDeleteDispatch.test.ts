import { renderHook, act, waitFor } from '@testing-library/react';
import { useDeleteDispatch } from './useDeleteDispatch';

// Mock the apiFetch module
jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '../lib/api';

const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('useDeleteDispatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with loading set to false', () => {
      const { result } = renderHook(() => useDeleteDispatch());
      expect(result.current.loading).toBe(false);
    });

    it('should initialize with error set to null', () => {
      const { result } = renderHook(() => useDeleteDispatch());
      expect(result.current.error).toBe(null);
    });

    it('should provide a deleteDispatch function', () => {
      const { result } = renderHook(() => useDeleteDispatch());
      expect(typeof result.current.deleteDispatch).toBe('function');
    });

    it('should provide a reset function', () => {
      const { result } = renderHook(() => useDeleteDispatch());
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('deleteDispatch', () => {
    it('should set loading to true when deletion starts', async () => {
      mockedApiFetch.mockImplementation(() => Promise.resolve({ success: true }));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      let loadingDuringRequest: boolean | undefined;
      
      const deletePromise = act(async () => {
        const deletePromise = result.current.deleteDispatch('test-id-123');
        loadingDuringRequest = result.current.loading;
        return deletePromise;
      });
      
      // Check loading is true during the request
      expect(result.current.loading).toBe(true);
      
      await deletePromise;
    });

    it('should set loading to false after successful deletion', async () => {
      mockedApiFetch.mockImplementation(() => Promise.resolve({ success: true }));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      await act(async () => {
        await result.current.deleteDispatch('test-id-123');
      });
      
      expect(result.current.loading).toBe(false);
    });

    it('should set loading to false after failed deletion', async () => {
      mockedApiFetch.mockImplementation(() => Promise.reject(new Error('Delete failed')));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      await act(async () => {
        try {
          await result.current.deleteDispatch('test-id-123');
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(result.current.loading).toBe(false);
    });

    it('should call apiFetch with correct parameters', async () => {
      mockedApiFetch.mockImplementation(() => Promise.resolve({ success: true }));
      
      const { result } = renderHook(() => useDeleteDispatch());
      const testId = 'dispatch-uuid-123';
      
      await act(async () => {
        await result.current.deleteDispatch(testId);
      });
      
      expect(mockedApiFetch).toHaveBeenCalledWith(`/api/dispatch/${testId}`, {
        method: 'DELETE',
      });
    });

    it('should not set error on successful deletion', async () => {
      mockedApiFetch.mockImplementation(() => Promise.resolve({ success: true }));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      await act(async () => {
        await result.current.deleteDispatch('test-id');
      });
      
      expect(result.current.error).toBe(null);
    });

    it('should set error state on API error', async () => {
      mockedApiFetch.mockImplementation(() => Promise.reject(new Error('Dispatch not found')));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      await act(async () => {
        try {
          await result.current.deleteDispatch('test-id');
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(result.current.error).toBe('Dispatch not found');
    });

    it('should set generic error message when error has no message', async () => {
      mockedApiFetch.mockImplementation(() => Promise.reject(new Error()));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      await act(async () => {
        try {
          await result.current.deleteDispatch('test-id');
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(result.current.error).toBe('Failed to delete dispatch');
    });

    it('should set generic error message when error is not an Error instance', async () => {
      mockedApiFetch.mockImplementation(() => Promise.reject('string error'));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      await act(async () => {
        try {
          await result.current.deleteDispatch('test-id');
        } catch (e) {
          // Expected to throw
        }
      });
      
      expect(result.current.error).toBe('Failed to delete dispatch');
    });

    it('should throw the original error after setting error state', async () => {
      const testError = new Error('Server error 500');
      mockedApiFetch.mockImplementation(() => Promise.reject(testError));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      let thrownError: Error | undefined;
      
      await act(async () => {
        try {
          await result.current.deleteDispatch('test-id');
        } catch (e) {
          thrownError = e as Error;
        }
      });
      
      expect(thrownError).toBe(testError);
    });

    it('should clear previous error when starting a new deletion', async () => {
      // First call fails
      mockedApiFetch.mockImplementationOnce(() => Promise.reject(new Error('First error')));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      // Trigger first deletion that fails
      await act(async () => {
        try {
          await result.current.deleteDispatch('test-id-1');
        } catch (e) {
          // Expected
        }
      });
      
      expect(result.current.error).toBe('First error');
      
      // Second call succeeds
      mockedApiFetch.mockImplementationOnce(() => Promise.resolve({ success: true }));
      
      await act(async () => {
        await result.current.deleteDispatch('test-id-2');
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('reset', () => {
    it('should clear error when reset is called', async () => {
      mockedApiFetch.mockImplementation(() => Promise.reject(new Error('Some error')));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      // Trigger a failed deletion
      await act(async () => {
        try {
          await result.current.deleteDispatch('test-id');
        } catch (e) {
          // Expected
        }
      });
      
      expect(result.current.error).toBe('Some error');
      
      // Call reset
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.error).toBe(null);
    });

    it('should not affect loading state when reset is called', async () => {
      mockedApiFetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      // Start deletion
      const deletePromise = act(async () => {
        result.current.deleteDispatch('test-id');
      });
      
      // While loading, call reset
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.loading).toBe(true);
      
      await deletePromise;
    });

    it('should be callable multiple times without issues', () => {
      const { result } = renderHook(() => useDeleteDispatch());
      
      act(() => {
        result.current.reset();
      });
      
      act(() => {
        result.current.reset();
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('state persistence across re-renders', () => {
    it('should preserve state when component re-renders', async () => {
      mockedApiFetch.mockImplementation(() => Promise.resolve({ success: true }));
      
      const { result, rerender } = renderHook(() => useDeleteDispatch());
      
      await act(async () => {
        await result.current.deleteDispatch('test-id');
      });
      
      // Rerender the component
      rerender();
      
      // State should persist
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should reset state when hook is called in a new component instance', async () => {
      mockedApiFetch.mockImplementation(() => Promise.resolve({ success: true }));
      
      const { result: result1, unmount: unmount1 } = renderHook(() => useDeleteDispatch());
      
      await act(async () => {
        await result1.current.deleteDispatch('test-id');
      });
      
      unmount1();
      
      // New component instance should have fresh state
      const { result: result2 } = renderHook(() => useDeleteDispatch());
      
      expect(result2.current.loading).toBe(false);
      expect(result2.current.error).toBe(null);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string id', async () => {
      mockedApiFetch.mockImplementation(() => Promise.resolve({ success: true }));
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      await act(async () => {
        await result.current.deleteDispatch('');
      });
      
      expect(mockedApiFetch).toHaveBeenCalledWith('/api/dispatch/', {
        method: 'DELETE',
      });
    });

    it('should handle special characters in id', async () => {
      mockedApiFetch.mockImplementation(() => Promise.resolve({ success: true }));
      
      const { result } = renderHook(() => useDeleteDispatch());
      const specialId = 'abc-123_test';
      
      await act(async () => {
        await result.current.deleteDispatch(specialId);
      });
      
      expect(mockedApiFetch).toHaveBeenCalledWith(`/api/dispatch/${specialId}`, {
        method: 'DELETE',
      });
    });

    it('should handle UUID format id', async () => {
      mockedApiFetch.mockImplementation(() => Promise.resolve({ success: true }));
      
      const { result } = renderHook(() => useDeleteDispatch());
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      
      await act(async () => {
        await result.current.deleteDispatch(uuidId);
      });
      
      expect(mockedApiFetch).toHaveBeenCalledWith(`/api/dispatch/${uuidId}`, {
        method: 'DELETE',
      });
    });

    it('should handle multiple rapid deletion calls', async () => {
      let callCount = 0;
      mockedApiFetch.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ success: true });
      });
      
      const { result } = renderHook(() => useDeleteDispatch());
      
      await act(async () => {
        await Promise.all([
          result.current.deleteDispatch('id-1'),
          result.current.deleteDispatch('id-2'),
        ]);
      });
      
      expect(callCount).toBe(2);
    });
  });
});
