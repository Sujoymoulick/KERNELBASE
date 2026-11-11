/**
 * Integrated terminal. Uses a real pseudo-terminal (node-pty) so shells,
 * prompts, vim, top, colours and Ctrl-C behave like Terminal.app. Falls back
 * to plain pipes when the native module is unavailable (e.g. an unbuilt
 * platform), which still runs commands but without a TTY.
 */
import { ipcMain, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

type PtyLike = {
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(signal?: string): void;
};

interface TerminalSession {
  id: string;
  pty: PtyLike;
  cwd: string;
  isPty: boolean;
}

const sessions = new Map<string, TerminalSession>();

let ptyModule: any | null | undefined;
function loadPty(): any | null {
  if (ptyModule !== undefined) return ptyModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ptyModule = require('node-pty');
  } catch (err) {
    console.warn('[terminal] node-pty unavailable, using pipe fallback:', (err as Error).message);
    ptyModule = null;
  }
  return ptyModule;
}

function defaultShell(): string {
  if (process.platform === 'win32') return process.env.COMSPEC || 'powershell.exe';
  const s = process.env.SHELL;
  if (s && fs.existsSync(s)) return s;
  return fs.existsSync('/bin/zsh') ? '/bin/zsh' : '/bin/bash';
}

export function registerTerminalIPC(mainWindow: BrowserWindow) {
  const send = (channel: string, payload: unknown) => {
    if (!mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload);
  };

  ipcMain.handle(
    'terminal:create',
    async (_, options?: { id?: string; cwd?: string; shell?: string; cols?: number; rows?: number }) => {
      const id = options?.id || `term-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      if (sessions.has(id)) return { success: true, id, cwd: sessions.get(id)!.cwd, reused: true };
      const cwd = options?.cwd && fs.existsSync(options.cwd) ? options.cwd : os.homedir();
      const shell = options?.shell || defaultShell();
      const cols = Math.max(20, options?.cols || 100);
      const rows = Math.max(5, options?.rows || 24);
      const env = {
        ...process.env,
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        TERM_PROGRAM: 'KernelBase',
        KERNEL_BASE_IDE: '1',
        LANG: process.env.LANG || 'en_US.UTF-8',
      } as Record<string, string>;
      const args = process.platform === 'win32' ? [] : ['-l'];

      try {
        const pty = loadPty();
        if (pty) {
          const p = pty.spawn(shell, args, { name: 'xterm-256color', cols, rows, cwd, env });
          p.onData((data: string) => send('terminal:data', { id, data }));
          p.onExit(({ exitCode }: { exitCode: number }) => {
            sessions.delete(id);
            send('terminal:exit', { id, code: exitCode ?? 0 });
          });
          sessions.set(id, { id, pty: p, cwd, isPty: true });
          return { success: true, id, cwd, shell: path.basename(shell), pty: true };
        }

        // Pipe fallback: interactive flag so the shell prints a prompt.
        const proc: ChildProcess = spawn(shell, process.platform === 'win32' ? [] : ['-il'], {
          cwd,
          env,
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        proc.stdout?.on('data', (d) => send('terminal:data', { id, data: d.toString('utf-8').replace(/\n/g, '\r\n') }));
        proc.stderr?.on('data', (d) => send('terminal:data', { id, data: d.toString('utf-8').replace(/\n/g, '\r\n') }));
        proc.on('exit', (code) => {
          sessions.delete(id);
          send('terminal:exit', { id, code: code ?? 0 });
        });
        sessions.set(id, {
          id,
          cwd,
          isPty: false,
          pty: {
            write: (data) => proc.stdin?.write(data.replace(/\r/g, '\n')),
            resize: () => {},
            kill: () => proc.kill(),
          },
        });
        return { success: true, id, cwd, shell: path.basename(shell), pty: false };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
  );

  ipcMain.handle('terminal:write', async (_, id: string, data: string) => {
    const s = sessions.get(id);
    if (!s) return { success: false, error: 'Terminal session not found' };
    s.pty.write(data);
    return { success: true };
  });

  ipcMain.handle('terminal:resize', async (_, id: string, cols: number, rows: number) => {
    const s = sessions.get(id);
    if (!s || !cols || !rows) return { success: false };
    try {
      s.pty.resize(Math.max(2, Math.floor(cols)), Math.max(1, Math.floor(rows)));
    } catch {
      /* resize after exit */
    }
    return { success: true };
  });

  ipcMain.handle('terminal:kill', async (_, id: string) => {
    const s = sessions.get(id);
    if (!s) return { success: true };
    try {
      s.pty.kill();
    } catch {
      /* already gone */
    }
    sessions.delete(id);
    return { success: true };
  });
}

export function killAllTerminals() {
  for (const [, s] of sessions) {
    try {
      s.pty.kill();
    } catch {
      /* ignore */
    }
  }
  sessions.clear();
}
