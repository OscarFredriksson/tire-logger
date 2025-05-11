import { Navigate, Route, Routes } from 'react-router';
import { Tires } from './components/tires/Tires';
import { Header } from './components/Header';
import { routes } from './routes';
import { Stints } from './components/Stints';
import { FC } from 'react';
import { Tracks } from './components/Tracks';
import { ScrollAreaAutosize } from '@mantine/core';
import { Cars } from './components/Cars';
import { Tire } from './components/tires/Tire';

export const App: FC = () => {
  return (
    <div className="h-screen">
      <Header />
      <ScrollAreaAutosize className="p-5" style={{ height: 'calc(100vh - 52px)' }}>
        <Routes>
          <Route path="/" element={<Navigate to={routes.CARS} />} />
          <Route path={routes.STINTS} element={<Stints />} />
          <Route path={routes.TIRES} element={<Tires />} />
          <Route path={routes.TIRE_tireId} element={<Tire />} />
          <Route path={routes.TRACKS} element={<Tracks />} />
          <Route path={routes.CARS} element={<Cars />} />
        </Routes>
      </ScrollAreaAutosize>
    </div>
  );
};
