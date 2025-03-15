import { Navigate, Route, Routes } from 'react-router';
import { Tires } from './components/Tires';
import { Tire } from './components/Tire';
import { Header } from './components/Header';
import { routes } from './routes';
import { Stints } from './components/Stints';
import { FC } from 'react';

export const App: FC = () => {
  return (
    <>
      <Header />
      <div className="p-5">
        <Routes>
          <Route path="/" element={<Navigate to={routes.STINTS} />} />
          <Route path={routes.STINTS} element={<Stints />} />
          <Route path={routes.TIRES} element={<Tires />} />
          <Route path={routes.TIRE_tireId} element={<Tire />} />
        </Routes>
      </div>
    </>
  );
};
