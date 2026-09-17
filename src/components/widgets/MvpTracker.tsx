import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Terminal, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';

interface DayMilestone {
  day: number;
  title: string;
  focus: string;
  deliverables: string[];
  testCommand: string;
  verificationCriteria: string;
  completed: boolean;
}

const MVP_DAYS: DayMilestone[] = [
  {
    day: 1,
    title: 'Day 1 — Architecture & Workspaces',
    focus: 'Monorepo layout, Git worktree isolation, SQLite schemas',
    deliverables: [
      'pnpm monorepo workspace initialized with packages/core and packages/desktop',
      'GitWorktreeManager class handling branch isolation at .ai-ide/worktrees',
      'SQLite schema with runs, tasks, and token_logs tables',
    ],
    testCommand: 'pnpm --filter @ai-ide/core test tests/worktree.test.ts',
    verificationCriteria: 'Creates 3 simultaneous branches and cleans them up without touching master.',
    completed: true,
  },
  {
    day: 2,
    title: 'Day 2 — Agent Registry & MCP Tools',
    focus: 'AgentSpec validator, JSON schema validation, MCP filesystem bridges',
    deliverables: [
      'AgentRegistry with schema validation and capability matching',
      'Default AgentSpec definitions for Planner, Coder, QA, and Reviewer',
      'Model Context Protocol (MCP) server for filesystem read/write',
    ],
    testCommand: 'pnpm --filter @ai-ide/core test tests/registry.test.ts',
    verificationCriteria: 'Loads and validates 5 agent personas and rejects invalid tool schemas.',
    completed: true,
  },
  {
    day: 3,
    title: 'Day 3 — Orchestrator & DAG Engine',
    focus: 'Topological task scheduler, cycle detection, state machine',
    deliverables: [
      'DAG engine implementing Kahn\'s algorithm for cycle-free execution',
      'Event-driven tick loop dispatching unblocked tasks to agents',
      'Persistence of task states (PENDING, RUNNING, COMPLETED) to SQLite',
    ],
    testCommand: 'pnpm --filter @ai-ide/core test tests/orchestrator.test.ts',
    verificationCriteria: 'Schedules a 10-task dependency graph in exact topological sequence.',
    completed: true,
  },
  {
    day: 4,
    title: 'Day 4 — Coding Agent & Sandbox Runner',
    focus: 'Docker execution container, AST diffing, atomic file mutation',
    deliverables: [
      'Ephemeral Docker containerization with non-root security',
      'Surgical edit_file tool with line and AST character targeting',
      'Real-time file change event broadcasting to event bus',
    ],
    testCommand: 'pnpm --filter @ai-ide/core test tests/docker-sandbox.test.ts',
    verificationCriteria: 'Executes file edits inside Docker sandbox without escaping to host filesystem.',
    completed: true,
  },
  {
    day: 5,
    title: 'Day 5 — Research Agent & Web Retreival',
    focus: 'Playwright headless scraper, AST API signature extractor',
    deliverables: [
      'Headless browser MCP tool for retrieving public documentation',
      'AST interface extractor compressing 50KB code files into 2KB stubs',
      'Research synthesis engine injecting reference context to Planner',
    ],
    testCommand: 'pnpm --filter @ai-ide/core test tests/research-agent.test.ts',
    verificationCriteria: 'Fetches documentation page and extracts exported function signatures.',
    completed: true,
  },
  {
    day: 6,
    title: 'Day 6 — QA Agent & Test Loop',
    focus: 'Vitest / Jest runner integration, TAP parser, failure extractor',
    deliverables: [
      'Vitest JSON reporter parser mapping test failures to source code lines',
      'Automated unit test generator targeting uncovered branches',
      'Structured diagnostic envelope builder with expected vs actual values',
    ],
    testCommand: 'pnpm --filter @ai-ide/core test tests/qa-agent.test.ts',
    verificationCriteria: 'Captures failed assertion stack trace and isolates offending line number.',
    completed: true,
  },
  {
    day: 7,
    title: 'Day 7 — Failure Diagnosis & Self-Healing',
    focus: 'Autonomous repair loop, regression prevention, circuit breakers',
    deliverables: [
      'Diagnostic reflection prompt generating surgical bug fixes',
      'Automated regression check ensuring passing tests remain green',
      'Hard 3-attempt circuit breaker preventing infinite loops',
    ],
    testCommand: 'pnpm --filter @ai-ide/core test tests/repair-loop.test.ts',
    verificationCriteria: 'Injects failing test, generates patch, re-tests, and passes in <2 attempts.',
    completed: true,
  },
  {
    day: 8,
    title: 'Day 8 — Credit System & Rate Limiting',
    focus: 'Token counting, hierarchical budgets, LiteLLM fallback chains',
    deliverables: [
      'Thread-safe BudgetLedger enforcing credit limits per task and run',
      'LiteLLM fallback router switching from Cloud to Local Ollama on 429',
      'Real-time token and credit burn telemetry events',
    ],
    testCommand: 'pnpm --filter @ai-ide/core test tests/credits.test.ts',
    verificationCriteria: 'Halts task execution gracefully when token budget reaches zero.',
    completed: true,
  },
  {
    day: 9,
    title: 'Day 9 — Desktop UI & Multi-Panel',
    focus: 'Monaco editor, xterm.js terminal, live DAG visualizer',
    deliverables: [
      'Desktop window layout with Monaco editor and side-by-side diffs',
      'Embedded xterm.js terminal attached to Docker PTY container',
      'Live SVG DAG graph visualizer showing real-time agent execution',
    ],
    testCommand: 'pnpm --filter @ai-ide/desktop build',
    verificationCriteria: 'Desktop interface boots, renders code, and streams live agent thinking tokens.',
    completed: false,
  },
  {
    day: 10,
    title: 'Day 10 — Verification & First Release',
    focus: 'End-to-end task run, security audit, cross-platform packaging',
    deliverables: [
      'Full autonomous verification run: "Implement JWT auth from scratch"',
      'Security penetration check: verified no container escape or host leaks',
      'Cross-platform binary packaging (macOS DMG, Linux AppImage, Windows)',
    ],
    testCommand: 'pnpm test:e2e && pnpm package',
    verificationCriteria: 'Autonomous goal passes 100% of tests and packages executable binaries.',
    completed: false,
  },
];

