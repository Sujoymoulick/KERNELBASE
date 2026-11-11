import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWb } from './store';
import { kb, basename, dirname, joinPath, relPath } from './bridge';
import { Icon, FileTag } from './icons';

/* ---------- Search ---------- */
export const SearchView: React.FC = () => {
  const wb = useWb();
  const [q, setQ] = useState('');
  const [caseS, setCaseS] = useState(false);
  const [word, setWord] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  useEffect(() => {
    if (!wb.root || !q.trim()) return setResults([]);
    setBusy(true);
    const t = setTimeout(async () => {
      const r = await kb.indexing.search(wb.root, q, { caseSensitive: caseS, wholeWord: word, maxResults: 500 });
      setResults(r?.results || []);
      setBusy(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q, caseS, word, wb.root]);

  const groups = useMemo(() => {
    const m = new Map<string, any[]>();
    for (const r of results) m.set(r.filePath, [...(m.get(r.filePath) || []), r]);
    return Array.from(m.entries());
  }, [results]);

  const toggle = (on: boolean, set: (v: boolean) => void, label: string, title: string) => (
    <button
      title={title}
      onClick={() => set(!on)}
      style={{ width: 22, height: 20, borderRadius: 3, fontSize: 11, border: on ? '1px solid var(--accent)' : '1px solid transparent', background: on ? 'var(--chip-on)' : 'transparent', color: on ? 'var(--text)' : 'var(--muted)' }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }} data-testid="search-view">
      <div style={{ padding: '0 12px 8px 20px' }}>
        <div style={{ position: 'relative' }}>
          <input ref={inputRef} className="kb-input" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingRight: 52 }} />
          <div style={{ position: 'absolute', right: 3, top: 3, display: 'flex', gap: 1 }}>
            {toggle(caseS, setCaseS, 'Aa', 'Match Case')}
            {toggle(word, setWord, 'ab', 'Match Whole Word')}
          </div>
        </div>
        {q && (
          <div className="kb-muted" style={{ fontSize: 12, marginTop: 6 }}>
            {busy ? 'Searching...' : `${results.length} result${results.length === 1 ? '' : 's'} in ${groups.length} file${groups.length === 1 ? '' : 's'}`}
          </div>
        )}
      </div>
      <div className="kb-scroll">
        {groups.map(([file, items]) => (
          <div key={file}>
            <div className="kb-row" style={{ paddingLeft: 12 }}>
              <Icon name="chevronDown" size={14} />
              <FileTag name={basename(file)} theme={wb.theme} />
              <span className="label" style={{ color: 'var(--text-strong)' }}>{basename(file)}</span>
              <span className="kb-muted label" style={{ fontSize: 11 }}>{relPath(wb.root || undefined, dirname(file))}</span>
              <span className="kb-count" style={{ marginLeft: 'auto' }}>{items.length}</span>
            </div>
            {items.map((r, i) => {
              const pre = r.preview || '';
              const idx = caseS ? pre.indexOf(r.match) : pre.toLowerCase().indexOf(String(r.match).toLowerCase());
              return (
                <button key={i} className="kb-row" style={{ paddingLeft: 40 }} title={pre} onClick={() => wb.openFile(file, { line: r.line, col: r.column })}>
                  <span className="label" style={{ fontSize: 12 }}>
                    {idx >= 0 ? (
                      <>
                        {pre.slice(Math.max(0, idx - 24), idx)}
                        <span style={{ background: 'rgba(234,92,0,0.33)', borderRadius: 2 }}>{pre.slice(idx, idx + r.match.length)}</span>
                        {pre.slice(idx + r.match.length)}
                      </>
                    ) : (
                      pre
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        {!wb.root && <div className="kb-empty">Open a folder to search its files.</div>}
      </div>
    </div>
  );
};

/* ---------- Source control ---------- */
const STATUS_LABEL: Record<string, string> = { M: 'M', A: 'A', D: 'D', R: 'R', U: 'U', '?': 'U', C: 'C' };
const STATUS_COLOR: Record<string, string> = { M: 'var(--modified)', A: 'var(--added)', U: 'var(--added)', '?': 'var(--added)', D: 'var(--deleted)', R: 'var(--added)' };

export const ScmView: React.FC = () => {
  const wb = useWb();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const root = wb.root;
  const { git } = wb;

  const act = async (label: string, fn: () => Promise<any>) => {
    setBusy(label);
    try {
      const r = await fn();
      if (r && r.success === false) wb.notify(`${label} failed: ${r.error || 'unknown error'}`, 'error');
      else wb.log('Git', `${label} ok`, 'ok');
    } catch (e: any) {
      wb.notify(`${label} failed: ${e?.message || e}`, 'error');
    } finally {
      setBusy(null);
      wb.refreshGit();
      wb.refreshTree();
    }
  };

  if (!root) return <div className="kb-empty">Open a folder to use source control.</div>;
  if (!git.isRepo)
    return (
      <div className="kb-empty">
        <p style={{ margin: '0 0 12px' }}>The folder currently open does not have a Git repository.</p>
        <button className="kb-btn full" onClick={() => wb.runInTerminal('git init', root, 'Git')}>Initialize Repository</button>
      </div>
    );

  const commit = () => {
    if (!msg.trim()) return wb.notify('Type a commit message first.', 'info');
    act('Commit', async () => {
      if (!(git.staged || []).length) await kb.git.stageAll(root);
      const r = await kb.git.commit(root, msg.trim());
      if (r?.success !== false) setMsg('');
      return r;
    });
  };

  const fileRow = (f: { path: string; status: string }, staged: boolean) => {
    const abs = joinPath(root, f.path.replace(/\/$/, ''));
    const st = f.status === '?' ? 'U' : f.status;
    return (
      <div key={(staged ? 's:' : 'u:') + f.path} className="kb-row" style={{ paddingLeft: 22 }} title={f.path}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }} onClick={() => wb.openFile(abs)}>
          <FileTag name={basename(f.path)} theme={wb.theme} />
          <span className="label" style={{ color: STATUS_COLOR[f.status], textDecoration: f.status === 'D' ? 'line-through' : undefined }}>{basename(f.path.replace(/\/$/, ''))}</span>
          <span className="kb-muted label" style={{ fontSize: 11 }}>{dirname(f.path) === '/' ? '' : dirname(f.path)}</span>
        </button>
        <button className="kb-icon-btn" style={{ width: 20, height: 20 }} title={staged ? 'Unstage Changes' : 'Stage Changes'} onClick={() => act(staged ? 'Unstage' : 'Stage', () => (staged ? kb.git.unstage(root, f.path) : kb.git.stage(root, f.path)))}>
          <Icon name={staged ? 'minus' : 'plus'} size={14} />
        </button>
        <span className="deco" style={{ color: STATUS_COLOR[f.status], width: 12 }}>{STATUS_LABEL[st] || st}</span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }} data-testid="scm-view">
      <div style={{ padding: '0 12px 10px 20px' }}>
        <textarea
          className="kb-input"
          rows={2}
          placeholder={`Message (⌘Enter to commit on "${git.branch || 'HEAD'}")`}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.metaKey && e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
          }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <button className="kb-btn" style={{ flex: 1 }} disabled={!!busy} onClick={commit}>
            <Icon name="check" size={14} /> {busy === 'Commit' ? 'Committing...' : 'Commit'}
          </button>
          <button className="kb-btn secondary" title="Pull" disabled={!!busy} onClick={() => act('Pull', () => kb.git.pull(root))}><Icon name="arrowDown" size={14} /></button>
          <button className="kb-btn secondary" title="Push" disabled={!!busy} onClick={() => act('Push', () => kb.git.push(root))}><Icon name="arrowUp" size={14} /></button>
        </div>
      </div>
      <div className="kb-scroll">
        {(git.staged || []).length > 0 && (
          <>
            <div className="kb-section-head" style={{ paddingLeft: 8 }}>
              <Icon name="chevronDown" size={14} /> Staged Changes
              <button className="kb-icon-btn" style={{ marginLeft: 'auto', width: 20, height: 20 }} title="Unstage All" onClick={() => act('Unstage all', () => kb.git.unstageAll(root))}><Icon name="minus" size={14} /></button>
              <span className="kb-count" style={{ marginRight: 8 }}>{git.staged!.length}</span>
            </div>
            {git.staged!.map((f) => fileRow(f, true))}
          </>
        )}
        <div className="kb-section-head" style={{ paddingLeft: 8 }}>
          <Icon name="chevronDown" size={14} /> Changes
          <button className="kb-icon-btn" style={{ marginLeft: 'auto', width: 20, height: 20 }} title="Stage All Changes" onClick={() => act('Stage all', () => kb.git.stageAll(root))}><Icon name="plus" size={14} /></button>
          <span className="kb-count" style={{ marginRight: 8 }}>{(git.unstaged || []).length}</span>
        </div>
        {(git.unstaged || []).map((f) => fileRow(f, false))}
        {!(git.unstaged || []).length && !(git.staged || []).length && <div className="kb-empty">No changes. Working tree clean.</div>}
      </div>
    </div>
  );
};

/* ---------- Run and build ---------- */
export const RunView: React.FC = () => {
  const wb = useWb();
  const [proj, setProj] = useState<any>(null);
  const [custom, setCustom] = useState('');
  const root = wb.root;

  useEffect(() => {
    if (root) kb.project.detect(root).then(setProj);
  }, [root]);

  if (!root) return <div className="kb-empty">Open a folder to run or build it.</div>;
  const active = wb.activeTab?.kind === 'file' && wb.activeTab.path ? wb.activeTab : null;

  const card = (icon: string, title: string, cmd: string | undefined, id: string) => (
    <button
      key={id}
      className="kb-card"
      disabled={!cmd}
      onClick={() => wb.runCommand(id)}
      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', width: '100%', textAlign: 'left', background: 'var(--editor)', opacity: cmd ? 1 : 0.5, marginBottom: 6 }}
    >
      <Icon name={icon} size={16} style={{ color: icon === 'play' ? 'var(--run)' : 'var(--accent-fg)', marginTop: 1 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ color: 'var(--text-strong)' }}>{title}</div>
        <div className="mono kb-muted" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cmd || 'Not available for this project'}</div>
      </div>
    </button>
  );

  return (
    <div className="kb-scroll" style={{ padding: '0 12px 12px 20px' }} data-testid="run-view">
      <button className="kb-btn full" style={{ height: 30, marginBottom: 12 }} onClick={() => wb.runCommand('run.file')} disabled={!active}>
        <Icon name="play" size={14} fill /> {active ? `Run ${active.name}` : 'Run Active File'}
      </button>
      <div className="kb-label" style={{ marginBottom: 6 }}>Project{proj?.kind ? ` · ${proj.kind}` : ''}</div>
      {proj ? (
        <>
          {card('play', 'Run Project', proj.run, 'run.project')}
          {card('build', 'Build', proj.build, 'run.build')}
          {card('beaker', 'Test', proj.test, 'run.test')}
        </>
      ) : (
        <div className="kb-muted" style={{ marginBottom: 8 }}>Detecting project type...</div>
      )}
      <button className="kb-btn secondary full" onClick={() => wb.runCommand('run.stop')} style={{ marginBottom: 14 }}>
        <Icon name="stop" size={13} /> Stop Running Task
      </button>
      <div className="kb-label" style={{ marginBottom: 6 }}>Custom command</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) wb.runInTerminal(custom.trim(), root);
        }}
        style={{ display: 'flex', gap: 6 }}
      >
        <input className="kb-input mono" placeholder="e.g. make clean && make" value={custom} onChange={(e) => setCustom(e.target.value)} />
        <button className="kb-btn" type="submit">Run</button>
      </form>
      <p className="kb-muted" style={{ fontSize: 12, lineHeight: 1.5, marginTop: 14 }}>
        Commands run in the integrated terminal, so programs that read input (scanf, input(), Scanner) work. Build errors show in the terminal; Cmd-click a path to open it.
      </p>
    </div>
  );
};

/* ---------- Extensions ---------- */
export const ExtensionsView: React.FC = () => {
  const wb = useWb();
  const [q, setQ] = useState('');
  const [installed, setInstalled] = useState<any[]>([]);
  const [found, setFound] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const load = () => kb.extensions.listInstalled().then((l: any[]) => setInstalled(l || []));
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (!q.trim()) return setFound([]);
    const t = setTimeout(() => kb.extensions.search(q).then((r: any[]) => setFound(r || [])), 350);
    return () => clearTimeout(t);
  }, [q]);

  const row = (x: any, isInstalled: boolean) => (
    <div key={x.id} style={{ display: 'flex', gap: 10, padding: '8px 12px 8px 20px', borderBottom: '1px solid var(--border)' }}>
      {x.iconUrl ? <img src={x.iconUrl} alt="" style={{ width: 36, height: 36, borderRadius: 4 }} /> : <Icon name="extensions" size={36} stroke={1} style={{ color: 'var(--dim)' }} />}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.displayName || x.name}</div>
        <div className="kb-muted" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.description}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <span className="kb-muted" style={{ fontSize: 11 }}>{x.publisher} · v{x.version}</span>
          <button
            className={`kb-btn ${isInstalled ? 'secondary' : ''}`}
            style={{ height: 20, fontSize: 11, padding: '0 8px' }}
            disabled={busy === x.id}
            onClick={async () => {
              setBusy(x.id);
              const r = isInstalled ? await kb.extensions.uninstall(x.id) : await kb.extensions.install(x.id);
              setBusy(null);
              if (r?.success === false) wb.notify(r.error || 'Failed', 'error');
              load();
            }}
          >
            {busy === x.id ? '...' : isInstalled ? 'Uninstall' : 'Install'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ padding: '0 12px 8px 20px' }}>
        <input className="kb-input" placeholder="Search Extensions in Open VSX" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="kb-scroll">
        {q ? (
          found.map((x) => row(x, installed.some((i) => i.id === x.id)))
        ) : (
          <>
            <div className="kb-section-head" style={{ paddingLeft: 8 }}>
              <Icon name="chevronDown" size={14} /> Installed <span className="kb-count" style={{ marginLeft: 'auto', marginRight: 8 }}>{installed.length}</span>
            </div>
            {installed.map((x) => row(x, true))}
            {!installed.length && <div className="kb-empty">No extensions installed. Search Open VSX above.</div>}
          </>
        )}
      </div>
    </div>
  );
};
