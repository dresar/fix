import { useQuery } from '@tanstack/react-query';
import { profileAPI } from '../services/api';

export const useProfile = () => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: profileAPI.get,
    retry: false, // Don't retry if failed, just show fallback
    refetchOnWindowFocus: false,
  });

  return {
    profile,
    isLoading,
    error,
  };
};
