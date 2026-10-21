import { Button, Group, Tabs, Title, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconChevronDown } from '@tabler/icons-react';
import { Car } from '@shared/model';
import { routes } from '@renderer/routes';
import { FC, PropsWithChildren } from 'react';
import { generatePath, useLocation, useNavigate } from 'react-router';
import { DataActionsMenu } from './import-export/ImportExportMenu';

const findActiveTab = (pathname: string, carId?: string): string | undefined => {
  if (carId && pathname.includes('/stints')) return generatePath(routes.STINTS, { carId });
  if (carId && pathname.includes('/tires')) return generatePath(routes.TIRES, { carId });
  if (pathname.includes('/tracks')) return routes.TRACKS;
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

interface HeaderProps {
  selectedCar?: Car;
  onChangeCar: () => void;
}

export const Header: FC<HeaderProps> = ({ selectedCar, onChangeCar }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const carId = selectedCar?.carId;
  const activeTab = findActiveTab(pathname, carId);

  return (
    <header>
      {selectedCar && (
        <Title order={1} px="md" pt="md" aria-label={selectedCar.name}>
          <button
            type="button"
            className="selected-car-switch"
            aria-label={`Change car, ${selectedCar.name}`}
            onClick={onChangeCar}
          >
            <span className="selected-car-name">{selectedCar.name}</span>
            <IconChevronDown size={24} aria-hidden="true" />
          </button>
        </Title>
      )}
      <Tabs value={activeTab} onChange={(value) => value && navigate(value)}>
        <Tabs.List>
          <HeaderTab
            route={carId ? generatePath(routes.STINTS, { carId }) : '/'}
            disabled={!selectedCar}
            disabledTooltip="Select a car first"
          >
            Stints
          </HeaderTab>
          <HeaderTab
            route={carId ? generatePath(routes.TIRES, { carId }) : '/'}
            disabled={!selectedCar}
            disabledTooltip="Select a car first"
          >
            Tires
          </HeaderTab>
          <HeaderTab route={routes.TRACKS}>Tracks</HeaderTab>
          <Group ml="auto" m="md" justify="end" gap="md">
            <DataActionsMenu />
            {!selectedCar && pathname !== '/' && (
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconArrowLeft size={18} aria-hidden="true" />}
                onClick={onChangeCar}
              >
                Change car
              </Button>
            )}
          </Group>
        </Tabs.List>
      </Tabs>
    </header>
  );
};
