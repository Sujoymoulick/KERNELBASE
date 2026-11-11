import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Play,
  Square,
  RefreshCw,
  Copy,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Workflow,
  Layers,
  Trash2,
} from 'lucide-react';
import { useIDE } from '../context/IDEContext';

type Provider = 'agy' | 'gemini';
type Mode = 'plan' | 'accept-edits' | 'auto';
type Strategy = 'parallel' | 'pipeline';
type RunStatus = 'queued' | 'running' | 'done' | 'failed' | 'stopped';

interface ProviderInfo {
  id: Provider;
  name: string;
  installed: boolean;
  version?: string;
  path?: string;
  installHint: string;
}

interface RoleDef {
  id: string;
  name: string;
  color: string;
  instructions: string;
}

interface AgentRun {
  id: string;
  roleId: string;
  roleName: string;
  color: string;
  provider: Provider;
  prompt: string;
  status: RunStatus;
  output: string;
  startedAt?: number;
  endedAt?: number;
  exitCode?: number;
  batchId: string;
  dependsOnPlanner?: boolean;
}

export const STUDIO_ROLES: RoleDef[] = [
  {
    id: 'planner',
    name: 'Planner',
    color: '#ff6b35',
    instructions:
      'You are the PLANNER agent in the Kernel Base multi-agent IDE. Break the goal into a short numbered implementation plan (max 8 steps) naming the files involved. Do not write full code.',
  },
  {
    id: 'coder',
    name: 'Coder',
    color: '#38bdf8',
    instructions:
      'You are the CODER agent in the Kernel Base multi-agent IDE. Implement the goal in this workspace with focused, idiomatic changes. Summarise each file you changed at the end.',
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    color: '#a78bfa',
    instructions:
      'You are the REVIEWER agent in the Kernel Base multi-agent IDE. Review the relevant code in this workspace for bugs, edge cases and readability. Output a list of findings as file:line - issue - fix.',
  },
  {
    id: 'tester',
    name: 'Tester',
    color: '#34d399',
    instructions:
      'You are the QA / TEST agent in the Kernel Base multi-agent IDE. Design test cases for the goal (unit + edge cases) and, if a test framework exists in this workspace, write the tests.',
  },
  {
    id: 'security',
    name: 'Security',
    color: '#f87171',
    instructions:
      'You are the SECURITY agent in the Kernel Base multi-agent IDE. Audit the code related to the goal for vulnerabilities (injection, secrets, unsafe IO, auth). Rate each finding low/medium/high.',
  },
  {
    id: 'docs',
    name: 'Docs',
    color: '#facc15',
    instructions:
      'You are the DOCS agent in the Kernel Base multi-agent IDE. Write concise developer documentation (README section or inline doc comments) for the goal.',
  },
  {
    id: 'debugger',
    name: 'Debugger',
    color: '#fb923c',
    instructions:
      'You are the DEBUGGER agent in the Kernel Base multi-agent IDE. Find the root cause of the problem described in the goal, explain it, and propose the minimal fix.',
  },
  {
    id: 'researcher',
    name: 'Research',
    color: '#22d3ee',
    instructions:
      'You are the RESEARCH agent in the Kernel Base multi-agent IDE. Explain the relevant libraries, APIs and approaches for the goal, with trade-offs and a recommendation.',
  },
];

const MODE_LABEL: Record<Mode, string> = {
  plan: 'Read-only (plan)',
  'accept-edits': 'Allow file edits',
  auto: 'Full auto',
};

const studioApi = () => (window as any).kernelBase?.studio;

function buildPrompt(role: RoleDef, goal: string, workspace: string, plan?: string) {
  return [
    role.instructions,
    `Workspace root: ${workspace}`,
    plan ? `\nThe Planner agent produced this plan. Follow it for your role:\n${plan}\n` : '',
    `\nGOAL:\n${goal}`,
  ].join('\n');
}

function fmtDuration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

