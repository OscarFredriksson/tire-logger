import { useFetch } from './useFetch';

export const useTracks = () => {
  const [loading, tracks] = useFetch('getTracks', window.api.getTracks);

  return {
    loading,
    tracks
  };
};
