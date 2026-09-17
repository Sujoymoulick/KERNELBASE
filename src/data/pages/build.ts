import { DocPage } from '../../types/docs';

export const buildPages: DocPage[] = [
  {
    slug: 'build/dev-environment',
    title: 'Development Environment',
    description: 'Setting up local tooling, compilers, Docker daemons, and environment configuration.',
    section: 'Build & Implementation',
    category: 'Codebase Foundations',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['dev-env', 'setup', 'tools', 'typescript'],
    content: {
      lead: 'Configure a rapid, reproducible development environment with Node 20+, TypeScript 5+, Docker, and Ollama.',
      sections: [
        {
          id: 'env-setup',
          title: 'Environment Verification Script',
          codeBlocks: [
            {
              filename: 'scripts/doctor.sh',
              language: 'bash',
              code: `#!/usr/bin/env bash
echo "Checking AI-Native IDE Development Environment..."
node -v || { echo "Node 20+ required"; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker daemon must be running"; exit 1; }
git --version || { echo "Git required"; exit 1; }
echo "All prerequisites verified successfully!"`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Repository Structure', slug: 'build/repo-structure' },
      ],
    },
  },
  {
    slug: 'build/repo-structure',
    title: 'Repository Structure',
    description: 'Monorepo layout: packages/core, packages/desktop, packages/mcp-servers, and shared schemas.',
    section: 'Build & Implementation',
    category: 'Codebase Foundations',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['monorepo', 'packages', 'layout'],
    content: {
      lead: 'The project is organized as a lightweight pnpm/npm workspaces monorepo separating the core orchestration engine from the desktop shell.',
      sections: [
        {
          id: 'directory-tree',
          title: 'Monorepo Organization',
          codeBlocks: [
            {
              filename: 'repo-structure.txt',
              language: 'text',
              code: `ai-native-ide/
├── packages/
│   ├── core/               # Orchestrator, DAG engine, Agent registry
│   │   ├── src/dag/        # Topological sort, Kahn's algorithm
│   │   ├── src/agents/     # Built-in agent specs (Coder, QA, Planner)
│   │   ├── src/budget/     # Credit calculator, token counters
│   │   └── src/sandbox/    # Docker and worktree bindings
│   ├── desktop/            # Electron / Tauri UI application
│   │   ├── src/components/ # Monaco editor, DAG visualizer, terminal
│   │   └── src/preload/    # Secure IPC bridge
│   ├── mcp-servers/        # Built-in MCP tool servers (fs, git, postgres)
│   └── shared/             # TypeScript types, schemas, and error codes
├── docs/                   # Documentation website source
├── docker/                 # Base sandbox container definitions
└── package.json            # Monorepo configuration`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Database Schema', slug: 'build/database-schema' },
      ],
    },
  },
  {
    slug: 'build/database-schema',
    title: 'Database Schema',
    description: 'Relational SQLite/PostgreSQL tables for runs, tasks, agent messages, and token audits.',
    section: 'Build & Implementation',
    category: 'Codebase Foundations',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['schema', 'sqlite', 'sql', 'tables'],
    content: {
      lead: 'State is persisted using relational schemas with foreign key integrity and audit logs.',
      sections: [
        {
          id: 'sql-ddl',
          title: 'Core Relational DDL',
          codeBlocks: [
            {
              filename: 'schema.sql',
              language: 'sql',
              code: `CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  goal TEXT NOT NULL,
  status TEXT NOT NULL,
  worktree_path TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  status TEXT NOT NULL,
  dependencies_json TEXT NOT NULL DEFAULT '[]',
  input_artifacts_json TEXT,
  output_artifacts_json TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE token_logs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  agent_id TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  credits_consumed REAL NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'REST API & WebSocket Specs', slug: 'build/api-architecture' },
      ],
    },
  },
  {
    slug: 'build/api-architecture',
    title: 'REST API & WebSocket Specs',
    description: 'Complete specification of /api/runs, /api/tasks, /api/agents, /api/events, and WebSocket streaming.',
    section: 'Build & Implementation',
    category: 'Codebase Foundations',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['api', 'rest', 'websocket', 'endpoints'],
    content: {
      lead: 'The daemon exposes standard HTTP REST and WebSocket/SSE endpoints for headless CI/CD, remote execution, and local UI binding.',
      sections: [
        {
          id: 'endpoints-table',
          title: 'Core HTTP & Stream Endpoints',
          table: {
            headers: ['Method', 'Endpoint Route', 'Description', 'Response Type'],
            rows: [
              ['POST', '/api/runs', 'Initiate a new multi-agent run with user goal', '{ runId: string, status: "QUEUED" }'],
              ['GET', '/api/runs/:id', 'Fetch run status, active agents, and credit burn', 'RunDetail object'],
              ['GET', '/api/runs/:id/events', 'SSE stream of live agent thoughts and diffs', 'text/event-stream'],
              ['GET', '/api/tasks/:id', 'Fetch specific task artifacts, tests, and logs', 'TaskDetail object'],
              ['POST', '/api/approvals/:id', 'Submit human approval for a gated action', '{ approved: boolean }'],
              ['GET', '/api/agents', 'List all registered agents and capability scores', 'AgentSpec[]'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Agent Registry Implementation', slug: 'build/agent-registry-impl' },
      ],
    },
  },
  {
    slug: 'build/agent-registry-impl',
    title: 'Agent Registry Implementation',
    description: 'Concrete TypeScript implementation of agent discovery, registration, and runtime initialization.',
    section: 'Build & Implementation',
    category: 'Core Engine Impl',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['typescript', 'registry', 'code'],
    content: {
      lead: 'The Agent Registry dynamically scans project configs, validates JSON schemas, and loads tool bindings.',
      sections: [
        {
          id: 'registry-code',
          title: 'Registry Implementation',
          codeBlocks: [
            {
              filename: 'src/core/registry/AgentRegistry.ts',
              language: 'typescript',
              code: `import { AgentSpec } from '../types/agent';

export class AgentRegistry {
  private registry = new Map<string, AgentSpec>();

  public register(spec: AgentSpec): void {
    if (this.registry.has(spec.id)) {
      throw new Error(\`Duplicate agent ID: \${spec.id}\`);
    }
    this.registry.set(spec.id, spec);
  }

  public get(id: string): AgentSpec | undefined {
    return this.registry.get(id);
  }

  public listAll(): AgentSpec[] {
    return Array.from(this.registry.values());
  }
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Orchestrator DAG Engine', slug: 'build/orchestrator-impl' },
      ],
    },
  },
  {
    slug: 'build/orchestrator-impl',
    title: 'Orchestrator DAG Engine',
    description: 'Deterministic scheduler, concurrency manager, and event loop implementation.',
    section: 'Build & Implementation',
    category: 'Core Engine Impl',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['orchestrator', 'dag-engine', 'concurrency'],
    content: {
      lead: 'The Orchestrator coordinates asynchronous workers, listening for task completion events and promoting dependent nodes.',
      sections: [
        {
          id: 'orchestrator-tick',
          title: 'Event-Driven Tick Loop',
          codeBlocks: [
            {
              filename: 'src/core/orchestrator/engine.ts',
              language: 'typescript',
              code: `export class OrchestratorEngine {
  private activeWorkers = 0;
  private maxConcurrency = 3;

  public async tick(): Promise<void> {
    if (this.activeWorkers >= this.maxConcurrency) return;

    const readyTasks = this.graph.getReadyTasks();
    for (const task of readyTasks) {
      if (this.activeWorkers >= this.maxConcurrency) break;
      this.dispatchTask(task);
    }
  }

  private async dispatchTask(task: TaskNode): Promise<void> {
    this.activeWorkers++;
    task.status = 'RUNNING';
    try {
      const result = await this.agentRunner.execute(task);
      task.status = result.passed ? 'COMPLETED' : 'FAILED';
    } finally {
      this.activeWorkers--;
      this.tick(); // Process newly unblocked nodes
    }
  }
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Verification Engine', slug: 'build/verification-impl' },
      ],
    },
  },
  {
    slug: 'build/verification-impl',
    title: 'Verification Engine',
    description: 'Automated test parsing, compiler linting, and coverage validation pipeline.',
    section: 'Build & Implementation',
    category: 'Core Engine Impl',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['verification', 'tests', 'sandbox'],
    content: {
      lead: 'The Verification Engine pipes test runner stdout into JSON parsers to compute pass/fail rates and extract failure stack traces.',
      sections: [
        {
          id: 'verification-code',
          title: 'Vitest JSON Output Parser',
          codeBlocks: [
            {
              filename: 'src/core/verification/vitestParser.ts',
              language: 'typescript',
              code: `export interface TestSummary {
  passed: number;
  failed: number;
  total: number;
  failures: Array<{ file: string; testName: string; error: string }>;
}

export function parseVitestJson(rawStdout: string): TestSummary {
  const data = JSON.parse(rawStdout);
  return {
    passed: data.numPassedTests,
    failed: data.numFailedTests,
    total: data.numTotalTests,
    failures: data.testResults
      .flatMap((r: any) => r.assertionResults)
      .filter((a: any) => a.status === 'failed')
      .map((a: any) => ({
        file: a.ancestorTitles.join(' > '),
        testName: a.title,
        error: a.failureMessages.join('\\n')
      }))
  };
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Credit System Implementation', slug: 'build/credit-system-impl' },
      ],
    },
  },
  {
    slug: 'build/credit-system-impl',
    title: 'Credit System Implementation',
    description: 'Thread-safe credit ledger, rate limiters, and spend enforcement algorithms.',
    section: 'Build & Implementation',
    category: 'Core Engine Impl',
    order: 8,
    checkedDate: 'September 2026',
    tags: ['credits', 'budget', 'ledger', 'accounting'],
    content: {
      lead: 'The credit ledger records immutable debit entries for every token consumed, halting execution if the allocated budget is exhausted.',
      sections: [
        {
          id: 'ledger-impl',
          title: 'Thread-Safe Budget Ledger',
          codeBlocks: [
            {
              filename: 'src/core/budget/Ledger.ts',
              language: 'typescript',
              code: `export class BudgetLedger {
  private remainingCredits: number;

  constructor(initialBudget: number) {
    this.remainingCredits = initialBudget;
  }

  public deduct(credits: number, reason: string): boolean {
    if (this.remainingCredits < credits) {
      return false; // Budget exhausted
    }
    this.remainingCredits -= credits;
    this.recordAudit(credits, reason, this.remainingCredits);
    return true;
  }

  public getBalance(): number {
    return this.remainingCredits;
  }
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Credit & Budget System', slug: 'architecture/credit-system' },
      ],
    },
  },
];
