import React, { useEffect, useState } from 'react';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './workbench.css';
import { useWb, SidebarView, Command } from './store';
import { kb, isDesktop, basename, LANGUAGE_LABEL } from './bridge';
import { Icon, BrandLogo } from './icons';
import { Explorer, ContextMenu, MenuItem } from './Explorer';
import { SearchView, ScmView, RunView, ExtensionsView } from './SideViews';
import { EditorArea } from './Editor';
import { Panel } from './Panel';
import { Studio } from './Studio';
import { QuickInput } from './QuickInput';
import { KernelVoice } from './KernelVoice';
import { TrustPrompt } from './trust';

const VIEW_TITLE: Record<SidebarView, string> = { explorer: 'Explorer', search: 'Search', scm: 'Source Control', run: 'Run and Build', extensions: 'Extensions' };

/* ---------- commands (shared by menus, palette and shortcuts) ---------- */
function useCommands() {
  const wb = useWb();
  const { layout, setLayout } = wb;

  const editorCmd = (action: string, fallback?: string) => () => {
    const el = document.activeElement as HTMLElement | null;
    const inMonaco = !!el?.closest('.monaco-editor');
    if (!inMonaco && fallback && el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable || el.closest('.xterm'))) {
      document.execCommand(fallback);
      return;
    }
    const ed = wb.editorRef.current;
    if (ed && wb.activeTab?.kind === 'file') {
      ed.focus();
      ed.trigger('kb', action, null);
    } else if (fallback) document.execCommand(fallback);
  };

  const showView = (v: SidebarView) => setLayout({ sidebar: layout.sidebar === v ? null : v });
  const openView = (v: SidebarView) => setLayout({ sidebar: v });

  const activeFile = () => (wb.activeTab?.kind === 'file' ? wb.activeTab : null);

  const runFile = async () => {
    const t = activeFile();
    if (!t) return wb.notify('Open a file to run it.', 'info');
    if (t.untitled || !t.path) {
      if (!(await wb.saveTab(t.id))) return;
    } else if (t.content !== t.saved) await wb.saveTab(t.id);
    const path = wb.tabs.find((x) => x.id === t.id)?.path || t.path;
    const r = await kb.project.commandForFile(path, wb.root || undefined);
    if (!r?.command) return wb.notify(`Kernel Base does not know how to run ${basename(path!)} yet. Use a custom command in Run and Build.`, 'error');
    wb.runInTerminal(r.command, r.cwd);
  };

  const runProject = async (kind: 'run' | 'build' | 'test') => {
    if (!wb.root) return wb.notify('Open a folder first.', 'info');
    await wb.saveAll();
    const p = await kb.project.detect(wb.root);
    const cmd = p?.[kind];
    if (!cmd) {
      if (kind === 'run' && activeFile()) return runFile();
      return wb.notify(`No ${kind} command detected for this ${p?.kind || 'folder'}. Add a Makefile, package.json script or use a custom command.`, 'error');
    }
    wb.runInTerminal(cmd, p.cwd || wb.root, kind === 'run' ? 'Run' : kind === 'build' ? 'Build' : 'Test');
  };

  const stopTask = () => {
    const t = wb.terminals.filter((x) => ['Run', 'Build', 'Test'].includes(x.title));
    if (!t.length) return wb.notify('Nothing is running.', 'info');
    for (const x of t) kb.terminal.write(x.id, '\u0003');
  };

  const cycleTab = (dir: 1 | -1) => {
    if (!wb.tabs.length) return;
    const i = wb.tabs.findIndex((t) => t.id === wb.activeId);
    wb.setActiveId(wb.tabs[(i + dir + wb.tabs.length) % wb.tabs.length].id);
  };

  const cmds: Command[] = [
    { id: 'settings.open', category: 'Preferences', title: 'Open Settings', key: '⌘,', run: () => wb.openSpecial('settings') },
    { id: 'theme.toggle', category: 'Preferences', title: 'Toggle Dark / Light Theme', key: '⌥⌘T', run: () => wb.setPrefs({ theme: wb.theme === 'dark' ? 'light' : 'dark' }) },
    { id: 'theme.dark', category: 'Preferences', title: 'Color Theme: Dark', run: () => wb.setPrefs({ theme: 'dark' }) },
    { id: 'theme.light', category: 'Preferences', title: 'Color Theme: Light', run: () => wb.setPrefs({ theme: 'light' }) },
    { id: 'theme.system', category: 'Preferences', title: 'Color Theme: Follow System', run: () => wb.setPrefs({ theme: 'system' }) },
    { id: 'file.new', category: 'File', title: 'New Text File', key: '⌘N', run: wb.newUntitled },
    { id: 'file.open', category: 'File', title: 'Open File...', key: '⌘O', run: wb.pickFiles },
    { id: 'folder.open', category: 'File', title: 'Open Folder...', key: '⇧⌘O', run: wb.pickFolder },
    { id: 'folder.close', category: 'File', title: 'Close Folder', run: wb.closeFolder },
    { id: 'file.save', category: 'File', title: 'Save', key: '⌘S', run: async () => { if (wb.activeId) await wb.saveTab(wb.activeId); } },
    { id: 'file.saveAs', category: 'File', title: 'Save As...', key: '⇧⌘S', run: async () => { if (wb.activeId) await wb.saveTab(wb.activeId, true); } },
    { id: 'file.saveAll', category: 'File', title: 'Save All', key: '⌥⌘S', run: wb.saveAll },
    { id: 'file.reveal', category: 'File', title: 'Reveal Active File in Finder', run: () => wb.activeTab?.path && kb.fs.revealInFinder(wb.activeTab.path) },
    { id: 'editor.close', category: 'View', title: 'Close Editor', key: '⌘W', run: () => wb.activeId && wb.closeTab(wb.activeId) },
    { id: 'edit.undo', category: 'Edit', title: 'Undo', key: '⌘Z', run: editorCmd('undo', 'undo') },
    { id: 'edit.redo', category: 'Edit', title: 'Redo', key: '⇧⌘Z', run: editorCmd('redo', 'redo') },
    { id: 'edit.selectAll', category: 'Edit', title: 'Select All', key: '⌘A', run: editorCmd('editor.action.selectAll', 'selectAll') },
    { id: 'editor.find', category: 'Edit', title: 'Find', key: '⌘F', run: editorCmd('actions.find') },
    { id: 'editor.replace', category: 'Edit', title: 'Replace', key: '⌥⌘F', run: editorCmd('editor.action.startFindReplaceAction') },
    { id: 'editor.expandSelection', category: 'Selection', title: 'Expand Selection', run: editorCmd('editor.action.smartSelect.expand') },
    { id: 'editor.copyLineDown', category: 'Selection', title: 'Copy Line Down', run: editorCmd('editor.action.copyLinesDownAction') },
    { id: 'editor.moveLineUp', category: 'Selection', title: 'Move Line Up', key: '⌥↑', run: editorCmd('editor.action.moveLinesUpAction') },
    { id: 'editor.moveLineDown', category: 'Selection', title: 'Move Line Down', key: '⌥↓', run: editorCmd('editor.action.moveLinesDownAction') },
    { id: 'editor.comment', category: 'Edit', title: 'Toggle Line Comment', key: '⌘/', run: editorCmd('editor.action.commentLine') },
    { id: 'editor.format', category: 'Edit', title: 'Format Document', key: '⇧⌥F', run: editorCmd('editor.action.formatDocument') },
    { id: 'editor.gotoLine', category: 'Go', title: 'Go to Line...', key: '⌃G', run: () => wb.setQuick({ mode: 'line' }) },
    { id: 'editor.next', category: 'View', title: 'Open Next Editor', key: '⌥⌘→', run: () => cycleTab(1) },
    { id: 'editor.prev', category: 'View', title: 'Open Previous Editor', key: '⌥⌘←', run: () => cycleTab(-1) },
    { id: 'palette.open', category: 'View', title: 'Show All Commands', key: '⇧⌘P', run: () => wb.setQuick({ mode: 'commands' }) },
    { id: 'quickOpen.open', category: 'Go', title: 'Go to File...', key: '⌘P', run: () => wb.setQuick({ mode: 'files' }) },
    { id: 'view.explorer', category: 'View', title: 'Show Explorer', key: '⇧⌘E', run: () => openView('explorer') },
    { id: 'view.search', category: 'View', title: 'Show Search', key: '⇧⌘F', run: () => openView('search') },
    { id: 'view.scm', category: 'View', title: 'Show Source Control', key: '⌃⇧G', run: () => openView('scm') },
    { id: 'view.run', category: 'View', title: 'Show Run and Build', key: '⇧⌘D', run: () => openView('run') },
    { id: 'view.extensions', category: 'View', title: 'Show Extensions', key: '⇧⌘X', run: () => openView('extensions') },
    { id: 'view.studio', category: 'View', title: 'Show Agent Studio', run: () => setLayout({ studioOpen: true, studioTab: 'agents' }) },
    { id: 'panel.problems', category: 'View', title: 'Show Problems', key: '⇧⌘M', run: () => setLayout({ panelOpen: true, panelTab: 'problems' }) },
    { id: 'panel.output', category: 'View', title: 'Show Output', key: '⇧⌘U', run: () => setLayout({ panelOpen: true, panelTab: 'output' }) },
    { id: 'panel.terminal', category: 'View', title: 'Toggle Terminal', key: '⌃`', run: () => setLayout(layout.panelOpen && layout.panelTab === 'terminal' ? { panelOpen: false } : { panelOpen: true, panelTab: 'terminal' }) },
    { id: 'layout.sidebar', category: 'View', title: 'Toggle Primary Side Bar', key: '⌘B', run: () => setLayout({ sidebar: layout.sidebar ? null : 'explorer' }) },
    { id: 'layout.panel', category: 'View', title: 'Toggle Panel', key: '⌘J', run: () => setLayout({ panelOpen: !layout.panelOpen }) },
    { id: 'layout.studio', category: 'View', title: 'Toggle Agent Studio', key: '⇧⌘L', run: () => setLayout({ studioOpen: !layout.studioOpen }) },
    { id: 'run.file', category: 'Run', title: 'Run Active File', key: 'F5', run: runFile },
    { id: 'run.fileInTerminal', category: 'Run', title: 'Run Active File in Terminal', run: runFile },
    { id: 'run.project', category: 'Run', title: 'Run Project', key: '⇧F5', run: () => runProject('run') },
    { id: 'run.build', category: 'Run', title: 'Build Project', key: '⇧⌘B', run: () => runProject('build') },
    { id: 'run.test', category: 'Run', title: 'Run Tests', run: () => runProject('test') },
    { id: 'run.stop', category: 'Run', title: 'Stop Running Task', key: '⌃C', run: stopTask },
    { id: 'terminal.new', category: 'Terminal', title: 'Create New Terminal', key: '⌃⇧`', run: () => wb.newTerminal() },
    { id: 'terminal.kill', category: 'Terminal', title: 'Kill the Active Terminal', run: () => wb.killTerminal() },
    { id: 'terminal.clear', category: 'Terminal', title: 'Clear Terminal', run: () => wb.activeTerm && wb.termClear.current[wb.activeTerm]?.() },
    { id: 'kernel.voice', category: 'Agents', title: 'Toggle Kernel Voice Session', key: '⇧⌘K', run: () => setLayout({ voiceOn: !layout.voiceOn }) },
    { id: 'agents.new', category: 'Agents', title: 'New Agent Run', key: '⇧⌘A', run: () => setLayout({ studioOpen: true, studioTab: 'agents' }) },
    { id: 'agents.stopAll', category: 'Agents', title: 'Stop All Agents', run: () => window.dispatchEvent(new Event('kb:agents-stop-all')) },
    { id: 'agents.detect', category: 'Agents', title: 'Detect AI CLIs', run: () => setLayout({ studioOpen: true }) },
    { id: 'resources.add', category: 'Agents', title: 'Add Document to Resources...', run: () => { setLayout({ studioOpen: true, studioTab: 'resources' }); setTimeout(() => window.dispatchEvent(new Event('kb:resources-add')), 50); } },
    { id: 'resources.show', category: 'Agents', title: 'Show Resources Rack', run: () => setLayout({ studioOpen: true, studioTab: 'resources' }) },
    { id: 'help.welcome', category: 'Help', title: 'Welcome', run: () => wb.openSpecial('welcome') },
    { id: 'window.reload', category: 'Developer', title: 'Reload Window', run: () => window.location.reload() },
  ];
  wb.registerCommands(cmds);
}

