import './style.css';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { App } from './App';
import { HashRouter, Route, Routes } from 'react-router';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <HashRouter>
        <Routes>
          <Route path="*" element={<App />} />
        </Routes>
      </HashRouter>
    </MantineProvider>
  </StrictMode>
);
