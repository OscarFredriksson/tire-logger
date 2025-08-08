import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { handlers } from './handlers';

// autoUpdater.logger = log;
// autoUpdater.checkForUpdatesAndNotify().then((updateCheckResult) => {
//   log.info('Update check result:', updateCheckResult);
// });

// autoUpdater.on('update-available', () => {
//   dialog
//     .showMessageBox({
//       title: 'Install Update',
//       message: 'A new version is available. Do you want to install it now?'
//     })
//     .then(() => {
//       setImmediate(() => autoUpdater.quitAndInstall());
//     });
// });

function createWindow(): void {
  const splash = new BrowserWindow({
    icon,
    transparent: true,
    frame: false,
    height: 300,
    width: 500,
    webPreferences: {
      preload: join(__dirname, '../preload/splash.js'),
      sandbox: false
    }
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    splash.loadURL(process.env.ELECTRON_RENDERER_URL + '/splash.html');
  } else {
    splash.loadFile(join(__dirname, '../renderer/splash.html'));
  }
  splash.center();

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    if (is.dev) splash.hide();
    else splash.close();
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL + '/index.html');
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // TODO: There is probably a more elegant way to set this up
  handlers.forEach((handler) => ipcMain.handle(handler.name, handler));

  createWindow();
});

app.on('window-all-closed', () => app.quit());
