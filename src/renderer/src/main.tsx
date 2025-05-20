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

export const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="dark">
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
