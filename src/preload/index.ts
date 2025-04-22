import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Stint, Tire, Track } from '../shared/model';

// Custom APIs for renderer
const api = {
  getTires: (): Promise<any> => ipcRenderer.invoke('getTires'),
  saveTireData: (data: any) => ipcRenderer.invoke('saveTireData', data),
  getTrack: (trackId: string): Promise<any> => ipcRenderer.invoke('getTrack', trackId),
  getTracks: (): Promise<Track[]> => ipcRenderer.invoke('getTracks'),
  getStintData: (): Promise<Stint[]> => ipcRenderer.invoke('getStintData'),
  getTire: (tireId: string): Promise<Tire> => ipcRenderer.invoke('getTire', tireId),
  putTrack: (track: Partial<Track>) => ipcRenderer.invoke('putTrack', track),
  deleteTrack: (trackId: string) => ipcRenderer.invoke('deleteTrack', trackId)
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
