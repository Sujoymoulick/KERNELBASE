import { Menu, BrowserWindow } from 'electron';

export function setupNativeMenu(mainWindow: BrowserWindow) {
  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);
}
