import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getTireData: () => Promise<any>;
      saveTireData: (data: any) => Promise<void>;
      getTrack: (trackId: string) => Promise<any>;
    };
  }
}
