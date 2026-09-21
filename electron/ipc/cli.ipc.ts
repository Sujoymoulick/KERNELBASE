import { ipcMain, BrowserWindow } from 'electron';
import { spawn, exec } from 'node:child_process';
import util from 'node:util';
import { CLIAdapterInfo } from '../../src/types/ide';

const execAsync = util.promisify(exec);

export function registerCliIPC(mainWindow: BrowserWindow) {
  ipcMain.handle('cli:detect', async () => {
    const adapters: CLIAdapterInfo[] = [
      {
        id: 'antigravity',
        name: 'Antigravity CLI',
        executable: 'agy',
        isInstalled: false,
        status: 'missing',
        description: 'Google Antigravity autonomous development agent CLI',
      },
      {
        id: 'cloudcode',
        name: 'Cloud Code CLI',
        executable: 'cloudcode',
        isInstalled: false,
        status: 'missing',
        description: 'Google Cloud development and deployment CLI',
      },
      {
        id: 'git',
        name: 'Git CLI',
        executable: 'git',
        isInstalled: false,
        status: 'missing',
        description: 'Distributed version control system',
      },
      {
        id: 'node',
        name: 'Node.js Runtime',
        executable: 'node',
        isInstalled: false,
        status: 'missing',
        description: 'JavaScript runtime environment',
      },
    ];

    for (const adapter of adapters) {
      try {
        const checkCmd = process.platform === 'win32' ? `where ${adapter.executable}` : `which ${adapter.executable}`;
        await execAsync(checkCmd);
        adapter.isInstalled = true;
        adapter.status = 'ready';

        try {
          const verRes = await execAsync(`${adapter.executable} --version`);
          adapter.version = verRes.stdout.trim().split('\n')[0];
        } catch {
          adapter.version = 'Available';
        }
      } catch {
        adapter.isInstalled = false;
        adapter.status = 'missing';
      }
    }

    return { success: true, adapters };
  });

  ipcMain.handle('cli:run', async (_, cliId: string, args: string[], cwd: string) => {
    const runId = `cli-run-${Date.now()}`;
    try {
      const proc = spawn(cliId, args, {
        cwd,
        env: { ...process.env, FORCE_COLOR: '1' },
        shell: true,
      });

      proc.stdout?.on('data', (data) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('cli:data', {
            id: runId,
            data: data.toString('utf-8'),
            stream: 'stdout',
          });
        }
      });

      proc.stderr?.on('data', (data) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('cli:data', {
            id: runId,
            data: data.toString('utf-8'),
            stream: 'stderr',
          });
        }
      });

      return new Promise((resolve) => {
        proc.on('close', (code) => {
          resolve({ success: code === 0, exitCode: code, runId });
        });
      });
    } catch (err: any) {
      return { success: false, error: err.message, runId };
    }
  });
}
