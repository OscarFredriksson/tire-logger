import { Group, Select, Tabs, Title, Tooltip } from '@mantine/core';
import { useActiveCar } from '@renderer/hooks/useCars';
import { queryClient } from '@renderer/main';
import { routes } from '@renderer/routes';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { generatePath, matchPath, useLocation, useNavigate } from 'react-router';
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

export const Header: FC = () => {
  const { activeCars } = useActiveCar();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [preferredCar, setSelectedCar] = useState<string | undefined>();
  const routeCarId = matchPath('/car/:carId/*', pathname)?.params.carId;
  const selectedCar =
    activeCars?.find((car) => car.carId === (routeCarId ?? preferredCar))?.carId ??
    activeCars?.[0]?.carId;

  const activeTab = findActiveTab(pathname, selectedCar);

  useEffect(() => {
    if (!activeCars || !routeCarId || activeCars.some((car) => car.carId === routeCarId)) return;

    const destination = selectedCar
      ? generatePath(pathname.includes('/tires') ? routes.TIRES : routes.STINTS, {
          carId: selectedCar
        })
      : routes.CARS;
    navigate(destination, { replace: true });
  }, [activeCars, routeCarId, selectedCar, pathname, navigate]);

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
            value={selectedCar ?? null}
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
