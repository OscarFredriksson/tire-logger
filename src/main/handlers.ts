import { Car, ImportData, PartialValue, Stint, Tire, Track } from '../shared/model';
import { randomUUID } from 'crypto';
import {
  deleteCarId,
  deleteStintId,
  deleteTireId,
  deleteTrackId,
  getAllTableNames,
  getQueryAllTables,
  importDataWithOptions,
  insertCar,
  insertStint,
  insertTire,
  insertTrack,
  queryCars,
  queryStints,
  queryTires,
  queryTracks,
  updateCar,
  updateStint,
  updateTire,
  updateTrack
} from './db';
import { tireSchema } from '../shared/schema/tireSchema';
import { carSchema } from '../shared/schema/carSchema';
import { trackSchema } from '../shared/schema/trackSchema';
import { stintSchema } from '../shared/schema/stintSchema';
import { app, BrowserWindow, dialog } from 'electron';
import fs from 'fs';

const getTracks = (): Track[] => {
  return queryTracks.all();
};

const putTrack = (_, track: PartialValue<Track, 'trackId'>) => {
  console.log('putTrack', track);

  try {
    trackSchema.parse(track);
  } catch (e) {
    console.log('Error validating track', e);
    throw new Error('Validation of track schema failed');
  }

  if (track.trackId) {
    console.log('Updating track', track.trackId);
    updateTrack.run(track.name, track.length, track.trackId);
  } else {
    console.log('Inserting track', track.name);
    insertTrack.run(randomUUID(), track.name, track.length);
  }
};

const deleteTrack = (_, trackId: string) => {
  console.log('Deleting track', trackId);
  deleteTrackId.run(trackId);
};

const putStint = (_, stint: PartialValue<Stint, 'stintId'>) => {
  console.log('putStint', stint);

  try {
    stintSchema.parse(stint);
  } catch (e) {
    console.log('Error validating stint', e);
    throw new Error('Validation of stint schema failed');
  }

  if (stint.stintId) {
    console.log('Updating stint', stint);
    updateStint.run(
      stint.trackId,
      stint.date.toISOString(),
      stint.laps,
      stint.leftFront,
      stint.rightFront,
      stint.leftRear,
      stint.rightRear,
      stint.note,
      stint.stintId
    );
  } else {
    console.log('Inserting stint', stint);
    insertStint.run(
      randomUUID(),
      stint.trackId,
      stint.carId || '1',
      stint.date.toISOString(),
      stint.laps,
      stint.leftFront,
      stint.rightFront,
      stint.leftRear,
      stint.rightRear,
      stint.note
    );
  }
};

const getStints = (_, carId: string) => {
  return queryStints.all(carId).map((stint) => ({
    ...stint,
    date: new Date(stint.date)
  }));
};

const getTires = (_, carId: string) => queryTires.all(carId);

const putTire = (_, tire: PartialValue<Tire, 'tireId'>) => {
  const { tireId, name, carId, allowedLf, allowedRf, allowedLr, allowedRr } = tire;
  console.log('putTire', tire);

  try {
    tireSchema.parse(tire);
  } catch (e) {
    console.log('Error validating tire', e);
    throw new Error('Validation of tire schema failed');
  }

  if (tireId) {
    console.log('Updating tire', tireId);
    updateTire.run(
      name,
      allowedLf ? 1 : 0,
      allowedRf ? 1 : 0,
      allowedLr ? 1 : 0,
      allowedRr ? 1 : 0,
      tireId
    );
  } else {
    console.log('Inserting tire', name);
    insertTire.run(
      randomUUID(),
      name,
      carId,
      allowedLf ? 1 : 0,
      allowedRf ? 1 : 0,
      allowedLr ? 1 : 0,
      allowedRr ? 1 : 0
    );
  }
};

const getCars = () => queryCars.all();

const putCar = (_, car: PartialValue<Car, 'carId'>) => {
  console.log('putCar', car);

  try {
    carSchema.parse(car);
  } catch (e) {
    console.log('Error validating car', e);
    throw new Error('Validation of car schema failed');
  }

  if (car.carId) {
    console.log('Updating car', car.carId);
    updateCar.run(car.name, car.carId);
  } else {
    console.log('Inserting car', car.name);
    insertCar.run(randomUUID(), car.name);
  }
};

const deleteCar = (_, carId: string) => {
  console.log('Deleting car', carId);
  deleteCarId.run(carId);
};

const deleteTire = (_, tireId: string) => {
  console.log('Deleting tire', tireId);
  deleteTireId.run(tireId);
};

const deleteStint = (_, stintId: string) => {
  console.log('Deleting stint', stintId);
  deleteStintId.run(stintId);
};

async function selectImportFile() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (!focusedWindow) return { canceled: true };

  const result = await dialog.showOpenDialog(focusedWindow, {
    title: 'Import Database',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile']
  });
  if (result.canceled || result.filePaths.length === 0) return { canceled: true };
  const filePath = result.filePaths[0];
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return { canceled: false, fileContent };
}

function confirmImport(_, importedData: ImportData) {
  // Validate and import as before
  importDataWithOptions(importedData, { conflictResolution: 'merge' });
  return { success: true };
}

async function exportData() {
  try {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow) return;

    // Show save dialog to let user choose location and filename
    const result = await dialog.showSaveDialog(focusedWindow, {
      title: 'Export Database',
      defaultPath: `tire-logger-export-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    // User cancelled the dialog
    if (result.canceled) {
      return { success: false, message: undefined };
    }

    // Get the selected file path
    const filePath = result.filePath;

    // Export data logic
    const tables = getAllTableNames.all();
    const data = getQueryAllTables([...tables.map((table) => table.name)]);

    // Add metadata to export
    const exportData = {
      exportDate: new Date().toISOString(),
      version: app.getVersion(),
      appName: 'tire-logger',
      data: data
    };

    // Write to the user-selected file
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    console.log(`Data exported successfully to ${filePath}`);

    return { success: true, filePath };
  } catch (error) {
    return { success: false, message: error };
  }
}

export const handlers = [
  // Tracks
  getTracks,
  putTrack,
  deleteTrack,
  // Cars
  getCars,
  putCar,
  deleteCar,
  // Tires
  getTires,
  putTire,
  deleteTire,
  // Stints
  putStint,
  getStints,
  deleteStint,
  // Data Transfer
  selectImportFile,
  confirmImport,
  exportData
];
