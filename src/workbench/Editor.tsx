import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { monaco } from './monacoSetup';
import { useWb, Tab, ThemePref } from './store';
import { kb, basename, relPath, LANGUAGE_LABEL } from './bridge';
import { Icon, FileTag, BrandLogo } from './icons';

const modelPath = (t: Tab) => (t.path ? monaco.Uri.file(t.path).toString() : `inmemory://model/${t.id}`);

/* ---------- Tabs + breadcrumbs ---------- */
const Tabs: React.FC = () => {
  const wb = useWb();
  if (!wb.tabs.length) return null;
  return (
    <div className="kb-tabs" data-testid="editor-tabs">
      {wb.tabs.map((t) => {
        const dirty = t.kind === 'file' && t.content !== t.saved;
        return (
          <div
            key={t.id}
            className={`kb-tab ${t.id === wb.activeId ? 'on' : ''} ${dirty ? 'dirty' : ''}`}
            onClick={() => wb.setActiveId(t.id)}
            onMouseDown={(e) => {
              if (e.button === 1) {
                e.preventDefault();
                wb.closeTab(t.id);
              }
            }}
            title={t.path || t.name}
          >
            {t.kind === 'welcome' ? <BrandLogo size={15} /> : t.kind === 'settings' ? <Icon name="gear" size={14} /> : <FileTag name={t.name} theme={wb.theme} />}
            <span style={{ fontStyle: t.kind === 'welcome' || t.kind === 'settings' ? 'normal' : undefined }}>{t.name}</span>
            <button
              className="close"
              title="Close (Cmd+W)"
              onClick={(e) => {
                e.stopPropagation();
                wb.closeTab(t.id);
              }}
            >
              <span className="dot" />
              <Icon name="close" size={14} className="x" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

const Breadcrumbs: React.FC<{ tab: Tab }> = ({ tab }) => {
  const wb = useWb();
  if (!tab.path) return <div className="kb-crumbs">{tab.name}</div>;
  const rel = relPath(wb.root || undefined, tab.path);
  const parts = rel.split('/');
  return (
    <div className="kb-crumbs">
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Icon name="chevronRight" size={12} />}
          {i === parts.length - 1 ? <FileTag name={p} theme={wb.theme} /> : null}
          <span style={{ color: i === parts.length - 1 ? 'var(--text)' : undefined }}>{p}</span>
        </React.Fragment>
      ))}
    </div>
  );
};

/* ---------- Monaco ---------- */
const CodeView: React.FC<{ tab: Tab }> = ({ tab }) => {
  const wb = useWb();
  const { prefs } = wb;

  // Problems from Monaco markers
  useEffect(() => {
    const sync = () => {
      const all = monaco.editor.getModelMarkers({});
      wb.setProblems(
        all
          .filter((m) => m.resource.scheme === 'file' && m.severity >= monaco.MarkerSeverity.Warning)
          .map((m) => ({
            path: m.resource.fsPath,
            line: m.startLineNumber,
            col: m.startColumn,
            message: m.message,
            severity: m.severity === monaco.MarkerSeverity.Error ? ('error' as const) : ('warning' as const),
            source: m.source || m.owner,
          }))
      );
    };
    const d = monaco.editor.onDidChangeMarkers(sync);
    sync();
    return () => d.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reveal = () => {
    const ed = wb.editorRef.current;
    const p = wb.pendingReveal.current;
    if (ed && p && p.path === tab.path) {
      ed.revealLineInCenter(p.line);
      ed.setPosition({ lineNumber: p.line, column: p.col });
      ed.focus();
      wb.pendingReveal.current = null;
    }
  };
  useEffect(() => {
    const t = setTimeout(reveal, 30);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab.id]);

  return (
    <MonacoEditor
      path={modelPath(tab)}
      language={tab.language}
      value={tab.content}
      theme={wb.theme === 'dark' ? 'kb-dark' : 'kb-light'}
      onChange={(v) => wb.updateContent(tab.id, v ?? '')}
      onMount={(ed, m) => {
        wb.editorRef.current = ed;
        wb.monacoRef.current = m;
        ed.onDidChangeCursorSelection((e) => {
          const s = e.selection;
          const model = ed.getModel();
          wb.setCursor({ line: s.positionLineNumber, col: s.positionColumn, sel: model ? model.getValueInRange(s).length : 0 });
        });
        reveal();
        ed.focus();
      }}
      options={{
        fontFamily: "'JetBrains Mono', Menlo, Monaco, monospace",
        fontSize: prefs.fontSize,
        fontLigatures: true,
        tabSize: prefs.tabSize,
        wordWrap: prefs.wordWrap ? 'on' : 'off',
        minimap: { enabled: prefs.minimap },
        smoothScrolling: true,
        cursorSmoothCaretAnimation: 'on',
        renderLineHighlight: 'all',
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 6 },
        stickyScroll: { enabled: true },
      }}
    />
  );
};

/* ---------- Welcome ---------- */
const Welcome: React.FC = () => {
  const wb = useWb();
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    kb?.workspace.getRecent().then((r: any) => setRecent((r?.recents || []).filter((x: any) => typeof x === 'string').slice(0, 6)));
  }, []);
  const item = (icon: string, label: string, onClick: () => void, key?: string) => (
    <button className="kb-link" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 13 }} onClick={onClick}>
      <Icon name={icon} size={16} />
      {label}
      {key && <span className="kb-muted" style={{ fontSize: 11 }}>{key}</span>}
    </button>
  );
  return (
    <div className="kb-scroll" style={{ background: 'var(--editor)' }} data-testid="welcome">
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '64px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
          <BrandLogo size={64} />
          <div>
            <div style={{ fontSize: 30, fontWeight: 300, color: 'var(--text-strong)', letterSpacing: '-0.01em' }}>Kernel Base</div>
            <div className="kb-muted" style={{ fontSize: 15 }}>Code, build and run with a team of agents</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 40 }}>
          <div>
            <div style={{ fontSize: 16, color: 'var(--text-strong)', marginBottom: 8 }}>Start</div>
            {item('newFile', 'New File...', wb.newUntitled, '⌘N')}
            {item('files', 'Open File...', wb.pickFiles, '⌘O')}
            {item('folder', 'Open Folder...', wb.pickFolder, '⇧⌘O')}
            {item('terminal', 'New Terminal', () => wb.newTerminal(), '⌃⇧`')}
            <div style={{ fontSize: 16, color: 'var(--text-strong)', margin: '28px 0 8px' }}>Recent</div>
            {recent.length === 0 && <div className="kb-muted">No recent folders.</div>}
            {recent.map((r) => (
              <div key={r} style={{ display: 'flex', gap: 10, padding: '3px 0', alignItems: 'baseline', minWidth: 0 }}>
                <button className="kb-link" onClick={() => wb.openFolder(r)}>{basename(r)}</button>
                <span className="kb-muted" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 16, color: 'var(--text-strong)', marginBottom: 8 }}>Walkthroughs</div>
            {[
              ['agents', 'Run agents in parallel', 'Use the Antigravity CLI you are signed in to and launch a team of agents.', () => wb.setLayout({ studioOpen: true, studioTab: 'agents' })],
              ['layers', 'Add project documents', 'Drop a PDF or DOCX into Resources. It is read on this Mac and turned into Markdown agents can use.', () => wb.setLayout({ studioOpen: true, studioTab: 'resources' })],
              ['play', 'Build and run', 'Run the current file or the whole project. Kernel Base detects npm, Cargo, Go, CMake, Make, Python, Java and C.', () => wb.setLayout({ sidebar: 'run' })],
              [wb.theme === 'dark' ? 'sun' : 'moon', 'Choose a theme', 'Switch between Dark and Light in Settings, or follow the system appearance.', () => wb.openSpecial('settings')],
            ].map(([icon, title, desc, fn]: any) => (
              <button key={title} className="kb-card" onClick={fn} style={{ display: 'flex', gap: 12, padding: '12px 14px', marginBottom: 8, width: '100%', textAlign: 'left', background: 'var(--side)' }}>
                <Icon name={icon} size={20} style={{ color: 'var(--accent-fg)', marginTop: 1 }} />
                <div>
                  <div style={{ color: 'var(--text-strong)', marginBottom: 2 }}>{title}</div>
                  <div className="kb-muted" style={{ fontSize: 12, lineHeight: 1.5 }}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 40 }} className="kb-muted">
          <input type="checkbox" checked={wb.prefs.showWelcome} onChange={(e) => wb.setPrefs({ showWelcome: e.target.checked })} />
          Show welcome page on startup
        </label>
      </div>
    </div>
  );
};

