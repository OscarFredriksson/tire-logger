import { ElectronAPI } from '@electron-toolkit/preload';
import { Stint, Tire, Track } from '@shared/model';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      // Tires
      getTires: () => Promise<Tire[]>;
      putTire: (track: PartialValue<Tire, 'tireId'>) => void;
      // Stints
      getStintData: () => Promise<Stint[]>;
      putStint: (stint: PartialValue<Stint, 'stintId'>) => void;
      // Tracks
      getTracks: () => Promise<Track[]>;
      putTrack: (track: PartialValue<Track, 'trackId'>) => void;
      deleteTrack: (trackId: string) => void;
    };
  }
}
