import { ElectronAPI } from '@electron-toolkit/preload';
import { Stint, Tire, Track } from '@shared/model';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      // Tracks
      getTracks: () => Promise<Track[]>;
      putTrack: (track: PartialValue<Track, 'trackId'>) => Promise<void>;
      deleteTrack: (trackId: string) => Promise<void>;
      // Cars
      getCars: () => Promise<Car[]>;
      putCar: (car: PartialValue<Car, 'carId'>) => Promise<void>;
      deleteCar: (carId: string) => Promise<void>;
      // Tires
      getTires: (carId: string) => Promise<Tire[]>;
      putTire: (track: PartialValue<Tire, 'tireId'>) => Promise<void>;
      deleteTire: (tireId: string) => Promise<void>;
      // Stints
      getStints: (carId: string) => Promise<Stint[]>;
      putStint: (stint: PartialValue<Stint, 'stintId'>) => Promise<void>;
      deleteStint: (stintId: string) => Promise<void>;
    };
  }
}