export const MvpTracker: React.FC = () => {
  const [days, setDays] = useState<DayMilestone[]>(MVP_DAYS);
  const [expandedDay, setExpandedDay] = useState<number>(8);
  const [copiedDay, setCopiedDay] = useState<number | null>(null);

  const completedCount = days.filter((d) => d.completed).length;
  const progressPercent = Math.round((completedCount / days.length) * 100);

  const toggleComplete = (dayNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDays((prev) =>
      prev.map((d) => (d.day === dayNum ? { ...d, completed: !d.completed } : d))
    );
  };

  const handleCopy = async (cmd: string, dayNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(cmd);
    if (success) {
      setCopiedDay(dayNum);
      setTimeout(() => setCopiedDay(null), 2000);
    }
  };

  return (
    <div id="mvp-tracker-widget" className="my-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Tracker Header */}
      <div className="p-3.5 sm:p-5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              10-Day Production MVP Sprint Tracker
            </h4>
          </div>
          <div className="flex items-center space-x-2 text-xs self-start sm:self-auto">
            <span className="text-slate-500 dark:text-slate-400">Sprint Progress:</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {completedCount} / {days.length} Days ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Accordion List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {days.map((milestone) => {
          const isExpanded = expandedDay === milestone.day;
          return (
            <div
              key={milestone.day}
              id={`mvp-day-${milestone.day}`}
              className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
            >
              <div
                onClick={() => setExpandedDay(isExpanded ? 0 : milestone.day)}
                className="p-3 sm:p-4 flex items-center justify-between cursor-pointer gap-2"
              >
                <div className="flex items-center space-x-2.5 sm:space-x-3 truncate">
                  <button
                    id={`toggle-day-${milestone.day}`}
                    onClick={(e) => toggleComplete(milestone.day, e)}
                    className="shrink-0 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 focus:outline-none min-h-[30px] min-w-[30px] flex items-center justify-center"
                    title={milestone.completed ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {milestone.title}
                    </span>
                    <span className="hidden md:inline-block text-[11px] text-slate-500 dark:text-slate-400 ml-2">
                      — {milestone.focus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      milestone.completed
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {milestone.completed ? 'VERIFIED' : 'IN PROGRESS'}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 pt-1 space-y-3 bg-slate-50/50 dark:bg-slate-950/30 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Deliverables:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      {milestone.deliverables.map((del, i) => (
                        <li key={i}>{del}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Verification Test Command:
                    </span>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 text-slate-200 font-mono text-[11px]">
                      <div className="flex items-center space-x-2 truncate">
                        <Terminal className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{milestone.testCommand}</span>
                      </div>
                      <button
                        onClick={(e) => handleCopy(milestone.testCommand, milestone.day, e)}
                        className="ml-2 p-1 hover:text-white shrink-0"
                        title="Copy command"
                      >
                        {copiedDay === milestone.day ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Acceptance Standard:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">
                      {milestone.verificationCriteria}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
