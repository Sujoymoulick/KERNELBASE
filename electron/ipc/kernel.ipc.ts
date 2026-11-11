/**
 * Kernel voice agent.
 *  - kernel:listen  on-device speech-to-text through the bundled `kb-listen` helper (Apple Speech)
 *  - kernel:ask     one agent turn on the user's Antigravity CLI (`agy`)
 *
 * Speed: instead of starting a fresh `agy -p` per turn (10-20s of startup each time), Kernel keeps
 * two warm `agy` sessions in stream-json mode for the whole voice session:
 *  - quick  read-only (plan mode) on a fast model, for questions and reasoning
 *  - build  accept-edits mode, for requests that create or change files in the open folder
 * Both are started when the voice session opens, so the first answer does not pay the startup cost.
 */
import { app, ipcMain, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { which } from './studio.ipc';

export type KernelKind = 'quick' | 'build';
export const QUICK_MODEL = 'gemini-3.8-flash-low';
// Fast coding model with moderate reasoning (the -low/-medium/-high suffix is the reasoning effort,
// so --effort must not be passed alongside it: agy rejects the combination)
export const BUILD_MODEL = 'gemini-3.8-flash-medium';
// Quick answers must be fast; builds may take long for big projects
const TURN_TIMEOUT: Record<KernelKind, number> = { quick: 120_000, build: 45 * 60_000 };

let listener: ChildProcess | null = null;

function helperPath() {
  const candidates = [
    path.join(process.resourcesPath || '', 'kb-listen'),
    path.join(app.getAppPath(), 'build', 'native', 'kb-listen'),
    path.join(process.cwd(), 'build', 'native', 'kb-listen'),
  ];
  return candidates.find((p) => fs.existsSync(p));
}

export function kernelPersona(cwd: string, kind: KernelKind) {
  const lines = [
    'You are KERNEL, the voice agent built into the Kernel Base IDE. You talk with the user out loud like a friendly, confident senior engineer.',
    'Reply to exactly what the user just said, using the recent conversation for context. Be specific (name files, numbers, steps); never give generic filler.',
    'Speech-to-text may mishear words: infer the most likely meaning from context instead of asking. Ask one short question only if the request is truly ambiguous.',
    `The user's open project folder is: ${cwd}. Treat it as your workspace.`,
  ];
  if (kind === 'build') {
    lines.push(
      'When the user asks you to build an app, create files, fix or change code: do the work yourself right now inside that folder with your file tools.',
      'Create real, complete, runnable files (for a web app: index.html, style.css, script.js unless asked otherwise). Do not only describe a plan.',
      'Work fast: every tool call costs seconds, so read each needed file once and write each file completely in ONE write (no series of small edits, no re-reading to verify). Do not explore unrelated files, do not run long installs or tests unless asked, do not ask for confirmation.',
      'After doing work, say what you created or changed and how to run or open it.'
    );
  } else {
    lines.push(
      'Answer questions and reasoning problems directly and quickly. Do not use tools unless the answer depends on the project files.',
      'You also run the planning conversation before big builds: when asked, ask the user short clarifying questions or describe a short plan. Never build in this mode.'
    );
  }
  lines.push('Your reply is read aloud by text-to-speech: answer in 1 to 3 short spoken sentences, plain words, no markdown, no bullet lists, no code blocks, no file contents, no math symbols.');
  return lines.join('\n');
}

/**
 * Routing:
 *  - project  a new app/site/game/etc: Kernel asks a few questions and agrees a plan before building
 *  - build    a direct change to the workspace (fix, add, rename...): done straight away
 *  - quick    questions and reasoning: answered by the fast read-only session
 */
export type Route = KernelKind | 'project' | 'docs';
export function classify(text: string): Route {
  const t = text.toLowerCase();
  // "make the project documentation / a README / an MD brief": written as Markdown into Resources
  if (/\b(documentation|documentary|docs|readme|markdown|md file|\.md|project brief|project report|write-?up)\b/.test(t) && /\b(make|create|write|generate|prepare|save|produce|give)\b/.test(t)) return 'docs';
  const wantsChange = /\b(make|build|create|write|generate|add|fix|change|edit|update|modify|refactor|implement|delete|remove|rename|install|set ?up|scaffold|code|develop|convert|style|design)\b/.test(t);
  if (!wantsChange) return 'quick';
  const newThing = /\b(make|build|create|develop|design|generate|write|code|scaffold|set ?up)\b.*\b(app|application|website|site|web ?app|game|project|system|api|backend|frontend|dashboard|tool|bot|program|portfolio|landing page|page|server|cli|extension|clone|platform|store|shop)\b/.test(t);
  const direct = /\b(just|quickly|no questions|without asking|directly|right now|simple|small|basic)\b/.test(t);
  return newThing && !direct ? 'project' : 'build';
}

interface Result {
  success: boolean;
  response?: string;
  error?: string;
  conversationId?: string;
  seconds?: number;
  kind?: KernelKind;
  cancelled?: boolean;
}

/** A long-lived `agy` session that runs one turn per NDJSON line on stdin. */
class Worker {
  proc: ChildProcess | null = null;
  cwd = '';
  primed = false;
  private buf = '';
  private lastErr = '';
  private pending: { resolve: (r: Result) => void; timer: NodeJS.Timeout; t0: number } | null = null;
  private cancelled = false;

  constructor(readonly kind: KernelKind, private onActivity: (t: string) => void) {}

  alive() {
    return !!this.proc && this.proc.exitCode === null && !this.proc.killed;
  }

  mode: 'plan' | 'accept-edits' | 'auto' = 'accept-edits';

  ensure(cwd: string, mode?: 'accept-edits' | 'auto') {
    if (this.kind === 'build' && mode && mode !== this.mode) {
      // Permission level changed (folder trust): restart the session with the new mode
      this.mode = mode;
      this.stop();
    }
    if (this.alive() && this.cwd === cwd) return true;
    this.stop();
    const bin = which('agy');
    if (!bin) return false;
    const args = ['--print', '', '--input-format', 'stream-json', '--output-format', 'stream-json'];
    if (this.kind === 'quick') args.push('--mode', 'plan', '--model', QUICK_MODEL);
    else args.push('--mode', this.mode, '--model', BUILD_MODEL);
    const proc = spawn(bin, args, { cwd, shell: false, env: { ...process.env, NO_COLOR: '1' }, stdio: ['pipe', 'pipe', 'pipe'] });
    this.proc = proc;
    this.cwd = cwd;
    // Background priority while idle-warming so the UI and speech stay smooth
    try {
      if (proc.pid) os.setPriority(proc.pid, 5);
    } catch {
      /* not permitted: ignore */
    }
    this.primed = false;
    this.buf = '';
    this.lastErr = '';
    proc.stdout?.on('data', (d) => this.onData(d.toString('utf-8')));
    proc.stderr?.on('data', (d) => {
      const t = d.toString('utf-8');
      this.lastErr = (this.lastErr + t).slice(-400);
      this.onActivity(t.slice(-300));
    });
    proc.on('error', (e) => this.finish({ success: false, error: e.message }));
    proc.on('close', (code) => {
      if (this.proc === proc) this.proc = null;
      this.finish(
        this.cancelled
          ? { success: false, cancelled: true, error: 'Stopped.' }
          : { success: false, error: (this.lastErr.trim().split('\n').pop() || '').replace(/^error:\s*/i, '') || `Antigravity CLI session ended (code ${code}).` }
      );
    });
    return true;
  }

  private onData(chunk: string) {
    this.buf += chunk;
    let i;
    while ((i = this.buf.indexOf('\n')) >= 0) {
      const line = this.buf.slice(0, i).trim();
      this.buf = this.buf.slice(i + 1);
      if (!line.startsWith('{')) continue;
      try {
        const e = JSON.parse(line);
        if (e.event === 'result' && e.result) {
          const r = e.result;
          this.finish({
            success: r.status === 'SUCCESS',
            response: String(r.response || '').trim(),
            error: r.status === 'SUCCESS' ? undefined : String(r.error || 'The agent reported an error.'),
            conversationId: r.conversation_id,
          });
        } else if (e.event === 'step_update' && e.step_update?.step_type && e.step_update.step_type !== 'agent_response') {
          this.onActivity(String(e.step_update.step_type));
        }
      } catch {
        /* ignore partial or non-JSON lines */
      }
    }
  }

  private finish(r: Result) {
    const p = this.pending;
    if (!p) return;
    this.pending = null;
    clearTimeout(p.timer);
    p.resolve({ ...r, kind: this.kind, seconds: (Date.now() - p.t0) / 1000 });
  }

  send(text: string): Promise<Result> {
    return new Promise((resolve) => {
      if (!this.alive()) return resolve({ success: false, error: 'Antigravity CLI session is not running.' });
      if (this.pending) return resolve({ success: false, error: 'Kernel is still working on the previous request.' });
      this.cancelled = false;
      const t0 = Date.now();
      const timer = setTimeout(() => {
        this.finish({ success: false, error: 'Kernel took too long on that request.' });
        this.stop();
      }, TURN_TIMEOUT[this.kind]);
      this.pending = { resolve, timer, t0 };
      this.proc!.stdin?.write(JSON.stringify({ event: 'user', message: { role: 'user', content: text } }) + '\n');
    });
  }

  cancel() {
    if (!this.pending) return;
    this.cancelled = true;
    this.stop();
  }

  stop() {
    const p = this.proc;
    this.proc = null;
    if (p && p.exitCode === null) {
      try {
        p.stdin?.end();
      } catch {
        /* closed */
      }
      p.kill('SIGTERM');
    }
  }
}

let workers: Record<KernelKind, Worker> | null = null;

export function registerKernelIPC(mainWindow: BrowserWindow) {
  const send = (channel: string, payload: unknown) => {
    if (!mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload);
  };
  const activity = (text: string) => send('kernel:activity', { text });
  workers = { quick: new Worker('quick', activity), build: new Worker('build', activity) };
  const W = workers;
  const resolveCwd = (cwd?: string) => (cwd && fs.existsSync(cwd) ? cwd : os.homedir());

  ipcMain.handle('kernel:listenStart', async () => {
    if (process.platform !== 'darwin') return { success: false, error: 'Voice input needs macOS. Type your request instead.' };
    const bin = helperPath();
    if (!bin) return { success: false, error: 'Voice helper (kb-listen) is missing from this build.' };
    listener?.kill();
    const proc = spawn(bin, ['--silence', '2.2'], { stdio: ['pipe', 'pipe', 'pipe'] });
    listener = proc;
    let buf = '';
    proc.stdout?.on('data', (d) => {
      buf += d.toString('utf-8');
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        try {
          send('kernel:listen', JSON.parse(line));
        } catch {
          /* ignore non-JSON */
        }
      }
    });
    proc.on('close', (code) => {
      if (listener === proc) listener = null;
      send('kernel:listen', { type: 'closed', code });
    });
    proc.on('error', (e) => send('kernel:listen', { type: 'error', message: e.message }));
    return { success: true };
  });

  ipcMain.handle('kernel:listenStop', async () => {
    try {
      listener?.stdin?.write('stop\n');
    } catch {
      /* already gone */
    }
    return true;
  });

  /** Start both agy sessions ahead of the first question. */
  ipcMain.handle('kernel:warm', async (_, req: { cwd?: string; mode?: 'accept-edits' | 'auto' }) => {
    if (!which('agy')) return { success: false, error: 'Antigravity CLI (agy) was not found. Install it and sign in from Terminal.' };
    const cwd = resolveCwd(req?.cwd);
    W.quick.ensure(cwd);
    W.build.ensure(cwd, req?.mode);
    return { success: true, quickModel: QUICK_MODEL, buildModel: BUILD_MODEL };
  });

  ipcMain.handle('kernel:classify', async (_, text: string) => classify(String(text || '')));

  ipcMain.handle('kernel:ask', async (_, req: { text: string; cwd?: string; kind?: KernelKind; history?: string; mode?: 'accept-edits' | 'auto' }): Promise<Result> => {
    if (!which('agy')) return { success: false, error: 'Antigravity CLI (agy) was not found. Install it and sign in from Terminal.' };
    const cwd = resolveCwd(req.cwd);
    const route = req.kind || classify(req.text);
    const kind: KernelKind = route === 'quick' || route === 'docs' ? 'quick' : 'build';
    const w = W[kind];

    // Report files the agent creates or edits so the UI can show real progress
    let watcher: fs.FSWatcher | null = null;
    if (kind === 'build') {
      const seen = new Set<string>();
      try {
        watcher = fs.watch(cwd, { recursive: true }, (_ev, file) => {
          const f = String(file || '');
          if (!f || seen.has(f) || /(^|\/)(\.git|node_modules|\.kernelbase)(\/|$)/.test(f) || f.endsWith('.DS_Store')) return;
          seen.add(f);
          send('kernel:file', { file: f, exists: fs.existsSync(path.join(cwd, f)) });
        });
      } catch {
        /* watching is best-effort */
      }
    }

    const run = async () => {
      if (!w.ensure(cwd, req.mode)) return { success: false, error: 'Antigravity CLI (agy) could not be started.' } as Result;
      const parts: string[] = [];
      if (!w.primed) parts.push(kernelPersona(cwd, kind));
      if (req.history) parts.push(`Recent conversation:\n${req.history}`);
      parts.push(`USER SAID: ${req.text}`);
      const r = await w.send(parts.join('\n\n'));
      if (r.success) w.primed = true;
      return r;
    };

    try {
      let r = await run();
      // One automatic retry on a fresh session for transient failures (not when the user pressed Stop)
      if (!r.success && !r.cancelled) {
        w.stop();
        r = await run();
      }
      return r;
    } finally {
      watcher?.close();
    }
  });

  ipcMain.handle('kernel:cancel', async () => {
    W.quick.cancel();
    W.build.cancel();
    listener?.kill('SIGTERM');
    return true;
  });

  /** End of the voice session: release the agy sessions and the microphone. */
  ipcMain.handle('kernel:stop', async () => {
    killKernel();
    return true;
  });
}

export function killKernel() {
  workers?.quick.stop();
  workers?.build.stop();
  listener?.kill('SIGTERM');
}
