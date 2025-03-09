import { Tabs } from '@mantine/core';
import { routes } from '@renderer/routes';
import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router';

const findActiveTab = (pathname: string): string | undefined => {
  for (const route of Object.values(routes)) {
    if (pathname.startsWith(route)) return route;
  }
  return undefined;
};

export const Header: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeTab = findActiveTab(pathname);

  return (
    <Tabs value={activeTab} onChange={(value) => value && navigate(value)}>
      <Tabs.List>
        <Tabs.Tab value={routes.STINTS}>Stints</Tabs.Tab>
        <Tabs.Tab value={routes.TIRES}>Tires</Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
};
