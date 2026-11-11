import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { kb, fsApi, basename, dirname, joinPath, languageOf, DirEntry, IMAGE_EXT } from './bridge';

export type ThemePref = 'dark' | 'light' | 'system';
export type SidebarView = 'explorer' | 'search' | 'scm' | 'run' | 'extensions';
export type PanelTab = 'problems' | 'output' | 'terminal';
export type StudioTab = 'agents' | 'resources';

export interface Tab {
  id: string;
  kind: 'file' | 'welcome' | 'settings' | 'image' | 'binary' | 'markdown-preview';
  path?: string;
  name: string;
  content: string;
  saved: string;
  language: string;
  untitled?: boolean;
}

export interface Prefs {
  theme: ThemePref;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  terminalFont: string;
  terminalFontSize: number;
  showWelcome: boolean;
}

export interface TerminalInfo {
  id: string;
  title: string;
}

export interface OutputLine {
  id: number;
  channel: string;
  text: string;
  level: 'info' | 'warn' | 'error' | 'ok';
  at: number;
}

export interface Problem {
  path: string;
  line: number;
  col: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source?: string;
}

export interface Toast {
  id: number;
  level: 'info' | 'error' | 'ok';
  text: string;
}

export interface Command {
  id: string;
  title: string;
  category?: string;
  key?: string;
  run: () => void | Promise<void>;
}

const DEFAULT_PREFS: Prefs = {
  theme: 'dark',
  fontSize: 13,
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  autoSave: false,
  terminalFont: 'JetBrains Mono',
  terminalFontSize: 12,
  showWelcome: true,
};

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? { ...fallback, ...JSON.parse(v) } : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
}

let uid = 1;
const nextId = (p: string) => `${p}-${Date.now().toString(36)}-${uid++}`;

