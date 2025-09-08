import { Tire } from '@shared/model';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useMutation } from './useMutation';
import { modals } from '@mantine/modals';
import { Alert, Stack, Text } from '@mantine/core';
import { routes } from '@renderer/routes';
import { generatePath, useNavigate } from 'react-router';
import { IconInfoCircle } from '@tabler/icons-react';
import { useErrorBoundary } from 'react-error-boundary';

interface UseActiveTiresProps {
  carId?: string;
}

interface UseActiveTires {
  loadingActiveTires: boolean;
  activeTires?: Tire[];
  getActiveTire: (tireId: string) => Tire | undefined;
  archiveTire: (tireId: string) => void;
}

export const useActiveTires = ({ carId }: UseActiveTiresProps): UseActiveTires => {
  const navigate = useNavigate();
  const { showBoundary } = useErrorBoundary();

  const { data: activeTires, isLoading } = useQuery({
    queryKey: ['tires', carId, false],
    queryFn: () => window.api.getTires(carId!, false)
  });

  const { mutate: confirmArchiveTire } = useMutation({
    operationType: 'archive',
    entityName: 'tire',
    queryKey: ['tires', carId],
    mutationFn: window.api.archiveTire,
    onSuccess: () => navigate(generatePath(routes.TIRES, { carId }))
  });

  const tireMap = useMemo<Record<string, Tire | undefined>>(
    () => Object.fromEntries(activeTires?.map((tire) => [tire.tireId, tire]) || []),
    [activeTires]
  );

  const getActiveTire = (tireId: string) => tireMap[tireId];

  const archiveTire = (tireId: string) => {
    const tire = getActiveTire(tireId);

    if (!tire) {
      showBoundary(new Error(`Tire with id ${tireId} not found`));
      return;
    }

    modals.openConfirmModal({
      title: 'Archive tire',
      children: (
        <Stack>
          <Text>
            Are you sure you want to archive the tire{' '}
            <Text span fw={800} inherit>
              {tire.name}
            </Text>
            ?
          </Text>
          <Alert variant="light" color="red" icon={<IconInfoCircle />}>
            This will also archive all stints where this tire is used.
          </Alert>
        </Stack>
      ),
      labels: { confirm: 'Archive', cancel: 'Cancel' },
      withCloseButton: false,
      onConfirm: () => confirmArchiveTire(tire.tireId),
      onAbort: modals.closeAll
    });
  };

  return {
    loadingActiveTires: isLoading,
    activeTires,
    getActiveTire,
    archiveTire
  };
};

interface UseArchivedTires {
  carId?: string;
}

export const useArchivedTires = ({ carId }: UseArchivedTires) => {
  const navigate = useNavigate();
  const { showBoundary } = useErrorBoundary();

  const { data: archivedTires, isLoading } = useQuery({
    queryKey: ['tires', carId, true],
    queryFn: () => window.api.getTires(carId!, true)
  });

  const { mutate: confirmRestoreTire } = useMutation({
    operationType: 'update',
    entityName: 'tire',
    queryKey: ['tires', carId],
    mutationFn: window.api.restoreTire,
    onSuccess: () => navigate(generatePath(routes.TIRES, { carId }))
  });

  const tireMap = useMemo<Record<string, Tire | undefined>>(
    () => Object.fromEntries(archivedTires?.map((tire) => [tire.tireId, tire]) || []),
    [archivedTires]
  );

  const getArchivedTire = (tireId: string) => tireMap[tireId];

  const restoreTire = (tireId: string) => {
    const tire = getArchivedTire(tireId);

    if (!tire) {
      showBoundary(new Error(`Tire with id ${tireId} not found`));
      return;
    }

    modals.openConfirmModal({
      title: 'Restore tire',
      children: (
        <Stack>
          <Text>
            Are you sure you want to restore the tire{' '}
            <Text span fw={800} inherit>
              {tire.name}
            </Text>
            ?
          </Text>
        </Stack>
      ),
      labels: { confirm: 'Restore', cancel: 'Cancel' },
      withCloseButton: false,
      onConfirm: () => confirmRestoreTire(tire.tireId),
      onAbort: modals.closeAll
    });
  };

  return {
    loadingArchivedTires: isLoading,
    archivedTires,
    getArchivedTire,
    restoreTire
  };
};
