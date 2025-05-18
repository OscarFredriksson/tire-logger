import './style.css';

import { Center, Loader, MantineProvider, Stack, Text } from '@mantine/core';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

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
    <MantineProvider defaultColorScheme="dark">
      <SplashContent />
    </MantineProvider>
  </StrictMode>
);
