import { ElectronAPI } from '@electron-toolkit/preload';
import { TireLoggerAPI } from './index';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: TireLoggerAPI;
  }
}
