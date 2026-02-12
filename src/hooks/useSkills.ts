import { useQuery } from '@tanstack/react-query';
import { skillsAPI } from '../services/api';
import { useMemo } from 'react';

export const useSkills = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['skills'],
    queryFn: skillsAPI.getAll,
  });

  const skills = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  return {
    skills,
    isLoading,
    error,
  };
};
