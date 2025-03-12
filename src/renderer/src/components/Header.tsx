import { Select, Tabs, Title } from '@mantine/core';
import { routes } from '@renderer/routes';
import { FC, PropsWithChildren, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

const findActiveTab = (pathname: string): string | undefined => {
  for (const route of Object.values(routes)) {
    if (pathname.startsWith(route)) return route;
  }
  return undefined;
};

interface HeaderTabProps {
  route: string;
}

const HeaderTab: FC<PropsWithChildren<HeaderTabProps>> = ({ route, children }) => (
  <Tabs.Tab value={route}>
    <Title order={4}>{children}</Title>
  </Tabs.Tab>
);

export const Header: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState<string>('Car 1');

  const activeTab = findActiveTab(pathname);

  return (
    <Tabs value={activeTab} onChange={(value) => value && navigate(value)}>
      <Tabs.List>
        <HeaderTab route={routes.STINTS}>Stints</HeaderTab>
        <HeaderTab route={routes.TIRES}>Tires</HeaderTab>
        <Select
          className="m-2 ml-auto"
          value={selectedCar}
          onChange={(value) => value && setSelectedCar(value)}
          data={['Car 1', 'Car 2', 'Car 3']}
        />
      </Tabs.List>
    </Tabs>
  );
};
