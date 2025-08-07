import './style.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { App } from './App';
import { HashRouter, Route, Routes } from 'react-router';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { ErrorBoundary } from './components/ErrorBoundary';
import { theme } from './theme';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
});

window.electron.ipcRenderer.on('import-complete', async (_event, { success, message }) => {
  if (success) {
    Notifications.show({
      title: 'Import Successful',
      message,
      color: 'green'
    });
    await queryClient.refetchQueries();
  } else {
    Notifications.show({
      title: 'Import Failed',
      message,
      color: 'red'
    });
  }
});

window.electron.ipcRenderer.on('export-complete', (_event, { success, message }) => {
  if (success) {
    Notifications.show({
      title: 'Export Successful',
      message,
      color: 'green'
    });
  } else {
    Notifications.show({
      title: 'Export Failed',
      message,
      color: 'red'
    });
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <ErrorBoundary>
          <Notifications />
          <HashRouter>
            <ModalsProvider>
              <Routes>
                <Route path="*" element={<App />} />
              </Routes>
            </ModalsProvider>
          </HashRouter>
        </ErrorBoundary>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);
