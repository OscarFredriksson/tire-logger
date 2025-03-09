import { Navigate, Route, Routes } from 'react-router';
import { useEffect, useState } from 'react';
import { Tire as ITire } from '@shared/model';
import { Tires } from './components/Tires';
import { Tire } from './components/Tire';
import { Header } from './components/Header';
import { routes } from './routes';
import { Stints } from './components/Stints';

export const App = (): JSX.Element => {
  const [tires, setTireData] = useState<ITire[]>();

  useEffect(() => {
    const getTireData = async () => {
      const data: ITire[] = await window.api.getTireData();
      setTireData(data);
    };
    getTireData();
  }, []);

  return (
    <>
      <Header />
      <div className="p-5">
        <Routes>
          <Route path="/" element={<Navigate to={routes.STINTS} />} />
          <Route path={routes.STINTS} element={<Stints />} />
          <Route path={routes.TIRES} element={<Tires tires={tires} />} />
          <Route path={routes.TIRE_tireId} element={<Tire tires={tires} />} />
        </Routes>
      </div>
    </>
  );
};
