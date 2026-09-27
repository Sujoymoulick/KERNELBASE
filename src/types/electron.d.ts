export interface KernelBaseSystemAPI {
  getPlatformInfo: () => Promise<{ platform: string; arch: string; nodeVersion: string }>;
  getVersion: () => Promise<string>;
  showDialog: (options: any) => Promise<any>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized?: () => Promise<boolean>;
}

export interface KernelBaseAPI {
  system: KernelBaseSystemAPI;
  [key: string]: any;
}

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
    kernelBase?: KernelBaseAPI;
  }
}

