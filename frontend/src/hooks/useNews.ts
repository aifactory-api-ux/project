import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNews,
  fetchNewsById,
  createNews,
  updateNews,
  deleteNews,
} from '../lib/api';
import type {
  NewsItem,
  NewsItemCreate,
  NewsItemUpdate,
} from '../types/models';

export interface NewsQueryParams {
  country?: string;
  tag?: string;
  priority?: number;
  limit?: number;
  offset?: number;
}

export function useNews(params?: NewsQueryParams) {
  const queryClient = useQueryClient();

  const {
    data: newsData,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['news', params],
    queryFn: async () => {
      const result = await fetchNews(params);
      return result as { items: NewsItem[]; total: number };
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: NewsItemCreate) => createNews(data) as Promise<NewsItem>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: NewsItemUpdate }) =>
      updateNews(id, data) as Promise<NewsItem>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  return {
    news: newsData?.items ?? [],
    total: newsData?.total ?? 0,
    loading,
    error: error ? (error as Error).message : null,
    fetchNews: refetch,
    createNews: createMutation.mutateAsync,
    updateNews: updateMutation.mutateAsync,
    deleteNews: deleteMutation.mutateAsync,
    deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
  };
}

export function useNewsItem(id: number) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: () => fetchNewsById(id) as Promise<NewsItem>,
    enabled: id > 0,
  });
}