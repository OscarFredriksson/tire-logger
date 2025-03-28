import { cache } from 'react';
import { useFetch } from './useFetch';

const getTracks = cache(window.api.getTracks);

export const useTracks = () => {
  const [loading, tracks] = useFetch(getTracks);

  return {
    loading,
    tracks
  };
};
