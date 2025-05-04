import { ElectronAPI } from '@electron-toolkit/preload';
import { Stint, Tire, Track } from '@shared/model';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      // Tracks
      getTracks: () => Promise<Track[]>;
      putTrack: (track: PartialValue<Track, 'trackId'>) => void;
      deleteTrack: (trackId: string) => void;
      // Cars
      getCars: () => Promise<Car[]>;
      putCar: (car: PartialValue<Car, 'carId'>) => void;
      deleteCar: (carId: string) => void;
      // Tires
      getTires: (carId: string) => Promise<Tire[]>;
      putTire: (track: PartialValue<Tire, 'tireId'>) => void;
      deleteTire: (tireId: string) => void;
      // Stints
      getStints: (carId: string) => Promise<Stint[]>;
      putStint: (stint: PartialValue<Stint, 'stintId'>) => void;
      deleteStint: (stintId: string) => void;
    };
  }
}
