/**
 * Project awareness for Run / Build / Test.
 * Returns shell commands that the renderer runs inside the integrated
 * terminal, so programs that read input (scanf, input(), Scanner) work.
 */
import { ipcMain, dialog, BrowserWindow, shell } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

export interface ProjectCommands {
  kind: string;
  cwd: string;
  run?: string;
  build?: string;
  test?: string;
}

const q = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;
const has = (dir: string, f: string) => fs.existsSync(path.join(dir, f));

function pkgRunner(dir: string): string {
  if (has(dir, 'pnpm-lock.yaml')) return 'pnpm';
  if (has(dir, 'yarn.lock')) return 'yarn';
  if (has(dir, 'bun.lockb') || has(dir, 'bun.lock')) return 'bun';
  return 'npm';
}

export function commandForFile(filePath: string, workspace?: string): { cwd: string; command: string } {
  const ext = path.extname(filePath).toLowerCase();
  const cwd = path.dirname(filePath);
  const base = path.basename(filePath);
  const stem = path.basename(filePath, ext);
  const out = `./${stem}`;
  const ws = workspace || cwd;
  let command: string;
  switch (ext) {
    case '.py':
      command = `python3 -u ${q(base)}`;
      break;
    case '.c':
      command = `clang -std=c17 -Wall -g ${q(base)} -o ${q(stem)} -lm && ${q(out)}`;
      break;
    case '.cpp':
    case '.cc':
    case '.cxx':
      command = `clang++ -std=c++20 -Wall -g ${q(base)} -o ${q(stem)} && ${q(out)}`;
      break;
    case '.java':
      command = `javac ${q(base)} && java ${q(stem)}`;
      break;
    case '.js':
    case '.mjs':
    case '.cjs':
      command = `node ${q(base)}`;
      break;
    case '.ts':
    case '.mts':
      command = `npx --yes tsx ${q(base)}`;
      break;
    case '.go':
      command = `go run ${q(base)}`;
      break;
    case '.rs':
      command = has(ws, 'Cargo.toml') ? 'cargo run' : `rustc ${q(base)} -o ${q(stem)} && ${q(out)}`;
      break;
    case '.swift':
      command = `swift ${q(base)}`;
      break;
    case '.kt':
      command = `kotlinc ${q(base)} -include-runtime -d ${q(stem + '.jar')} && java -jar ${q(stem + '.jar')}`;
      break;
    case '.rb':
      command = `ruby ${q(base)}`;
      break;
    case '.php':
      command = `php ${q(base)}`;
      break;
    case '.sh':
    case '.bash':
      command = `bash ${q(base)}`;
      break;
    case '.zsh':
      command = `zsh ${q(base)}`;
      break;
    case '.html':
    case '.htm':
      command = process.platform === 'darwin' ? `open ${q(base)}` : `xdg-open ${q(base)}`;
      break;
    default:
      command = `echo ${q(`Kernel Base: no runner for ${ext || 'this file'} yet`)}`;
  }
  return { cwd, command };
}

