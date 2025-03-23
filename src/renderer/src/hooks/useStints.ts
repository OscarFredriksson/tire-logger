import { Stint } from '@shared/model';
import { useFetch } from './useFetch';

interface UseStints {
  loading: boolean;
  stints?: Stint[];
  getStint: (stintId: string) => Stint | undefined;
}

export const useStints = (): UseStints => {
  const [loading, stints] = useFetch('getStints', window.api.getStintData);

  const getStint = (stintId: string): Stint | undefined =>
    stints?.find((stint) => stint.stintId === stintId);

  return {
    loading,
    stints,
    getStint
  };
};
