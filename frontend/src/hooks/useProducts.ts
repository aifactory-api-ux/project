import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (category?: string) => Promise<void>;
  fetchProduct: (id: string) => Promise<Product>;
  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (category?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const query = category ? `?category=${encodeURIComponent(category)}` : '';
      const response = await api.get<Product[]>(`/api/products${query}`);
      setProducts(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProduct = useCallback(async (id: string): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Product>(`/api/products/${id}`);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch product';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<Product>('/api/products', data);
      setProducts(prev => [...prev, response]);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (
    id: string,
    data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put<Product>(`/api/products/${id}`, data);
      setProducts(prev => prev.map(p => p.id === id ? response : p));
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}