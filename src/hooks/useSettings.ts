import { useQuery } from '@tanstack/react-query';
import { siteSettingsAPI } from '../services/api';

export const useSettings = () => {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: siteSettingsAPI.get,
    retry: false, // Don't retry if failed
    refetchOnWindowFocus: false,
  });

  return {
    settings,
    isLoading,
    error,
  };
};
