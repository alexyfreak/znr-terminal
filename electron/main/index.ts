import { app, BrowserWindow, Menu } from 'electron'
import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { registerGlobalErrorHandlers } from './errors'

registerGlobalErrorHandlers()

const envPath = resolve(__dirname, '..', '..', '.env')
if (existsSync(envPath)) {
  config({ path: envPath })
}

let mainWindow: BrowserWindow | null = null

async function createWindow(): Promise<void> {
  const { registerIpcHandlers } = await import('./ipc-handlers')

  Menu.setApplicationMenu(null)

  mainWindow = new BrowserWindow({
    title: 'Zunoora',
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: resolve(app.getAppPath(), 'logo.jpg'),
    webPreferences: {
      preload: resolve(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  registerIpcHandlers(mainWindow)

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools() // Open DevTools in dev mode
  } else {
    mainWindow.loadFile(resolve(__dirname, '../renderer/index.html'))
  }

  // Allow opening DevTools with Ctrl+Shift+I or F12
  const mw = mainWindow!
  mw.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      mw.webContents.toggleDevTools()
      event.preventDefault()
    }
    if (input.key === 'F12') {
      mw.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
