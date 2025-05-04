import { Car } from '@shared/model';
import { useQuery } from '@tanstack/react-query';

interface UseCars {
  loading: boolean;
  cars?: Car[];
}
export const useCars = (): UseCars => {
  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: window.api.getCars
  });

  return {
    loading: isLoading,
    cars
  };
};
