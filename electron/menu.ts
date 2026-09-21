import { Menu, MenuItemConstructorOptions, app, BrowserWindow, dialog } from 'electron';

export function setupNativeMenu(mainWindow: BrowserWindow) {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: 'Kernel Base',
            submenu: [
              {
                label: 'About Kernel Base',
                click: () => {
                  dialog.showMessageBox(mainWindow, {
                    title: 'About Kernel Base IDE',
                    message: 'Kernel Base IDE',
                    detail: 'AI-Native Multi-Agent Development Environment for macOS\nVersion 0.1.0\n© 2026 Kernel Base Team',
                    type: 'info',
                  });
                },
              },
              { type: 'separator' as const },
              {
                label: 'Settings...',
                accelerator: 'CmdOrCtrl+,',
                click: () => mainWindow.webContents.send('menu:action', 'open-settings'),
              },
              {
                label: 'Check for Updates...',
                click: () => mainWindow.webContents.send('menu:action', 'check-updates'),
              },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu:action', 'open-folder'),
        },
        {
          label: 'Open Workspace...',
          click: () => mainWindow.webContents.send('menu:action', 'open-folder'),
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu:action', 'save-file'),
        },
        { type: 'separator' as const },
        {
          label: 'Close Workspace',
          click: () => mainWindow.webContents.send('menu:action', 'close-workspace'),
        },
        { type: 'separator' as const },
        isMac ? { role: 'close' as const } : { role: 'quit' as const },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'selectAll' as const },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Command Palette...',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => mainWindow.webContents.send('menu:action', 'toggle-command-palette'),
        },
        {
          label: 'Quick Open...',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow.webContents.send('menu:action', 'toggle-quick-open'),
        },
        {
          label: 'Global Search...',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => mainWindow.webContents.send('menu:action', 'toggle-search'),
        },
        { type: 'separator' as const },
        {
          label: 'Project Explorer',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => mainWindow.webContents.send('menu:action', 'show-explorer'),
        },
        {
          label: 'AI Agents Panel',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => mainWindow.webContents.send('menu:action', 'show-agents'),
        },
        {
          label: 'Integrated Terminal',
          accelerator: 'CmdOrCtrl+`',
          click: () => mainWindow.webContents.send('menu:action', 'toggle-terminal'),
        },
        {
          label: 'Problems / Diagnostics',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => mainWindow.webContents.send('menu:action', 'show-problems'),
        },
        { type: 'separator' as const },
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
      ],
    },
    {
      label: 'Run',
      submenu: [
        {
          label: 'Run Project',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.webContents.send('menu:action', 'run-project'),
        },
        {
          label: 'Run Tests',
          accelerator: 'CmdOrCtrl+T',
          click: () => mainWindow.webContents.send('menu:action', 'run-tests'),
        },
        {
          label: 'Debug Project',
          click: () => mainWindow.webContents.send('menu:action', 'debug-project'),
        },
      ],
    },
    {
      label: 'Agent',
      submenu: [
        {
          label: 'New AI Task...',
          accelerator: 'CmdOrCtrl+K',
          click: () => mainWindow.webContents.send('menu:action', 'new-agent-task'),
        },
        {
          label: 'Plan Mode',
          click: () => mainWindow.webContents.send('menu:action', 'set-agent-mode-plan'),
        },
        {
          label: 'Build Mode',
          click: () => mainWindow.webContents.send('menu:action', 'set-agent-mode-build'),
        },
        {
          label: 'Review Mode',
          click: () => mainWindow.webContents.send('menu:action', 'set-agent-mode-review'),
        },
        { type: 'separator' as const },
        {
          label: 'Cancel Running Agents',
          accelerator: 'Escape',
          click: () => mainWindow.webContents.send('menu:action', 'cancel-agent'),
        },
      ],
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        ...(isMac
          ? [{ type: 'separator' as const }, { role: 'front' as const }, { type: 'separator' as const }, { role: 'window' as const }]
          : [{ role: 'close' as const }]),
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Kernel Base Documentation',
          click: () => mainWindow.webContents.send('menu:action', 'open-docs'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
