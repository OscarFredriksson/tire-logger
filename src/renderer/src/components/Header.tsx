import { Select, Tabs, Title, Tooltip } from '@mantine/core';
import { useCars } from '@renderer/hooks/useCars';
import { routes } from '@renderer/routes';
import { FC, PropsWithChildren, useState } from 'react';
import { generatePath, useLocation, useNavigate } from 'react-router';

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
  const { cars } = useCars();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState<string | undefined>();

  const activeTab = findActiveTab(pathname, selectedCar);

  const onSelectCar = (carId: string | null) => {
    if (carId) {
      setSelectedCar(carId);
      navigate(generatePath(routes.STINTS, { carId }));
    }
  };

  return (
    <Tabs value={activeTab} onChange={(value) => value && navigate(value)}>
      <Tabs.List>
        <HeaderTab
          route={selectedCar ? generatePath(routes.STINTS, { carId: selectedCar }) : '/'}
          disabled={!selectedCar}
          disabledTooltip="Please select a car"
        >
          Stints
        </HeaderTab>
        <HeaderTab
          route={selectedCar ? generatePath(routes.TIRES, { carId: selectedCar }) : '/'}
          disabled={!selectedCar}
          disabledTooltip="Please select a car"
        >
          Tires
        </HeaderTab>
        <HeaderTab route={routes.TRACKS}>Tracks</HeaderTab>
        <HeaderTab route={routes.CARS}>Cars</HeaderTab>
        <Select
          className="m-2 ml-auto"
          value={selectedCar}
          onChange={onSelectCar}
          placeholder="Select a car..."
          data={cars?.map(({ carId, name }) => ({
            value: carId,
            label: name
          }))}
        />
      </Tabs.List>
    </Tabs>
  );
};
