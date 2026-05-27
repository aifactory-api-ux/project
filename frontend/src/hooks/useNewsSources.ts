import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSources, createSource } from '../lib/api';
import { NewsSource } from '../types/models';

export function useNewsSources() {
  const queryClient = useQueryClient();

  const {
    data: sources = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<NewsSource[], Error>({
    queryKey: ['sources'],
    queryFn: async () => {
      const result = await fetchSources();
      return result as NewsSource[];
    },
  });

  const createSourceMutation = useMutation<NewsSource, Error, { name: string; url: string }>({
    mutationFn: (data: { name: string; url: string }) => createSource(data) as Promise<NewsSource>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });

  return {
    data: sources,
    loading,
    error: error ? error.message : null,
    fetchSources: refetch,
    createSource: createSourceMutation.mutateAsync,
  };
}