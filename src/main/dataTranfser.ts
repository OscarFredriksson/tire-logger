import { SqliteError } from 'better-sqlite3';
import { BrowserWindow, dialog, app } from 'electron';
import { importSchema } from '../shared/schema/importSchema';
import { importDataWithOptions, getAllTableNames, getQueryAllTables } from './db';
import fs from 'fs';
import Zod from 'zod';

export async function importAllData() {
  try {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow) return;

    const importMessage = dialog.showMessageBox(focusedWindow, {
      type: 'info',
      title: 'Import Data',
      message: 'This will merge imported data with existing records',
      detail:
        'Existing tire records may be updated with new information. Consider creating a backup before proceeding.',
      buttons: ['Continue', 'Cancel'],
      defaultId: 0,
      cancelId: 1
    });

    if ((await importMessage).response === 1) {
      return; // User cancelled the import
    }

    // Ensure the focused window is available
    if (!focusedWindow) {
      throw new Error('No focused window found for import operation.');
    }

    // Check if the file system module is available
    if (!fs) {
      throw new Error('File system module is not available.');
    }

    // Show file dialog to select JSON file
    const result = await dialog.showOpenDialog(focusedWindow, {
      title: 'Import Database',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return;
    }

    const filePath = result.filePaths[0];
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const importedData = JSON.parse(fileContent);

    importSchema.parse(importedData);

    // Import the data
    importDataWithOptions(importedData, { conflictResolution: 'merge' });

    // Notify renderer process that import is complete
    focusedWindow.webContents.send('import-complete', {
      success: true,
      message: 'Data imported successfully'
    });
  } catch (error: SqliteError | Error | Zod.ZodError | any) {
    console.error('Import failed:', error);
    const focusedWindow = BrowserWindow.getFocusedWindow();

    if (error instanceof SqliteError) {
      focusedWindow?.webContents.send('import-complete', {
        success: false,
        message: `Import failed: ${error.message}`
      });
      return;
    }

    if (error instanceof Zod.ZodError) {
      focusedWindow?.webContents.send('import-complete', {
        success: false,
        message: `Imort failed: Invalid data format`
      });
      return;
    }

    // General error handling
    focusedWindow?.webContents.send('import-complete', {
      success: false,
      message: `Import failed: ${error.message || error}`
    });

    // Optionally, you can show a dialog to the user
    dialog.showErrorBox(
      'Import Failed',
      `An error occurred during import: ${error.message || error}`
    );
  }
}

export async function exportAllData() {
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
      return;
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

    // Notify renderer process
    const focusedWindow2 = BrowserWindow.getFocusedWindow();
    if (focusedWindow2) {
      focusedWindow2.webContents.send('export-complete', {
        success: true,
        message: `Data exported successfully to ${filePath}`,
        filePath: filePath
      });
    }
  } catch (error) {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send('export-complete', {
        success: false,
        message: `Export failed: ${error}`
      });
    }
  }
}
