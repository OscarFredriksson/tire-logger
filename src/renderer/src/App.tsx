import { generatePath, matchPath, Route, Routes, useLocation, useNavigate } from 'react-router';
import { Tires } from './components/tires/Tires';
import { Header } from './components/Header';
import { Stints } from './components/stints/Stints';
import { routes } from './routes';
import { FC, useEffect, useState } from 'react';
import { Tracks } from './components/tracks/Tracks';
import { Box, Loader } from '@mantine/core';
import { Tire } from './components/tires/Tire';
import { useActiveCar } from './hooks/useCars';
import { CarChooser } from './components/cars/CarChooser';

export const App: FC = () => {
  const { activeCars, loadingActiveCars, activeCarsError } = useActiveCar();
  const [selectedCarId, setSelectedCarId] = useState<string>();
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const routeCarId = matchPath('/car/:carId/*', pathname)?.params.carId;
  const selectedCar =
    pathname === '/'
      ? undefined
      : activeCars?.find((car) => car.carId === (routeCarId ?? selectedCarId));

  useEffect(() => {
    if (initialized || loadingActiveCars || activeCarsError || !activeCars) return;
    setInitialized(true);
    if (pathname === '/' && activeCars.length === 1) {
      const { carId } = activeCars[0];
      setSelectedCarId(carId);
      navigate(generatePath(routes.STINTS, { carId }), { replace: true });
    }
  }, [initialized, loadingActiveCars, activeCarsError, activeCars, pathname, navigate]);

  useEffect(() => {
    if (routeCarId && activeCars?.some((car) => car.carId === routeCarId)) {
      setSelectedCarId(routeCarId);
    } else if (initialized && pathname === '/') {
      setSelectedCarId(undefined);
    }
  }, [routeCarId, activeCars, initialized, pathname]);

  if (activeCarsError) throw activeCarsError;
  if (!initialized || loadingActiveCars || !activeCars) {
    return <Loader aria-label="Loading cars" m="md" />;
  }

  const selectCar = (carId: string) => {
    if (!activeCars.some((car) => car.carId === carId)) {
      throw new Error(`Unarchived car with id ${carId} not found`);
    }
    setSelectedCarId(carId);
    navigate(generatePath(routes.STINTS, { carId }));
  };

  const changeCar = () => {
    setSelectedCarId(undefined);
    navigate('/');
  };

  return (
    <div className="application-shell">
      {pathname !== '/' && <Header selectedCar={selectedCar} onChangeCar={changeCar} />}
      <Box component="main" p="md" className="application-content">
        <Routes>
          <Route path="/" element={<CarChooser cars={activeCars} onSelectCar={selectCar} />} />
          <Route path={routes.STINTS} element={<Stints />} />
          <Route path={routes.TIRES} element={<Tires />} />
          <Route path={routes.TIRE_tireId} element={<Tire />} />
          <Route path={routes.TRACKS} element={<Tracks />} />
        </Routes>
      </Box>
    </div>
  );
};
