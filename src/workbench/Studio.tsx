import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import { useWb } from './store';
import { kb, joinPath } from './bridge';
import { Icon } from './icons';
import { KernelSessionCard } from './KernelVoice';
import { ensureTrust, getTrust, modeFor, setTrust } from './trust';

type Provider = 'agy' | 'gemini';
type Mode = 'plan' | 'accept-edits' | 'auto';
type Strategy = 'parallel' | 'pipeline';
type RunStatus = 'queued' | 'running' | 'done' | 'failed' | 'stopped';

interface ProviderInfo { id: Provider; name: string; installed: boolean; version?: string; path?: string; installHint: string }
interface RoleDef { id: string; name: string; color: string; instructions: string; writes: boolean; fast: boolean }
interface AgentRun {
  id: string; roleId: string; roleName: string; color: string; provider: Provider; prompt: string; status: RunStatus;
  output: string; startedAt?: number; endedAt?: number; exitCode?: number; batchId: string; dependsOnPlanner?: boolean;
}
interface RackItem {
  id: string; slot: number; name: string; type: string; size: number; pages?: number; words: number;
  file: string; text: string; md: string; agentsRead: boolean; status: 'extracted' | 'summarizing' | 'ready' | 'error'; error?: string; addedAt: number;
}

/*
 * Lean role prompts (fewer input tokens) with an output budget for report-only roles (fewer output tokens).
 * writes: the role edits the workspace (runs with the folder's trust level); others run read-only.
 * fast:   the role uses the fastest model when Model is "Auto".
 */
export const STUDIO_ROLES: RoleDef[] = [
  { id: 'planner', name: 'Planner', color: '#d18616', writes: false, fast: true, instructions: 'Role: PLANNER. Give a numbered implementation plan (max 6 steps) naming the files to touch. No code. Max 150 words.' },
  { id: 'coder', name: 'Coder', color: '#3794ff', writes: true, fast: false, instructions: 'Role: CODER. Implement the goal now. Be fast: every tool call costs time, so read each needed file once, then write each changed file in ONE complete write (no many small edits, no re-reading to verify). Skip unrelated files. End with one line per changed file.' },
  { id: 'reviewer', name: 'Reviewer', color: '#b180d7', writes: false, fast: true, instructions: 'Role: REVIEWER. Read only the files relevant to the goal, once each. List only real issues as "file:line - issue - fix". Max 10 items, max 200 words.' },
  { id: 'tester', name: 'Tester', color: '#4ec9b0', writes: true, fast: false, instructions: 'Role: TESTER. Write focused tests for the goal using the existing test setup (or a minimal one), each test file in one write. End with how to run them.' },
  { id: 'security', name: 'Security', color: '#f14c4c', writes: false, fast: true, instructions: 'Role: SECURITY. Audit code related to the goal for vulnerabilities. List findings with severity low/medium/high and a fix. Max 200 words.' },
  { id: 'docs', name: 'Docs', color: '#cca700', writes: false, fast: true, instructions: 'Role: DOCS. Write clear Markdown documentation for the project or goal: overview, features, setup and run steps, file structure. Reply with the Markdown only; it is saved to Resources.' },
  { id: 'debugger', name: 'Debugger', color: '#e37933', writes: false, fast: false, instructions: 'Role: DEBUGGER. Find the root cause of the problem in the goal, explain it briefly and give the minimal fix. Max 200 words.' },
  { id: 'researcher', name: 'Research', color: '#29b8db', writes: false, fast: true, instructions: 'Role: RESEARCH. Compare the relevant libraries or approaches for the goal and recommend one. Max 200 words.' },
];

const MODE_LABEL: Record<Mode, string> = { auto: 'Edit + run commands', 'accept-edits': 'Edit files only', plan: 'Read only' };

function buildPrompt(role: RoleDef, goal: string, workspace: string, docs: { name: string; md: string }[], plan?: string) {
  // Excerpts only: full documents would be re-sent to every agent and cost many tokens
  const clip = (t: string, n: number) => (t.length > n ? `${t.slice(0, n)}\n[...]` : t);
  const ctx = docs.length ? `Project documents (excerpts):\n${docs.map((d) => `- ${d.name}: ${clip(d.md, 1200)}`).join('\n')}` : '';
  return [role.instructions, `Workspace: ${workspace}`, ctx, plan ? `Plan from the Planner:\n${clip(plan, 1500)}` : '', `GOAL: ${goal}`].filter(Boolean).join('\n\n');
}

