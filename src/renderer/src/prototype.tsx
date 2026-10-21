import './style.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, v8CssVariablesResolver } from '@mantine/core';
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { theme } from './theme';
import { CarSelectionPrototype } from './components/cars/CarSelection.prototype';

const root = document.getElementById('root');
if (!root) throw new Error('Prototype root element is missing');

createRoot(root).render(
  <StrictMode>
    <MantineProvider
      defaultColorScheme="dark"
      theme={theme}
      cssVariablesResolver={v8CssVariablesResolver}
    >
      <HashRouter>
        <Routes>
          <Route path="/cars" element={<CarSelectionPrototype />} />
          <Route path="*" element={<Navigate to="/cars?variant=A" replace />} />
        </Routes>
      </HashRouter>
    </MantineProvider>
  </StrictMode>
);
