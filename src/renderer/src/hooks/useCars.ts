import { Car } from '@shared/model';
import { useQuery } from '@tanstack/react-query';

interface UseCars {
  loading: boolean;
  cars?: Car[];
  getCar: (carId: string) => Car | undefined;
}
export const useCars = (): UseCars => {
  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: window.api.getCars
  });

  const getCar = (carId: string) => cars?.find((car) => car.carId === carId);

  return {
    loading: isLoading,
    cars,
    getCar
  };
};
