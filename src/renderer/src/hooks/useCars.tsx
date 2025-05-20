import { Car } from '@shared/model';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from './useMutation';
import { modals } from '@mantine/modals';
import { Alert, Button, Group, LoadingOverlay, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useErrorBoundary } from 'react-error-boundary';

interface UseCars {
  loading: boolean;
  cars?: Car[];
  getCar: (carId: string) => Car | undefined;
  deleteCar: (carId: string) => void;
}
export const useCars = (): UseCars => {
  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: window.api.getCars
  });

  const carMap = useMemo<Record<string, Car>>(
    () => Object.fromEntries(cars?.map((car) => [car.carId, car]) || []),
    [cars]
  );

  const getCar = (carId: string) => carMap[carId];

  const { isPending, mutate: confirmDeleteCar } = useMutation({
    operationType: 'delete',
    entityName: 'car',
    queryKey: ['cars'],
    mutationFn: window.api.deleteCar
  });

  const { showBoundary } = useErrorBoundary();

  const deleteCar = (carId: string) => {
    const car = getCar(carId + '123');

    if (!car) {
      showBoundary(new Error(`Car with id ${carId} not found`));
      return;
    }

    modals.open({
      title: 'Delete car',
      children: (
        <Stack justify="center">
          <LoadingOverlay visible={isPending} w="100%" h="100%" />
          <Text fw={500}>
            Are you sure you want to delete the car{' '}
            <Text span fw={800} inherit>
              {car.name}
            </Text>
            ?
          </Text>
          <Alert variant="light" color="red" icon={<IconInfoCircle />}>
            This will also delete all tires and stints for this car.
          </Alert>
          <Group justify="flex-end">
            <Button variant="default" onClick={modals.closeAll}>
              Cancel
            </Button>
            <Button onClick={() => confirmDeleteCar(carId)}>Save</Button>
          </Group>
        </Stack>
      ),
      withCloseButton: false
    });
  };

  return {
    loading: isLoading,
    cars,
    getCar,
    deleteCar
  };
};
