import { Stint, TireStint } from '@shared/model';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from './useMutation';
import { useErrorBoundary } from 'react-error-boundary';
import { Button, Group, Stack, Text } from '@mantine/core';
import { formatDate } from '@renderer/utils/dateUtils';
import { modals } from '@mantine/modals';

interface UseStintsProps {
  carId?: string;
}

export const useStints = ({ carId }: UseStintsProps) => {
  const { showBoundary } = useErrorBoundary();
  const { data: stints, isLoading } = useQuery({
    queryKey: ['stints', carId],
    queryFn: () => window.api.getStints(carId!)
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

  const { mutate: confirmDeleteStint } = useMutation({
    operationType: 'delete',
    entityName: 'stint',
    queryKey: ['stints', carId],
    mutationFn: window.api.deleteStint
  });

  const deleteStint = (stintId: string) => {
    const stint = getStint(stintId);

    if (!stint) {
      showBoundary(new Error(`Stint with id ${stintId} not found`));
      return;
    }

    modals.open({
      title: 'Delete stint',
      children: (
        <Stack>
          <Text>
            Are you sure you want to delete the stint at{' '}
            <Text span fw={800} inherit>
              {formatDate(stint.date)}
            </Text>
            ?
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={modals.closeAll}>
              Cancel
            </Button>
            <Button onClick={() => confirmDeleteStint(stintId)}>Save</Button>
          </Group>
        </Stack>
      )
    });
  };

  return {
    loading: isLoading,
    stints,
    getStint,
    getTireStints,
    deleteStint
  };
};
