import { Group, Select, Tabs, Title, Tooltip } from '@mantine/core';
import { useActiveCar } from '@renderer/hooks/useCars';
import { queryClient } from '@renderer/main';
import { routes } from '@renderer/routes';
import { FC, PropsWithChildren, useState } from 'react';
import { generatePath, useLocation, useNavigate } from 'react-router';
import { Car } from '@shared/model';
import { DataActionsMenu } from './import-export/ImportExportMenu';

const findActiveTab = (pathname: string, carId?: string): string | undefined => {
  if (carId && pathname.includes('/stints')) return generatePath(routes.STINTS, { carId });
  if (carId && pathname.includes('/tires')) return generatePath(routes.TIRES, { carId });
  if (pathname.includes('/tracks')) return routes.TRACKS;
  if (pathname.includes('/cars')) return routes.CARS;
  return undefined;
};

interface HeaderTabProps {
  route: string;
  disabled?: boolean;
  disabledTooltip?: string;
}

const HeaderTab: FC<PropsWithChildren<HeaderTabProps>> = ({
  route,
  disabled,
  disabledTooltip,
  children
}) => (
  <Tooltip withArrow label={disabledTooltip} hidden={!disabled}>
    <Tabs.Tab value={route} disabled={disabled}>
      <Title order={4}>{children}</Title>
    </Tabs.Tab>
  </Tooltip>
);

const findFirstActiveCar = (cars: Car[]) => cars.find((car) => !car.archived);

export const Header: FC = () => {
  const { activeCars } = useActiveCar({
    onCarsChange: (cars) => {
      // If the currently selected car is archived, select the first active car
      if (selectedCar && cars.every((car) => car.carId !== selectedCar || car.archived)) {
        const firstActiveCar = findFirstActiveCar(cars);
        if (firstActiveCar) {
          setSelectedCar(firstActiveCar.carId);
        }
      }
    }
  });
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState<string | undefined>();

  const activeTab = findActiveTab(pathname, selectedCar);

  if (!selectedCar && activeCars && activeCars.length > 0) {
    setSelectedCar(findFirstActiveCar(activeCars)!.carId);
  }

  const onSelectCar = (carId: string | null) => {
    if (carId) {
      console.log('Selected car:', carId);
      setSelectedCar(carId);
      queryClient.invalidateQueries({ queryKey: ['stints'] });
      queryClient.invalidateQueries({ queryKey: ['tires'] });
      navigate(generatePath(routes.STINTS, { carId }), { replace: true });
    }
  };

  return (
    <Tabs value={activeTab} onChange={(value) => value && navigate(value)}>
      <Tabs.List>
        <HeaderTab
          route={selectedCar ? generatePath(routes.STINTS, { carId: selectedCar }) : '/'}
          disabled={!selectedCar}
          disabledTooltip="Select a car first"
        >
          Stints
        </HeaderTab>
        <HeaderTab
          route={selectedCar ? generatePath(routes.TIRES, { carId: selectedCar }) : '/'}
          disabled={!selectedCar}
          disabledTooltip="Select a car first"
        >
          Tires
        </HeaderTab>
        <HeaderTab route={routes.TRACKS}>Tracks</HeaderTab>
        <HeaderTab route={routes.CARS}>Cars</HeaderTab>
        <Group ml="auto" m="md" justify="end" gap="md">
          <DataActionsMenu />
          <Select
            value={selectedCar}
            onChange={onSelectCar}
            placeholder="Select a car..."
            data={activeCars?.map(({ carId, name }) => ({
              value: carId,
              label: name
            }))}
            style={{ minWidth: 180 }}
          />
        </Group>
      </Tabs.List>
    </Tabs>
  );
};
