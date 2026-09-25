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

// Supported platforms: Linux (native / WSLg) and Windows host (WSL integration)
const isSupportedPlatform = process.platform === 'linux' || process.platform === 'win32';

if (!isSupportedPlatform) {
  console.error(`Kernel Base is a Linux and WSL application and cannot run on platform "${process.platform}".`);
  app.whenReady().then(() => {
    dialog.showErrorBox(
      'Platform Not Supported',
      `Kernel Base is designed for Linux and WSL (Windows Subsystem for Linux) environments. Current platform (${process.platform}) is not supported.`
    );
    app.quit();
  });
}

// Disable GPU hardware acceleration, DBus warnings, and AT-SPI bridge in WSL / Linux environments
process.env.NO_AT_BRIDGE = '1';

const isWSL = Boolean(process.env.WSL_DISTRO_NAME) || Boolean(process.env.WSL_INTEROP);
if (isWSL || process.platform === 'linux') {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-gpu-sandbox');
  app.commandLine.appendSwitch('disable-gpu-compositing');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  app.commandLine.appendSwitch('disable-dev-shm-usage');
  app.commandLine.appendSwitch('password-store', 'basic');
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-features', 'UseDBus,AudioServiceOutOfProcess,OzoneWayland');

  if (!process.env.DBUS_SESSION_BUS_ADDRESS) {
    process.env.DBUS_SESSION_BUS_ADDRESS = 'disabled:';
  }
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0c0a09',
    title: 'Kernel Base',
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
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
  const devUrl = process.env.VITE_DEV_SERVER_URL || (!app.isPackaged ? 'http://localhost:3000' : null);
  if (devUrl) {
    const loadDev = () => {
      mainWindow?.loadURL(devUrl).catch(() => {
        setTimeout(loadDev, 1000);
      });
    };
    loadDev();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Log renderer console messages to main terminal
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (!isSupportedPlatform) {
    return;
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

process.on('uncaughtException', (error) => {
  console.error('Kernel Base Main Process Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Kernel Base Main Process Unhandled Rejection:', reason);
});
