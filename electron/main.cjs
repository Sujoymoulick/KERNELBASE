const { app, BrowserWindow, Menu, shell, ipcMain, nativeTheme, dialog } = require('electron');
const path = require('path');

// Set application name
app.name = 'Kernel Base Docs';

let mainWindow = null;

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

// Disable GPU hardware acceleration and DBus warnings in WSL / Linux VM environments
const isWSL = Boolean(process.env.WSL_DISTRO_NAME) || Boolean(process.env.WSL_INTEROP);
if (isWSL || process.platform === 'linux') {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-gpu-compositing');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  app.commandLine.appendSwitch('password-store', 'basic');
}

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function isValidExternalUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac
      ? [
          {
            label: 'Kernel Base Docs',
            submenu: [
              {
                label: 'About Kernel Base Docs',
                click: () => {
                  dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'About Kernel Base Docs',
                    message: `Kernel Base Docs v${app.getVersion()}`,
                    detail:
                      'AI-Native Multi-Agent IDE Documentation\nProduction Architecture, Research, and Implementation Guidelines.\n\nCopyright © 2026 Kernel Base Team. All rights reserved.',
                    buttons: ['OK'],
                    icon: path.join(__dirname, '../build/icon.png'),
                  });
                },
              },
              { type: 'separator' },
              {
                label: 'Search Documentation',
                accelerator: 'CmdOrCtrl+F',
                click: () => {
                  if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('action:search');
                  }
                },
              },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        ...(app.isPackaged ? [] : [{ role: 'toggleDevTools' }]),
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'History',
      submenu: [
        {
          label: 'Back',
          accelerator: 'CmdOrCtrl+[',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('action:navigate-history', 'back');
            }
          },
        },
        {
          label: 'Forward',
          accelerator: 'CmdOrCtrl+]',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('action:navigate-history', 'forward');
            }
          },
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' },
            ]
          : [{ role: 'close' }]),
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Kernel Base Documentation Online',
          click: async () => {
            await shell.openExternal('https://kernelbasedocs-zeta.vercel.app/');
          },
        },
        {
          label: 'GitHub Repository',
          click: async () => {
            await shell.openExternal('https://github.com/Sujoymoulick/kernelbase-docs');
          },
        },
        {
          label: 'System Architecture',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.executeJavaScript(
                `window.location.hash = 'architecture/overview';`
              );
            }
          },
        },
        {
          label: 'Agent Flow & Autonomy',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.executeJavaScript(
                `window.location.hash = 'agents/overview';`
              );
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Kernel Base Docs',
    width: 1380,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: '#090D16',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
    },
  });

  // Intercept new window requests (target="_blank", window.open) and open in external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isValidExternalUrl(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Intercept navigation requests to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Allow local file navigation or hash change
    if (url.startsWith('file://')) {
      return;
    }
    event.preventDefault();
    if (isValidExternalUrl(url)) {
      shell.openExternal(url);
    }
  });

  // Load entry point
  const indexPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(indexPath).catch((err) => {
    console.error('Failed to load dist/index.html:', err);
  });

  // Smooth appearance
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('shell:open-external', async (_event, url) => {
  if (typeof url === 'string' && isValidExternalUrl(url)) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

// App lifecycle
app.whenReady().then(() => {
  createApplicationMenu();
  createWindow();

  // Listen for macOS native theme changes
  nativeTheme.on('updated', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('theme:system-changed', nativeTheme.shouldUseDarkColors);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
