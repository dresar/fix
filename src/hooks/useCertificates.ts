import { useQuery } from '@tanstack/react-query';
import { certificatesAPI } from '../services/api';
import { useMemo } from 'react';

export const useCertificates = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['certificates'],
    queryFn: certificatesAPI.getAll,
  });

  const certificates = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  return {
    certificates,
    isLoading,
    error,
    refetch,
  };
};
