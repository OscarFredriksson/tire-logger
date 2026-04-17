import { Stint, TireStint } from '@shared/model';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from './useMutation';
import { useErrorBoundary } from 'react-error-boundary';
import { Button, Group, Stack, Text } from '@mantine/core';
import { formatDate } from '@renderer/utils/dateUtils';
import { modals } from '@mantine/modals';

interface UseStintsProps {
  carId?: string;
  archived?: boolean;
}

export const useActiveStints = ({ carId, archived }: UseStintsProps = { archived: false }) => {
  const { showBoundary } = useErrorBoundary();
  const { data: activeStints, isLoading } = useQuery({
    queryKey: ['stints', carId, archived],
    queryFn: () => window.api.getStints(carId!, archived!)
  });

  const getStint = (stintId: string): Stint | undefined =>
    activeStints?.find((stint) => stint.stintId === stintId);

  const getTireStints = (tireId: string): TireStint[] =>
    activeStints?.reduce((stints: TireStint[], stint) => {
      const { leftFront, rightFront, leftRear, rightRear } = stint;
      if (leftFront === tireId) return [...stints, { ...stint, position: 'Left Front' }];
      if (rightFront === tireId) return [...stints, { ...stint, position: 'Right Front' }];
      if (leftRear === tireId) return [...stints, { ...stint, position: 'Left Rear' }];
      if (rightRear === tireId) return [...stints, { ...stint, position: 'Right Rear' }];
      return stints;
    }, [] as TireStint[]) || [];

  const { mutate: confirmArchiveStint } = useMutation({
    operationType: 'archive',
    entityName: 'stint',
    queryKey: ['stints', carId],
    mutationFn: window.api.archiveStint
  });

  const archiveStint = (stintId: string) => {
    const stint = getStint(stintId);

    if (!stint) {
      showBoundary(new Error(`Stint with id ${stintId} not found`));
      return;
    }

    modals.open({
      title: 'Archive stint',
      children: (
        <Stack>
          <Text>
            Are you sure you want to archive the stint at{' '}
            <Text span fw={800} inherit>
              {formatDate(stint.date)}
            </Text>
            ?
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={modals.closeAll}>
              Cancel
            </Button>
            <Button onClick={() => confirmArchiveStint(stintId)}>Save</Button>
          </Group>
        </Stack>
      )
    });
  };

  return {
    loadingActiveStints: isLoading,
    activeStints,
    getStint,
    getTireStints,
    archiveStint
  };
};

interface UseArchivedStintsProps {
  carId?: string;
}

export const useArchivedStints = ({ carId }: UseArchivedStintsProps) => {
  const { showBoundary } = useErrorBoundary();
  const { data: archivedStints, isLoading } = useQuery({
    queryKey: ['stints', carId, true],
    queryFn: () => window.api.getStints(carId!, true)
  });

  const getArchivedStint = (stintId: string): Stint | undefined =>
    archivedStints?.find((stint) => stint.stintId === stintId);

  const getTireStints = (tireId: string): TireStint[] =>
    archivedStints?.reduce((stints: TireStint[], stint) => {
      const { leftFront, rightFront, leftRear, rightRear } = stint;
      if (leftFront === tireId) return [...stints, { ...stint, position: 'Left Front' }];
      if (rightFront === tireId) return [...stints, { ...stint, position: 'Right Front' }];
      if (leftRear === tireId) return [...stints, { ...stint, position: 'Left Rear' }];
      if (rightRear === tireId) return [...stints, { ...stint, position: 'Right Rear' }];
      return stints;
    }, [] as TireStint[]) || [];

  const { mutate: confirmRestoreStint } = useMutation({
    operationType: 'update',
    entityName: 'stint',
    queryKey: ['stints', carId],
    mutationFn: window.api.restoreStint
  });

  const restoreStint = (stintId: string) => {
    const stint = getArchivedStint(stintId);

    if (!stint) {
      showBoundary(new Error(`Stint with id ${stintId} not found`));
      return;
    }

    modals.open({
      title: 'Restore stint',
      children: (
        <Stack>
          <Text>
            Are you sure you want to restore the stint at{' '}
            <Text span fw={800} inherit>
              {/* {formatDate(stint.date)} */}
            </Text>
            ?
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={modals.closeAll}>
              Cancel
            </Button>
            <Button onClick={() => confirmRestoreStint(stintId)}>Save</Button>
          </Group>
        </Stack>
      )
    });
  };

  return {
    archivedStints,
    loadingArchivedStints: isLoading,
    getArchivedStint,
    getTireStints,
    restoreStint
  };
};
