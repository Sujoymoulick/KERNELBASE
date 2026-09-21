import { ipcMain } from 'electron';
import { exec } from 'node:child_process';
import util from 'node:util';

const execAsync = util.promisify(exec);

async function runGit(cwd: string, command: string): Promise<{ stdout: string; stderr: string }> {
  return execAsync(`git ${command}`, {
    cwd,
    env: { ...process.env, LANG: 'en_US.UTF-8' },
    maxBuffer: 10 * 1024 * 1024,
  });
}

export function registerGitIPC() {
  ipcMain.handle('git:status', async (_, workspacePath: string) => {
    try {
      // Check if it is a git repo
      await runGit(workspacePath, 'rev-parse --is-inside-work-tree');

      // Get current branch
      const branchRes = await runGit(workspacePath, 'branch --show-current').catch(() => ({ stdout: 'main' }));
      const currentBranch = branchRes.stdout.trim() || 'HEAD';

      // Get ahead/behind
      let ahead = 0;
      let behind = 0;
      try {
        const revList = await runGit(workspacePath, 'rev-list --left-right --count @{u}...HEAD');
        const [b, a] = revList.stdout.trim().split(/\s+/).map(Number);
        behind = b || 0;
        ahead = a || 0;
      } catch {
        // No upstream configured
      }

      // Get porcelain status
      const statusRes = await runGit(workspacePath, 'status --porcelain=v1 -uall');
      const lines = statusRes.stdout.split('\n').filter(Boolean);

      const stagedFiles: any[] = [];
      const unstagedFiles: any[] = [];

      for (const line of lines) {
        const indexStatus = line[0];
        const workTreeStatus = line[1];
        const filePath = line.substring(3).trim();

        if (indexStatus !== ' ' && indexStatus !== '?') {
          stagedFiles.push({
            path: filePath,
            status: indexStatus,
            staged: true,
          });
        }

        if (workTreeStatus !== ' ' || indexStatus === '?') {
          unstagedFiles.push({
            path: filePath,
            status: indexStatus === '?' ? '?' : workTreeStatus,
            staged: false,
          });
        }
      }

      // Get last commit
      let lastCommit: any = undefined;
      try {
        const logRes = await runGit(workspacePath, 'log -1 --format="%H|%s|%an|%cr"');
        const [hash, message, author, date] = logRes.stdout.trim().split('|');
        if (hash) {
          lastCommit = { hash: hash.substring(0, 7), message, author, date };
        }
      } catch {
        // No commits yet
      }

      // Get branches
      const branchListRes = await runGit(workspacePath, 'branch --list');
      const branches = branchListRes.stdout
        .split('\n')
        .filter(Boolean)
        .map((b) => {
          const isCurrent = b.startsWith('*');
          const name = b.replace(/^\*\s*/, '').trim();
          return { name, current: isCurrent };
        });

      return {
        success: true,
        gitState: {
          isRepo: true,
          currentBranch,
          branches,
          stagedFiles,
          unstagedFiles,
          ahead,
          behind,
          lastCommit,
        },
      };
    } catch (err: any) {
      return {
        success: true,
        gitState: {
          isRepo: false,
          currentBranch: '',
          branches: [],
          stagedFiles: [],
          unstagedFiles: [],
          ahead: 0,
          behind: 0,
        },
      };
    }
  });

  ipcMain.handle('git:branches', async (_, workspacePath: string) => {
    try {
      const res = await runGit(workspacePath, 'branch -a');
      const branches = res.stdout
        .split('\n')
        .filter(Boolean)
        .map((b) => {
          const isCurrent = b.startsWith('*');
          const name = b.replace(/^\*\s*/, '').trim();
          return { name, current: isCurrent };
        });
      return { success: true, branches };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:stage', async (_, workspacePath: string, filePath: string) => {
    try {
      await runGit(workspacePath, `add "${filePath}"`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:unstage', async (_, workspacePath: string, filePath: string) => {
    try {
      await runGit(workspacePath, `restore --staged "${filePath}"`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:stageAll', async (_, workspacePath: string) => {
    try {
      await runGit(workspacePath, 'add -A');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:unstageAll', async (_, workspacePath: string) => {
    try {
      await runGit(workspacePath, 'restore --staged .');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:commit', async (_, workspacePath: string, message: string) => {
    try {
      const escaped = message.replace(/"/g, '\\"');
      const res = await runGit(workspacePath, `commit -m "${escaped}"`);
      return { success: true, output: res.stdout };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:push', async (_, workspacePath: string) => {
    try {
      const res = await runGit(workspacePath, 'push');
      return { success: true, output: res.stdout || res.stderr };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:pull', async (_, workspacePath: string) => {
    try {
      const res = await runGit(workspacePath, 'pull');
      return { success: true, output: res.stdout || res.stderr };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:fetch', async (_, workspacePath: string) => {
    try {
      const res = await runGit(workspacePath, 'fetch');
      return { success: true, output: res.stdout || res.stderr };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:diff', async (_, workspacePath: string, filePath?: string) => {
    try {
      const fileArg = filePath ? `"${filePath}"` : '';
      const diffRes = await runGit(workspacePath, `diff HEAD ${fileArg}`);
      return { success: true, diff: diffRes.stdout };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:log', async (_, workspacePath: string, limit = 20) => {
    try {
      const logRes = await runGit(workspacePath, `log -n ${limit} --pretty=format:"%H|%an|%ar|%s"`);
      const commits = logRes.stdout
        .split('\n')
        .filter(Boolean)
        .map((l) => {
          const [hash, author, date, message] = l.split('|');
          return { hash: hash?.substring(0, 7), author, date, message };
        });
      return { success: true, commits };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:checkout', async (_, workspacePath: string, branchName: string) => {
    try {
      const res = await runGit(workspacePath, `checkout "${branchName}"`);
      return { success: true, output: res.stdout || res.stderr };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('git:createBranch', async (_, workspacePath: string, branchName: string) => {
    try {
      const res = await runGit(workspacePath, `checkout -b "${branchName}"`);
      return { success: true, output: res.stdout || res.stderr };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
}