/* ---------- title bar ---------- */
const TitleBar: React.FC = () => {
  const wb = useWb();
  const { layout, setLayout } = wb;
  return (
    <div className="kb-titlebar" data-testid="titlebar" onDoubleClick={(e) => e.target === e.currentTarget && kb?.system?.toggleMaximize?.()}>
      {!isDesktop && <span style={{ width: 0 }} />}
      <button className="kb-brand" title="Kernel Base: open Welcome" onClick={() => wb.openSpecial('welcome')} data-testid="brand">
        <BrandLogo size={20} />
        <span>Kernel Base</span>
      </button>
      <div className="spacer" />
      <button className="kb-command-center" onClick={() => wb.setQuick({ mode: 'files' })} title="Search files (⌘P), commands (⇧⌘P)" data-testid="command-center">
        <Icon name="search" size={13} />
        <span>{wb.root ? basename(wb.root) : 'Kernel Base'}</span>
      </button>
      <div className="spacer" />
      <button className={`kb-icon-btn ${layout.sidebar ? 'on' : ''}`} title="Toggle Primary Side Bar (⌘B)" onClick={() => setLayout({ sidebar: layout.sidebar ? null : 'explorer' })}>
        <Icon name="sidebarLeft" />
      </button>
      <button className={`kb-icon-btn ${layout.panelOpen ? 'on' : ''}`} title="Toggle Panel (⌘J)" onClick={() => setLayout({ panelOpen: !layout.panelOpen })}>
        <Icon name="panelBottom" />
      </button>
      <button className={`kb-icon-btn ${layout.studioOpen ? 'on' : ''}`} title="Toggle Agent Studio (⇧⌘L)" onClick={() => setLayout({ studioOpen: !layout.studioOpen })} data-testid="toggle-studio">
        <Icon name="sidebarRight" />
      </button>
      <button className="kb-icon-btn" title={wb.theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'} onClick={() => wb.runCommand('theme.toggle')} data-testid="theme-toggle">
        <Icon name={wb.theme === 'dark' ? 'sun' : 'moon'} />
      </button>
    </div>
  );
};

/* ---------- activity bar ---------- */
const ActivityBar: React.FC = () => {
  const wb = useWb();
  const { layout, setLayout } = wb;
  const [menu, setMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null);
  const item = (v: SidebarView, icon: string, title: string, badge?: number) => (
    <button key={v} className={layout.sidebar === v ? 'on' : ''} title={title} onClick={() => setLayout({ sidebar: layout.sidebar === v ? null : v })} data-testid={`activity-${v}`}>
      <Icon name={icon} size={24} stroke={1.4} />
      {!!badge && <span className="kb-badge">{badge > 99 ? '99+' : badge}</span>}
    </button>
  );
  return (
    <div className="kb-activity">
      <div>
        {item('explorer', 'files', 'Explorer (⇧⌘E)')}
        {item('search', 'search', 'Search (⇧⌘F)')}
        {item('scm', 'git', 'Source Control (⌃⇧G)', wb.git.changes)}
        {item('run', 'runDebug', 'Run and Build (⇧⌘D)')}
        {item('extensions', 'extensions', 'Extensions (⇧⌘X)')}
        <button className={layout.studioOpen ? 'on' : ''} title="Agent Studio (⇧⌘L)" onClick={() => setLayout({ studioOpen: !layout.studioOpen })} data-testid="activity-studio">
          <Icon name="agents" size={24} stroke={1.4} />
        </button>
      </div>
      <div>
        <button
          title="Manage"
          onClick={(e) =>
            setMenu({
              x: e.clientX + 12,
              y: e.clientY - 150,
              items: [
                { label: 'Command Palette...', key: '⇧⌘P', run: () => wb.runCommand('palette.open') },
                { label: 'Settings', key: '⌘,', run: () => wb.runCommand('settings.open') },
                { sep: true },
                { label: wb.theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme', run: () => wb.runCommand('theme.toggle') },
                { label: 'Welcome', run: () => wb.runCommand('help.welcome') },
              ],
            })
          }
        >
          <Icon name="gear" size={24} stroke={1.4} />
        </button>
      </div>
      {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} />}
    </div>
  );
};

/* ---------- status bar ---------- */
const StatusBar: React.FC = () => {
  const wb = useWb();
  const t = wb.activeTab;
  const errors = wb.problems.filter((p) => p.severity === 'error').length;
  const warns = wb.problems.filter((p) => p.severity === 'warning').length;
  return (
    <div className="kb-status" data-testid="statusbar">
      <span className="remote" title="Kernel Base">
        <BrandLogo size={14} />
      </span>
      {wb.git.isRepo && (
        <button title="Source Control" onClick={() => wb.setLayout({ sidebar: 'scm' })}>
          <Icon name="git" size={13} /> {wb.git.branch || 'HEAD'}
          {wb.git.changes ? '*' : ''}
          {(wb.git.ahead || wb.git.behind) ? <span style={{ marginLeft: 4 }}>{wb.git.behind || 0}↓ {wb.git.ahead || 0}↑</span> : null}
        </button>
      )}
      <button title="Problems" onClick={() => wb.setLayout({ panelOpen: true, panelTab: 'problems' })}>
        <Icon name="error" size={13} /> {errors}
        <Icon name="warning" size={13} style={{ marginLeft: 4 }} /> {warns}
      </button>
      <div style={{ flex: 1, padding: 0 }} />
      {t?.kind === 'file' && (
        <>
          <button onClick={() => wb.runCommand('editor.gotoLine')} title="Go to Line">
            Ln {wb.cursor.line}, Col {wb.cursor.col}
            {wb.cursor.sel ? ` (${wb.cursor.sel} selected)` : ''}
          </button>
          <button title="Indentation" onClick={() => wb.openSpecial('settings')}>Spaces: {wb.prefs.tabSize}</button>
          <span>UTF-8</span>
          <span>LF</span>
          <span>{LANGUAGE_LABEL[t.language] || t.language}</span>
        </>
      )}
      <button title="Toggle theme" onClick={() => wb.runCommand('theme.toggle')}>
        <Icon name={wb.theme === 'dark' ? 'moon' : 'sun'} size={13} />
      </button>
      <button title="Notifications"><Icon name="bell" size={13} /></button>
    </div>
  );
};

/* ---------- toasts ---------- */
const Toasts: React.FC = () => {
  const wb = useWb();
  return (
    <div className="kb-toasts">
      {wb.toasts.map((t) => (
        <div key={t.id} className="kb-toast" role="status">
          <Icon name={t.level === 'error' ? 'error' : t.level === 'ok' ? 'check' : 'info'} size={16} style={{ color: t.level === 'error' ? 'var(--err)' : t.level === 'ok' ? 'var(--ok)' : 'var(--accent-fg)', marginTop: 1 }} />
          <div className="select-text" style={{ flex: 1, lineHeight: 1.45 }}>{t.text}</div>
          <button className="kb-icon-btn" style={{ width: 20, height: 20 }} onClick={() => wb.dismissToast(t.id)}><Icon name="close" size={13} /></button>
        </div>
      ))}
    </div>
  );
};

/* ---------- sash ---------- */
const Sash: React.FC<{ side: 'left' | 'right'; width: number; onChange: (w: number) => void; min: number; max: number }> = ({ side, width, onChange, min, max }) => {
  const [drag, setDrag] = useState(false);
  return (
    <div
      className={`kb-sash-v ${drag ? 'drag' : ''}`}
      style={side === 'right' ? { right: -2 } : { left: -2 }}
      onMouseDown={(e) => {
        e.preventDefault();
        setDrag(true);
        const x0 = e.clientX;
        const move = (ev: MouseEvent) => onChange(Math.max(min, Math.min(max, width + (side === 'right' ? ev.clientX - x0 : x0 - ev.clientX))));
        const up = () => {
          setDrag(false);
          document.body.style.cursor = '';
          window.removeEventListener('mousemove', move);
          window.removeEventListener('mouseup', up);
        };
        document.body.style.cursor = 'col-resize';
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
      }}
    />
  );
};

/* ---------- workbench ---------- */
export const Workbench: React.FC = () => {
  const wb = useWb();
  const { layout, setLayout, theme } = wb;
  useCommands();
  (window as any).__kbWorkbench = wb; // used by the automated UI tests

  useEffect(() => {
    document.body.style.background = theme === 'dark' ? '#1f1f1f' : '#ffffff';
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Window title
  useEffect(() => {
    const t = wb.activeTab;
    document.title = [t ? `${t.kind === 'file' && t.content !== t.saved ? '● ' : ''}${t.name}` : null, wb.root ? basename(wb.root) : null, 'Kernel Base'].filter(Boolean).join(' — ');
  }, [wb.activeTab, wb.root]);

  // Native menu bar
  useEffect(() => {
    if (!kb?.menu) return;
    return kb.menu.onAction((id: string) => {
      if (!wb.runCommand(id)) console.warn('Unknown menu action', id);
    });
  }, [wb]);

  // Keyboard shortcuts not covered by the native menu (and all of them in a browser)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (e.key === 'Escape' && wb.quick) return wb.setQuick(null);
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        return wb.runCommand(e.shiftKey ? 'terminal.new' : 'panel.terminal');
      }
      if (isDesktop) return; // the native menu owns the rest
      const k = e.key.toLowerCase();
      const map: Record<string, string> = {
        p: e.shiftKey ? 'palette.open' : 'quickOpen.open',
        s: e.shiftKey ? 'file.saveAs' : 'file.save',
        b: 'layout.sidebar',
        j: 'layout.panel',
        o: e.shiftKey ? 'folder.open' : 'file.open',
        ',': 'settings.open',
      };
      if (meta && map[k]) {
        e.preventDefault();
        wb.runCommand(map[k]);
      }
      if (e.key === 'F5') {
        e.preventDefault();
        wb.runCommand(e.shiftKey ? 'run.project' : 'run.file');
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [wb]);

  // Drop files/folders from Finder onto the window to open them
  const onDrop = async (e: React.DragEvent) => {
    if (!kb?.resources?.pathForFile || e.defaultPrevented) return;
    e.preventDefault();
    for (const f of Array.from(e.dataTransfer.files)) {
      const p = kb.resources.pathForFile(f);
      if (!p) continue;
      const st = await kb.fs.stat(p);
      if (st?.stat?.isDirectory) await wb.openFolder(p);
      else await wb.openFile(p);
    }
  };

  const SideView = () => {
    switch (layout.sidebar) {
      case 'explorer': return <Explorer />;
      case 'search': return <SearchView />;
      case 'scm': return <ScmView />;
      case 'run': return <RunView />;
      case 'extensions': return <ExtensionsView />;
      default: return null;
    }
  };

  return (
    <div className="kb-root" data-theme={theme} onDragOver={(e) => e.preventDefault()} onDrop={onDrop} data-testid="workbench">
      <TitleBar />
      <div className="kb-body">
        <ActivityBar />
        {layout.sidebar && (
          <div className="kb-sidebar" style={{ width: layout.sidebarW }} data-testid="sidebar">
            <div className="kb-view-title">
              <span>{VIEW_TITLE[layout.sidebar]}</span>
              <div className="kb-view-actions">
                {layout.sidebar === 'explorer' && (
                  <button className="kb-icon-btn" title="Open Folder..." onClick={wb.pickFolder}><Icon name="folder" size={15} /></button>
                )}
                {layout.sidebar === 'scm' && (
                  <button className="kb-icon-btn" title="Refresh" onClick={wb.refreshGit}><Icon name="refresh" size={15} /></button>
                )}
              </div>
            </div>
            {SideView()}
            <Sash side="right" width={layout.sidebarW} min={170} max={600} onChange={(w) => setLayout({ sidebarW: w })} />
          </div>
        )}
        <div className="kb-main" style={{ position: 'relative' }}>
          <EditorArea />
          {layout.voiceOn && <KernelVoice />}
          <div style={{ display: layout.panelOpen ? 'contents' : 'none' }}>
            <Panel />
          </div>
        </div>
        <div className="kb-sidebar right" style={{ width: layout.studioW, display: layout.studioOpen ? 'flex' : 'none' }}>
          <Studio />
          <Sash side="left" width={layout.studioW} min={280} max={720} onChange={(w) => setLayout({ studioW: w })} />
        </div>
      </div>
      <StatusBar />
      {wb.quick && <QuickInput key={wb.quick.mode + (wb.quick.initial || '')} />}
      <Toasts />
      <TrustPrompt />
    </div>
  );
};

