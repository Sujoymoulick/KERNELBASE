import os from 'node:os';
import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { ProjectInfo } from '../../src/types/ide';

const RECENT_WORKSPACES_FILE = path.join(process.env.HOME || '', '.kernelbase-recents.json');
const WORKSPACE_STATES_DIR = path.join(process.env.HOME || '', '.kernelbase-states');

let activeWorkspacePath: string = process.cwd();

export function registerWorkspaceIPC(mainWindow: BrowserWindow) {
  ipcMain.handle('workspace:get', async () => {
    try {
      if (!isUsableWorkspace(activeWorkspacePath)) {
        if (fs.existsSync(RECENT_WORKSPACES_FILE)) {
          const recents = JSON.parse(await fs.promises.readFile(RECENT_WORKSPACES_FILE, 'utf-8'));
          const firstGood = Array.isArray(recents) ? recents.find((r) => typeof r === 'string' && isUsableWorkspace(r)) : undefined;
          if (firstGood) activeWorkspacePath = firstGood;
        }
      }
    } catch {}

    if (!isUsableWorkspace(activeWorkspacePath)) {
      activeWorkspacePath = await ensureStarterWorkspace();
    }

    const projectInfo = await detectProjectMetadata(activeWorkspacePath);
    return {
      rootPath: activeWorkspacePath,
      name: path.basename(activeWorkspacePath) || 'Kernel Base Workspace',
      projectType: projectInfo?.framework || 'node',
      projectInfo,
    };
  });

  ipcMain.handle('workspace:set', async (_, newPath: string) => {
    if (isUsableWorkspace(newPath)) activeWorkspacePath = path.resolve(newPath);
    newPath = activeWorkspacePath;
    await saveRecentWorkspace(newPath);
    const projectInfo = await detectProjectMetadata(newPath);
    return {
      rootPath: newPath,
      name: path.basename(newPath) || 'Kernel Base Workspace',
      projectType: projectInfo?.framework || 'generic',
      projectInfo,
    };
  });
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


/** Absolute, existing directory that is not the filesystem root. */
function isUsableWorkspace(p: string): boolean {
  try {
    return path.isAbsolute(p) && path.resolve(p) !== '/' && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/** First launch (e.g. from Finder, where cwd is "/"): create a small starter project. */
async function ensureStarterWorkspace(): Promise<string> {
  const dir = path.join(os.homedir(), 'KernelBase', 'Welcome');
  const files: Record<string, string> = {
    'README.md': [
      '# Welcome to Kernel Base',
      '',
      '- Open a project: File > Open Folder (⌘O).',
      '- Run the open file: ⌘R (Python, C, C++, JavaScript, TypeScript, Go, Rust, Java when installed).',
      '- Agent Studio (right panel, ⌘⇧L): launch parallel AI agents on your own Antigravity (`agy`) or Gemini CLI login.',
      '',
    ].join('\n'),
    'hello.py': 'name = "Kernel Base"\nfor i in range(3):\n    print(f"Hello from {name} #{i + 1}")\n',
    'hello.c': '#include <stdio.h>\n\nint main(void) {\n  printf("Hello from Kernel Base (C)\\n");\n  return 0;\n}\n',
    'hello.js': 'const langs = ["C", "Python", "JavaScript"];\nconsole.log(`Kernel Base runs: ${langs.join(", ")}`);\n',
  };
  try {
    await fs.promises.mkdir(dir, { recursive: true });
    for (const [name, body] of Object.entries(files)) {
      const p = path.join(dir, name);
      if (!fs.existsSync(p)) await fs.promises.writeFile(p, body, 'utf-8');
    }
    return dir;
  } catch {
    return os.homedir();
  }
}
