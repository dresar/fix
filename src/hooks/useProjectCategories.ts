import { useQuery } from '@tanstack/react-query';
import { projectCategoriesAPI } from '@/services/api';
import { useMemo } from 'react';

export function useProjectCategories() {
  const categoriesQuery = useQuery({
    queryKey: ['project-categories'],
    queryFn: projectCategoriesAPI.getAll,
  });

  const categories = useMemo(() => {
    const data = categoriesQuery.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [categoriesQuery.data]);

  return {
    categories,
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
  };
}
