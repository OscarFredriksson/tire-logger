import { Tire } from '@shared/model';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useMutation } from './useMutation';
import { modals } from '@mantine/modals';
import { Alert, Stack, Text } from '@mantine/core';
import { routes } from '@renderer/routes';
import { generatePath, useNavigate } from 'react-router';
import { IconInfoCircle } from '@tabler/icons-react';

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
  const navigate = useNavigate();
  const { data: tires, isLoading } = useQuery({
    queryKey: ['tires', carId],
    queryFn: () => window.api.getTires(carId!)
  });

  const tireMap = useMemo(
    () => Object.fromEntries(tires?.map((tire) => [tire.tireId, tire]) || []),
    [tires]
  );

  const getTire = (tireId: string) => tireMap[tireId];

  const { mutate: confirmDeleteTire } = useMutation({
    operationType: 'delete',
    entityName: 'tire',
    queryKey: ['tires', carId],
    mutationFn: async (tireId: string) => {
      await window.api.deleteTire(tireId);
    },
    onSuccess: () => navigate(generatePath(routes.TIRES, { carId }))
  });

  const deleteTire = (tireId: string) => {
    const tire = getTire(tireId);
    if (tire)
      modals.openConfirmModal({
        title: 'Delete tire',
        children: (
          <Stack>
            <Text>
              Are you sure you want to delete the tire{' '}
              <Text span fw={800} inherit>
                {tire.name}
              </Text>
              ?
            </Text>
            <Alert variant="light" color="red" icon={<IconInfoCircle />}>
              This will also delete all stints where this tire is used.
            </Alert>
          </Stack>
        ),
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        withCloseButton: false,
        onConfirm: () => {
          confirmDeleteTire(tire.tireId);
        },
        onAbort: () => modals.closeAll()
      });
  };

  return {
    loading: isLoading,
    tires,
    getTire,
    deleteTire
  };
};
