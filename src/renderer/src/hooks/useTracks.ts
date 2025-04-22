import { Track } from '@shared/model';
import { useQuery } from '@tanstack/react-query';

export const useTracks = () => {
  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: window.api.getTracks
  });

  const getTrack = (trackId: string): Track | undefined =>
    tracks?.find((track) => track.trackId === trackId);

  return {
    loading: isLoading,
    tracks,
    getTrack
  };
};
