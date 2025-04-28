import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { PartialValue, Stint, Tire, Track } from '../shared/model';

// Custom APIs for renderer
const api = {
  getTires: (): Promise<any> => ipcRenderer.invoke('getTires'),
  putTire: (track: PartialValue<Tire, 'tireId'>) => ipcRenderer.invoke('putTire', track),
  getTrack: (trackId: string): Promise<any> => ipcRenderer.invoke('getTrack', trackId),
  getTracks: (): Promise<Track[]> => ipcRenderer.invoke('getTracks'),
  getStints: (): Promise<Stint[]> => ipcRenderer.invoke('getStints'),
  getTire: (tireId: string): Promise<Tire> => ipcRenderer.invoke('getTire', tireId),
  putStint: (stint: PartialValue<Stint, 'stintId'>) => ipcRenderer.invoke('putStint', stint),
  putTrack: (track: PartialValue<Track, 'trackId'>) => ipcRenderer.invoke('putTrack', track),
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
