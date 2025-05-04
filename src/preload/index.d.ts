import { ElectronAPI } from '@electron-toolkit/preload';
import { Stint, Tire, Track } from '@shared/model';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      // Cars
      getCars: () => Promise<Car[]>;
      putCar: (car: PartialValue<Car, 'carId'>) => void;
      deleteCar: (carId: string) => void;
      // Tires
      getTires: (carId: string) => Promise<Tire[]>;
      putTire: (track: PartialValue<Tire, 'tireId'>) => void;
      // Stints
      getStints: () => Promise<Stint[]>;
      putStint: (stint: PartialValue<Stint, 'stintId'>) => void;
      // Tracks
      getTracks: () => Promise<Track[]>;
      putTrack: (track: PartialValue<Track, 'trackId'>) => void;
      deleteTrack: (trackId: string) => void;
    };
  }
}
