/**
 * Kernel Base — Agent Studio runtime.
 *
 * Runs several AI agents in parallel by spawning the user's own, already
 * authenticated AI CLIs (Google Antigravity `agy`, Google `gemini`) as child
 * processes. Each agent is one process with its own role prompt, so a single
 * subscription that the user signed into in their terminal powers every agent.
 *
 * No API keys are stored by Kernel Base: authentication stays inside the CLI.
 */
import { ipcMain, BrowserWindow } from 'electron';
import { spawn, execFile, ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type StudioProvider = 'agy' | 'gemini';
export type StudioMode = 'plan' | 'accept-edits' | 'auto';

export interface StudioProviderInfo {
  id: StudioProvider;
  name: string;
  executable: string;
  installed: boolean;
  path?: string;
  version?: string;
  installHint: string;
}

export interface StudioSpawnRequest {
  id: string;
  provider: StudioProvider;
  prompt: string;
  cwd: string;
  model?: string;
  mode?: StudioMode;
  /** agy only: emit live NDJSON progress (Agent Studio) instead of plain text (Resources summaries) */
  stream?: boolean;
}

interface RunningAgent {
  proc: ChildProcess;
  startedAt: number;
}

const running = new Map<string, RunningAgent>();

/** GUI apps on macOS don't inherit the shell PATH; rebuild it once at startup. */
export async function hydrateShellPath(): Promise<void> {
  const extras = [
    path.join(os.homedir(), '.local/bin'),
    path.join(os.homedir(), '.npm-global/bin'),
    path.join(os.homedir(), '.bun/bin'),
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    '/usr/sbin',
    '/sbin',
  ];
  let shellPath = '';
  if (process.platform !== 'win32') {
    const shell = process.env.SHELL || (process.platform === 'darwin' ? '/bin/zsh' : '/bin/bash');
    shellPath = await new Promise<string>((resolve) => {
      execFile(
        shell,
        ['-ilc', 'printf "__KBPATH__%s__KBPATH__" "$PATH"'],
        { timeout: 5000, env: { ...process.env, TERM: 'dumb' } },
        (_err, stdout) => {
          const m = /__KBPATH__(.*)__KBPATH__/.exec(stdout || '');
          resolve(m ? m[1] : '');
        }
      );
    });
  }
  const parts = [...shellPath.split(':'), ...(process.env.PATH || '').split(':'), ...extras].filter(Boolean);
  process.env.PATH = Array.from(new Set(parts)).join(path.delimiter);
}

export function which(bin: string): string | undefined {
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    const candidate = path.join(dir, bin);
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      /* keep looking */
    }
  }
  return undefined;
}

function versionOf(bin: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    execFile(bin, ['--version'], { timeout: 8000 }, (err, stdout, stderr) => {
      if (err) return resolve(undefined);
      resolve(((stdout || stderr || '').trim().split('\n')[0] || '').slice(0, 60) || undefined);
    });
  });
}

async function detectProviders(): Promise<StudioProviderInfo[]> {
  const defs: Omit<StudioProviderInfo, 'installed'>[] = [
    {
      id: 'agy',
      name: 'Google Antigravity CLI',
      executable: 'agy',
      installHint: 'Install Antigravity, then run `agy` once in Terminal to sign in.',
    },
    {
      id: 'gemini',
      name: 'Gemini CLI',
      executable: 'gemini',
      installHint: 'npm install -g @google/gemini-cli, then run `gemini` once to sign in.',
    },
  ];
  return Promise.all(
    defs.map(async (d) => {
      const p = which(d.executable);
      return { ...d, installed: !!p, path: p, version: p ? await versionOf(p) : undefined };
    })
  );
}

function listModels(provider: StudioProvider): Promise<{ id: string; label: string }[]> {
  if (provider !== 'agy') {
    return Promise.resolve([
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    ]);
  }
  const bin = which('agy');
  if (!bin) return Promise.resolve([]);
  return new Promise((resolve) => {
    execFile(bin, ['models'], { timeout: 30000 }, (_err, stdout) => {
      const models = (stdout || '')
        .split('\n')
        .map((l) => l.split('\t'))
        .filter((cols) => cols.length >= 2 && cols[0].trim() && !cols[0].includes(' '))
        .map(([id, label]) => ({ id: id.trim(), label: label.trim() }));
      resolve(models);
    });
  });
}

/** Readable progress line for an agy tool step, e.g. "Writing style.css" or "Running: npm test". */
function humanStep(tool: string, params: Record<string, unknown> | undefined, cwd: string) {
  const p = params || {};
  const pick = (...keys: string[]) => {
    for (const k of keys) for (const [pk, v] of Object.entries(p)) if (pk.toLowerCase() === k && typeof v === 'string' && v) return v;
    return '';
  };
  const file = pick('path', 'file', 'filepath', 'absolutepath', 'targetfile', 'directorypath', 'dir');
  const rel = file ? path.relative(cwd, file) || path.basename(file) : '';
  const cmd = pick('command', 'commandline', 'cmd');
  const q = pick('query', 'pattern', 'url');
  const t = tool.toLowerCase();
  if (/write|create|edit|replace|patch|apply/.test(t)) return `Writing ${rel || 'files'}`;
  if (/view|read|open/.test(t)) return `Reading ${rel || 'files'}`;
  if (/list|dir|ls/.test(t)) return `Listing ${rel || 'the project'}`;
  if (/grep|search|find/.test(t)) return `Searching${q ? ` for "${q.slice(0, 40)}"` : ''}`;
  if (/command|terminal|shell|run|exec/.test(t)) return `Running${cmd ? `: ${cmd.slice(0, 60)}` : ' a command'}`;
  if (/browser|web|url|fetch/.test(t)) return `Looking up${q ? ` ${q.slice(0, 50)}` : ' the web'}`;
  return tool.replace(/_/g, ' ');
}

