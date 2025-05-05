import { Tire } from '@shared/model';
import { useQuery } from '@tanstack/react-query';

interface UseTiresProps {
  carId?: string;
}

interface UseTires {
  loading: boolean;
  tires?: Tire[];
  getTire: (tireId: string) => Tire | undefined;
}

export const useTires = (props: UseTiresProps): UseTires => {
  console.log('useTires', props.carId);
  const { data: tires, isLoading } = useQuery({
    queryKey: ['tires', props.carId],
    queryFn: () => window.api.getTires(props.carId!)
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
