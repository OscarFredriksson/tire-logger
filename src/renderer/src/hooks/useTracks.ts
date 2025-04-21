import { useQuery } from '@tanstack/react-query';

export const useTracks = () => {
  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: window.api.getTracks
  });

  return {
    loading: isLoading,
    tracks
  };
};
