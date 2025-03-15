import { Stint } from '@shared/model';
import { useFetch } from './useFetch';

interface UseStints {
  loading: boolean;
  stints?: Stint[];
}

export const useStints = (): UseStints => {
  const [loading, stints] = useFetch(window.api.getStintData);

  return {
    loading,
    stints
  };
};
