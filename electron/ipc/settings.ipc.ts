import { ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import util from 'node:util';
import { WorkspaceSettings } from '../../src/types/ide';

const execAsync = util.promisify(exec);
const SETTINGS_FILE = path.join(process.env.HOME || '', '.kernelbase-settings.json');

const DEFAULT_SETTINGS: WorkspaceSettings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Fira Code, Menlo, Monaco, monospace',
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  formatOnSave: true,
  defaultShell: process.env.SHELL || (process.platform === 'win32' ? 'wsl.exe' : '/bin/bash'),
  terminalFontSize: 13,
  autoSave: 'afterDelay',
  agentAutoApproveRead: true,
  agentAutoApproveSafeCommands: false,
  activeModelId: 'gemini-2.5-flash',
  models: [
    {
      id: 'gemini-2.5-flash',
      name: 'Google Gemini 2.5 Flash',
      provider: 'google',
      modelId: 'gemini-2.5-flash',
      isActive: true,
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Google Gemini 2.5 Pro',
      provider: 'google',
      modelId: 'gemini-2.5-pro',
      isActive: false,
    },
    {
      id: 'claude-3-7-sonnet',
      name: 'Anthropic Claude 3.7 Sonnet',
      provider: 'anthropic',
      modelId: 'claude-3-7-sonnet-20250219',
      isActive: false,
    },
    {
      id: 'gpt-4o',
      name: 'OpenAI GPT-4o',
      provider: 'openai',
      modelId: 'gpt-4o',
      isActive: false,
    },
    {
      id: 'ollama-deepseek',
      name: 'Ollama DeepSeek-R1 (Local)',
      provider: 'ollama',
      modelId: 'deepseek-r1:8b',
      baseUrl: 'http://localhost:11434',
      isActive: false,
    },
  ],
};

export function registerSettingsIPC() {
  ipcMain.handle('settings:get', async () => {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const data = await fs.promises.readFile(SETTINGS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        return { success: true, settings: { ...DEFAULT_SETTINGS, ...parsed } };
      }
      return { success: true, settings: DEFAULT_SETTINGS };
    } catch {
      return { success: true, settings: DEFAULT_SETTINGS };
    }
  });

  ipcMain.handle('settings:save', async (_, settings: Partial<WorkspaceSettings>) => {
    try {
      let current = DEFAULT_SETTINGS;
      if (fs.existsSync(SETTINGS_FILE)) {
        const data = await fs.promises.readFile(SETTINGS_FILE, 'utf-8');
        current = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
      const updated = { ...current, ...settings };
      await fs.promises.writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      return { success: true, settings: updated };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // macOS Keychain Secure Credential Access
  ipcMain.handle('settings:getSecret', async (_, key: string) => {
    try {
      if (process.platform === 'darwin') {
        const res = await execAsync(`security find-generic-password -s "KernelBaseIDE" -a "${key}" -w`);
        return { success: true, secret: res.stdout.trim() };
      }
      return { success: false, error: 'Keychain not supported on this platform' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('settings:setSecret', async (_, key: string, value: string) => {
    try {
      if (process.platform === 'darwin') {
        // -U updates if exists
        await execAsync(`security add-generic-password -U -s "KernelBaseIDE" -a "${key}" -w "${value}"`);
        return { success: true };
      }
      return { success: false, error: 'Keychain not supported on this platform' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('settings:deleteSecret', async (_, key: string) => {
    try {
      if (process.platform === 'darwin') {
        await execAsync(`security delete-generic-password -s "KernelBaseIDE" -a "${key}"`);
        return { success: true };
      }
      return { success: false, error: 'Keychain not supported on this platform' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
}
