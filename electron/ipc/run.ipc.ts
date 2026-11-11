import { ipcMain, BrowserWindow } from 'electron';
import { spawn, exec, ChildProcess } from 'node:child_process';
import util from 'node:util';
import path from 'node:path';
import fs from 'node:fs';
import { DiagnosticItem, ToolchainInfo, RunExecutionResult } from '../../src/types/ide';

const execAsync = util.promisify(exec);

let activeRunProcess: ChildProcess | null = null;
let activeRunId: string | null = null;

export function registerRunIPC(mainWindow: BrowserWindow) {
  // Detect available toolchains on the host system
  ipcMain.handle('run:detectToolchains', async (): Promise<ToolchainInfo[]> => {
    const toolchains: ToolchainInfo[] = [
      { language: 'python', compiler: 'python3', isAvailable: false },
      { language: 'c', compiler: 'clang', isAvailable: false },
      { language: 'cpp', compiler: 'clang++', isAvailable: false },
      { language: 'rust', compiler: 'rustc', isAvailable: false },
      { language: 'rust-cargo', compiler: 'cargo', isAvailable: false },
      { language: 'go', compiler: 'go', isAvailable: false },
      { language: 'typescript', compiler: 'tsx', isAvailable: false },
      { language: 'javascript', compiler: 'node', isAvailable: false },
      { language: 'bun', compiler: 'bun', isAvailable: false },
      { language: 'java', compiler: 'javac', isAvailable: false },
      { language: 'swift', compiler: 'swift', isAvailable: false },
    ];

    for (const tc of toolchains) {
      try {
        const checkCmd = process.platform === 'win32' ? `where ${tc.compiler}` : `which ${tc.compiler}`;
        const { stdout } = await execAsync(checkCmd);
        const binPath = stdout.trim().split('\n')[0];
        tc.isAvailable = true;
        tc.path = binPath;

        try {
          const { stdout: verOut } = await execAsync(`${tc.compiler} --version`);
          tc.version = verOut.trim().split('\n')[0];
        } catch {
          // Version query fallback
        }
      } catch {
        tc.isAvailable = false;
      }
    }

    return toolchains;
  });

  // Execute active file with compiler / runtime
  ipcMain.handle(
    'run:executeFile',
    async (
      _,
      options: {
        filePath: string;
        language?: string;
        workspacePath: string;
        args?: string[];
      }
    ): Promise<RunExecutionResult> => {
      const { filePath, workspacePath } = options;
      const ext = path.extname(filePath).toLowerCase();
      const dirName = path.dirname(filePath);
      const baseName = path.basename(filePath);
      const fileNameNoExt = path.basename(filePath, ext);
      const outputPath = path.join(dirName, fileNameNoExt);

      const startTime = Date.now();
      let command = '';
      let shellArgs: string[] = [];

      // Determine compilation/run command pipeline based on file type
      switch (ext) {
        case '.py':
          command = `python3 -u "${baseName}"`;
          break;
        case '.c':
          command = `clang -std=c17 -O2 -Wall "${baseName}" -o "${fileNameNoExt}" && "./${fileNameNoExt}"`;
          break;
        case '.cpp':
        case '.cc':
        case '.cxx':
          command = `clang++ -std=c++20 -O2 -Wall "${baseName}" -o "${fileNameNoExt}" && "./${fileNameNoExt}"`;
          break;
        case '.rs':
          if (fs.existsSync(path.join(workspacePath, 'Cargo.toml'))) {
            command = 'cargo run';
          } else {
            command = `rustc "${baseName}" -o "${fileNameNoExt}" && "./${fileNameNoExt}"`;
          }
          break;
        case '.go':
          command = `go run "${baseName}"`;
          break;
        case '.ts':
        case '.tsx':
          command = `npx tsx "${baseName}"`;
          break;
        case '.js':
        case '.mjs':
          command = `node "${baseName}"`;
          break;
        case '.java':
          command = `javac "${baseName}" && java "${fileNameNoExt}"`;
          break;
        case '.swift':
          command = `swift "${baseName}"`;
          break;
        case '.sh':
        case '.zsh':
          command = `/bin/zsh "${baseName}"`;
          break;
        default:
          command = `node "${baseName}"`;
          break;
      }

      const runId = `run-${Date.now()}`;
      activeRunId = runId;

      return new Promise<RunExecutionResult>((resolve) => {
        let stdoutAccumulator = '';
        let stderrAccumulator = '';

        const proc = spawn('/bin/zsh', ['-c', command], {
          cwd: dirName,
          env: {
            ...process.env,
            PATH: `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin:${process.env.HOME}/.cargo/bin`,
            TERM: 'xterm-256color',
            PYTHONUNBUFFERED: '1',
          },
        });

        activeRunProcess = proc;

        proc.stdout?.on('data', (chunk) => {
          const text = chunk.toString('utf-8');
          stdoutAccumulator += text;
          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('run:data', {
              runId,
              stream: 'stdout',
              data: text,
            });
          }
        });

        proc.stderr?.on('data', (chunk) => {
          const text = chunk.toString('utf-8');
          stderrAccumulator += text;
          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('run:data', {
              runId,
              stream: 'stderr',
              data: text,
            });
          }
        });

        proc.on('close', (code) => {
          activeRunProcess = null;
          activeRunId = null;
          const durationMs = Date.now() - startTime;

          // Parse compiler error diagnostics from stderr
          const diagnostics = parseCompilerDiagnostics(
            stderrAccumulator + '\n' + stdoutAccumulator,
            filePath
          );

          const result: RunExecutionResult = {
            success: code === 0,
            exitCode: code ?? 0,
            stdout: stdoutAccumulator,
            stderr: stderrAccumulator,
            command,
            durationMs,
            diagnostics,
          };

          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('run:exit', { runId, result });
          }

          resolve(result);
        });

        proc.on('error', (err) => {
          activeRunProcess = null;
          activeRunId = null;
          resolve({
            success: false,
            exitCode: 1,
            stdout: stdoutAccumulator,
            stderr: err.message,
            command,
            durationMs: Date.now() - startTime,
            diagnostics: [],
          });
        });
      });
    }
  );

  // Stop currently running execution
  ipcMain.handle('run:stop', async () => {
    if (activeRunProcess) {
      try {
        activeRunProcess.kill('SIGTERM');
        activeRunProcess = null;
        activeRunId = null;
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  });
}

/**
 * Intelligent regex parser for compiler and interpreter diagnostics
 */
function parseCompilerDiagnostics(output: string, fallbackFilePath: string): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = [];
  const lines = output.split('\n');

  // Regex patterns for Clang, GCC, Rust, Python, TypeScript
  const clangGccPattern = /^(.+):(\d+):(\d+):\s+(error|warning|note):\s+(.+)$/;
  const rustPattern = /-->\s+(.+):(\d+):(\d+)/;
  const pyTracePattern = /File\s+"(.+)",\s+line\s+(\d+)(?:,\s+in\s+.+)?/;
  const tsPattern = /^(.+)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 1. Clang / GCC: file:line:col: error: message
    const clangMatch = line.match(clangGccPattern);
    if (clangMatch) {
      diagnostics.push({
        id: `diag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        filePath: clangMatch[1].startsWith('/') ? clangMatch[1] : path.resolve(path.dirname(fallbackFilePath), clangMatch[1]),
        line: parseInt(clangMatch[2], 10),
        column: parseInt(clangMatch[3], 10),
        severity: clangMatch[4] === 'error' ? 'error' : 'warning',
        message: clangMatch[5],
        source: 'clang/gcc',
      });
      continue;
    }

    // 2. TypeScript: file(line,col): error TS1234: message
    const tsMatch = line.match(tsPattern);
    if (tsMatch) {
      diagnostics.push({
        id: `diag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        filePath: tsMatch[1].startsWith('/') ? tsMatch[1] : path.resolve(path.dirname(fallbackFilePath), tsMatch[1]),
        line: parseInt(tsMatch[2], 10),
        column: parseInt(tsMatch[3], 10),
        severity: 'error',
        message: `${tsMatch[4]}: ${tsMatch[5]}`,
        source: 'tsc',
      });
      continue;
    }

    // 3. Python Traceback: File "file", line X, in ...
    const pyMatch = line.match(pyTracePattern);
    if (pyMatch && i + 1 < lines.length) {
      const nextLine = lines[i + 1] || '';
      const errorLine = lines[i + 2] || nextLine;
      diagnostics.push({
        id: `diag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        filePath: pyMatch[1].startsWith('/') ? pyMatch[1] : path.resolve(path.dirname(fallbackFilePath), pyMatch[1]),
        line: parseInt(pyMatch[2], 10),
        column: 1,
        severity: 'error',
        message: errorLine || 'Python runtime exception',
        source: 'python',
      });
      continue;
    }
  }

  return diagnostics;
}