/** Builds argv for each CLI. Prompt is passed as one argv entry — never through a shell. */
export function buildArgs(req: StudioSpawnRequest): string[] {
  const mode = req.mode || 'plan';
  if (req.provider === 'agy') {
    // stream-json: progress arrives live (steps, reply text) instead of only when the agent finishes
    const args = ['-p', req.prompt, '--mode', mode, '--output-format', req.stream ? 'stream-json' : 'text', '--print-timeout', req.stream ? '1800s' : '600s'];
    if (req.model) args.push('--model', req.model);
    return args;
  }
  const args = ['-p', req.prompt];
  if (req.model) args.push('-m', req.model);
  if (mode === 'auto') args.push('--yolo');
  else if (mode === 'accept-edits') args.push('--approval-mode', 'auto_edit');
  return args;
}

export function registerStudioIPC(mainWindow: BrowserWindow) {
  const send = (channel: string, payload: unknown) => {
    if (!mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload);
  };

  ipcMain.handle('studio:detect', async () => ({ success: true, providers: await detectProviders() }));

  ipcMain.handle('studio:models', async (_, provider: StudioProvider) => listModels(provider));

  ipcMain.handle('studio:spawn', async (_, req: StudioSpawnRequest) => {
    if (running.has(req.id)) return { success: false, error: 'Agent already running' };
    if (req.provider !== 'agy' && req.provider !== 'gemini') return { success: false, error: 'Unknown provider' };
    const bin = which(req.provider);
    if (!bin) return { success: false, error: `${req.provider} not found on PATH` };
    const cwd = req.cwd && fs.existsSync(req.cwd) ? req.cwd : os.homedir();

    const proc = spawn(bin, buildArgs({ ...req, stream: true }), {
      cwd,
      shell: false,
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', KERNEL_BASE_AGENT: req.id },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    running.set(req.id, { proc, startedAt: Date.now() });

    const out = (data: string) => send('studio:data', { id: req.id, stream: 'stdout', data });
    if (req.provider === 'agy') {
      // Turn agy's NDJSON events into readable live progress
      let buf = '';
      const seenSteps = new Set<number>();
      let lastWasText = false;
      proc.stdout?.on('data', (d) => {
        buf += d.toString('utf-8');
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i).trim();
          buf = buf.slice(i + 1);
          if (!line.startsWith('{')) continue;
          try {
            const e = JSON.parse(line);
            const st = e.step_update;
            if (st?.text_delta && st.step_type === 'agent_response') {
              out(st.text_delta);
              lastWasText = true;
            } else if (st && st.step_type && st.step_type !== 'user_input' && st.step_type !== 'agent_response' && !seenSteps.has(st.step_index)) {
              seenSteps.add(st.step_index);
              out(`${lastWasText ? '\n' : ''}> ${humanStep(st.tool_name || st.step_type, st.tool_info?.parameters, cwd)}\n`);
              lastWasText = false;
            } else if (e.event === 'result' && e.result?.status !== 'SUCCESS' && e.result?.error) {
              out(`\n[error] ${e.result.error}\n`);
            }
          } catch {
            /* partial line */
          }
        }
      });
    } else {
      proc.stdout?.on('data', (d) => out(d.toString('utf-8')));
    }
    // Real file progress for agents that edit the workspace
    let watcher: fs.FSWatcher | null = null;
    if (req.mode !== 'plan') {
      const seen = new Set<string>();
      try {
        watcher = fs.watch(cwd, { recursive: true }, (_ev, file) => {
          const f = String(file || '');
          if (!f || seen.has(f) || /(^|\/)(\.git|node_modules|\.kernelbase|dist|build)(\/|$)/.test(f) || f.endsWith('.DS_Store')) return;
          seen.add(f);
          out(`> ${fs.existsSync(path.join(cwd, f)) ? 'Wrote' : 'Removed'} ${f}\n`);
          send('studio:file', { id: req.id, file: f });
        });
      } catch {
        /* best effort */
      }
    }
    proc.stderr?.on('data', (d) => send('studio:data', { id: req.id, stream: 'stderr', data: d.toString('utf-8') }));
    proc.on('error', (err) => {
      running.delete(req.id);
      send('studio:exit', { id: req.id, code: -1, error: err.message, durationMs: 0 });
    });
    proc.on('close', (code, signal) => {
      watcher?.close();
      const r = running.get(req.id);
      running.delete(req.id);
      send('studio:exit', {
        id: req.id,
        code: code ?? (signal ? 130 : -1),
        signal,
        durationMs: r ? Date.now() - r.startedAt : 0,
      });
    });
    return { success: true, pid: proc.pid };
  });

  ipcMain.handle('studio:stop', async (_, id: string) => {
    const r = running.get(id);
    if (!r) return false;
    r.proc.kill('SIGTERM');
    setTimeout(() => {
      if (running.has(id)) r.proc.kill('SIGKILL');
    }, 3000);
    return true;
  });

  ipcMain.handle('studio:stopAll', async () => {
    for (const [, r] of running) r.proc.kill('SIGTERM');
    return true;
  });
}

export function killAllStudioAgents() {
  for (const [, r] of running) r.proc.kill('SIGKILL');
  running.clear();
}
