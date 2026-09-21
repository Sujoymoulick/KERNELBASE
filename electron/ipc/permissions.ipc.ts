import { ipcMain, BrowserWindow } from 'electron';
import { PermissionRequest } from '../../src/types/ide';

interface PendingRequest {
  request: PermissionRequest;
  resolve: (value: { allowed: boolean; alwaysAllow?: boolean }) => void;
}

const pendingRequests = new Map<string, PendingRequest>();

const defaultPermissionSettings = {
  readFile: 'always',
  writeFile: 'ask',
  runCommand: 'ask',
  deleteFile: 'ask',
  gitCommit: 'ask',
  gitPush: 'ask',
};

let currentPermissionSettings = { ...defaultPermissionSettings };

export function registerPermissionsIPC(mainWindow: BrowserWindow) {
  ipcMain.handle('permissions:respond', async (_, requestId: string, allowed: boolean, alwaysAllow = false) => {
    const pending = pendingRequests.get(requestId);
    if (pending) {
      pending.resolve({ allowed, alwaysAllow });
      pendingRequests.delete(requestId);
      return { success: true };
    }
    return { success: false, error: 'Request not found or timed out' };
  });

  ipcMain.handle('permissions:getSettings', async () => {
    return { success: true, settings: currentPermissionSettings };
  });

  ipcMain.handle('permissions:updateSetting', async (_, key: string, value: string) => {
    if (key in currentPermissionSettings) {
      (currentPermissionSettings as any)[key] = value;
      return { success: true };
    }
    return { success: false, error: 'Invalid setting key' };
  });
}

export async function checkOrRequestPermission(
  mainWindow: BrowserWindow,
  type: keyof typeof defaultPermissionSettings,
  details: {
    toolName: string;
    description: string;
    command?: string;
    filePath?: string;
    operation?: string;
    isDangerous?: boolean;
    diff?: { oldContent: string; newContent: string };
  }
): Promise<boolean> {
  const setting = currentPermissionSettings[type];

  // Dangerous commands always require explicit approval regardless of general settings
  const isDangerous = details.isDangerous || (details.command && (
    details.command.includes('rm -rf') ||
    details.command.includes('sudo') ||
    details.command.includes('dd ') ||
    details.command.includes('mkfs') ||
    details.command.includes('chmod 777')
  ));

  if (setting === 'never') {
    return false;
  }

  if (setting === 'always' && !isDangerous) {
    return true;
  }

  // Request user authorization through UI modal
  const requestId = `perm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const request: PermissionRequest = {
    id: requestId,
    toolName: details.toolName,
    description: details.description,
    details: {
      ...details,
      isDangerous: Boolean(isDangerous),
    },
    createdAt: Date.now(),
  };

  return new Promise<boolean>((resolve) => {
    pendingRequests.set(requestId, {
      request,
      resolve: ({ allowed, alwaysAllow }) => {
        if (alwaysAllow && !isDangerous) {
          currentPermissionSettings[type] = 'always';
        }
        resolve(allowed);
      },
    });

    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('permissions:request', request);
    }
  });
}
