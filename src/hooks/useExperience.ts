import { useQuery } from '@tanstack/react-query';
import { experienceAPI } from '../services/api';
import { useMemo } from 'react';

export const useExperience = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['experience'],
    queryFn: experienceAPI.getAll,
  });

  const experiences = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  return {
    experiences,
    isLoading,
    error,
  };
};
