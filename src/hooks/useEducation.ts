import { useQuery } from '@tanstack/react-query';
import { educationAPI } from '../services/api';
import { useMemo } from 'react';

export const useEducation = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['education'],
    queryFn: educationAPI.getAll,
  });

  const education = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  return {
    education,
    isLoading,
    error,
  };
};
