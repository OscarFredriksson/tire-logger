import './style.css';

import {
  Center,
  Loader,
  MantineProvider,
  Stack,
  Text,
  v8CssVariablesResolver
} from '@mantine/core';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { theme } from './theme';

export const SplashContent = () => {
  return (
    <Center className="h-screen">
      <Stack w="100%" align="center">
        <Loader />
        <Text>Warming up tires...</Text>
      </Stack>
    </Center>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <MantineProvider
      defaultColorScheme="dark"
      theme={theme}
      cssVariablesResolver={v8CssVariablesResolver}
    >
      <SplashContent />
    </MantineProvider>
  </StrictMode>
);
