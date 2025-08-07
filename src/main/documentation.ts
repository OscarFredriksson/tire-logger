import { dialog } from 'electron';
import fs from 'fs';

export function showImportDocumentation() {
  const documentation = `
TIRE LOGGER - IMPORT FORMAT DOCUMENTATION

Required File Format: JSON

Basic Structure:
{
  "exportDate": "2024-08-04T10:30:00Z" (optional),
  "version": "1.0.0" (optional),
  "appName": "tire-logger" (optional),
  "data": {
    "cars": [...],
    "tires": [...],
    "tracks": [...],
    "stints": [...]
  }
}

CARS FORMAT:
{
  "id": "unique-string-id" (optional),
  "name": "Car Name" (required),
  "make": "Toyota" (optional),
  "model": "Corolla" (optional),
  "year": 2023 (optional)
}

TIRES FORMAT:
{
  "id": "unique-string-id" (optional),
  "carId": "reference-to-car-id" (optional),
  "brand": "Michelin" (optional),
  "model": "Pilot Sport" (optional),
  "size": "225/40R18" (optional),
  "position": "front-left" (optional: front-left, front-right, rear-left, rear-right)
}

TRACKS FORMAT:
{
  "id": "unique-string-id" (optional),
  "name": "Track Name" (required),
  "location": "City, Country" (optional),
  "length": 2.5 (optional, in km)
}

STINTS FORMAT:
{
  "id": "unique-string-id" (optional),
  "date": "2024-08-04" (optional),
  "carId": "reference-to-car-id" (optional),
  "trackId": "reference-to-track-id" (optional),
  "duration": 1800 (optional, in seconds)
}

Notes:
• All arrays can be empty []
• All fields marked as optional can be omitted
• Additional fields are preserved during import
• Existing data will be merged with imported data
  `;

  dialog
    .showMessageBox({
      type: 'info',
      title: 'Import Documentation',
      message: 'Tire Logger Import Format',
      detail: documentation,
      buttons: ['OK', 'Export Sample File'],
      defaultId: 0
    })
    .then((result) => {
      if (result.response === 1) {
        exportSampleFile();
      }
    });
}

export async function exportSampleFile() {
  const sampleData = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    appName: 'tire-logger',
    data: {
      cars: [
        {
          id: 'car-1',
          name: 'My Car',
          make: 'Toyota',
          model: 'Corolla',
          year: 2023
        }
      ],
      tires: [
        {
          id: 'tire-1',
          carId: 'car-1',
          brand: 'Michelin',
          model: 'Pilot Sport 4',
          size: '225/40R18',
          position: 'front-left'
        }
      ],
      tracks: [
        {
          id: 'track-1',
          name: 'Silverstone Circuit',
          location: 'Silverstone, UK',
          length: 5.891
        }
      ],
      stints: [
        {
          id: 'stint-1',
          date: '2024-08-04',
          carId: 'car-1',
          trackId: 'track-1',
          duration: 1800
        }
      ]
    }
  };

  try {
    const result = await dialog.showSaveDialog({
      title: 'Export Sample Import File',
      defaultPath: 'tire-logger-sample.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, JSON.stringify(sampleData, null, 2));

      dialog.showMessageBox({
        type: 'info',
        title: 'Sample File Created',
        message: `Sample import file created at:\n${result.filePath}`,
        buttons: ['OK']
      });
    }
  } catch (error) {
    dialog.showErrorBox('Error', `Failed to create sample file: ${error}`);
  }
}
