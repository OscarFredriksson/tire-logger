import { ElectronAPI } from '@electron-toolkit/preload';
import { Stint, Tire, Track } from '@shared/model';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getTireData: () => Promise<any>;
      saveTireData: (data: any) => Promise<void>;
      getTrack: (trackId: string) => Promise<any>;
      getTracks: () => Promise<Track[]>;
      getStintData: () => Promise<Stint[]>;
      getTire: (tireId: string) => Promise<Tire>;
    };
  }
}
