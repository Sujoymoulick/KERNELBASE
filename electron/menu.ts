import { Menu, MenuItemConstructorOptions, app, BrowserWindow, dialog, shell } from 'electron';

/**
 * Native menu bar. Every custom item sends `menu:action` with an id that the
 * renderer's command registry (src/workbench/commands.ts) handles.
 */
export function setupNativeMenu(mainWindow: BrowserWindow) {
  const isMac = process.platform === 'darwin';
  const act = (id: string) => () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.webContents.send('menu:action', id);
    }
  };
  const item = (label: string, id: string, accelerator?: string): MenuItemConstructorOptions => ({
    label,
    accelerator,
    click: act(id),
  });
  const sep: MenuItemConstructorOptions = { type: 'separator' };

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: 'Kernel Base',
            submenu: [
              {
                label: 'About Kernel Base',
                click: () =>
                  dialog.showMessageBox(mainWindow, {
                    title: 'About Kernel Base',
                    message: 'Kernel Base',
                    detail: `Code editor with parallel agents\nVersion ${app.getVersion()}`,
                    type: 'info',
                  }),
              },
              sep,
              item('Settings…', 'settings.open', 'CmdOrCtrl+,'),
              item('Color Theme: Toggle Dark / Light', 'theme.toggle'),
              sep,
              { role: 'services' as const },
              sep,
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              sep,
              { role: 'quit' as const },
            ] as MenuItemConstructorOptions[],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        item('New Text File', 'file.new', 'CmdOrCtrl+N'),
        sep,
        item('Open File…', 'file.open', 'CmdOrCtrl+O'),
        item('Open Folder…', 'folder.open', 'CmdOrCtrl+Shift+O'),
        sep,
        item('Save', 'file.save', 'CmdOrCtrl+S'),
        item('Save As…', 'file.saveAs', 'CmdOrCtrl+Shift+S'),
        item('Save All', 'file.saveAll', 'CmdOrCtrl+Alt+S'),
        sep,
        item('Reveal Active File in Finder', 'file.reveal'),
        sep,
        item('Close Editor', 'editor.close', 'CmdOrCtrl+W'),
        item('Close Folder', 'folder.close'),
        ...(isMac ? [] : [sep, { role: 'quit' as const }]),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        item('Undo', 'edit.undo', 'CmdOrCtrl+Z'),
        item('Redo', 'edit.redo', 'CmdOrCtrl+Shift+Z'),
        sep,
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        sep,
        item('Find', 'editor.find', 'CmdOrCtrl+F'),
        item('Replace', 'editor.replace', 'CmdOrCtrl+Alt+F'),
        sep,
        item('Find in Files', 'view.search', 'CmdOrCtrl+Shift+F'),
      ],
    },
    {
      label: 'Selection',
      submenu: [
        item('Select All', 'edit.selectAll', 'CmdOrCtrl+A'),
        item('Expand Selection', 'editor.expandSelection', 'Ctrl+Shift+Right'),
        sep,
        item('Copy Line Down', 'editor.copyLineDown', 'Alt+Shift+Down'),
        item('Move Line Up', 'editor.moveLineUp', 'Alt+Up'),
        item('Move Line Down', 'editor.moveLineDown', 'Alt+Down'),
        sep,
        item('Toggle Line Comment', 'editor.comment', 'CmdOrCtrl+/'),
      ],
    },
    {
      label: 'View',
      submenu: [
        item('Command Palette…', 'palette.open', 'CmdOrCtrl+Shift+P'),
        item('Go to File…', 'quickOpen.open', 'CmdOrCtrl+P'),
        sep,
        item('Explorer', 'view.explorer', 'CmdOrCtrl+Shift+E'),
        item('Search', 'view.search'),
        item('Source Control', 'view.scm', 'Ctrl+Shift+G'),
        item('Run and Debug', 'view.run', 'CmdOrCtrl+Shift+D'),
        item('Extensions', 'view.extensions', 'CmdOrCtrl+Shift+X'),
        item('Agent Studio', 'view.studio', 'CmdOrCtrl+Shift+L'),
        sep,
        item('Problems', 'panel.problems', 'CmdOrCtrl+Shift+M'),
        item('Output', 'panel.output', 'CmdOrCtrl+Shift+U'),
        item('Terminal', 'panel.terminal', 'Ctrl+`'),
        sep,
        item('Toggle Primary Side Bar', 'layout.sidebar', 'CmdOrCtrl+B'),
        item('Toggle Panel', 'layout.panel', 'CmdOrCtrl+J'),
        item('Toggle Secondary Side Bar', 'layout.studio', 'CmdOrCtrl+Alt+B'),
        sep,
        item('Toggle Dark / Light Theme', 'theme.toggle'),
        sep,
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        sep,
        { role: 'togglefullscreen' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Go',
      submenu: [
        item('Go to File…', 'quickOpen.open'),
        item('Go to Line…', 'editor.gotoLine', 'Ctrl+G'),
        sep,
        item('Next Editor', 'editor.next', 'CmdOrCtrl+Alt+Right'),
        item('Previous Editor', 'editor.prev', 'CmdOrCtrl+Alt+Left'),
      ],
    },
    {
      label: 'Run',
      submenu: [
        item('Run Active File', 'run.file', 'CmdOrCtrl+R'),
        item('Run Project', 'run.project', 'F5'),
        item('Build Project', 'run.build', 'CmdOrCtrl+Shift+B'),
        item('Run Tests', 'run.test'),
        sep,
        item('Stop', 'run.stop', 'Shift+F5'),
      ],
    },
    {
      label: 'Terminal',
      submenu: [
        item('New Terminal', 'terminal.new', 'Ctrl+Shift+`'),
        item('Kill Terminal', 'terminal.kill'),
        item('Clear Terminal', 'terminal.clear', 'CmdOrCtrl+K'),
        sep,
        item('Run Active File in Terminal', 'run.fileInTerminal'),
      ],
    },
    {
      label: 'Agents',
      submenu: [
        item('Open Agent Studio', 'view.studio'),
        item('New Agent Run…', 'agents.new', 'CmdOrCtrl+Shift+I'),
        item('Stop All Agents', 'agents.stopAll'),
        sep,
        item('Add Document to Resources…', 'resources.add'),
        item('Show Resources Rack', 'resources.show'),
        sep,
        item('Detect AI CLIs', 'agents.detect'),
      ],
    },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        item('Welcome', 'help.welcome'),
        item('Keyboard Shortcuts', 'palette.open'),
        sep,
        { label: 'Kernel Base Documentation', click: () => shell.openExternal('https://kernelbasedocs-zeta.vercel.app/') },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
