import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerFsIPC } from './ipc/fs.ipc';
import { registerTerminalIPC } from './ipc/terminal.ipc';
import { registerGitIPC } from './ipc/git.ipc';
import { registerPermissionsIPC } from './ipc/permissions.ipc';
import { registerToolsIPC } from './ipc/tools.ipc';
import { registerAgentsIPC } from './ipc/agents.ipc';
import { registerCliIPC } from './ipc/cli.ipc';
import { registerWorkspaceIPC } from './ipc/workspace.ipc';
import { registerSettingsIPC } from './ipc/settings.ipc';
import { registerIndexingIPC } from './ipc/indexing.ipc';
import { setupNativeMenu } from './menu';

// __dirname is provided globally in CommonJS build

// Disable GPU hardware acceleration issues in some VMs/environments if needed
app.commandLine.appendSwitch('enable-features', 'Metal');

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0c0a09',
    title: 'Kernel Base',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    },
  });

  // Register All IPC Modules
  registerFsIPC();
  registerTerminalIPC(mainWindow);
  registerGitIPC();
  registerPermissionsIPC(mainWindow);
  registerToolsIPC(mainWindow);
  registerAgentsIPC(mainWindow);
  registerCliIPC(mainWindow);
  registerWorkspaceIPC(mainWindow);
  registerSettingsIPC();
  registerIndexingIPC();

  // Window controls
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.handle('window:close', () => mainWindow?.close());
  ipcMain.handle('system:getPlatformInfo', () => ({
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
  }));
  ipcMain.handle('system:getVersion', () => app.getVersion());
  ipcMain.handle('system:showDialog', async (_, options) => dialog.showMessageBox(mainWindow!, options));

  // Native Menu
  setupNativeMenu(mainWindow);

  // Load URL or File
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
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

process.on('uncaughtException', (error) => {
  console.error('Kernel Base Main Process Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Kernel Base Main Process Unhandled Rejection:', reason);
});
