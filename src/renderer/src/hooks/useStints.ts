import { Stint } from '@shared/model';
import { cache, useEffect, useState } from 'react';

interface UseStints {
  loading: boolean;
  stints?: Stint[];
  getStint: (stintId: string) => Stint | undefined;
}

const getStints = cache(window.api.getStintData);

export const useStints = (): UseStints => {
  const [stints, setStints] = useState<Stint[]>();

  useEffect(() => {
    getStints().then(setStints);
  }, []);

  const getStint = (stintId: string): Stint | undefined =>
    stints?.find((stint) => stint.stintId === stintId);

  return {
    loading: !stints,
    stints,
    getStint
  };
};
