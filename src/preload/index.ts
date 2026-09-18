import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Car, PartialValue, Stint, Tire, Track } from '../shared/model';

export type TireLoggerAPI = typeof api;

// Custom APIs for renderer
const api = {
  //Tracks
  getTracks: (archived: boolean): Promise<Track[]> => ipcRenderer.invoke('getTracks', archived),
  putTrack: (track: PartialValue<Track, 'trackId'>) => ipcRenderer.invoke('putTrack', track),
  deleteTrack: (trackId: string) => ipcRenderer.invoke('deleteTrack', trackId),
  archiveTrack: (trackId: string) => ipcRenderer.invoke('archiveTrack', trackId),
  restoreTrack: (trackId: string) => ipcRenderer.invoke('restoreTrack', trackId),
  // Cars
  getCars: (archived: boolean): Promise<Car[]> => ipcRenderer.invoke('getCars', archived),
  putCar: (car: PartialValue<Car, 'carId'>) => ipcRenderer.invoke('putCar', car),
  deleteCar: (carId: string) => ipcRenderer.invoke('deleteCar', carId),
  archiveCar: (carId: string, archiveRelated: boolean) =>
    ipcRenderer.invoke('archiveCar', carId, archiveRelated),
  restoreCar: (carId: string) => ipcRenderer.invoke('restoreCar', carId),
  // Tires
  getTires: (carId: string, archive: boolean): Promise<Tire[]> =>
    ipcRenderer.invoke('getTires', carId, archive),
  putTire: (tire: PartialValue<Tire, 'tireId'>) => ipcRenderer.invoke('putTire', tire),
  deleteTire: (tireId: string) => ipcRenderer.invoke('deleteTire', tireId),
  archiveTire: (tireId: string) => ipcRenderer.invoke('archiveTire', tireId),
  restoreTire: (tireId: string) => ipcRenderer.invoke('restoreTire', tireId),
  // Stints
  getStints: (carId: string, archived: boolean): Promise<Stint[]> =>
    ipcRenderer.invoke('getStints', carId, archived),
  putStint: (stint: PartialValue<Stint, 'stintId'>) => ipcRenderer.invoke('putStint', stint),
  deleteStint: (stintId: string) => ipcRenderer.invoke('deleteStint', stintId),
  archiveStint: (stintId: string) => ipcRenderer.invoke('archiveStint', stintId),
  restoreStint: (stintId: string) => ipcRenderer.invoke('restoreStint', stintId)
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