const fmtDuration = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};
const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
marked.use({ renderer: { html: (t: any) => escapeHtml(typeof t === 'string' ? t : t.text || '') } });

/* =================================================================== */
export const Studio: React.FC = () => {
  const wb = useWb();
  const tab = wb.layout.studioTab;
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [provider, setProvider] = useState<Provider>('agy');
  const [detecting, setDetecting] = useState(false);
  const [rackCount, setRackCount] = useState(0);
  const [running, setRunning] = useState(0);

  const detect = useCallback(async () => {
    if (!kb) return;
    setDetecting(true);
    try {
      const res = await kb.studio.detect();
      const list: ProviderInfo[] = (res.providers || []).filter((p: ProviderInfo) => p.id === 'agy');
      setProviders(list);
      const first = list.find((p) => p.installed);
      if (first) setProvider((cur) => (list.find((p) => p.id === cur && p.installed) ? cur : first.id));
    } finally {
      setDetecting(false);
    }
  }, []);
  useEffect(() => {
    detect();
  }, [detect]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }} data-testid="agent-studio">
      <div className="kb-view-title" style={{ paddingLeft: 12 }}>
        <span>Agent Studio</span>
        <div className="kb-view-actions" style={{ alignItems: 'center' }}>
          <button
            className="kb-voice-toggle"
            data-on={wb.layout.voiceOn}
            title={wb.layout.voiceOn ? 'End Kernel voice session' : 'Start a Kernel voice session (⇧⌘K)'}
            onClick={() => wb.setLayout({ voiceOn: !wb.layout.voiceOn })}
            data-testid="voice-toggle"
          >
            <Icon name="mic" size={13} />
            Voice
            <span className="sw"><span /></span>
          </button>
          <button className="kb-icon-btn" title="Re-detect CLIs" onClick={detect}>
            <Icon name="refresh" size={15} style={detecting ? { animation: 'kb-spin 1s linear infinite' } : undefined} />
          </button>
          <button className="kb-icon-btn" title="Close Agent Studio (⇧⌘L)" onClick={() => wb.setLayout({ studioOpen: false })}>
            <Icon name="close" size={15} />
          </button>
        </div>
      </div>
      {wb.layout.voiceOn && <KernelSessionCard version={providers.find((p) => p.id === 'agy')?.version} />}
      <div className="kb-panel-tabs" style={{ height: 30, borderBottom: '1px solid var(--border)', padding: '0 12px' }}>
        <button className={`tab ${tab === 'agents' ? 'on' : ''}`} onClick={() => wb.setLayout({ studioTab: 'agents' })} data-testid="studio-tab-agents">
          Agents {running > 0 && <span className="kb-count">{running}</span>}
        </button>
        <button className={`tab ${tab === 'resources' ? 'on' : ''}`} onClick={() => wb.setLayout({ studioTab: 'resources' })} data-testid="studio-tab-resources">
          Resources <span className="kb-count">{rackCount}/8</span>
        </button>
      </div>
      <div style={{ display: tab === 'agents' ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <AgentsTab providers={providers} provider={provider} setProvider={setProvider} onRunning={setRunning} />
      </div>
      <div style={{ display: tab === 'resources' ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <ResourcesTab provider={provider} providerReady={!!providers.find((p) => p.id === provider)?.installed} onCount={setRackCount} />
      </div>
    </div>
  );
};

/* =================================================================== */
const AgentsTab: React.FC<{ providers: ProviderInfo[]; provider: Provider; setProvider: (p: Provider) => void; onRunning: (n: number) => void }> = ({ providers, provider, setProvider, onRunning }) => {
  const wb = useWb();
  const cwd = wb.root || '';
  const [models, setModels] = useState<{ id: string; label: string }[]>([]);
  const [model, setModel] = useState('auto');
  const [mode, setMode] = useState<Mode>('accept-edits');
  const [strategy, setStrategy] = useState<Strategy>('parallel');
  const [maxParallel, setMaxParallel] = useState(4);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['planner', 'coder', 'reviewer', 'tester']);
  const [goal, setGoal] = useState('');
  const [useDocs, setUseDocs] = useState(true);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [, forceTick] = useState(0);
  const launchingRef = useRef(new Set<string>());
  const wbRef = useRef(wb);
  wbRef.current = wb;
  const cwdRef = useRef(cwd);
  cwdRef.current = cwd;
  // Permission level comes from the folder's one-time trust decision
  useEffect(() => {
    const t = getTrust(cwd);
    if (t) setMode(modeFor(t));
  }, [cwd]);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const batchGoals = useRef(new Map<string, { goal: string; docs: { name: string; md: string }[] }>());

  useEffect(() => {
    if (!kb) return;
    setModels([]);
    setModel('auto');
    kb.studio.models(provider).then((m: any[]) => setModels(m || []));
  }, [provider, providers.length]);

  useEffect(() => {
    if (!kb) return;
    const offData = kb.studio.onData(({ id, data }: { id: string; data: string }) =>
      {
        setRuns((prev) => prev.map((r) => (r.id === id ? { ...r, output: (r.output + data).slice(-200_000) } : r)));
        // Live IDE sync while agents write files
        if (data.includes('> Wrote') || data.includes('> Removed')) {
          clearTimeout(syncTimer.current);
          syncTimer.current = setTimeout(() => {
            wbRef.current.refreshTree();
            wbRef.current.syncFromDisk();
          }, 400);
        }
      }
    );
    const offExit = kb.studio.onExit(({ id, code, error }: { id: string; code: number; error?: string }) => {
      launchingRef.current.delete(id);
      setRuns((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: r.status === 'stopped' ? 'stopped' : code === 0 ? 'done' : 'failed', exitCode: code, endedAt: Date.now(), output: error ? `${r.output}\n[error] ${error}` : r.output }
            : r
        )
      );
      setRuns((prev) => {
        const r = prev.find((x) => x.id === id);
        if (r) {
          const w = wbRef.current;
          w.log('Agents', `${r.roleName} ${r.status} (exit ${code})`, r.status === 'done' ? 'ok' : r.status === 'failed' ? 'error' : 'info');
          // Show the agent's changes right away in the explorer, open editors and source control
          w.refreshTree();
          w.syncFromDisk();
          w.refreshGit();
          // The Docs agent's Markdown goes straight into the Resources rack
          const md = r.output.split('\n').filter((l) => !l.startsWith('> ') && !l.startsWith('[error]')).join('\n').trim();
          if (r.roleId === 'docs' && r.status === 'done' && md && cwdRef.current) {
            kb.resources.saveMarkdown(cwdRef.current, 'Project documentation', md).then((res: { success: boolean; error?: string }) =>
              w.notify(res.success ? 'Saved Project documentation.md to Resources' : `Could not save docs: ${res.error}`, res.success ? 'info' : 'error')
            );
          }
        }
        return prev;
      });
    });
    return () => {
      offData();
      offExit();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onRunning(runs.filter((r) => r.status === 'running').length);
    if (!runs.some((r) => r.status === 'running')) return;
    const t = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [runs, onRunning]);

  // Scheduler: start queued runs up to the parallel limit
  useEffect(() => {
    if (!kb) return;
    let slots = maxParallel - runs.filter((r) => r.status === 'running').length;
    if (slots <= 0) return;
    for (const run of runs) {
      if (slots <= 0) break;
      if (run.status !== 'queued' || launchingRef.current.has(run.id)) continue;
      let prompt = run.prompt;
      if (run.dependsOnPlanner) {
        const planner = runs.find((r) => r.batchId === run.batchId && r.roleId === 'planner');
        if (planner && (planner.status === 'queued' || planner.status === 'running')) continue;
        const role = STUDIO_ROLES.find((r) => r.id === run.roleId)!;
        const b = batchGoals.current.get(run.batchId)!;
        prompt = buildPrompt(role, b.goal, cwd, b.docs, planner?.status === 'done' ? planner.output.trim() : undefined);
      }
      slots--;
      launchingRef.current.add(run.id);
      setRuns((prev) => prev.map((r) => (r.id === run.id ? { ...r, status: 'running', startedAt: Date.now(), prompt } : r)));
      const role = STUDIO_ROLES.find((r) => r.id === run.roleId);
      // Auto: report-only roles use the fastest model; coding roles a fast coding model
      const runModel = model === 'auto' ? (run.provider === 'agy' ? (role?.fast ? 'gemini-3.8-flash-low' : 'gemini-3.8-flash-medium') : undefined) : model || undefined;
      // Report-only roles never edit, so they run read-only (faster, no clashes with the Coder)
      const runMode: Mode = mode === 'plan' || !role?.writes ? 'plan' : mode;
      kb.studio.spawn({ id: run.id, provider: run.provider, prompt, cwd, model: runModel, mode: runMode }).then((res: { success: boolean; error?: string }) => {
        if (!res.success) {
          launchingRef.current.delete(run.id);
          setRuns((prev) => prev.map((r) => (r.id === run.id ? { ...r, status: 'failed', endedAt: Date.now(), output: `[error] ${res.error}` } : r)));
        }
      });
    }
  }, [runs, maxParallel, cwd, model, mode]);

  const providerInfo = providers.find((p) => p.id === provider);
  const canLaunch = !!kb && !!providerInfo?.installed && goal.trim().length > 0 && selectedRoles.length > 0 && !!cwd;

  const launch = async () => {
    if (!canLaunch) return;
    // Ask once per folder; afterwards agents never ask again for this workspace
    const writers = STUDIO_ROLES.some((r) => selectedRoles.includes(r.id) && r.writes);
    if (mode !== 'plan' && writers) {
      const t = await ensureTrust(cwd);
      if (!t) {
        wb.notify('Agents need your permission to change files in this folder.', 'info');
        return;
      }
      if (mode === 'auto' && t === 'edits') setMode('accept-edits');
    }
    const docs: { name: string; md: string }[] = useDocs ? await kb.resources.agentContext(cwd) : [];
    const batchId = `b${Date.now().toString(36)}`;
    batchGoals.current.set(batchId, { goal: goal.trim(), docs });
    const pipeline = strategy === 'pipeline' && selectedRoles.includes('planner');
    const ordered = STUDIO_ROLES.filter((r) => selectedRoles.includes(r.id));
    wb.log('Agents', `Launching ${ordered.length} agent(s) on ${provider}${docs.length ? ` with ${docs.length} resource doc(s)` : ''}`);
    setRuns((prev) => [
      ...ordered.map((role, i) => ({
        id: `${batchId}-${role.id}-${i}`, roleId: role.id, roleName: role.name, color: role.color, provider,
        prompt: buildPrompt(role, goal.trim(), cwd, docs), status: 'queued' as RunStatus, output: '', batchId,
        dependsOnPlanner: pipeline && role.id !== 'planner',
      })),
      ...prev,
    ]);
  };
  const stop = (id: string) => {
    setRuns((prev) => prev.map((r) => (r.id === id && (r.status === 'running' || r.status === 'queued') ? { ...r, status: 'stopped', endedAt: Date.now() } : r)));
    kb?.studio.stop(id);
  };
  const stopAll = () => {
    setRuns((prev) => prev.map((r) => (r.status === 'running' || r.status === 'queued' ? { ...r, status: 'stopped', endedAt: Date.now() } : r)));
    kb?.studio.stopAll();
  };
  useEffect(() => {
    const h = () => stopAll();
    window.addEventListener('kb:agents-stop-all', h);
    return () => window.removeEventListener('kb:agents-stop-all', h);
  });
  const rerun = (run: AgentRun) =>
    setRuns((prev) => [{ ...run, id: `${run.batchId}-${run.roleId}-r${Date.now().toString(36)}`, status: 'queued', output: '', startedAt: undefined, endedAt: undefined, exitCode: undefined, dependsOnPlanner: false }, ...prev]);
  const counts = useMemo(() => ({ running: runs.filter((r) => r.status === 'running').length, queued: runs.filter((r) => r.status === 'queued').length }), [runs]);

  return (
    <div className="kb-scroll" style={{ padding: 12 }}>
      <div className="kb-label" style={{ marginBottom: 6 }}>Subscription connector</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
        {(providers.length ? providers : ([{ id: 'agy', name: 'Antigravity CLI', installed: false, installHint: '' }] as ProviderInfo[])).map((p) => (
          <button
            key={p.id}
            onClick={() => p.installed && setProvider(p.id)}
            title={p.installed ? p.path : p.installHint}
            className="kb-card"
            style={{ textAlign: 'left', padding: '7px 9px', borderColor: provider === p.id && p.installed ? 'var(--accent)' : undefined, background: provider === p.id && p.installed ? 'var(--chip-on)' : 'var(--editor)', opacity: p.installed ? 1 : 0.6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-strong)' }}>
              <span className="kb-dot" style={{ width: 7, height: 7, background: p.installed ? 'var(--ok)' : 'var(--dim)' }} />
              {p.name.replace('Google ', '')}
            </div>
            <div className="kb-muted" style={{ fontSize: 11, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.installed ? `${p.id} ${p.version || ''}` : 'Not found, hover for setup'}
            </div>
          </button>
        ))}
      </div>
      <p className="kb-muted" style={{ fontSize: 11, lineHeight: 1.5, margin: '6px 0 12px' }}>
        Agents run through the Antigravity CLI you are signed in to in Terminal. All agents share that one subscription. Kernel Base stores no keys.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <label>
          <div className="kb-label" style={{ marginBottom: 4 }}>Model</div>
          <select className="kb-input" value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="auto">Auto (fast per role)</option>
            <option value="">CLI default (slower)</option>
            {models.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <label>
          <div className="kb-label" style={{ marginBottom: 4 }}>Permissions</div>
          <select
            className="kb-input"
            value={mode}
            onChange={(e) => {
              const m = e.target.value as Mode;
              setMode(m);
              // Choosing a level here is the user's decision for this folder: remember it
              if (cwd && m !== 'plan') setTrust(cwd, m === 'auto' ? 'auto' : 'edits');
            }}
          >
            {(Object.keys(MODE_LABEL) as Mode[]).map((m) => <option key={m} value={m}>{MODE_LABEL[m]}</option>)}
          </select>
        </label>
        <div>
          <div className="kb-label" style={{ marginBottom: 4 }}>Strategy</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['parallel', 'pipeline'] as Strategy[]).map((s) => (
              <button key={s} className={`kb-chip ${strategy === s ? 'on' : ''}`} style={{ flex: 1, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, textTransform: 'capitalize' }} onClick={() => setStrategy(s)}
                title={s === 'parallel' ? 'All agents start at once' : 'Planner runs first, others get its plan'}>
                <Icon name={s === 'parallel' ? 'layers' : 'pipeline'} size={13} /> {s}
              </button>
            ))}
          </div>
        </div>
        <label>
          <div className="kb-label" style={{ marginBottom: 4 }}>Max parallel: {maxParallel}</div>
          <input type="range" min={1} max={8} value={maxParallel} onChange={(e) => setMaxParallel(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </label>
      </div>
      {mode === 'auto' && (
        <div style={{ fontSize: 12, color: 'var(--warn)', marginBottom: 10, display: 'flex', gap: 6 }}>
          <Icon name="warning" size={14} /> Agents may change files in this folder. Commit first so you can review the diff.
        </div>
      )}

      <div className="kb-label" style={{ marginBottom: 6 }}>Agents ({selectedRoles.length})</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        {STUDIO_ROLES.map((r) => {
          const on = selectedRoles.includes(r.id);
          return (
            <button key={r.id} className={`kb-chip ${on ? 'on' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 5 }}
              onClick={() => setSelectedRoles((p) => (p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id]))}>
              <span className="kb-dot" style={{ width: 6, height: 6, background: on ? r.color : 'var(--dim)' }} />
              {r.name}
            </button>
          );
        })}
      </div>
      <textarea
        className="kb-input"
        rows={4}
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            launch();
          }
          e.stopPropagation();
        }}
        placeholder="Describe the goal for your agent team (⌘Enter to launch)"
      />
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, margin: '6px 0 8px' }} className="kb-muted">
        <input type="checkbox" checked={useDocs} onChange={(e) => setUseDocs(e.target.checked)} />
        Give agents the documents marked "Agents read" in Resources
      </label>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="kb-btn" style={{ flex: 1 }} onClick={launch} disabled={!canLaunch} data-testid="launch-agents">
          <Icon name="play" size={13} fill /> Launch {selectedRoles.length} agent{selectedRoles.length === 1 ? '' : 's'}
        </button>
        <button className="kb-btn secondary" title="Stop all" onClick={stopAll} disabled={!counts.running && !counts.queued}><Icon name="stop" size={13} /></button>
        <button className="kb-btn secondary" title="Clear finished" onClick={() => setRuns((p) => p.filter((r) => r.status === 'running' || r.status === 'queued'))} disabled={!runs.some((r) => r.status !== 'running' && r.status !== 'queued')}>
          <Icon name="trash" size={13} />
        </button>
      </div>
      {!cwd && <div className="kb-muted" style={{ fontSize: 12, marginTop: 6 }}>Open a folder so agents work inside your project.</div>}

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {runs.length === 0 && <div className="kb-muted" style={{ textAlign: 'center', padding: '24px 0' }}>No agents yet. Pick roles, write a goal, launch.</div>}
        {runs.map((r) => <AgentCard key={r.id} run={r} onStop={() => stop(r.id)} onRerun={() => rerun(r)} />)}
      </div>
    </div>
  );
};

const AgentCard: React.FC<{ run: AgentRun; onStop: () => void; onRerun: () => void }> = ({ run, onStop, onRerun }) => {
  const outRef = useRef<HTMLPreElement>(null);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (run.status === 'running' && outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [run.output, run.status]);
  const elapsed = run.startedAt ? (run.endedAt || Date.now()) - run.startedAt : 0;
  const sColor = run.status === 'done' ? 'var(--ok)' : run.status === 'failed' ? 'var(--err)' : run.status === 'stopped' ? 'var(--dim)' : run.status === 'running' ? 'var(--accent-fg)' : 'var(--muted)';
  return (
    <div className="kb-card" style={{ overflow: 'hidden', borderLeft: `2px solid ${run.color}` }} data-testid="agent-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderBottom: open ? '1px solid var(--border)' : undefined }}>
        <span className="kb-dot" style={{ background: sColor, animation: run.status === 'running' ? 'kb-pulse 1.2s ease-in-out infinite' : undefined }} />
        <button onClick={() => setOpen((v) => !v)} style={{ flex: 1, textAlign: 'left', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: 'var(--text-strong)', fontWeight: 600 }}>{run.roleName}</span>
          <span className="kb-muted" style={{ marginLeft: 6, fontSize: 12 }}>
            {run.provider} · {run.status}{run.dependsOnPlanner && run.status === 'queued' ? ' (waiting for plan)' : ''}
          </span>
        </button>
        {run.startedAt && <span className="kb-muted" style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{fmtDuration(elapsed)}</span>}
        <button className="kb-icon-btn" style={{ width: 20, height: 20 }} title="Copy output" onClick={() => navigator.clipboard?.writeText(run.output)}><Icon name="copy" size={13} /></button>
        {run.status === 'running' || run.status === 'queued' ? (
          <button className="kb-icon-btn" style={{ width: 20, height: 20 }} title="Stop agent" onClick={onStop}><Icon name="stop" size={12} /></button>
        ) : (
          <button className="kb-icon-btn" style={{ width: 20, height: 20 }} title="Run again" onClick={onRerun}><Icon name="refresh" size={13} /></button>
        )}
      </div>
      {open && (
        <pre ref={outRef} className="mono select-text" style={{ margin: 0, maxHeight: 260, overflow: 'auto', padding: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 11.5, lineHeight: 1.5 }}>
          {run.output || (run.status === 'running' ? 'Working...' : run.status === 'queued' ? 'Queued' : '')}
        </pre>
      )}
    </div>
  );
};

/* =================================================================== */
const RACK_SLOTS = 8;
const TYPE_COLOR: Record<string, string> = { pdf: '#f14c4c', docx: '#3794ff', doc: '#3794ff', md: '#4ec9b0', txt: '#9d9d9d', rtf: '#b180d7', pages: '#e37933' };

const ResourcesTab: React.FC<{ provider: Provider; providerReady: boolean; onCount: (n: number) => void }> = ({ provider, providerReady, onCount }) => {
  const wb = useWb();
  const ws = wb.root;
  const [items, setItems] = useState<RackItem[]>([]);
  const [dir, setDir] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [md, setMd] = useState('');
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const reload = useCallback(async () => {
    if (!ws || !kb) return setItems([]);
    const r = await kb.resources.list(ws);
    setItems(r.items || []);
    setDir(r.dir || '');
  }, [ws]);
  useEffect(() => {
    reload();
  }, [reload]);
  useEffect(() => onCount(items.length), [items.length, onCount]);
  useEffect(() => {
    if (!kb) return;
    const off1 = kb.resources.onChanged(() => reload());
    const off2 = kb.resources.onProgress?.(({ id, chars }: { id: string; chars: number }) => setProgress((p) => ({ ...p, [id]: chars })));
    return () => {
      off1?.();
      off2?.();
    };
  }, [reload]);

  const selected = items.find((i) => i.id === sel) || null;
  useEffect(() => {
    if (!ws || !selected) return setMd('');
    kb.resources.readMd(ws, selected.id).then((t: string | null) => setMd(t || ''));
  }, [ws, selected?.id, selected?.status]);

  const importFiles = async (files: string[]) => {
    if (!ws) return wb.notify('Open a folder first. Resources are stored in <folder>/.kernelbase/resources.', 'info');
    if (!files.length) return;
    setBusy(true);
    const r = await kb.resources.import(ws, files);
    setBusy(false);
    for (const e of r.errors || []) wb.notify(e, 'error');
    await reload();
    const added = (r.items || []).filter((i: RackItem) => !items.some((x) => x.id === i.id));
    if (added.length) {
      setSel(added[added.length - 1].id);
      wb.log('Resources', `Added ${added.map((a: RackItem) => a.name).join(', ')}`, 'ok');
      if (providerReady) for (const a of added) summarize(a.id);
    }
  };
  useEffect(() => {
    const h = () => kb?.resources.pick().then(importFiles);
    window.addEventListener('kb:resources-add', h);
    return () => window.removeEventListener('kb:resources-add', h);
  });

  const summarize = async (id: string) => {
    if (!ws) return;
    if (!providerReady) return wb.notify(`${provider} CLI not found. Install it and sign in from Terminal, then click Regenerate.`, 'error');
    setProgress((p) => ({ ...p, [id]: 0 }));
    const r = await kb.resources.summarize(ws, id, provider);
    if (!r?.success) wb.notify(`Docs agent failed: ${r?.error || 'unknown error'}`, 'error');
    else wb.log('Resources', 'Markdown brief ready', 'ok');
    reload();
  };

  const toggleRead = async (it: RackItem) => setItems(await kb.resources.setAgentsRead(ws, it.id, !it.agentsRead));
  const remove = async (it: RackItem) => {
    if (!window.confirm(`Remove "${it.name}" from the rack? Its copy and Markdown are deleted.`)) return;
    setItems(await kb.resources.remove(ws, it.id));
    if (sel === it.id) setSel(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const paths = Array.from(e.dataTransfer.files)
      .map((f) => kb.resources.pathForFile(f))
      .filter(Boolean);
    importFiles(paths);
  };

  const slots = Array.from({ length: RACK_SLOTS }, (_, i) => items.find((it) => it.slot === i + 1) || null);
  const html = useMemo(() => (md ? (marked.parse(md, { async: false }) as string) : ''), [md]);

  if (!ws) return <div className="kb-empty">Open a folder to use the Resources rack. Documents are stored inside the project.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }} data-testid="resources">
      <div className="kb-scroll" style={{ padding: 12, flex: selected ? '0 1 auto' : 1, maxHeight: selected ? '55%' : undefined }}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          style={{ border: `1px dashed ${drag ? 'var(--accent)' : 'var(--border-strong)'}`, background: drag ? 'var(--chip-on)' : 'transparent', borderRadius: 6, padding: '14px 10px', textAlign: 'center', marginBottom: 12 }}
        >
          <Icon name="upload" size={20} style={{ color: 'var(--muted)' }} />
          <div style={{ margin: '4px 0 2px', color: 'var(--text-strong)' }}>{busy ? 'Reading document...' : 'Drop project documents here'}</div>
          <div className="kb-muted" style={{ fontSize: 11, marginBottom: 8 }}>PDF, DOCX, DOC, RTF, Pages, TXT, MD. Read on this Mac, never uploaded.</div>
          <button className="kb-btn secondary" style={{ height: 24 }} onClick={() => kb.resources.pick().then(importFiles)} disabled={busy} data-testid="resources-choose">
            Choose Files...
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span className="kb-label">Rack · {items.length} of {RACK_SLOTS} slots</span>
          <button className="kb-link" style={{ fontSize: 11 }} onClick={() => dir && kb.fs.revealInFinder(dir)}>Reveal folder</button>
        </div>
        <div style={{ border: '1px solid var(--border-strong)', borderRadius: 6, background: 'var(--side)', padding: '4px 6px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }} data-testid="rack">
          {slots.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: 6, height: 38, borderBottom: i < RACK_SLOTS - 1 ? '1px solid var(--border)' : undefined }}>
              {/* rail with slot number and screw holes */}
              <div className="mono" style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: 'var(--dim)', fontSize: 9 }}>
                <span style={{ width: 4, height: 4, borderRadius: 2, border: '1px solid var(--border-strong)' }} />
                U{i + 1}
              </div>
              {it ? (
                <button
                  onClick={() => setSel(it.id === sel ? null : it.id)}
                  data-testid="rack-slot"
                  style={{
                    flex: 1, minWidth: 0, margin: '3px 0', display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', borderRadius: 4, textAlign: 'left',
                    background: sel === it.id ? 'var(--selected)' : 'var(--editor)', border: `1px solid ${sel === it.id ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  <span className="kb-dot" title={it.status} style={{
                    width: 7, height: 7,
                    background: it.status === 'ready' ? 'var(--ok)' : it.status === 'error' ? 'var(--err)' : it.status === 'summarizing' ? 'var(--accent-fg)' : 'var(--warn)',
                    boxShadow: it.status === 'ready' ? '0 0 6px var(--ok)' : undefined,
                    animation: it.status === 'summarizing' ? 'kb-pulse 1.2s ease-in-out infinite' : undefined,
                  }} />
                  <span className="mono" style={{ fontSize: 9, fontWeight: 600, color: TYPE_COLOR[it.type] || 'var(--muted)', width: 30 }}>{it.type.toUpperCase().slice(0, 4)}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12 }}>{it.name}</span>
                    <span className="kb-muted" style={{ display: 'block', fontSize: 10.5 }}>
                      {it.status === 'summarizing' ? `Docs agent writing${progress[it.id] ? ` · ${progress[it.id]} chars` : '...'}` : it.status === 'error' ? 'Agent failed, extracted text kept' : it.status === 'ready' ? 'Markdown ready' : 'Extracted'}
                      {` · ${it.pages ? `${it.pages} pp · ` : ''}${it.words.toLocaleString()} words`}
                    </span>
                  </span>
                  <span
                    role="checkbox"
                    aria-checked={it.agentsRead}
                    title={it.agentsRead ? 'Agents read this document' : 'Agents ignore this document'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRead(it);
                    }}
                    style={{ width: 26, height: 14, borderRadius: 7, background: it.agentsRead ? 'var(--accent)' : 'var(--border-strong)', position: 'relative', flexShrink: 0, cursor: 'pointer' }}
                  >
                    <span style={{ position: 'absolute', top: 2, left: it.agentsRead ? 14 : 2, width: 10, height: 10, borderRadius: 5, background: '#fff', transition: 'left .15s' }} />
                  </span>
                </button>
              ) : (
                <div style={{ flex: 1, margin: '3px 0', borderRadius: 4, border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', padding: '0 10px', color: 'var(--dim)', fontSize: 11 }}>
                  Empty slot
                </div>
              )}
              <div style={{ width: 8, display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 4, height: 4, borderRadius: 2, border: '1px solid var(--border-strong)' }} />
              </div>
            </div>
          ))}
        </div>
        <p className="kb-muted" style={{ fontSize: 11, lineHeight: 1.5, marginTop: 8 }}>
          The switch on each unit controls whether agents read it. The green light means the Docs agent has written a Markdown brief.
        </p>
      </div>

      {selected && (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px 6px 12px' }}>
            <Icon name="doc" size={14} />
            <span className="mono" style={{ fontSize: 12, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.md}</span>
            <button className="kb-icon-btn" title="Open Markdown in editor" onClick={() => wb.openFile(joinPath(dir, selected.md))}><Icon name="external" size={14} /></button>
            {selected.status === 'summarizing' ? (
              <button className="kb-icon-btn" title="Cancel docs agent" onClick={() => kb.resources.cancel(selected.id)}><Icon name="stop" size={13} /></button>
            ) : (
              <button className="kb-icon-btn" title="Regenerate with the Docs agent" onClick={() => summarize(selected.id)} data-testid="resources-regenerate"><Icon name="refresh" size={14} /></button>
            )}
            <button className="kb-icon-btn" title="Open original document" onClick={() => kb.shell.openPath ? kb.shell.openPath(joinPath(dir, selected.file)) : kb.fs.revealInFinder(joinPath(dir, selected.file))}><Icon name="eye" size={14} /></button>
            <button className="kb-icon-btn" title="Remove from rack" onClick={() => remove(selected)}><Icon name="trash" size={14} /></button>
          </div>
          {selected.status === 'error' && selected.error && <div style={{ color: 'var(--err)', fontSize: 11, padding: '0 12px 6px' }}>{selected.error}</div>}
          <div className="kb-scroll kb-md" style={{ padding: '4px 14px 16px' }} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
    </div>
  );
};
