import { Track } from '@shared/model';
import { useQuery } from '@tanstack/react-query';

export const useActiveTracks = () => {
  const { data: activeTracks, isLoading } = useQuery({
    queryKey: ['tracks', false],
    queryFn: () => window.api.getTracks(false)
  });

  const getTrack = (trackId: string): Track | undefined =>
    activeTracks?.find((track) => track.trackId === trackId);

  return {
    loadingActiveTracks: isLoading,
    activeTracks,
    getTrack
  };
};

export const useArchivedTracks = () => {
  const { data: archivedTracks, isLoading } = useQuery({
    queryKey: ['tracks', true],
    queryFn: () => window.api.getTracks(true)
  });

  const getTrack = (trackId: string): Track | undefined =>
    archivedTracks?.find((track) => track.trackId === trackId);

  return {
    loadingArchivedTracks: isLoading,
    archivedTracks,
    getTrack
  };
};

export const useTracks = () => {
  const { activeTracks, loadingActiveTracks } = useActiveTracks();
  const { archivedTracks, loadingArchivedTracks } = useArchivedTracks();
  const tracks = activeTracks && archivedTracks ? [...activeTracks, ...archivedTracks] : undefined;

  return {
    tracks,
    loading: loadingActiveTracks || loadingArchivedTracks,
    getTrack: (trackId: string) => tracks?.find((track) => track.trackId === trackId)
  };
};