function useWorkbenchState() {
  // Preferences and theme
  const [prefs, setPrefsState] = useState<Prefs>(() => loadJSON('kb.prefs', DEFAULT_PREFS));
  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefsState((p) => {
      const n = { ...p, ...patch };
      saveJSON('kb.prefs', n);
      return n;
    });
  }, []);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const on = () => setSystemDark(mq.matches);
    mq?.addEventListener('change', on);
    return () => mq?.removeEventListener('change', on);
  }, []);
  const theme: 'dark' | 'light' = prefs.theme === 'system' ? (systemDark ? 'dark' : 'light') : prefs.theme;

  // Layout
  const [layout, setLayoutState] = useState(() => ({
    ...loadJSON('kb.layout', {
      sidebar: 'explorer' as SidebarView | null,
      sidebarW: 260,
      studioOpen: true,
      studioW: 360,
      studioTab: 'agents' as StudioTab,
      panelOpen: true,
      panelH: 240,
      panelTab: 'terminal' as PanelTab,
      voiceOn: false,
    }),
    voiceOn: false, // a voice session never auto-starts
  }));
  const setLayout = useCallback((patch: Partial<typeof layout>) => {
    setLayoutState((l) => {
      const n = { ...l, ...patch };
      saveJSON('kb.layout', n);
      return n;
    });
  }, []);

  // Workspace + explorer tree (lazy)
  const [root, setRoot] = useState<string | null>(null);
  const [dirs, setDirs] = useState<Record<string, DirEntry[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);

  const loadDir = useCallback(async (dir: string) => {
    try {
      const entries = await fsApi.list(dir);
      setDirs((d) => ({ ...d, [dir]: entries }));
      return entries;
    } catch {
      setDirs((d) => ({ ...d, [dir]: [] }));
      return [];
    }
  }, []);

  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;
  const rootRef = useRef(root);
  rootRef.current = root;

  const refreshTree = useCallback(async () => {
    const r = rootRef.current;
    if (!r) return;
    await Promise.all([r, ...Array.from(expandedRef.current)].map((d) => loadDir(d)));
  }, [loadDir]);

  const toggleDir = useCallback(
    async (dir: string, open?: boolean) => {
      const willOpen = open ?? !expandedRef.current.has(dir);
      setExpanded((s) => {
        const n = new Set(s);
        willOpen ? n.add(dir) : n.delete(dir);
        return n;
      });
      if (willOpen) await loadDir(dir);
    },
    [loadDir]
  );

  // Editors
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const activeRef = useRef(activeId);
  activeRef.current = activeId;
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [cursor, setCursor] = useState({ line: 1, col: 1, sel: 0 });
  const pendingReveal = useRef<{ path: string; line: number; col: number } | null>(null);

  // Notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((text: string, level: Toast['level'] = 'info') => {
    const id = uid++;
    setToasts((t) => [...t.slice(-3), { id, text, level }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), level === 'error' ? 8000 : 4000);
  }, []);
  const dismissToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  // Output + problems
  const [output, setOutput] = useState<OutputLine[]>([]);
  const log = useCallback((channel: string, text: string, level: OutputLine['level'] = 'info') => {
    setOutput((o) => [...o.slice(-2000), { id: uid++, channel, text, level, at: Date.now() }]);
  }, []);
  const [problems, setProblems] = useState<Problem[]>([]);

  const openSpecial = useCallback((kind: 'welcome' | 'settings') => {
    const existing = tabsRef.current.find((t) => t.kind === kind);
    if (existing) return setActiveId(existing.id);
    const tab: Tab = { id: nextId(kind), kind, name: kind === 'welcome' ? 'Welcome' : 'Settings', content: '', saved: '', language: 'plaintext' };
    setTabs((t) => [...t, tab]);
    setActiveId(tab.id);
  }, []);

  const openFile = useCallback(
    async (path: string, reveal?: { line: number; col?: number }) => {
      const existing = tabsRef.current.find((t) => t.path === path);
      if (reveal) pendingReveal.current = { path, line: reveal.line, col: reveal.col || 1 };
      if (existing) {
        setActiveId(existing.id);
        if (reveal && editorRef.current && activeRef.current === existing.id) {
          editorRef.current.revealLineInCenter(reveal.line);
          editorRef.current.setPosition({ lineNumber: reveal.line, column: reveal.col || 1 });
          editorRef.current.focus();
          pendingReveal.current = null;
        }
        return;
      }
      const name = basename(path);
      const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
      let tab: Tab;
      if (IMAGE_EXT.has(ext)) {
        tab = { id: nextId('tab'), kind: 'image', path, name, content: '', saved: '', language: 'plaintext' };
      } else {
        const st = await fsApi.stat(path);
        if (!st) {
          notify(`Cannot open ${name}: file not found`, 'error');
          return;
        }
        if (st.size > 10 * 1024 * 1024) {
          tab = { id: nextId('tab'), kind: 'binary', path, name, content: 'File is larger than 10 MB.', saved: '', language: 'plaintext' };
        } else {
          let content = '';
          try {
            content = await fsApi.read(path);
          } catch (e: any) {
            notify(`Cannot open ${name}: ${e.message}`, 'error');
            return;
          }
          const binary = content.slice(0, 8000).includes('\u0000');
          tab = binary
            ? { id: nextId('tab'), kind: 'binary', path, name, content: 'This file is binary or uses an unsupported text encoding.', saved: '', language: 'plaintext' }
            : { id: nextId('tab'), kind: 'file', path, name, content, saved: content, language: languageOf(path) };
        }
      }
      setTabs((t) => [...t, tab]);
      setActiveId(tab.id);
      setSelected(path);
    },
    [notify]
  );

  const newUntitled = useCallback(() => {
    const n = tabsRef.current.filter((t) => t.untitled).length + 1;
    const tab: Tab = { id: nextId('tab'), kind: 'file', name: `Untitled-${n}`, content: '', saved: '', language: 'plaintext', untitled: true };
    setTabs((t) => [...t, tab]);
    setActiveId(tab.id);
  }, []);

  const updateContent = useCallback((id: string, content: string) => {
    setTabs((t) => t.map((x) => (x.id === id ? { ...x, content } : x)));
  }, []);

  const saveTab = useCallback(
    async (id: string, saveAs = false): Promise<boolean> => {
      const tab = tabsRef.current.find((t) => t.id === id);
      if (!tab || tab.kind !== 'file') return false;
      let path = tab.path;
      if (!path || saveAs || tab.untitled) {
        const target = await kb.dialog.saveFile(path || (rootRef.current ? joinPath(rootRef.current, tab.name) : tab.name));
        if (!target) return false;
        path = target;
      }
      try {
        await fsApi.write(path!, tab.content);
      } catch (e: any) {
        notify(`Save failed: ${e.message}`, 'error');
        return false;
      }
      setTabs((t) =>
        t.map((x) =>
          x.id === id ? { ...x, path, name: basename(path!), saved: x.content, untitled: false, language: x.untitled || saveAs ? languageOf(path!) : x.language } : x
        )
      );
      if (rootRef.current && path!.startsWith(rootRef.current)) loadDir(dirname(path!));
      return true;
    },
    [notify, loadDir]
  );

  const saveAll = useCallback(async () => {
    for (const t of tabsRef.current) if (t.kind === 'file' && t.content !== t.saved && t.path) await saveTab(t.id);
  }, [saveTab]);

  const closeTab = useCallback(
    async (id: string) => {
      const tab = tabsRef.current.find((t) => t.id === id);
      if (!tab) return;
      if (tab.kind === 'file' && tab.content !== tab.saved) {
        const choice = window.confirm(`Save changes to ${tab.name} before closing?\n\nOK saves, Cancel discards.`);
        if (choice && !(await saveTab(id))) return;
      }
      setTabs((t) => {
        const idx = t.findIndex((x) => x.id === id);
        const next = t.filter((x) => x.id !== id);
        if (activeRef.current === id) setActiveId(next.length ? next[Math.min(idx, next.length - 1)].id : null);
        return next;
      });
    },
    [saveTab]
  );

  // Workspace open / close
  const openFolder = useCallback(
    async (folder: string) => {
      const dirty = tabsRef.current.filter((t) => t.kind === 'file' && t.content !== t.saved);
      if (dirty.length && !window.confirm(`${dirty.length} file(s) have unsaved changes. Open the folder anyway and discard them?`)) return;
      await kb.workspace.set(folder);
      setRoot(folder);
      setDirs({});
      setExpanded(new Set());
      setTabs([]);
      setActiveId(null);
      setProblems([]);
      await loadDir(folder);
      // restore last session for this folder
      const sess = loadJSON<{ files: string[]; active?: string }>(`kb.session:${folder}`, { files: [] });
      for (const f of sess.files.slice(0, 15)) if (await fsApi.stat(f)) await openFile(f);
      if (sess.active && (await fsApi.stat(sess.active))) await openFile(sess.active);
      if (!sess.files.length && loadJSON('kb.prefs', DEFAULT_PREFS).showWelcome) openSpecial('welcome');
    },
    [loadDir, openFile, openSpecial]
  );

  const closeFolder = useCallback(() => {
    const dirty = tabsRef.current.filter((t) => t.kind === 'file' && t.content !== t.saved);
    if (dirty.length && !window.confirm(`${dirty.length} file(s) have unsaved changes. Close the folder and discard them?`)) return;
    setRoot(null);
    setDirs({});
    setExpanded(new Set());
    setTabs([]);
    setActiveId(null);
    setProblems([]);
  }, []);

  const pickFolder = useCallback(async () => {
    const r = await kb.workspace.selectFolder();
    if (r?.success && r.folderPath) await openFolder(r.folderPath);
  }, [openFolder]);

  const pickFiles = useCallback(async () => {
    const files: string[] = await kb.dialog.openFile(rootRef.current || undefined);
    for (const f of files) await openFile(f);
  }, [openFile]);

  // Persist open tabs per workspace
  useEffect(() => {
    if (!root) return;
    const files = tabs.filter((t) => t.path && (t.kind === 'file' || t.kind === 'image')).map((t) => t.path!);
    const active = tabs.find((t) => t.id === activeId)?.path;
    saveJSON(`kb.session:${root}`, { files, active });
  }, [tabs, activeId, root]);

  // Initial workspace
  useEffect(() => {
    if (!kb) return;
    kb.workspace.get().then((ws: any) => ws?.rootPath && openFolder(ws.rootPath));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On window focus: refresh tree and reload unmodified open files changed on disk
  useEffect(() => {
    const onFocus = async () => {
      refreshTree();
      for (const t of tabsRef.current) {
        if (t.kind !== 'file' || !t.path || t.content !== t.saved) continue;
        try {
          const disk = await fsApi.read(t.path);
          if (disk !== t.saved) setTabs((all) => all.map((x) => (x.id === t.id ? { ...x, content: disk, saved: disk } : x)));
        } catch {
          /* deleted on disk */
        }
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshTree]);

  // Auto save
  useEffect(() => {
    if (!prefs.autoSave) return;
    const t = setTimeout(() => saveAll(), 1000);
    return () => clearTimeout(t);
  }, [tabs, prefs.autoSave, saveAll]);

  // Terminals
  const [terminals, setTerminals] = useState<TerminalInfo[]>([]);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const termsRef = useRef(terminals);
  termsRef.current = terminals;
  const termClear = useRef<Record<string, () => void>>({});

  const newTerminal = useCallback(
    async (title?: string, cwd?: string): Promise<string> => {
      const id = nextId('term');
      const res = await kb.terminal.create({ id, cwd: cwd || rootRef.current || undefined, cols: 120, rows: 20 });
      const name = title || res?.shell || 'zsh';
      setTerminals((t) => [...t, { id, title: name }]);
      setActiveTerm(id);
      setLayout({ panelOpen: true, panelTab: 'terminal' });
      return id;
    },
    [setLayout]
  );

  const killTerminal = useCallback(async (id?: string) => {
    const target = id || activeTerm;
    if (!target) return;
    await kb.terminal.kill(target);
    setTerminals((t) => {
      const next = t.filter((x) => x.id !== target);
      setActiveTerm((cur) => (cur === target ? next[next.length - 1]?.id || null : cur));
      return next;
    });
  }, [activeTerm]);

  useEffect(() => {
    if (!kb) return;
    return kb.terminal.onExit(({ id }: { id: string }) => {
      setTerminals((t) => {
        const next = t.filter((x) => x.id !== id);
        setActiveTerm((cur) => (cur === id ? next[next.length - 1]?.id || null : cur));
        return next;
      });
    });
  }, []);

  /** Runs a command in a dedicated terminal so interactive programs can read input. */
  const runInTerminal = useCallback(
    async (command: string, cwd: string, title = 'Run') => {
      let term = termsRef.current.find((t) => t.title === title);
      let id = term?.id;
      if (!id) id = await newTerminal(title, cwd);
      setActiveTerm(id);
      setLayout({ panelOpen: true, panelTab: 'terminal' });
      const q = `'${cwd.replace(/'/g, `'\\''`)}'`;
      await kb.terminal.write(id, `\u0015cd ${q} && clear && ${command}\r`);
      log(title, `$ ${command}  (in ${cwd})`);
    },
    [newTerminal, setLayout, log]
  );

  // Command palette / quick open
  const [quick, setQuick] = useState<null | { mode: 'commands' | 'files' | 'line'; initial?: string }>(null);
  const commandsRef = useRef<Map<string, Command>>(new Map());
  const registerCommands = useCallback((cmds: Command[]) => {
    for (const c of cmds) commandsRef.current.set(c.id, c);
  }, []);
  const runCommand = useCallback((id: string) => {
    const c = commandsRef.current.get(id);
    if (c) Promise.resolve(c.run()).catch((e) => console.error(id, e));
    return !!c;
  }, []);

  // Git summary for status bar / badge
  const [git, setGit] = useState<{
    branch?: string;
    changes: number;
    ahead?: number;
    behind?: number;
    isRepo: boolean;
    files?: Record<string, string>;
    staged?: { path: string; status: string }[];
    unstaged?: { path: string; status: string }[];
  }>({ changes: 0, isRepo: false });
  const refreshGit = useCallback(async () => {
    const r = rootRef.current;
    if (!r || !kb) return;
    try {
      const res = await kb.git.status(r);
      const s = res?.gitState;
      if (!res?.success || !s?.isRepo) return setGit({ changes: 0, isRepo: false });
      const files: Record<string, string> = {};
      for (const f of [...(s.stagedFiles || []), ...(s.unstagedFiles || [])]) files[joinPath(r, String(f.path).replace(/\/$/, ''))] = f.status === '?' ? 'U' : f.status;
      setGit({ branch: s.currentBranch, changes: Object.keys(files).length, ahead: s.ahead, behind: s.behind, isRepo: true, files, staged: s.stagedFiles || [], unstaged: s.unstagedFiles || [] });
    } catch {
      setGit({ changes: 0, isRepo: false });
    }
  }, []);
  useEffect(() => {
    refreshGit();
    const t = setInterval(refreshGit, 6000);
    return () => clearInterval(t);
  }, [root, refreshGit]);

  /** Reload open files that changed on disk (e.g. written by an agent). Unsaved edits are never overwritten. */
  const syncFromDisk = useCallback(async () => {
    const clean = tabsRef.current.filter((t) => t.kind === 'file' && t.path && !t.untitled && t.content === t.saved);
    const fresh = await Promise.all(
      clean.map(async (t) => {
        try {
          return [t.id, await fsApi.read(t.path!)] as const;
        } catch {
          return null;
        }
      })
    );
    const changed = new Map(fresh.filter((x): x is readonly [string, string] => !!x).map(([id, c]) => [id, c]));
    if (!changed.size) return;
    setTabs((ts) => ts.map((t) => (changed.has(t.id) && t.content === t.saved && changed.get(t.id) !== t.content ? { ...t, content: changed.get(t.id)!, saved: changed.get(t.id)! } : t)));
  }, []);

  // Kernel voice session summary (shown in Agent Studio)
  const [kernelStats, setKernelStats] = useState<{ startedAt: number; turns: number; phase: string; files: number; quickSecs?: number; buildSecs?: number }>({ startedAt: 0, turns: 0, phase: '', files: 0 });

  const activeTab = tabs.find((t) => t.id === activeId) || null;

  return {
    prefs, setPrefs, theme,
    layout, setLayout,
    root, dirs, expanded, selected, setSelected, loadDir, toggleDir, refreshTree, openFolder, closeFolder, pickFolder, pickFiles,
    tabs, setTabs, activeId, setActiveId, activeTab, openFile, openSpecial, newUntitled, updateContent, saveTab, saveAll, closeTab,
    editorRef, monacoRef, cursor, setCursor, pendingReveal,
    toasts, notify, dismissToast,
    output, log, clearOutput: () => setOutput([]), problems, setProblems,
    terminals, activeTerm, setActiveTerm, newTerminal, killTerminal, runInTerminal, termClear,
    quick, setQuick, registerCommands, runCommand, commandsRef,
    git, refreshGit, syncFromDisk,
    kernelStats, setKernelStats,
  };
}

export type Workbench = ReturnType<typeof useWorkbenchState>;
const Ctx = createContext<Workbench | null>(null);

export const WorkbenchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wb = useWorkbenchState();
  return <Ctx.Provider value={wb}>{children}</Ctx.Provider>;
};

export function useWb(): Workbench {
  const v = useContext(Ctx);
  if (!v) throw new Error('useWb outside WorkbenchProvider');
  return v;
}

export function useStable<T extends (...a: any[]) => any>(fn: T): T {
  const ref = useRef(fn);
  ref.current = fn;
  return useMemo(() => ((...a: any[]) => ref.current(...a)) as T, []);
}
