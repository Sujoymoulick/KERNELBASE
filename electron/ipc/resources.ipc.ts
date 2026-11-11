/**
 * Resources rack: project documents that agents can read.
 *
 * Everything happens on this machine. Documents are copied into
 * `<workspace>/.kernelbase/resources/`, their text is extracted locally
 * (PDF, DOCX, RTF/DOC/Pages, plain text and code), and an agent from the
 * user's own AI CLI turns that text into a Markdown brief saved next to it.
 */
import { ipcMain, dialog, BrowserWindow } from 'electron';
import { execFile, spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { which, buildArgs, StudioProvider } from './studio.ipc';

export interface RackItem {
  id: string;
  slot: number;
  name: string;
  type: string;
  size: number;
  pages?: number;
  words: number;
  file: string; // copied original, relative to the resources dir
  text: string; // extracted text file
  md: string; // generated markdown
  agentsRead: boolean;
  status: 'extracted' | 'summarizing' | 'ready' | 'error';
  error?: string;
  addedAt: number;
}

export const RACK_SLOTS = 8;
const TEXT_EXT = new Set([
  '.txt', '.md', '.markdown', '.csv', '.json', '.yaml', '.yml', '.xml', '.html', '.htm', '.tex',
  '.c', '.h', '.cpp', '.hpp', '.cc', '.java', '.py', '.js', '.ts', '.tsx', '.jsx', '.go', '.rs', '.swift', '.kt', '.sql', '.sh',
]);
const MAX_BYTES = 50 * 1024 * 1024;

const dynamicImport = new Function('s', 'return import(s)') as (s: string) => Promise<any>;

const resDir = (ws: string) => path.join(ws, '.kernelbase', 'resources');
const rackFile = (ws: string) => path.join(resDir(ws), 'rack.json');

function readRack(ws: string): RackItem[] {
  try {
    return JSON.parse(fs.readFileSync(rackFile(ws), 'utf-8'));
  } catch {
    return [];
  }
}

function writeRack(ws: string, items: RackItem[]) {
  fs.mkdirSync(resDir(ws), { recursive: true });
  fs.writeFileSync(rackFile(ws), JSON.stringify(items, null, 2));
}

function slugify(name: string) {
  return (
    name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'document'
  );
}

function textutil(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile('/usr/bin/textutil', ['-convert', 'txt', '-stdout', file], { maxBuffer: 64 * 1024 * 1024 }, (err, out) =>
      err ? reject(err) : resolve(out)
    );
  });
}

export async function extractText(file: string): Promise<{ text: string; pages?: number }> {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.pdf') {
    const { extractText: pdfText, getDocumentProxy } = await dynamicImport('unpdf');
    const pdf = await getDocumentProxy(new Uint8Array(await fs.promises.readFile(file)));
    const { totalPages, text } = await pdfText(pdf, { mergePages: false });
    const pages = (text as string[]).map((t, i) => `\n\n--- Page ${i + 1} ---\n\n${t.trim()}`).join('');
    return { text: pages.trim(), pages: totalPages };
  }
  if (ext === '.docx') {
    const mammoth = require('mammoth');
    const { value } = await mammoth.extractRawText({ path: file });
    return { text: value };
  }
  if (['.doc', '.rtf', '.rtfd', '.odt', '.pages', '.webarchive'].includes(ext) && process.platform === 'darwin') {
    return { text: await textutil(file) };
  }
  if (TEXT_EXT.has(ext) || ext === '') {
    return { text: await fs.promises.readFile(file, 'utf-8') };
  }
  throw new Error(`Unsupported file type ${ext}. Use PDF, DOCX, DOC, RTF, TXT, MD or source code.`);
}

function fallbackMarkdown(item: RackItem, text: string) {
  const preview = text.length > 20000 ? `${text.slice(0, 20000)}\n\n[... ${text.length - 20000} more characters in ${item.text}]` : text;
  return [
    `# ${item.name}`,
    '',
    `> Extracted locally by Kernel Base · ${item.type.toUpperCase()}${item.pages ? ` · ${item.pages} pages` : ''} · ${item.words} words`,
    '> Click Regenerate to have an agent turn this into a structured project brief.',
    '',
    '## Content',
    '',
    preview,
    '',
  ].join('\n');
}

