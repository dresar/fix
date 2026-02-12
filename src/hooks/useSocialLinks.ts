import { useQuery } from '@tanstack/react-query';
import { socialLinksAPI } from '../services/api';
import { useMemo } from 'react';

export const useSocialLinks = () => {
  const { data: socialLinks, isLoading, error } = useQuery({
    queryKey: ['social-links'],
    queryFn: socialLinksAPI.getAll,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    socialLinks,
    isLoading,
    error,
  };
};
