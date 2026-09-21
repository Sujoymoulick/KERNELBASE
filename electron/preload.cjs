const { contextBridge, ipcRenderer } = require('electron');

/**
 * Safe Preload Script for Kernel Base Docs
 * Context Isolation: ENABLED
 * Node Integration: DISABLED
 * Sandbox: ENABLED
 */
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getPlatform: () => process.platform,
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
  onShortcutSearch: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('action:search', handler);
    return () => ipcRenderer.removeListener('action:search', handler);
  },
  onNavigateHistory: (callback) => {
    const handler = (_event, direction) => callback(direction);
    ipcRenderer.on('action:navigate-history', handler);
    return () => ipcRenderer.removeListener('action:navigate-history', handler);
  },
  onSystemThemeChanged: (callback) => {
    const handler = (_event, isDark) => callback(isDark);
    ipcRenderer.on('theme:system-changed', handler);
    return () => ipcRenderer.removeListener('theme:system-changed', handler);
  },
});
