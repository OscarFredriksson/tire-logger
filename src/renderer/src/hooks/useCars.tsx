import { Car } from '@shared/model';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from './useMutation';
import { modals } from '@mantine/modals';
import { Alert, Button, Group, LoadingOverlay, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useMemo, useEffect } from 'react';
import { useErrorBoundary } from 'react-error-boundary';

interface UseActiveCars {
  loadingActiveCars: boolean;
  activeCars?: Car[];
  getCar: (carId: string) => Car | undefined;
  archiveCar: (carId: string) => void;
}

interface UseActiveCarsProps {
  onCarsChange?: (cars: Car[]) => void;
}
export const useActiveCar = ({ onCarsChange }: UseActiveCarsProps = {}): UseActiveCars => {
  const { showBoundary } = useErrorBoundary();

  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars', false],
    queryFn: () => window.api.getCars(false)
  });

  const carMap = useMemo<Record<string, Car>>(
    () => Object.fromEntries(cars?.map((car) => [car.carId, car]) || []),
    [cars]
  );

  const getCar = (carId: string) => carMap[carId];

  const { isPending, mutate: confirmArchiveCar } = useMutation({
    operationType: 'archive',
    entityName: 'car',
    queryKey: ['cars'],
    mutationFn: ({ carId, archiveRelated }: { carId: string; archiveRelated: boolean }) =>
      window.api.archiveCar(carId, archiveRelated)
  });

  const archiveCar = (carId: string) => {
    const car = getCar(carId);

    if (!car) {
      showBoundary(new Error(`Car with id ${carId} not found`));
      return;
    }

    modals.open({
      title: 'Archive car',
      children: (
        <Stack justify="center">
          <LoadingOverlay visible={isPending} w="100%" h="100%" />
          <Text fw={500}>
            Are you sure you want to archive the car{' '}
            <Text span fw={800} inherit>
              {car.name}
            </Text>
            ?
          </Text>
          <Alert variant="light" color="red" icon={<IconInfoCircle />}>
            This will also archive all tires and stints for this car.
          </Alert>
          <Group justify="flex-end">
            <Button variant="default" onClick={modals.closeAll}>
              Cancel
            </Button>
            <Button onClick={() => confirmArchiveCar({ carId, archiveRelated: true })}>Save</Button>
          </Group>
        </Stack>
      ),
      withCloseButton: false
    });
  };

  // Notify consumer when filtered cars change
  useEffect(() => {
    if (onCarsChange && cars) {
      onCarsChange(cars);
    }
  }, [cars, onCarsChange]);

  return {
    loadingActiveCars: isLoading,
    activeCars: cars,
    getCar,
    archiveCar
  };
};

interface UseArchivedCars {
  loadingArchivedCars: boolean;
  archivedCars?: Car[];
  getArchivedCar: (carId: string) => Car | undefined;
  restoreCar: (carId: string) => void;
}

export const useArchivedCars = (): UseArchivedCars => {
  const { showBoundary } = useErrorBoundary();

  const { data: archivedCars, isLoading: loadingArchivedCars } = useQuery({
    queryKey: ['cars', true],
    queryFn: () => window.api.getCars(true)
  });

  const archivedCarMap = useMemo<Record<string, Car>>(
    () => Object.fromEntries(archivedCars?.map((car) => [car.carId, car]) || []),
    [archivedCars]
  );

  console.log(archivedCars);

  const getArchivedCar = (carId: string) => archivedCarMap[carId];

  const { mutate: confirmRestoreCar, isPending } = useMutation({
    operationType: 'update',
    entityName: 'car',
    queryKey: ['cars'],
    mutationFn: ({ carId }: { carId: string }) => window.api.restoreCar(carId)
  });

  const restoreCar = (carId: string) => {
    const car = getArchivedCar(carId);

    if (!car) {
      showBoundary(new Error(`Car with id ${carId} not found`));
      return;
    }

    modals.open({
      title: 'Restore car',
      children: (
        <Stack justify="center">
          <LoadingOverlay visible={isPending} w="100%" h="100%" />
          <Text fw={500}>
            Are you sure you want to restore the car{' '}
            <Text span fw={800} inherit>
              {car.name}
            </Text>
            ?
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={modals.closeAll}>
              Cancel
            </Button>
            <Button onClick={() => confirmRestoreCar({ carId })}>Restore</Button>
          </Group>
        </Stack>
      ),
      withCloseButton: false
    });
  };

  return { loadingArchivedCars, archivedCars, getArchivedCar, restoreCar };
};