export const AgentStudio: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { workspace } = useIDE();
  const cwd = workspace?.rootPath || '';

  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [provider, setProvider] = useState<Provider>('agy');
  const [models, setModels] = useState<{ id: string; label: string }[]>([]);
  const [model, setModel] = useState('');
  const [mode, setMode] = useState<Mode>('plan');
  const [strategy, setStrategy] = useState<Strategy>('parallel');
  const [maxParallel, setMaxParallel] = useState(4);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['planner', 'coder', 'reviewer', 'tester']);
  const [goal, setGoal] = useState('');
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [, forceTick] = useState(0);

  const runsRef = useRef<AgentRun[]>([]);
  runsRef.current = runs;
  const launchingRef = useRef(new Set<string>());
  const isDesktop = !!studioApi();

  const detect = useCallback(async () => {
    const api = studioApi();
    if (!api) return;
    setDetecting(true);
    try {
      const res = await api.detect();
      setProviders(res.providers || []);
      const firstInstalled = (res.providers || []).find((p: ProviderInfo) => p.installed);
      if (firstInstalled) setProvider((cur) => (res.providers.find((p: ProviderInfo) => p.id === cur && p.installed) ? cur : firstInstalled.id));
    } finally {
      setDetecting(false);
    }
  }, []);

  useEffect(() => {
    detect();
  }, [detect]);

  useEffect(() => {
    const api = studioApi();
    if (!api) return;
    setModels([]);
    setModel('');
    api.models(provider).then((m: { id: string; label: string }[]) => setModels(m || []));
  }, [provider, providers.length]);

  // Live stream + exit events
  useEffect(() => {
    const api = studioApi();
    if (!api) return;
    const offData = api.onData(({ id, data }: { id: string; data: string }) => {
      setRuns((prev) => prev.map((r) => (r.id === id ? { ...r, output: (r.output + data).slice(-200_000) } : r)));
    });
    const offExit = api.onExit(({ id, code, error }: { id: string; code: number; error?: string }) => {
      launchingRef.current.delete(id);
      setRuns((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: r.status === 'stopped' ? 'stopped' : code === 0 ? 'done' : 'failed',
                exitCode: code,
                endedAt: Date.now(),
                output: error ? `${r.output}\n[error] ${error}` : r.output,
              }
            : r
        )
      );
    });
    return () => {
      offData();
      offExit();
    };
  }, []);

  // Elapsed timer refresh while anything is running
  useEffect(() => {
    if (!runs.some((r) => r.status === 'running')) return;
    const t = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [runs]);

  // Scheduler: start queued runs up to the parallel limit
  useEffect(() => {
    const api = studioApi();
    if (!api) return;
    const active = runs.filter((r) => r.status === 'running').length;
    let slots = maxParallel - active;
    if (slots <= 0) return;

    for (const run of runs) {
      if (slots <= 0) break;
      if (run.status !== 'queued' || launchingRef.current.has(run.id)) continue;

      let prompt = run.prompt;
      if (run.dependsOnPlanner) {
        const planner = runs.find((r) => r.batchId === run.batchId && r.roleId === 'planner');
        if (planner && (planner.status === 'queued' || planner.status === 'running')) continue;
        const role = STUDIO_ROLES.find((r) => r.id === run.roleId)!;
        prompt = buildPrompt(role, goalForBatch(run.batchId), cwd, planner?.status === 'done' ? planner.output.trim() : undefined);
      }

      slots--;
      launchingRef.current.add(run.id);
      const startedAt = Date.now();
      setRuns((prev) => prev.map((r) => (r.id === run.id ? { ...r, status: 'running', startedAt, prompt } : r)));
      api
        .spawn({ id: run.id, provider: run.provider, prompt, cwd, model: model || undefined, mode })
        .then((res: { success: boolean; error?: string }) => {
          if (!res.success) {
            launchingRef.current.delete(run.id);
            setRuns((prev) =>
              prev.map((r) =>
                r.id === run.id ? { ...r, status: 'failed', endedAt: Date.now(), output: `[error] ${res.error}` } : r
              )
            );
          }
        });
    }
  }, [runs, maxParallel, cwd, model, mode]);

  const batchGoals = useRef(new Map<string, string>());
  const goalForBatch = (batchId: string) => batchGoals.current.get(batchId) || '';

  const providerInfo = providers.find((p) => p.id === provider);
  const canLaunch = isDesktop && !!providerInfo?.installed && goal.trim().length > 0 && selectedRoles.length > 0;

  const launch = () => {
    if (!canLaunch) return;
    const batchId = `b${Date.now().toString(36)}`;
    batchGoals.current.set(batchId, goal.trim());
    const pipeline = strategy === 'pipeline' && selectedRoles.includes('planner');
    const ordered = STUDIO_ROLES.filter((r) => selectedRoles.includes(r.id));
    const newRuns: AgentRun[] = ordered.map((role, i) => ({
      id: `${batchId}-${role.id}-${i}`,
      roleId: role.id,
      roleName: role.name,
      color: role.color,
      provider,
      prompt: buildPrompt(role, goal.trim(), cwd),
      status: 'queued',
      output: '',
      batchId,
      dependsOnPlanner: pipeline && role.id !== 'planner',
    }));
    setRuns((prev) => [...newRuns, ...prev]);
  };

  const stop = (id: string) => {
    setRuns((prev) => prev.map((r) => (r.id === id && (r.status === 'running' || r.status === 'queued') ? { ...r, status: 'stopped', endedAt: Date.now() } : r)));
    studioApi()?.stop(id);
  };

  const stopAll = () => {
    setRuns((prev) => prev.map((r) => (r.status === 'running' || r.status === 'queued' ? { ...r, status: 'stopped', endedAt: Date.now() } : r)));
    studioApi()?.stopAll();
  };

  const rerun = (run: AgentRun) => {
    const id = `${run.batchId}-${run.roleId}-r${Date.now().toString(36)}`;
    setRuns((prev) => [{ ...run, id, status: 'queued', output: '', startedAt: undefined, endedAt: undefined, exitCode: undefined, dependsOnPlanner: false }, ...prev]);
  };

  const clearFinished = () => setRuns((prev) => prev.filter((r) => r.status === 'running' || r.status === 'queued'));

  const counts = useMemo(
    () => ({
      running: runs.filter((r) => r.status === 'running').length,
      queued: runs.filter((r) => r.status === 'queued').length,
      done: runs.filter((r) => r.status === 'done').length,
    }),
    [runs]
  );

  const toggleRole = (id: string) =>
    setSelectedRoles((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));

  return (
    <div className="h-full flex flex-col bg-[#0e0805] text-neutral-200 text-xs" data-testid="agent-studio">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-[#26130d] shrink-0">
        <div className="flex items-center gap-2 font-semibold tracking-wide uppercase text-[11px] text-neutral-300">
          <Layers className="w-4 h-4 text-[#ff6b35]" />
          Agent Studio
          {counts.running > 0 && (
            <span className="ml-1 px-1.5 rounded-full bg-[#ff6b35]/20 text-[#ff8a5c] normal-case font-medium">
              {counts.running} running{counts.queued ? ` · ${counts.queued} queued` : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={detect} title="Re-detect CLIs" className="p-1 rounded hover:bg-[#20100a] text-neutral-400">
            <RefreshCw className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onClose} title="Close Agent Studio (⌘⇧L)" className="p-1 rounded hover:bg-[#20100a] text-neutral-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Connection */}
        <section className="p-3 border-b border-[#26130d] space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500">Subscription connector</div>
          {!isDesktop && (
            <div className="text-amber-300/90">Agent Studio needs the Kernel Base desktop app.</div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {(providers.length ? providers : [
              { id: 'agy', name: 'Google Antigravity CLI', installed: false, installHint: '' },
              { id: 'gemini', name: 'Gemini CLI', installed: false, installHint: '' },
            ] as ProviderInfo[]).map((p) => (
              <button
                key={p.id}
                onClick={() => p.installed && setProvider(p.id)}
                title={p.installed ? p.path : p.installHint}
                className={`text-left p-2 rounded border transition-colors ${
                  provider === p.id && p.installed
                    ? 'border-[#ff6b35] bg-[#1d0e08]'
                    : 'border-[#2a160e] bg-[#120a07] hover:border-[#3d1f14]'
                } ${p.installed ? '' : 'opacity-60 cursor-help'}`}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.installed ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                  {p.name}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5 truncate">
                  {p.installed ? `${p.id} ${p.version || ''}` : 'Not found — hover for setup'}
                </div>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            Agents run through the CLI you are signed in to in your terminal. Every agent shares that one subscription — Kernel Base stores no keys.
          </p>
        </section>

        {/* Config */}
        <section className="p-3 border-b border-[#26130d] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">Model</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#120a07] border border-[#2a160e] rounded px-1.5 py-1 outline-none focus:border-[#ff6b35]"
              >
                <option value="">CLI default</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">Permissions</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="w-full bg-[#120a07] border border-[#2a160e] rounded px-1.5 py-1 outline-none focus:border-[#ff6b35]"
              >
                {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
                  <option key={m} value={m}>
                    {MODE_LABEL[m]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">Strategy</span>
              <div className="flex rounded border border-[#2a160e] overflow-hidden">
                {(['parallel', 'pipeline'] as Strategy[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrategy(s)}
                    className={`flex-1 py-1 flex items-center justify-center gap-1 capitalize ${
                      strategy === s ? 'bg-[#ff6b35] text-black font-semibold' : 'bg-[#120a07] text-neutral-400'
                    }`}
                    title={s === 'parallel' ? 'All agents start at once' : 'Planner runs first, others get its plan'}
                  >
                    {s === 'parallel' ? <Layers className="w-3 h-3" /> : <Workflow className="w-3 h-3" />}
                    {s}
                  </button>
                ))}
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">Max parallel: {maxParallel}</span>
              <input
                type="range"
                min={1}
                max={8}
                value={maxParallel}
                onChange={(e) => setMaxParallel(Number(e.target.value))}
                className="w-full accent-[#ff6b35]"
              />
            </label>
          </div>
          {mode !== 'plan' && (
            <div className="text-[10px] text-amber-300/90">
              Agents may change files in {cwd || 'the workspace'}. Commit first so you can review the diff in Source Control.
            </div>
          )}
        </section>

        {/* Roles + goal */}
        <section className="p-3 border-b border-[#26130d] space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500">Agents ({selectedRoles.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {STUDIO_ROLES.map((r) => {
              const on = selectedRoles.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRole(r.id)}
                  className={`px-2 py-0.5 rounded-full border transition-colors ${on ? 'text-neutral-100' : 'text-neutral-500 border-[#2a160e]'}`}
                  style={on ? { borderColor: r.color, background: `${r.color}22` } : undefined}
                >
                  {r.name}
                </button>
              );
            })}
          </div>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                launch();
              }
              e.stopPropagation();
            }}
            rows={4}
            placeholder="Describe the goal for your agent team… (⌘↵ to launch)"
            className="w-full resize-y bg-[#120a07] border border-[#2a160e] rounded p-2 outline-none focus:border-[#ff6b35] placeholder:text-neutral-600 select-text"
          />
          <div className="flex gap-2">
            <button
              onClick={launch}
              disabled={!canLaunch}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#ff6b35] hover:bg-[#ff804d] text-black font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5" />
              Launch {selectedRoles.length} agent{selectedRoles.length === 1 ? '' : 's'}
            </button>
            <button
              onClick={stopAll}
              disabled={!counts.running && !counts.queued}
              className="px-2.5 rounded border border-[#3d1f14] text-neutral-300 hover:bg-[#20100a] disabled:opacity-40"
              title="Stop all"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearFinished}
              disabled={!runs.some((r) => r.status !== 'running' && r.status !== 'queued')}
              className="px-2.5 rounded border border-[#3d1f14] text-neutral-300 hover:bg-[#20100a] disabled:opacity-40"
              title="Clear finished"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {!cwd && <div className="text-[10px] text-neutral-500">Open a folder so agents work inside your project.</div>}
        </section>

        {/* Runs */}
        <section className="p-3 space-y-2">
          {runs.length === 0 && (
            <div className="text-center text-neutral-600 py-8">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No agents yet. Pick roles, write a goal, launch.
            </div>
          )}
          {runs.map((r) => (
            <AgentCard key={r.id} run={r} onStop={() => stop(r.id)} onRerun={() => rerun(r)} />
          ))}
        </section>
      </div>
    </div>
  );
};

const AgentCard: React.FC<{ run: AgentRun; onStop: () => void; onRerun: () => void }> = ({ run, onStop, onRerun }) => {
  const outRef = useRef<HTMLPreElement>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (run.status === 'running' && outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [run.output, run.status]);

  const elapsed = run.startedAt ? (run.endedAt || Date.now()) - run.startedAt : 0;
  const StatusIcon =
    run.status === 'running' ? Loader2 : run.status === 'done' ? CheckCircle2 : run.status === 'queued' ? Clock : XCircle;
  const statusColor =
    run.status === 'done' ? 'text-emerald-400' : run.status === 'failed' ? 'text-red-400' : run.status === 'stopped' ? 'text-neutral-500' : 'text-[#ff8a5c]';

  return (
    <div className="rounded border border-[#2a160e] bg-[#120a07] overflow-hidden" data-testid="agent-card">
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-[#1f100a]" style={{ borderLeft: `3px solid ${run.color}` }}>
        <StatusIcon className={`w-3.5 h-3.5 shrink-0 ${statusColor} ${run.status === 'running' ? 'animate-spin' : ''}`} />
        <button onClick={() => setExpanded((v) => !v)} className="font-semibold text-neutral-100 truncate text-left flex-1">
          {run.roleName}
          <span className="ml-1.5 font-normal text-neutral-500">
            {run.provider} · {run.status}
            {run.dependsOnPlanner && run.status === 'queued' ? ' (waiting for plan)' : ''}
          </span>
        </button>
        {run.startedAt && <span className="text-neutral-500 tabular-nums">{fmtDuration(elapsed)}</span>}
        <button
          onClick={() => navigator.clipboard?.writeText(run.output)}
          className="p-0.5 text-neutral-500 hover:text-neutral-200"
          title="Copy output"
        >
          <Copy className="w-3 h-3" />
        </button>
        {run.status === 'running' || run.status === 'queued' ? (
          <button onClick={onStop} className="p-0.5 text-neutral-500 hover:text-red-300" title="Stop agent">
            <Square className="w-3 h-3" />
          </button>
        ) : (
          <button onClick={onRerun} className="p-0.5 text-neutral-500 hover:text-neutral-200" title="Run again">
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>
      {expanded && (
        <pre
          ref={outRef}
          className="max-h-64 overflow-auto p-2 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-neutral-300 select-text"
        >
          {run.output || (run.status === 'running' ? 'Thinking…' : run.status === 'queued' ? 'Queued…' : '')}
        </pre>
      )}
    </div>
  );
};
