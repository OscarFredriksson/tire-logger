import { Tire } from '@shared/model';
import { useFetch } from './useFetch';
import { cache } from 'react';

interface UseTires {
  loading: boolean;
  tires?: Tire[];
  getTire: (tireId: string) => Tire | undefined;
}

const getTires = cache(window.api.getTires);

export const useTires = (): UseTires => {
  const [loading, tires] = useFetch(getTires);

  const getTire = (tireId: string) => {
    return tires?.find((tire) => tire.tireId === tireId);
  };

  return {
    loading,
    tires,
    getTire
  };
};
