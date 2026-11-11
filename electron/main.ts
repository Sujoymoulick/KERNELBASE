import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerFsIPC } from './ipc/fs.ipc';
import { registerTerminalIPC, killAllTerminals } from './ipc/terminal.ipc';
import { registerGitIPC } from './ipc/git.ipc';
import { registerPermissionsIPC } from './ipc/permissions.ipc';
import { registerToolsIPC } from './ipc/tools.ipc';
import { registerAgentsIPC } from './ipc/agents.ipc';
import { registerCliIPC } from './ipc/cli.ipc';
import { registerWorkspaceIPC } from './ipc/workspace.ipc';
import { registerSettingsIPC } from './ipc/settings.ipc';
import { registerIndexingIPC } from './ipc/indexing.ipc';
import { registerRunIPC } from './ipc/run.ipc';
import { registerExtensionsIPC } from './ipc/extensions.ipc';
import { registerStudioIPC, hydrateShellPath, killAllStudioAgents } from './ipc/studio.ipc';
import { registerProjectIPC } from './ipc/project.ipc';
import { registerResourcesIPC } from './ipc/resources.ipc';
import { registerKernelIPC, killKernel } from './ipc/kernel.ipc';
import { setupNativeMenu } from './menu';

// __dirname is provided globally in CommonJS build

// Disable GPU hardware acceleration issues in some VMs/environments if needed
app.commandLine.appendSwitch('enable-features', 'Metal');
app.commandLine.appendSwitch('allow-file-access-from-files');

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#1f1f1f',
    title: 'Kernel Base',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: false,
    },
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] ${message} (${sourceId}:${line})`);
  });
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Load Error] ${errorCode}: ${errorDescription} at ${validatedURL}`);
  });

  // Shortcut to toggle DevTools: Command+Option+I
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.meta && input.alt && input.key.toLowerCase() === 'i') {
      mainWindow?.webContents.toggleDevTools();
      event.preventDefault();
    }
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
  registerRunIPC(mainWindow);
  registerExtensionsIPC(mainWindow);
  registerStudioIPC(mainWindow);
  registerProjectIPC(mainWindow);
  registerResourcesIPC(mainWindow);
  registerKernelIPC(mainWindow);

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

  // macOS: closing the window hides it so IPC handlers stay bound to one window.
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin' && !isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await hydrateShellPath();
  createWindow();

  app.on('activate', () => {
    if (mainWindow) {
      mainWindow.show();
    } else if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  killAllStudioAgents();
  killKernel();
  killAllTerminals();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Never leave agy sessions or the mic helper running if the app is killed
process.on('exit', () => {
  killKernel();
  killAllStudioAgents();
});
process.on('SIGTERM', () => {
  killKernel();
  killAllStudioAgents();
  app.quit();
});

process.on('uncaughtException', (error) => {
  console.error('Kernel Base Main Process Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Kernel Base Main Process Unhandled Rejection:', reason);
});
