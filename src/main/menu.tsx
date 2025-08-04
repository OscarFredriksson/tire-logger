import { Menu, app, dialog } from 'electron';
import { exportAllData, importAllData } from './dataTranfser';
import { exportSampleFile, showImportDocumentation } from './documentation';

export function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Import Data',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            importAllData();
          }
        },
        {
          label: 'Export Data',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            exportAllData();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    // Add to your menu template
    {
      label: 'Help',
      submenu: [
        {
          label: 'Import Format Documentation',
          click: () => showImportDocumentation()
        },
        {
          label: 'Export Sample Import File',
          click: () => exportSampleFile()
        },
        {
          label: 'About Tire Logger',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About Tire Logger',
              message: `Tire Logger ${app.getVersion()}`,
              detail: 'A comprehensive tire tracking application for motorsports enthusiasts.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
