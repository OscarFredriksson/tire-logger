import { BrowserWindow, dialog, app } from 'electron';
import { importDataWithOptions, getAllTableNames, getQueryAllTables } from './db';
import fs from 'fs';
import { ipcMain } from 'electron';

// In dataTransfer.ts

ipcMain.handle('select-import-file', async () => {
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
});

ipcMain.handle('confirm-import', async (_event, importedData) => {
  // Validate and import as before
  importDataWithOptions(importedData, { conflictResolution: 'merge' });
  return { success: true };
});

ipcMain.handle('export-data', async () => {
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
});
