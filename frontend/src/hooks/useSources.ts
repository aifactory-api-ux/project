import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSources, createSource } from '../lib/api';

export function useSources() {
  const queryClient = useQueryClient();

  const {
    data: sources = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const result = await fetchSources();
      return result;
    },
  });

  const createSourceMutation = useMutation({
    mutationFn: (data: { name: string; url: string }) => createSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });

  return {
    sources,
    loading,
    error: error ? (error as Error).message : null,
    fetchSources: refetch,
    createSource: createSourceMutation.mutateAsync,
  };
}