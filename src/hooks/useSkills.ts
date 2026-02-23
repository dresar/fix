import { useQuery } from '@tanstack/react-query';
import { skillsAPI } from '../services/api';
import { useMemo } from 'react';

export const useSkills = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['skills'],
    queryFn: skillsAPI.getAll,
    retry: 0,
    staleTime: 300000,
  });

  const skills = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  return {
    skills,
    isLoading,
    isError,
  };
};
