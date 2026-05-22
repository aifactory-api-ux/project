import { useState, useCallback } from 'react';
import { Cart, CartItem, AddCartItemInput, UpdateCartItemInput } from '../types/cart';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:23001';

interface UseCartReturn {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<Cart | null>;
  addItem: (data: AddCartItemInput) => Promise<Cart | null>;
  updateItem: (productId: number, data: UpdateCartItemInput) => Promise<Cart | null>;
  removeItem: (productId: number) => Promise<Cart | null>;
  clearCart: () => Promise<boolean>;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }, []);

  const fetchCart = useCallback(async (): Promise<Cart | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }
      const data: Cart = await response.json();
      setCart(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching cart';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const addItem = useCallback(async (data: AddCartItemInput): Promise<Cart | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to add item to cart: ${response.statusText}`);
      }
      const updatedCart: Cart = await response.json();
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error adding item to cart';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const updateItem = useCallback(async (productId: number, data: UpdateCartItemInput): Promise<Cart | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update cart item: ${response.statusText}`);
      }
      const updatedCart: Cart = await response.json();
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error updating cart item';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const removeItem = useCallback(async (productId: number): Promise<Cart | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to remove cart item: ${response.statusText}`);
      }
      const updatedCart: Cart = await response.json();
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error removing cart item';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const clearCart = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const cartItems = cart?.items || [];
      for (const item of cartItems) {
        const response = await fetch(`${API_BASE_URL}/api/cart/items/${item.productId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          throw new Error(`Failed to remove cart item: ${response.statusText}`);
        }
      }
      setCart((prev) => (prev ? { ...prev, items: [] } : null));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error clearing cart';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cart, getAuthHeaders]);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  };
}