/* ---------- Settings ---------- */
const SettingRow: React.FC<{ q: string; title: string; desc: string; children: React.ReactNode }> = ({ q, title, desc, children }) =>
  !q || (title + desc).toLowerCase().includes(q.toLowerCase()) ? (
    <div style={{ padding: '10px 0 14px' }}>
      <div style={{ color: 'var(--text-strong)', fontWeight: 600, marginBottom: 2 }}>{title}</div>
      <div className="kb-muted" style={{ fontSize: 12, marginBottom: 8 }}>{desc}</div>
      {children}
    </div>
  ) : null;

const Settings: React.FC = () => {
  const wb = useWb();
  const { prefs, setPrefs } = wb;
  const [q, setQ] = useState('');
  const num = (v: number, on: (n: number) => void, min: number, max: number) => (
    <input className="kb-input" type="number" min={min} max={max} value={v} style={{ width: 90 }} onChange={(e) => on(Math.max(min, Math.min(max, Number(e.target.value) || min)))} />
  );
  const check = (v: boolean, on: (b: boolean) => void, label: string) => (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} />
      {label}
    </label>
  );
  return (
    <div className="kb-scroll" data-testid="settings">
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '20px 32px 48px' }}>
        <input className="kb-input" placeholder="Search settings" value={q} onChange={(e) => setQ(e.target.value)} style={{ height: 30, marginBottom: 16 }} />
        <div style={{ fontSize: 22, color: 'var(--text-strong)', margin: '8px 0 4px' }}>Appearance</div>
        <SettingRow q={q} title="Color Theme" desc="Choose the workbench colour theme. System follows the macOS appearance.">
          <div style={{ display: 'flex', gap: 10 }} data-testid="theme-picker">
            {(['dark', 'light', 'system'] as ThemePref[]).map((t) => (
              <button
                key={t}
                onClick={() => setPrefs({ theme: t })}
                className="kb-card"
                data-on={prefs.theme === t}
                style={{ width: 150, padding: 8, textAlign: 'left', outline: prefs.theme === t ? '2px solid var(--accent)' : 'none', outlineOffset: -1 }}
              >
                <div style={{ height: 64, borderRadius: 4, overflow: 'hidden', display: 'flex', border: '1px solid var(--border)', marginBottom: 6 }}>
                  {(t === 'system' ? ['dark', 'light'] : [t]).map((x) => (
                    <div key={x} style={{ flex: 1, display: 'flex', background: x === 'dark' ? '#1f1f1f' : '#ffffff' }}>
                      <div style={{ width: 10, background: x === 'dark' ? '#181818' : '#f8f8f8' }} />
                      <div style={{ width: 26, background: x === 'dark' ? '#181818' : '#f8f8f8', borderRight: `1px solid ${x === 'dark' ? '#2b2b2b' : '#e5e5e5'}` }} />
                      <div style={{ flex: 1, padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ height: 3, width: '70%', background: x === 'dark' ? '#e3963e' : '#cc5500', borderRadius: 2 }} />
                        <div style={{ height: 3, width: '50%', background: x === 'dark' ? '#555' : '#ccc', borderRadius: 2 }} />
                        <div style={{ height: 3, width: '80%', background: x === 'dark' ? '#555' : '#ccc', borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 6, border: '1px solid var(--border-strong)', background: prefs.theme === t ? 'var(--accent)' : 'transparent' }} />
                  {t === 'dark' ? 'Dark' : t === 'light' ? 'Light' : 'System'}
                </div>
              </button>
            ))}
          </div>
        </SettingRow>
        <div style={{ fontSize: 22, color: 'var(--text-strong)', margin: '18px 0 4px' }}>Text Editor</div>
        <SettingRow q={q} title="Font Size" desc="Controls the font size in pixels.">{num(prefs.fontSize, (n) => setPrefs({ fontSize: n }), 8, 32)}</SettingRow>
        <SettingRow q={q} title="Tab Size" desc="The number of spaces a tab is equal to.">{num(prefs.tabSize, (n) => setPrefs({ tabSize: n }), 1, 8)}</SettingRow>
        <SettingRow q={q} title="Word Wrap" desc="Controls how lines should wrap.">{check(prefs.wordWrap, (b) => setPrefs({ wordWrap: b }), 'Wrap long lines')}</SettingRow>
        <SettingRow q={q} title="Minimap" desc="Controls whether the minimap is shown.">{check(prefs.minimap, (b) => setPrefs({ minimap: b }), 'Show minimap')}</SettingRow>
        <SettingRow q={q} title="Auto Save" desc="Save dirty files automatically one second after the last change.">{check(prefs.autoSave, (b) => setPrefs({ autoSave: b }), 'Enable auto save')}</SettingRow>
        <div style={{ fontSize: 22, color: 'var(--text-strong)', margin: '18px 0 4px' }}>Terminal</div>
        <SettingRow q={q} title="Font Family" desc="Font used by the integrated terminal.">
          <input className="kb-input" style={{ width: 260 }} value={prefs.terminalFont} onChange={(e) => setPrefs({ terminalFont: e.target.value })} />
        </SettingRow>
        <SettingRow q={q} title="Font Size" desc="Terminal font size in pixels.">{num(prefs.terminalFontSize, (n) => setPrefs({ terminalFontSize: n }), 8, 28)}</SettingRow>
        <div style={{ fontSize: 22, color: 'var(--text-strong)', margin: '18px 0 4px' }}>Window</div>
        <SettingRow q={q} title="Welcome Page" desc="Show the welcome page when a folder opens without saved editors.">{check(prefs.showWelcome, (b) => setPrefs({ showWelcome: b }), 'Show on startup')}</SettingRow>
      </div>
    </div>
  );
};

/* ---------- Editor group ---------- */
export const EditorArea: React.FC = () => {
  const wb = useWb();
  const tab = wb.activeTab;

  // Dispose models whose tab was closed so stale problems disappear
  useEffect(() => {
    const open = new Set(wb.tabs.map(modelPath));
    for (const m of monaco.editor.getModels()) {
      const u = m.uri.toString();
      if ((m.uri.scheme === 'file' || m.uri.scheme === 'inmemory') && !open.has(u)) m.dispose();
    }
  }, [wb.tabs]);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--editor)' }}>
      <Tabs />
      {tab && (tab.kind === 'file' || tab.kind === 'image') && <Breadcrumbs tab={tab} />}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }} data-testid="editor">
        {!tab && <EmptyEditor />}
        {tab?.kind === 'file' && <CodeView tab={tab} />}
        {tab?.kind === 'welcome' && <Welcome />}
        {tab?.kind === 'settings' && <Settings />}
        {tab?.kind === 'image' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
            <img src={`file://${encodeURI(tab.path!)}`} alt={tab.name} style={{ maxWidth: '90%', maxHeight: '90%' }} />
          </div>
        )}
        {tab?.kind === 'binary' && <div className="kb-empty">{tab.content}</div>}
      </div>
    </div>
  );
};

const EmptyEditor: React.FC = () => {
  const wb = useWb();
  const rows: [string, string][] = [
    ['Show All Commands', '⇧⌘P'],
    ['Go to File', '⌘P'],
    ['Open Folder', '⇧⌘O'],
    ['Toggle Terminal', '⌃`'],
    ['Toggle Agent Studio', '⇧⌘L'],
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <BrandLogo size={140} style={{ opacity: 0.18, filter: 'grayscale(0.4)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '8px 16px', fontSize: 13 }}>
        {rows.map(([l, k]) => (
          <React.Fragment key={l}>
            <span className="kb-muted" style={{ textAlign: 'right' }}>{l}</span>
            <span style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}>{k}</span>
          </React.Fragment>
        ))}
      </div>
      {!wb.root && <button className="kb-btn" onClick={wb.pickFolder}>Open Folder</button>}
    </div>
  );
};

export const languageLabel = (l: string) => LANGUAGE_LABEL[l] || l;
