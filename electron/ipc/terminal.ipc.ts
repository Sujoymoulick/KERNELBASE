import { ipcMain, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'node:child_process';
import os from 'node:os';
import fs from 'node:fs';

interface TerminalSession {
  id: string;
  process: ChildProcess;
  cwd: string;
}

const sessions = new Map<string, TerminalSession>();

export function registerTerminalIPC(mainWindow: BrowserWindow) {
  ipcMain.handle('terminal:create', async (_, options?: { id?: string; cwd?: string; shell?: string }) => {
    const id = options?.id || `term-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const isWin = process.platform === 'win32';
    
    let targetCwd = options?.cwd || process.env.HOME || os.homedir();
    if (!targetCwd || !fs.existsSync(targetCwd)) {
      targetCwd = process.cwd();
    }

    let userShell = options?.shell || process.env.SHELL;
    if (!userShell) {
      if (isWin) {
        if (fs.existsSync('C:\\Windows\\System32\\wsl.exe')) {
          userShell = 'wsl.exe';
        } else if (fs.existsSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe')) {
          userShell = 'powershell.exe';
        } else {
          userShell = process.env.COMSPEC || 'cmd.exe';
        }
      } else {
        userShell = '/bin/bash';
      }
    }

    const spawnArgs: string[] = [];
    if (isWin) {
      if (userShell.includes('powershell')) {
        spawnArgs.push('-NoLogo', '-NoExit');
      } else if (userShell.includes('cmd')) {
        spawnArgs.push('/k');
      }
    } else if (userShell.endsWith('bash') || userShell.endsWith('zsh')) {
      spawnArgs.push('-l');
    }

    try {
      // Spawn interactive shell with piped stdio and interactive prompt environment
      const proc = spawn(userShell, spawnArgs, {
        cwd: targetCwd,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          KERNEL_BASE_IDE: '1',
        },
        shell: isWin ? true : false,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      proc.stdout?.on('data', (data) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('terminal:data', { id, data: data.toString('utf-8') });
        }
      });

      proc.stderr?.on('data', (data) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('terminal:data', { id, data: data.toString('utf-8') });
        }
      });

      proc.on('exit', (code) => {
        sessions.delete(id);
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('terminal:exit', { id, code: code ?? 0 });
        }
      });

      proc.on('error', (err) => {
        console.error(`Terminal process error [${id}]:`, err);
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('terminal:data', { id, data: `\r\nTerminal Error: ${err.message}\r\n` });
        }
      });

      sessions.set(id, { id, process: proc, cwd: targetCwd });

      // Send initial newline to trigger prompt rendering
      setTimeout(() => {
        try {
          proc.stdin?.write('\r\n');
        } catch {}
      }, 150);

      return { success: true, id, cwd: targetCwd, shell: userShell };
    } catch (err: any) {
      console.error('Failed to create terminal session:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('terminal:write', async (_, id: string, data: string) => {
    const session = sessions.get(id);
    if (!session || !session.process.stdin) {
      return { success: false, error: 'Terminal session not found' };
    }
    try {
      session.process.stdin.write(data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('terminal:resize', async (_, _id: string, _cols: number, _rows: number) => {
    // If using pty, call pty.resize(cols, rows)
    return { success: true };
  });

  ipcMain.handle('terminal:kill', async (_, id: string) => {
    const session = sessions.get(id);
    if (!session) return { success: true };
    try {
      session.process.kill();
      sessions.delete(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
}
