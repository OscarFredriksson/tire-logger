import { Tire } from '@shared/model';
import { useFetch } from './useFetch';

interface UseTires {
  loading: boolean;
  tires?: Tire[];
  getTire: (tireId: string) => Tire | undefined;
}

export const useTires = (): UseTires => {
  const [loading, tires] = useFetch('getTires', window.api.getTires);

  const getTire = (tireId: string) => {
    return tires?.find((tire) => tire.tireId === tireId);
  };

  return {
    loading,
    tires,
    getTire
  };
};
