import { Car, PartialValue, Stint, Tire, Track } from '../shared/model';
import { randomUUID } from 'crypto';
import {
  deleteCarId,
  deleteTrackId,
  insertCar,
  insertStint,
  insertTire,
  insertTrack,
  queryCars,
  queryStints,
  queryTires,
  queryTracks,
  updateCar,
  updateStint,
  updateTire,
  updateTrack
} from './db';

// TODO: delete stint

const getTracks = (): Track[] => {
  return queryTracks.all();
};

const putTrack = (_, track: PartialValue<Track, 'trackId'>) => {
  console.log('putTrack', track);

  if (track.trackId) {
    console.log('Updating track', track.trackId);
    updateTrack.run(track.name, track.length, track.trackId);
  } else {
    console.log('Inserting track', track.name);
    insertTrack.run(randomUUID(), track.name, track.length);
  }
};

const deleteTrack = (_, trackId: string) => {
  console.log('Deleting track', trackId);
  deleteTrackId.run(trackId);
};

const putStint = (_, stint: PartialValue<Stint, 'stintId'>) => {
  if (stint.stintId) {
    console.log('Updating stint', stint);
    updateStint.run(
      stint.trackId,
      stint.date.toISOString(),
      stint.laps,
      stint.leftFront,
      stint.rightFront,
      stint.leftRear,
      stint.rightRear,
      stint.note,
      stint.stintId
    );
  } else {
    console.log('Inserting stint', stint);
    insertStint.run(
      randomUUID(),
      stint.trackId,
      stint.carId || '1',
      stint.date.toISOString(),
      stint.laps,
      stint.leftFront,
      stint.rightFront,
      stint.leftRear,
      stint.rightRear,
      stint.note
    );
  }
};

const getStints = () => {
  return queryStints.all().map((stint) => ({
    ...stint,
    date: new Date(stint.date)
  }));
};

const getTires = (_, carId: string) => {
  console.log('getTires', carId);
  const tires = queryTires.all();
  console.log('Tires', tires);
  return tires;
};

const putTire = (_, tire: PartialValue<Tire, 'tireId'>) => {
  console.log('putTire', tire);

  if (tire.tireId) {
    console.log('Updating tire', tire.tireId);
    updateTire.run(
      tire.name,
      tire.allowedLf ? 1 : 0,
      tire.allowedRf ? 1 : 0,
      tire.allowedLr ? 1 : 0,
      tire.allowedRr ? 1 : 0,
      tire.tireId
    );
  } else {
    console.log('Inserting tire', tire.name);
    insertTire.run(
      randomUUID(),
      tire.name,
      tire.carId,
      tire.allowedLf ? 1 : 0, // TODO: generalize this convertion
      tire.allowedRf ? 1 : 0,
      tire.allowedLr ? 1 : 0,
      tire.allowedRr ? 1 : 0
    );
  }
};

const getCars = () => {
  return queryCars.all();
};
const putCar = (_, car: PartialValue<Car, 'carId'>) => {
  console.log('putCar', car);

  if (car.carId) {
    console.log('Updating car', car.carId);
    updateCar.run(car.name, car.carId);
  } else {
    console.log('Inserting car', car.name);
    insertCar.run(randomUUID(), car.name);
  }
};

const deleteCar = (_, carId: string) => {
  console.log('Deleting car', carId);
  deleteCarId.run(carId);
};

export const handlers = [
  getCars,
  putCar,
  deleteCar,
  getTires,
  putTire,
  putStint,
  getStints,
  getTracks,
  putTrack,
  deleteTrack
];
