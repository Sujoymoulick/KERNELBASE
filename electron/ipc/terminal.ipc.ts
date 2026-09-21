import { ipcMain, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'node:child_process';
import os from 'node:os';

interface TerminalSession {
  id: string;
  process: ChildProcess;
  cwd: string;
}

const sessions = new Map<string, TerminalSession>();

export function registerTerminalIPC(mainWindow: BrowserWindow) {
  ipcMain.handle('terminal:create', async (_, options?: { id?: string; cwd?: string; shell?: string }) => {
    const id = options?.id || `term-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const cwd = options?.cwd || process.env.HOME || os.homedir();
    const userShell = options?.shell || process.env.SHELL || '/bin/zsh';

    try {
      // Spawn interactive shell with piped stdio and interactive prompt environment
      const proc = spawn(userShell, ['-l'], {
        cwd,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          KERNEL_BASE_IDE: '1',
        },
        shell: false,
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

      sessions.set(id, { id, process: proc, cwd });

      // Send initial clear or newline to trigger prompt
      setTimeout(() => {
        proc.stdin?.write('\n');
      }, 100);

      return { success: true, id, cwd, shell: userShell };
    } catch (err: any) {
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
