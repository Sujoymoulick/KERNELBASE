import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import '@xterm/xterm/css/xterm.css';
import { useWb, PanelTab } from './store';
import { kb, relPath, basename } from './bridge';
import { Icon } from './icons';

/* ---------- terminal data bus: buffers output that arrives before a view mounts ---------- */
const listeners = new Map<string, (d: string) => void>();
const pending = new Map<string, string[]>();
let busReady = false;
function ensureBus() {
  if (busReady || !kb) return;
  busReady = true;
  kb.terminal.onData(({ id, data }: { id: string; data: string }) => {
    const l = listeners.get(id);
    if (l) l(data);
    else pending.set(id, [...(pending.get(id) || []), data]);
  });
}

const TERM_THEME = {
  dark: {
    background: '#181818', foreground: '#cccccc', cursor: '#cccccc', selectionBackground: '#5a3418',
    black: '#000000', red: '#cd3131', green: '#0dbc79', yellow: '#e5e510', blue: '#2472c8', magenta: '#bc3fbc', cyan: '#11a8cd', white: '#e5e5e5',
    brightBlack: '#666666', brightRed: '#f14c4c', brightGreen: '#23d18b', brightYellow: '#f5f543', brightBlue: '#3b8eea', brightMagenta: '#d670d6', brightCyan: '#29b8db', brightWhite: '#e5e5e5',
  },
  light: {
    background: '#f8f8f8', foreground: '#3b3b3b', cursor: '#3b3b3b', selectionBackground: '#f6d3b3',
    black: '#000000', red: '#cd3131', green: '#107c10', yellow: '#949800', blue: '#0451a5', magenta: '#bc05bc', cyan: '#0598bc', white: '#555555',
    brightBlack: '#666666', brightRed: '#cd3131', brightGreen: '#14ce14', brightYellow: '#b5ba00', brightBlue: '#0451a5', brightMagenta: '#bc05bc', brightCyan: '#0598bc', brightWhite: '#a5a5a5',
  },
};

const TerminalView: React.FC<{ id: string; visible: boolean }> = ({ id, visible }) => {
  const wb = useWb();
  const host = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    ensureBus();
    const term = new Terminal({
      fontFamily: `'${wb.prefs.terminalFont}', 'JetBrains Mono', Menlo, monospace`,
      fontSize: wb.prefs.terminalFontSize,
      cursorBlink: true,
      allowProposedApi: true,
      scrollback: 5000,
      macOptionIsMeta: true,
      theme: TERM_THEME[wb.theme],
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon((_e, uri) => kb.shell.openExternal(uri)));
    term.open(host.current!);
    // GPU renderer: draws block and box characters (CLI banners, TUIs) without gaps, and scrolls faster.
    // Falls back to the default renderer if WebGL is unavailable or the context is lost.
    try {
      const gl = new WebglAddon();
      gl.onContextLoss(() => gl.dispose());
      term.loadAddon(gl);
    } catch {
      /* keep the DOM renderer */
    }
    termRef.current = term;
    fitRef.current = fit;

    listeners.set(id, (d) => term.write(d));
    for (const d of pending.get(id) || []) term.write(d);
    pending.delete(id);

    term.onData((d) => kb.terminal.write(id, d));
    term.onResize(({ cols, rows }) => kb.terminal.resize(id, cols, rows));
    wb.termClear.current[id] = () => term.clear();

    const ro = new ResizeObserver(() => {
      if (host.current && host.current.offsetWidth > 0) {
        try {
          fit.fit();
        } catch {
          /* not visible yet */
        }
      }
    });
    ro.observe(host.current!);
    return () => {
      ro.disconnect();
      listeners.delete(id);
      delete wb.termClear.current[id];
      term.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (termRef.current) termRef.current.options.theme = TERM_THEME[wb.theme];
  }, [wb.theme]);
  useEffect(() => {
    if (!termRef.current) return;
    termRef.current.options.fontSize = wb.prefs.terminalFontSize;
    termRef.current.options.fontFamily = `'${wb.prefs.terminalFont}', 'JetBrains Mono', Menlo, monospace`;
    try {
      fitRef.current?.fit();
    } catch {
      /* hidden */
    }
  }, [wb.prefs.terminalFontSize, wb.prefs.terminalFont]);
  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        try {
          fitRef.current?.fit();
        } catch {
          /* hidden */
        }
        termRef.current?.focus();
      });
    }
  }, [visible]);

  return <div ref={host} className="kb-term" data-testid="terminal" style={{ position: 'absolute', inset: 0, display: visible ? 'block' : 'none' }} />;
};