export function detectProject(dir: string): ProjectCommands {
  const p: ProjectCommands = { kind: 'unknown', cwd: dir };
  if (!dir || !fs.existsSync(dir)) return p;

  if (has(dir, 'package.json')) {
    const runner = pkgRunner(dir);
    let scripts: Record<string, string> = {};
    try {
      scripts = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')).scripts || {};
    } catch {
      /* invalid package.json */
    }
    const r = (name: string) => (runner === 'npm' ? `npm run ${name}` : `${runner} ${name}`);
    const install = has(dir, 'node_modules') ? '' : `${runner} install && `;
    p.kind = 'node';
    p.run = scripts.dev ? install + r('dev') : scripts.start ? install + r('start') : `${install}node .`;
    if (scripts.build) p.build = install + r('build');
    if (scripts.test) p.test = install + r('test');
    return p;
  }
  if (has(dir, 'Cargo.toml')) return { kind: 'rust', cwd: dir, run: 'cargo run', build: 'cargo build', test: 'cargo test' };
  if (has(dir, 'go.mod')) return { kind: 'go', cwd: dir, run: 'go run .', build: 'go build ./...', test: 'go test ./...' };
  if (has(dir, 'Package.swift')) return { kind: 'swift', cwd: dir, run: 'swift run', build: 'swift build', test: 'swift test' };
  if (has(dir, 'CMakeLists.txt')) {
    let name = '';
    try {
      name = /project\s*\(\s*([A-Za-z0-9_\-]+)/i.exec(fs.readFileSync(path.join(dir, 'CMakeLists.txt'), 'utf-8'))?.[1] || '';
    } catch {
      /* ignore */
    }
    const build = 'cmake -S . -B build && cmake --build build';
    return { kind: 'cmake', cwd: dir, build, run: name ? `${build} && ./build/${name}` : build, test: `${build} && ctest --test-dir build` };
  }
  if (has(dir, 'Makefile') || has(dir, 'makefile')) {
    let mk = '';
    try {
      mk = fs.readFileSync(path.join(dir, has(dir, 'Makefile') ? 'Makefile' : 'makefile'), 'utf-8');
    } catch {
      /* ignore */
    }
    return { kind: 'make', cwd: dir, build: 'make', run: /^run\s*:/m.test(mk) ? 'make run' : 'make', test: /^test\s*:/m.test(mk) ? 'make test' : undefined };
  }
  if (has(dir, 'pom.xml')) return { kind: 'maven', cwd: dir, build: 'mvn -q package', run: 'mvn -q compile exec:java', test: 'mvn test' };
  if (has(dir, 'build.gradle') || has(dir, 'build.gradle.kts')) {
    const g = has(dir, 'gradlew') ? './gradlew' : 'gradle';
    return { kind: 'gradle', cwd: dir, build: `${g} build`, run: `${g} run`, test: `${g} test` };
  }
  const files = fs.readdirSync(dir);
  const pyMain = ['main.py', 'app.py', 'manage.py', '__main__.py'].find((f) => files.includes(f));
  if (pyMain || has(dir, 'pyproject.toml') || has(dir, 'requirements.txt')) {
    const req = has(dir, 'requirements.txt') ? 'python3 -m pip install -r requirements.txt && ' : '';
    return {
      kind: 'python',
      cwd: dir,
      run: pyMain ? `python3 -u ${q(pyMain)}${pyMain === 'manage.py' ? ' runserver' : ''}` : undefined,
      build: req ? req.replace(/ && $/, '') : undefined,
      test: 'python3 -m pytest',
    };
  }
  const cFiles = files.filter((f) => f.endsWith('.c'));
  const cppFiles = files.filter((f) => /\.(cpp|cc|cxx)$/.test(f));
  if (cppFiles.length) {
    const build = `clang++ -std=c++20 -Wall -g ${cppFiles.map(q).join(' ')} -o app`;
    return { kind: 'cpp', cwd: dir, build, run: `${build} && ./app` };
  }
  if (cFiles.length) {
    const build = `clang -std=c17 -Wall -g ${cFiles.map(q).join(' ')} -o app -lm`;
    return { kind: 'c', cwd: dir, build, run: `${build} && ./app` };
  }
  const javaMain = files.find((f) => f === 'Main.java');
  if (javaMain) return { kind: 'java', cwd: dir, build: 'javac *.java', run: 'javac *.java && java Main' };
  if (files.includes('index.html')) return { kind: 'web', cwd: dir, run: process.platform === 'darwin' ? 'open index.html' : 'xdg-open index.html' };
  return p;
}

export function registerProjectIPC(mainWindow: BrowserWindow) {
  ipcMain.handle('project:detect', async (_, dir: string) => detectProject(dir));
  ipcMain.handle('project:commandForFile', async (_, filePath: string, ws?: string) => commandForFile(filePath, ws));

  ipcMain.handle('dialog:openFile', async (_, defaultPath?: string) => {
    const r = await dialog.showOpenDialog(mainWindow, {
      title: 'Open File',
      defaultPath,
      properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
    });
    return r.canceled ? [] : r.filePaths;
  });

  ipcMain.handle('dialog:saveFile', async (_, defaultPath?: string) => {
    const r = await dialog.showSaveDialog(mainWindow, { title: 'Save As', defaultPath, showsTagField: false });
    return r.canceled ? null : r.filePath;
  });

  ipcMain.handle('shell:openExternal', async (_, url: string) => {
    if (/^https?:\/\//.test(url)) await shell.openExternal(url);
    return true;
  });

  // Open a local document (e.g. a rack PDF) in its default macOS app
  ipcMain.handle('shell:openPath', async (_, p: string) => {
    if (typeof p !== 'string' || !path.isAbsolute(p) || !fs.existsSync(p)) return 'Not found';
    return shell.openPath(p);
  });
}
