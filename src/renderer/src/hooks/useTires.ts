import { Tire } from '@shared/model';
import { useQuery } from '@tanstack/react-query';

interface UseTires {
  loading: boolean;
  tires?: Tire[];
  getTire: (tireId: string) => Tire | undefined;
}

export const useTires = (): UseTires => {
  const { data: tires, isLoading } = useQuery({
    queryKey: ['tires'],
    queryFn: window.api.getTires
  });

  const getTire = (tireId: string) => {
    return tires?.find((tire) => tire.tireId === tireId);
  };

  return {
    loading: isLoading,
    tires,
    getTire
  };
};