const ProblemsView: React.FC = () => {
  const wb = useWb();
  const groups = useMemo(() => {
    const m = new Map<string, typeof wb.problems>();
    for (const p of wb.problems) m.set(p.path, [...(m.get(p.path) || []), p]);
    return Array.from(m.entries());
  }, [wb.problems]);
  if (!groups.length) return <div className="kb-empty">No problems have been detected in the workspace.</div>;
  return (
    <div className="kb-scroll select-text" style={{ padding: '2px 0' }}>
      {groups.map(([path, items]) => (
        <div key={path}>
          <div className="kb-row" style={{ paddingLeft: 12 }}>
            <Icon name="chevronDown" size={14} />
            <span style={{ color: 'var(--text-strong)' }}>{basename(path)}</span>
            <span className="kb-muted" style={{ fontSize: 12 }}>{relPath(wb.root || undefined, path)}</span>
            <span className="kb-count">{items.length}</span>
          </div>
          {items.map((p, i) => (
            <button key={i} className="kb-row" style={{ paddingLeft: 34 }} onClick={() => wb.openFile(p.path, { line: p.line, col: p.col })}>
              <Icon name={p.severity === 'error' ? 'error' : p.severity === 'warning' ? 'warning' : 'info'} size={14}
                style={{ color: p.severity === 'error' ? 'var(--err)' : p.severity === 'warning' ? 'var(--warn)' : 'var(--accent-fg)' }} />
              <span className="label">{p.message}</span>
              <span className="kb-muted" style={{ fontSize: 12 }}>{p.source ? `${p.source} ` : ''}[Ln {p.line}, Col {p.col}]</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

const OutputView: React.FC = () => {
  const wb = useWb();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [wb.output.length]);
  return (
    <div ref={ref} className="kb-scroll mono select-text" style={{ padding: '4px 16px', fontSize: 12, lineHeight: 1.55 }}>
      {wb.output.length === 0 && <div className="kb-muted">No output yet. Build, run and agent activity is logged here.</div>}
      {wb.output.map((l) => (
        <div key={l.id} style={{ whiteSpace: 'pre-wrap', color: l.level === 'error' ? 'var(--err)' : l.level === 'warn' ? 'var(--warn)' : l.level === 'ok' ? 'var(--ok)' : undefined }}>
          <span className="kb-muted">[{new Date(l.at).toLocaleTimeString()}] [{l.channel}]</span> {l.text}
        </div>
      ))}
    </div>
  );
};

export const Panel: React.FC = () => {
  const wb = useWb();
  const { layout, setLayout } = wb;
  const [drag, setDrag] = useState(false);
  const errors = wb.problems.filter((p) => p.severity === 'error').length;
  const warns = wb.problems.filter((p) => p.severity === 'warning').length;

  // Make sure a terminal exists whenever the terminal tab is shown
  // (waits briefly for the workspace so the shell starts in the project folder)
  const [wsWait, setWsWait] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setWsWait(false), 1500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!kb || (!wb.root && wsWait)) return;
    if (layout.panelOpen && layout.panelTab === 'terminal' && wb.terminals.length === 0) wb.newTerminal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.panelOpen, layout.panelTab, wb.terminals.length, wb.root, wsWait]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setDrag(true);
    const startY = e.clientY;
    const startH = layout.panelH;
    const move = (ev: MouseEvent) => setLayout({ panelH: Math.max(100, Math.min(window.innerHeight - 200, startH + startY - ev.clientY)) });
    const up = () => {
      setDrag(false);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const tab = (id: PanelTab, label: string, extra?: React.ReactNode) => (
    <button className={`tab ${layout.panelTab === id ? 'on' : ''}`} onClick={() => setLayout({ panelTab: id })}>
      {label}
      {extra}
    </button>
  );

  return (
    <div className="kb-panel" style={{ height: layout.panelH }} data-testid="panel">
      <div className={`kb-sash-h ${drag ? 'drag' : ''}`} onMouseDown={startDrag} />
      <div className="kb-panel-tabs">
        {tab('problems', 'Problems', errors + warns > 0 ? <span className="kb-count">{errors + warns}</span> : null)}
        {tab('output', 'Output')}
        {tab('terminal', 'Terminal')}
        <div style={{ flex: 1 }} />
        {layout.panelTab === 'terminal' && (
          <>
            <select
              className="kb-input"
              style={{ width: 150, height: 22, fontSize: 12 }}
              value={wb.activeTerm || ''}
              onChange={(e) => wb.setActiveTerm(e.target.value)}
            >
              {wb.terminals.map((t, i) => (
                <option key={t.id} value={t.id}>
                  {i + 1}: {t.title}
                </option>
              ))}
            </select>
            <button className="kb-icon-btn" title="New Terminal (Ctrl+Shift+`)" onClick={() => wb.newTerminal()}>
              <Icon name="plus" />
            </button>
            <button className="kb-icon-btn" title="Clear Terminal" onClick={() => wb.activeTerm && wb.termClear.current[wb.activeTerm]?.()}>
              <Icon name="minus" />
            </button>
            <button className="kb-icon-btn" title="Kill Terminal" onClick={() => wb.killTerminal()}>
              <Icon name="trash" />
            </button>
          </>
        )}
        {layout.panelTab === 'output' && (
          <button className="kb-icon-btn" title="Clear Output" onClick={wb.clearOutput}>
            <Icon name="trash" />
          </button>
        )}
        <button className="kb-icon-btn" title="Close Panel (Cmd+J)" onClick={() => setLayout({ panelOpen: false })}>
          <Icon name="close" />
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {layout.panelTab === 'problems' && <ProblemsView />}
        {layout.panelTab === 'output' && <OutputView />}
        <div style={{ position: 'absolute', inset: 0, display: layout.panelTab === 'terminal' ? 'block' : 'none' }}>
          {wb.terminals.map((t) => (
            <TerminalView key={t.id} id={t.id} visible={layout.panelTab === 'terminal' && wb.activeTerm === t.id} />
          ))}
        </div>
      </div>
    </div>
  );
};
