import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Car, PartialValue, Stint, Tire, Track } from '../shared/model';

export type TireLoggerAPI = typeof api;

// Custom APIs for renderer
const api = {
  //Tracks
  getTracks: (): Promise<Track[]> => ipcRenderer.invoke('getTracks'),
  putTrack: (track: PartialValue<Track, 'trackId'>) => ipcRenderer.invoke('putTrack', track),
  deleteTrack: (trackId: string) => ipcRenderer.invoke('deleteTrack', trackId),
  // Cars
  getCars: (): Promise<any> => ipcRenderer.invoke('getCars'),
  putCar: (car: PartialValue<Car, 'carId'>) => ipcRenderer.invoke('putCar', car),
  deleteCar: (carId: string) => ipcRenderer.invoke('deleteCar', carId),
  // Tires
  getTires: (carId: string): Promise<any> => ipcRenderer.invoke('getTires', carId),
  putTire: (tire: PartialValue<Tire, 'tireId'>) => ipcRenderer.invoke('putTire', tire),
  deleteTire: (tireId: string) => ipcRenderer.invoke('deleteTire', tireId),
  // Stints
  getStints: (carId: string): Promise<Stint[]> => ipcRenderer.invoke('getStints', carId),
  putStint: (stint: PartialValue<Stint, 'stintId'>) => ipcRenderer.invoke('putStint', stint),
  deleteStint: (stintId: string) => ipcRenderer.invoke('deleteStint', stintId)
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
