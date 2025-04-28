import { Stint } from '@shared/model';
import { useQuery } from '@tanstack/react-query';

interface UseStints {
  loading: boolean;
  stints?: Stint[];
  getStint: (stintId: string) => Stint | undefined;
}

export const useStints = (): UseStints => {
  const { data: stints, isLoading } = useQuery({
    queryKey: ['stints'],
    queryFn: window.api.getStints
  });

  const getStint = (stintId: string): Stint | undefined =>
    stints?.find((stint) => stint.stintId === stintId);

  return {
    loading: isLoading,
    stints,
    getStint
  };
};
