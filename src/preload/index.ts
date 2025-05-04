import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Car, PartialValue, Stint, Tire, Track } from '../shared/model';

// Custom APIs for renderer
const api = {
  getCars: (): Promise<any> => ipcRenderer.invoke('getCars'),
  putCar: (car: PartialValue<Car, 'carId'>) => ipcRenderer.invoke('putCar', car),
  deleteCar: (carId: string) => ipcRenderer.invoke('deleteCar', carId),
  getTires: (carId: string): Promise<any> => ipcRenderer.invoke('getTires', carId),
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