export function registerResourcesIPC(mainWindow: BrowserWindow) {
  const send = (channel: string, payload: unknown) => {
    if (!mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload);
  };
  const running = new Map<string, ReturnType<typeof spawn>>();

  ipcMain.handle('resources:list', async (_, ws: string) => ({
    items: readRack(ws).map((i) => (i.status === 'summarizing' && !running.has(i.id) ? { ...i, status: 'extracted' as const } : i)),
    slots: RACK_SLOTS,
    dir: resDir(ws),
  }));

  ipcMain.handle('resources:pick', async () => {
    const r = await dialog.showOpenDialog(mainWindow, {
      title: 'Add documents to Resources',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Documents', extensions: ['pdf', 'docx', 'doc', 'rtf', 'odt', 'pages', 'txt', 'md', 'markdown', 'csv', 'json', 'html', 'tex'] },
        { name: 'All files', extensions: ['*'] },
      ],
    });
    return r.canceled ? [] : r.filePaths;
  });

  ipcMain.handle('resources:import', async (_, ws: string, files: string[]) => {
    if (!ws || !fs.existsSync(ws)) return { success: false, error: 'Open a folder first.' };
    const items = readRack(ws);
    const errors: string[] = [];
    const dir = resDir(ws);
    fs.mkdirSync(path.join(dir, 'files'), { recursive: true });

    for (const src of files) {
      const used = new Set(items.map((i) => i.slot));
      const slot = Array.from({ length: RACK_SLOTS }, (_, i) => i + 1).find((n) => !used.has(n));
      if (!slot) {
        errors.push(`Rack is full (${RACK_SLOTS} slots). Remove a document first.`);
        break;
      }
      try {
        const stat = await fs.promises.stat(src);
        if (!stat.isFile()) throw new Error('Not a file');
        if (stat.size > MAX_BYTES) throw new Error('File is larger than 50 MB');
        const name = path.basename(src);
        const ext = path.extname(name).toLowerCase();
        let slug = slugify(name);
        while (items.some((i) => i.md === `${slug}.md`)) slug += '-2';
        const id = crypto.randomUUID();
        const copied = path.join('files', `${slug}${ext}`);
        await fs.promises.copyFile(src, path.join(dir, copied));
        const { text, pages } = await extractText(src);
        const item: RackItem = {
          id,
          slot,
          name,
          type: ext.replace('.', '') || 'txt',
          size: stat.size,
          pages,
          words: (text.match(/\S+/g) || []).length,
          file: copied,
          text: `${slug}.txt`,
          md: `${slug}.md`,
          agentsRead: true,
          status: 'extracted',
          addedAt: Date.now(),
        };
        await fs.promises.writeFile(path.join(dir, item.text), text, 'utf-8');
        await fs.promises.writeFile(path.join(dir, item.md), fallbackMarkdown(item, text), 'utf-8');
        items.push(item);
      } catch (err: any) {
        errors.push(`${path.basename(src)}: ${err.message}`);
      }
    }
    writeRack(ws, items);
    return { success: errors.length === 0, errors, items };
  });

  /**
   * Save Markdown written by an agent (e.g. "make the project documentation") as a rack item.
   * Saving again with the same name replaces it, so repeated requests do not fill the rack.
   */
  ipcMain.handle('resources:saveMarkdown', async (_, ws: string, name: string, md: string) => {
    if (!ws || !fs.existsSync(ws)) return { success: false, error: 'Open a folder first.' };
    const items = readRack(ws);
    const dir = resDir(ws);
    fs.mkdirSync(path.join(dir, 'files'), { recursive: true });
    const fileName = /\.md$/i.test(name) ? name : `${name}.md`;
    let item = items.find((i) => i.name === fileName);
    if (!item) {
      const used = new Set(items.map((i) => i.slot));
      const slot = Array.from({ length: RACK_SLOTS }, (_, i) => i + 1).find((n) => !used.has(n));
      if (!slot) return { success: false, error: `Rack is full (${RACK_SLOTS} slots). Remove a document first.` };
      let slug = slugify(fileName);
      while (items.some((i) => i.md === `${slug}.md`)) slug += '-2';
      item = {
        id: crypto.randomUUID(), slot, name: fileName, type: 'md', size: 0, words: 0,
        file: path.join('files', `${slug}.md`), text: `${slug}.txt`, md: `${slug}.md`,
        agentsRead: true, status: 'ready', addedAt: Date.now(),
      };
      items.push(item);
    }
    const body = md.trim() + '\n';
    item.size = Buffer.byteLength(body);
    item.words = (body.match(/\S+/g) || []).length;
    item.status = 'ready';
    item.addedAt = Date.now();
    await fs.promises.writeFile(path.join(dir, item.file), body, 'utf-8');
    await fs.promises.writeFile(path.join(dir, item.text), body, 'utf-8');
    await fs.promises.writeFile(path.join(dir, item.md), body, 'utf-8');
    writeRack(ws, items);
    send('resources:changed', { ws });
    return { success: true, item };
  });

  ipcMain.handle('resources:readMd', async (_, ws: string, id: string) => {
    const it = readRack(ws).find((i) => i.id === id);
    if (!it) return null;
    try {
      return await fs.promises.readFile(path.join(resDir(ws), it.md), 'utf-8');
    } catch {
      return '';
    }
  });

  ipcMain.handle('resources:setAgentsRead', async (_, ws: string, id: string, on: boolean) => {
    const items = readRack(ws).map((i) => (i.id === id ? { ...i, agentsRead: on } : i));
    writeRack(ws, items);
    return items;
  });

  ipcMain.handle('resources:remove', async (_, ws: string, id: string) => {
    const items = readRack(ws);
    const it = items.find((i) => i.id === id);
    if (it) {
      for (const f of [it.file, it.text, it.md]) fs.rmSync(path.join(resDir(ws), f), { force: true });
    }
    const next = items.filter((i) => i.id !== id);
    writeRack(ws, next);
    return next;
  });

  /** Ask an agent to turn the extracted text into a structured Markdown brief. */
  ipcMain.handle('resources:summarize', async (_, ws: string, id: string, provider: StudioProvider, model?: string) => {
    const items = readRack(ws);
    const it = items.find((i) => i.id === id);
    if (!it) return { success: false, error: 'Not found' };
    const bin = which(provider);
    if (!bin) return { success: false, error: `${provider} CLI not found. Install it and sign in from Terminal.` };
    if (running.has(id)) return { success: false, error: 'Already running' };

    const textPath = path.join(resDir(ws), it.text);
    const prompt = [
      'You are the DOCS agent of the Kernel Base IDE.',
      `Read the extracted text of the user's project document at: ${textPath}`,
      `Original document: ${it.name}${it.pages ? ` (${it.pages} pages)` : ''}.`,
      'Write a structured Markdown project brief that other coding agents will use as context.',
      'Use these sections when the document supports them: # <Project title>, ## Summary, ## Goals, ## Scope and features,',
      '## Requirements (functional / non-functional), ## Architecture and tech stack, ## Data and interfaces, ## Constraints,',
      '## Milestones, ## Open questions. Keep facts from the document only; cite page numbers like (p. 3) when available.',
      'Output ONLY the Markdown document, no preamble, no code fences around the whole document. Do not edit any files.',
    ].join('\n');

    writeRack(ws, items.map((i) => (i.id === id ? { ...i, status: 'summarizing', error: undefined } : i)));
    send('resources:changed', { ws });

    const proc = spawn(bin, buildArgs({ id, provider, prompt, cwd: ws, model, mode: 'plan' }), {
      cwd: ws,
      shell: false,
      env: { ...process.env, NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    running.set(id, proc);
    let out = '';
    let err = '';
    proc.stdout?.on('data', (d) => {
      out += d.toString('utf-8');
      send('resources:progress', { id, chars: out.length });
    });
    proc.stderr?.on('data', (d) => (err += d.toString('utf-8')));

    return await new Promise((resolve) => {
      proc.on('close', async (code) => {
        running.delete(id);
        const md = out.trim().replace(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/i, '$1');
        const ok = code === 0 && md.length > 40;
        if (ok) await fs.promises.writeFile(path.join(resDir(ws), it.md), md + '\n', 'utf-8');
        const next = readRack(ws).map((i) =>
          i.id === id ? { ...i, status: ok ? 'ready' : 'error', error: ok ? undefined : (err.trim() || `exit ${code}`).slice(-300) } : i
        ) as RackItem[];
        writeRack(ws, next);
        send('resources:changed', { ws });
        resolve({ success: ok, error: ok ? undefined : next.find((i) => i.id === id)?.error });
      });
      proc.on('error', (e) => {
        running.delete(id);
        resolve({ success: false, error: e.message });
      });
    });
  });

  ipcMain.handle('resources:cancel', async (_, id: string) => {
    running.get(id)?.kill('SIGTERM');
    return true;
  });

  /** Absolute md paths of documents agents may read (used to build agent prompts). */
  ipcMain.handle('resources:agentContext', async (_, ws: string) =>
    readRack(ws)
      .filter((i) => i.agentsRead)
      .map((i) => ({ name: i.name, md: path.join(resDir(ws), i.md), text: path.join(resDir(ws), i.text) }))
  );
}
