export interface ElectronAPI {
  isElectron: boolean;
  getPlatform: () => string;
  getAppVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<boolean>;
  onShortcutSearch: (callback: () => void) => () => void;
  onNavigateHistory: (callback: (direction: 'back' | 'forward') => void) => () => void;
  onSystemThemeChanged: (callback: (isDark: boolean) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
