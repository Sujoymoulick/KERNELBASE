import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { ProjectInfo } from '../../src/types/ide';

const RECENT_WORKSPACES_FILE = path.join(process.env.HOME || '', '.kernelbase-recents.json');
const WORKSPACE_STATES_DIR = path.join(process.env.HOME || '', '.kernelbase-states');

export function registerWorkspaceIPC(mainWindow: BrowserWindow) {
  ipcMain.handle('workspace:selectFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Open Project Folder - Kernel Base',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const folderPath = result.filePaths[0];
    await saveRecentWorkspace(folderPath);
    const projectInfo = await detectProjectMetadata(folderPath);

    return {
      success: true,
      folderPath,
      projectInfo,
    };
  });

  ipcMain.handle('workspace:openFolder', async (_, dirPath: string) => {
    try {
      const stat = await fs.promises.stat(dirPath);
      if (!stat.isDirectory()) {
        return { success: false, error: 'Path is not a directory' };
      }
      await saveRecentWorkspace(dirPath);
      const projectInfo = await detectProjectMetadata(dirPath);
      return { success: true, folderPath: dirPath, projectInfo };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('workspace:getRecent', async () => {
    try {
      if (fs.existsSync(RECENT_WORKSPACES_FILE)) {
        const data = await fs.promises.readFile(RECENT_WORKSPACES_FILE, 'utf-8');
        const list = JSON.parse(data);
        return { success: true, recents: list };
      }
      return { success: true, recents: [] };
    } catch {
      return { success: true, recents: [] };
    }
  });

  ipcMain.handle('workspace:detectProject', async (_, dirPath: string) => {
    try {
      const projectInfo = await detectProjectMetadata(dirPath);
      return { success: true, projectInfo };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('workspace:saveState', async (_, workspacePath: string, state: any) => {
    try {
      await fs.promises.mkdir(WORKSPACE_STATES_DIR, { recursive: true });
      const hash = Buffer.from(workspacePath).toString('base64url');
      const stateFile = path.join(WORKSPACE_STATES_DIR, `${hash}.json`);
      await fs.promises.writeFile(stateFile, JSON.stringify(state, null, 2), 'utf-8');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('workspace:loadState', async (_, workspacePath: string) => {
    try {
      const hash = Buffer.from(workspacePath).toString('base64url');
      const stateFile = path.join(WORKSPACE_STATES_DIR, `${hash}.json`);
      if (fs.existsSync(stateFile)) {
        const content = await fs.promises.readFile(stateFile, 'utf-8');
        return { success: true, state: JSON.parse(content) };
      }
      return { success: true, state: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
}

async function saveRecentWorkspace(folderPath: string) {
  try {
    let recents: string[] = [];
    if (fs.existsSync(RECENT_WORKSPACES_FILE)) {
      const data = await fs.promises.readFile(RECENT_WORKSPACES_FILE, 'utf-8');
      recents = JSON.parse(data);
    }
    recents = [folderPath, ...recents.filter((p) => p !== folderPath)].slice(0, 15);
    await fs.promises.writeFile(RECENT_WORKSPACES_FILE, JSON.stringify(recents, null, 2), 'utf-8');
  } catch {
    // Ignore error
  }
}

async function detectProjectMetadata(dirPath: string): Promise<ProjectInfo> {
  const name = path.basename(dirPath);
  let language = 'Plain Text';
  let framework: string | undefined = undefined;
  let packageManager: string | undefined = undefined;
  let runtime: string | undefined = undefined;
  let testFramework: string | undefined = undefined;
  let isGit = false;

  try {
    const files = await fs.promises.readdir(dirPath);
    isGit = files.includes('.git');

    if (files.includes('package.json')) {
      language = 'TypeScript / JavaScript';
      runtime = 'Node.js';
      packageManager = files.includes('pnpm-lock.yaml')
        ? 'pnpm'
        : files.includes('yarn.lock')
        ? 'yarn'
        : files.includes('bun.lock') || files.includes('bun.lockb')
        ? 'bun'
        : 'npm';

      try {
        const pkgContent = await fs.promises.readFile(path.join(dirPath, 'package.json'), 'utf-8');
        const pkg = JSON.parse(pkgContent);
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

        if (deps.react) framework = 'React';
        if (deps.vue) framework = 'Vue';
        if (deps.next) framework = 'Next.js';
        if (deps.electron) framework = 'Electron';
        if (deps.vite) framework = framework ? `${framework} + Vite` : 'Vite';

        if (deps.vitest) testFramework = 'Vitest';
        else if (deps.jest) testFramework = 'Jest';
        else if (deps.mocha) testFramework = 'Mocha';
      } catch {
        // Ignore parse error
      }
    } else if (files.includes('Cargo.toml')) {
      language = 'Rust';
      packageManager = 'Cargo';
      runtime = 'Rust Native';
      testFramework = 'cargo test';
    } else if (files.includes('go.mod')) {
      language = 'Go';
      packageManager = 'Go Modules';
      runtime = 'Go Runtime';
      testFramework = 'go test';
    } else if (files.includes('pyproject.toml') || files.includes('requirements.txt')) {
      language = 'Python';
      packageManager = files.includes('poetry.lock') ? 'Poetry' : 'pip';
      runtime = 'Python 3';
      testFramework = 'pytest';
    }
  } catch {
    // Ignore error
  }

  return {
    name,
    path: dirPath,
    language,
    framework,
    packageManager,
    runtime,
    testFramework,
    isGit,
  };
}
