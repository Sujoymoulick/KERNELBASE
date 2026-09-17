import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, AlertCircle, Clock, ShieldCheck, Wrench } from 'lucide-react';

interface TaskState {
  id: string;
  title: string;
  agent: string;
  status: 'PENDING' | 'RUNNING' | 'VERIFYING' | 'COMPLETED' | 'REPAIRED';
  deps: string[];
  output: string;
  tokens: number;
}

const INITIAL_TASKS: TaskState[] = [
  {
    id: 'task-1',
    title: '1. Decompose Goal into Work Plan',
    agent: 'Planner Agent',
    status: 'COMPLETED',
    deps: [],
    output: 'DAG constructed: 4 tasks scheduled with topological order.',
    tokens: 420,
  },
  {
    id: 'task-2',
    title: '2. Create Isolated Git Worktree',
    agent: 'Workspace Manager',
    status: 'COMPLETED',
    deps: ['task-1'],
    output: 'Worktree created at .ai-ide/worktrees/run-auth-argon2 on branch ai/run-auth',
    tokens: 110,
  },
  {
    id: 'task-3',
    title: '3. Implement Argon2 Password Hashing',
    agent: 'Coding Agent',
    status: 'RUNNING',
    deps: ['task-2'],
    output: 'Editing src/auth/password.ts with argon2id algorithm and timing-safe equal.',
    tokens: 1850,
  },
  {
    id: 'task-4',
    title: '4. Execute Unit Tests in Docker Sandbox',
    agent: 'QA Agent',
    status: 'PENDING',
    deps: ['task-3'],
    output: 'Awaiting completion of task-3 to run vitest run tests/auth.test.ts.',
    tokens: 0,
  },
  {
    id: 'task-5',
    title: '5. Security Audit & Regression Check',
    agent: 'Security Agent',
    status: 'PENDING',
    deps: ['task-4'],
    output: 'Awaiting test pass to verify OWASP compliance and constant-time compares.',
    tokens: 0,
  },
];

export const DagVisualizer: React.FC = () => {
  const [tasks, setTasks] = useState<TaskState[]>(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState<TaskState>(INITIAL_TASKS[2]);
  const [simStep, setSimStep] = useState<number>(2);

  const handleNextStep = () => {
    if (simStep === 2) {
      // Step 3: Coding finished, QA running
      const updated = [...tasks];
      updated[2].status = 'COMPLETED';
      updated[3].status = 'RUNNING';
      updated[3].tokens = 620;
      setTasks(updated);
      setSelectedTask(updated[3]);
      setSimStep(3);
    } else if (simStep === 3) {
      // Step 4: QA failed assertion, triggers auto-repair
      const updated = [...tasks];
      updated[3].status = 'VERIFYING';
      updated[3].output = 'Test assertion failed: hash length mismatch (expected 96, got 92). Triggering auto-repair...';
      setTasks(updated);
      setSelectedTask(updated[3]);
      setSimStep(4);
    } else if (simStep === 4) {
      // Step 5: Repaired & passed
      const updated = [...tasks];
      updated[3].status = 'REPAIRED';
      updated[3].output = 'Repaired src/auth/password.ts. Retest: 8/8 tests passed (100%).';
      updated[4].status = 'RUNNING';
      updated[4].tokens = 480;
      setTasks(updated);
      setSelectedTask(updated[4]);
      setSimStep(5);
    } else if (simStep === 5) {
      // Step 6: Security audit passed, complete!
      const updated = [...tasks];
      updated[4].status = 'COMPLETED';
      updated[4].output = 'Security verification passed. Constant-time compare verified. Ready for human merge.';
      setTasks(updated);
      setSelectedTask(updated[4]);
      setSimStep(6);
    }
  };

  const handleReset = () => {
    setTasks(INITIAL_TASKS);
    setSelectedTask(INITIAL_TASKS[2]);
    setSimStep(2);
  };

  const totalTokens = tasks.reduce((acc, t) => acc + t.tokens, 0);

  const getStatusBadge = (status: TaskState['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            <span>Passed</span>
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 animate-pulse">
            <Clock className="h-3 w-3" />
            <span>Executing</span>
          </span>
        );
      case 'VERIFYING':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <AlertCircle className="h-3 w-3" />
            <span>Diagnosing Failure</span>
          </span>
        );
      case 'REPAIRED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300">
            <Wrench className="h-3 w-3" />
            <span>Self-Healed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div id="interactive-dag-visualizer" className="my-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Visualizer header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 sm:px-5 py-3 sm:py-3.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Live DAG Orchestrator & Loop
          </h4>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
          <button
            id="dag-sim-step"
            onClick={handleNextStep}
            disabled={simStep >= 6}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium shadow-xs transition-colors min-h-[34px]"
          >
            <Play className="h-3 w-3" />
            <span>{simStep >= 6 ? 'Completed' : 'Simulate Next Step'}</span>
          </button>
          <button
            id="dag-sim-reset"
            onClick={handleReset}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors min-h-[34px]"
            title="Reset simulation"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* DAG Node Graph Layout */}
      <div className="p-3.5 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Node list representing DAG graph */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Topological Dependency Nodes (Kahn's Sort Order)
          </div>

          {tasks.map((task, index) => {
            const isSelected = selectedTask.id === task.id;
            return (
              <div
                key={task.id}
                id={`dag-node-${task.id}`}
                onClick={() => setSelectedTask(task)}
                className={`p-3 sm:p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      Node {index + 1}:
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {task.title}
                    </span>
                  </div>
                  <div className="self-start sm:self-auto shrink-0">
                    {getStatusBadge(task.status)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    Agent: {task.agent}
                  </span>
                  <span>
                    {task.deps.length === 0
                      ? 'Root Node'
                      : `Depends on: ${task.deps.join(', ')}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Details & Live Telemetry */}
        <div className="lg:col-span-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span>Task Inspector</span>
              <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                {selectedTask.id}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Assigned Persona</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedTask.agent}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Execution Status</span>
                <div className="mt-1">{getStatusBadge(selectedTask.status)}</div>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Live Output / Action</span>
                <p className="mt-1 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedTask.output}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Inference Cost</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedTask.tokens} tokens (~{(selectedTask.tokens * 0.000001).toFixed(4)} credits)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Total Run Tokens:</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {totalTokens.toLocaleString()} tokens
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
