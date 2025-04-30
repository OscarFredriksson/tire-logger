import { Stint, TireStint } from '@shared/model';
import { useQuery } from '@tanstack/react-query';

interface UseStints {
  loading: boolean;
  stints?: Stint[];
  getStint: (stintId: string) => Stint | undefined;
  getTireStints: (tireId: string) => TireStint[];
}

export const useStints = (): UseStints => {
  const { data: stints, isLoading } = useQuery({
    queryKey: ['stints'],
    queryFn: window.api.getStints
  });

  const getStint = (stintId: string): Stint | undefined =>
    stints?.find((stint) => stint.stintId === stintId);

  const getTireStints = (tireId: string): TireStint[] =>
    stints?.reduce((stints: TireStint[], stint) => {
      const { leftFront, rightFront, leftRear, rightRear } = stint;
      if (leftFront === tireId) return [...stints, { ...stint, position: 'Left Front' }];
      if (rightFront === tireId) return [...stints, { ...stint, position: 'Right Front' }];
      if (leftRear === tireId) return [...stints, { ...stint, position: 'Left Rear' }];
      if (rightRear === tireId) return [...stints, { ...stint, position: 'Right Rear' }];
      return stints;
    }, [] as TireStint[]) || [];

  // stints?.filter((stint) => {
  //   const { leftFront, rightFront, leftRear, rightRear } = stint;
  //   return (
  //     leftFront === tireId || rightFront === tireId || leftRear === tireId || rightRear === tireId
  //   );
  // }) || [];

  return {
    loading: isLoading,
    stints,
    getStint,
    getTireStints
  };
};
