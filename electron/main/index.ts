import { app, BrowserWindow } from 'electron';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

const envPath = resolve(app.getAppPath(), '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
} else if (process.resourcesPath) {
  const resourceEnv = resolve(process.resourcesPath, '.env');
  if (existsSync(resourceEnv)) {
    config({ path: resourceEnv });
  }
}

let mainWindow: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  const { registerIpcHandlers } = await import('./ipc-handlers');

  mainWindow = new BrowserWindow({
    title: 'Zunoora',
    width: 1200,
    height: 800,
    webPreferences: {
      preload: resolve(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  registerIpcHandlers(mainWindow);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(resolve(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
