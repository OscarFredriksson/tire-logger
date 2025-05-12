import { modals } from '@mantine/modals';
import { queryClient } from '@renderer/main';
import { Tire } from '@shared/model';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

interface UseTiresProps {
  carId?: string;
}

interface UseTires {
  loading: boolean;
  tires?: Tire[];
  getTire: (tireId: string) => Tire | undefined;
  deleteTire: (tireId: string) => void;
}

export const useTires = ({ carId }: UseTiresProps): UseTires => {
  const { data: tires, isLoading } = useQuery({
    queryKey: ['tires', carId],
    queryFn: () => window.api.getTires(carId!)
  });

  const tireMap = useMemo(() => {
    return (
      tires?.reduce(
        (acc, tire) => {
          acc[tire.tireId] = tire;
          return acc;
        },
        {} as Record<string, Tire>
      ) || {}
    );
  }, [tires]);

  const getTire = (tireId: string) => {
    return tireMap?.[tireId];
  };

  const deleteTire = (tireId: string) => {
    window.api.deleteTire(tireId);
    queryClient.invalidateQueries({ queryKey: ['tires', carId] });
    modals.closeAll();
  };

  return {
    loading: isLoading,
    tires,
    getTire,
    deleteTire
  };
};
