import { useFetch } from './useFetch';

export const useTracks = () => {
  const [loading, tracks] = useFetch(window.api.getTracks);

  return {
    loading,
    tracks
  };
};
