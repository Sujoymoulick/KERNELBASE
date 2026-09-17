import { DocPage } from '../../types/docs';

export const mvp10DayPages: DocPage[] = [
  {
    slug: '10-day-mvp/mvp-overview',
    title: '10-Day Sprint Overview',
    description: 'A day-by-day production engineering roadmap to deliver a working multi-agent IDE in 10 days.',
    section: '10-Day MVP Plan',
    category: 'Daily Roadmap',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['mvp', '10-day-sprint', 'roadmap', 'schedule'],
    content: {
      lead: 'A rigorous, milestone-driven execution plan detailing exactly what to build each day to reach a functional, verified multi-agent IDE release in 10 days.',
      interactiveComponent: 'mvp-tracker',
      sections: [
        {
          id: 'sprint-schedule-table',
          title: 'Daily Sprint Milestones',
          table: {
            headers: ['Day', 'Focus Area', 'Primary Deliverable', 'Validation Test'],
            rows: [
              ['Day 1', 'Architecture & Workspace', 'Monorepo setup, Git worktree isolation, SQLite schema', 'Create & clean up 5 isolated worktrees'],
              ['Day 2', 'Agent Registry & MCP', 'AgentSpec loader, JSON schema validator, standard MCP fs tools', 'Discover and validate 5 agent specs'],
              ['Day 3', 'Orchestrator & DAG', 'Topological sort, Kahn algorithm, task state machine', 'Resolve 10-node mock task graph without cycles'],
              ['Day 4', 'Coding Agent & Sandbox', 'Docker runner, AST-aware edit_file, code generator', 'Agent creates and modifies TypeScript files safely'],
              ['Day 5', 'Research Agent & Web', 'Playwright / web search MCP server, context pruner', 'Fetch documentation and extract API signatures'],
              ['Day 6', 'QA Agent & Test Loop', 'Vitest test runner integration, TAP parser, failure extractor', 'Run test suite inside container and report JSON'],
              ['Day 7', 'Failure Diagnosis & Repair', 'Diagnostic prompt, surgical patch generator, regression loop', 'Fix deliberately broken assertion automatically'],
              ['Day 8', 'Credit System & Rate Limiting', 'Token counter, hierarchical budget cascade, spend limiter', 'Halt run when credit allowance hits zero'],
              ['Day 9', 'Desktop UI & Panels', 'Editor layout, live DAG visualizer, streaming telemetry panel', 'Interactive UI renders live streamed agent thoughts'],
              ['Day 10', 'Testing, Hardening & Release', 'End-to-end task run, security audit, binary packaging', 'Execute complete user feature request from scratch'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Day 1 — Architecture & Workspace', slug: '10-day-mvp/day-1-architecture' },
        { title: 'System Architecture', slug: 'architecture/system-architecture' },
      ],
    },
  },
  {
    slug: '10-day-mvp/day-1-architecture',
    title: 'Day 1 — Architecture & Workspace',
    description: 'Scaffolding the monorepo, implementing Git worktree managers, and establishing SQLite storage.',
    section: '10-Day MVP Plan',
    category: 'Daily Roadmap',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['day-1', 'monorepo', 'sqlite'],
    content: {
      lead: 'Day 1 establishes the foundational isolation boundaries, ensuring agents never execute on your primary git branch.',
      sections: [
        {
          id: 'day-1-tasks',
          title: 'Key Engineering Tasks',
          steps: [
            {
              title: 'Initialize pnpm workspace',
              description: 'Configure packages/core, packages/desktop, and packages/shared.',
              code: 'pnpm init && git init',
              language: 'bash',
            },
            {
              title: 'Implement GitWorktreeManager',
              description: 'Write wrapper for `git worktree add` and `git worktree remove` with deterministic branch naming.',
            },
            {
              title: 'Setup SQLite Schema',
              description: 'Create runs and tasks tables using better-sqlite3 with foreign key enforcement.',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Day 2 — Agent Registry & MCP', slug: '10-day-mvp/day-2-agent-registry' },
      ],
    },
  },
  {
    slug: '10-day-mvp/day-2-agent-registry',
    title: 'Day 2 — Agent Registry & MCP',
    description: 'Building the capability matching engine, JSON schema validation, and MCP tool bridges.',
    section: '10-Day MVP Plan',
    category: 'Daily Roadmap',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['day-2', 'agent-registry', 'mcp'],
    content: {
      lead: 'Day 2 implements the Agent Registry and standardizes tool access via the Model Context Protocol (MCP).',
      sections: [
        {
          id: 'day-2-tasks',
          title: 'Key Engineering Tasks',
          body: 'Implement AgentRegistry class with JSON schema validation, author default AgentSpec files for Planner, Coder, and QA, and connect MCP filesystem server.',
        },
      ],
      relatedPages: [
        { title: 'Day 3 — Orchestrator & DAG', slug: '10-day-mvp/day-3-orchestrator' },
      ],
    },
  },
  {
    slug: '10-day-mvp/day-3-orchestrator',
    title: 'Day 3 — Orchestrator & DAG',
    description: 'Implementing topological DAG resolution, parallel scheduling, and dynamic task state transitions.',
    section: '10-Day MVP Plan',
    category: 'Daily Roadmap',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['day-3', 'dag', 'scheduler'],
    content: {
      lead: 'Day 3 delivers the deterministic Orchestrator, ensuring tasks execute in strict dependency order.',
      sections: [
        {
          id: 'day-3-tasks',
          title: 'Key Engineering Tasks',
          body: 'Implement Kahn\'s algorithm for cycle detection, construct event-driven tick loop for task dispatching, and connect SQLite event logging.',
        },
      ],
      relatedPages: [
        { title: 'Day 4 — Coding Agent Sandbox', slug: '10-day-mvp/day-4-coding-agent' },
      ],
    },
  },
  {
    slug: '10-day-mvp/day-4-coding-agent',
    title: 'Day 4 — Coding Agent Sandbox',
    description: 'Docker containerization, surgical block diff editing, and file mutation verification.',
    section: '10-Day MVP Plan',
    category: 'Daily Roadmap',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['day-4', 'coding-agent', 'docker'],
    content: {
      lead: 'Day 4 brings the Coding Agent to life inside an isolated Docker sandbox with surgical diff capabilities.',
      sections: [
        {
          id: 'day-4-tasks',
          title: 'Key Engineering Tasks',
          body: 'Build Docker sandbox runner with unprivileged user, implement `edit_file` with AST character matching, and stream file modification events to the bus.',
        },
      ],
      relatedPages: [
        { title: 'Day 5 — Research Agent & Web', slug: '10-day-mvp/day-5-research-agent' },
      ],
    },
  },
  {
    slug: '10-day-mvp/day-5-research-agent',
    title: 'Day 5 — Research Agent & Web',
    description: 'Web scraping, documentation retrieval via Playwright, and context compression.',
    section: '10-Day MVP Plan',
    category: 'Daily Roadmap',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['day-5', 'research-agent', 'playwright'],
    content: {
      lead: 'Day 5 provides agents with live documentation awareness, preventing library hallucination.',
      sections: [
        {
          id: 'day-5-tasks',
          title: 'Key Engineering Tasks',
          body: 'Implement documentation scraping MCP tool, build AST interface extractor to compress context, and wire Research Agent into Planner decomposition.',
        },
      ],
      relatedPages: [
        { title: 'Day 6 — QA Agent & Test Loop', slug: '10-day-mvp/day-6-qa-agent' },
      ],
    },
  },
  {
    slug: '10-day-mvp/day-6-qa-agent',
    title: 'Day 6 — QA Agent & Test Loop',
    description: 'Automated test suite generation, Vitest/Jest runner integration, and TAP parsing in sandbox.',
    section: '10-Day MVP Plan',
    category: 'Daily Roadmap',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['day-6', 'qa-agent', 'testing'],
    content: {
      lead: 'Day 6 closes the feedback loop by verifying code execution against automated unit tests.',
      sections: [
        {
          id: 'day-6-tasks',
          title: 'Key Engineering Tasks',
          body: 'Execute Vitest inside Docker sandbox, capture structured JSON results, and calculate line coverage statistics.',
        },
      ],
      relatedPages: [
        { title: 'Day 7 — Failure Diagnosis & Repair', slug: '10-day-mvp/day-7-repair-loop' },
      ],
    },
  },
  {
    slug: '10-day-mvp/day-7-repair-loop',
    title: 'Day 7 — Failure Diagnosis & Repair',
    description: 'Automated stack trace analysis, patch generation, regression avoidance, and retry limits.',
    section: '10-Day MVP Plan',
    category: 'Daily Roadmap',
    order: 8,
    checkedDate: 'September 2026',
    tags: ['day-7', 'repair-loop', 'self-healing'],
    content: {
      lead: 'Day 7 delivers autonomous self-healing: diagnosing failed assertions and issuing surgical patches.',
      sections: [
        {
          id: 'day-7-tasks',
          title: 'Key Engineering Tasks',
          body: 'Extract failed test lines, feed failure diagnostics back to Coding Agent, re-execute tests, and enforce 3-attempt circuit breaker.',
        },
      ],
      relatedPages: [
        { title: 'Day 8 — Credit System & Rate Limiting', slug: '10-day-mvp/day-8-credits' },
      ],
    },
  },
  {
    slug: '10-day-mvp/day-8-credits',
    title: 'Day 8 — Credit System & Rate Limiting',
    description: 'Token counting, hierarchical budgets, rate limiters, and LiteLLM fallback chains.',
    section: '10-Day MVP Plan',
    category: 'Daily Roadmap',
    order: 9,
    checkedDate: 'September 2026',
    tags: ['day-8', 'credits', 'budget'],
    content: {
      lead: 'Day 8 prevents unexpected cloud API bills by enforcing hard token and credit ceilings per run.',
      sections: [
        {
          id: 'day-8-tasks',
          title: 'Key Engineering Tasks',
          body: 'Implement thread-safe credit ledger, bind LiteLLM proxy fallback rules, and add real-time credit display to API responses.',
        },
      ],
      relatedPages: [
        { title: 'Day 9 — Desktop UI & Multi-Panel', slug: '10-day-mvp/day-9-desktop-ui' },
      ],
    },
  },
  {
    slug: '10-day-mvp/day-9-desktop-ui',
    title: 'Day 9 — Desktop UI & Multi-Panel',
    description: 'Monaco code editor, xterm.js terminal, live DAG visualizer, and agent telemetry panel.',
    section: '10-Day MVP Plan',
    category: 'Daily Roadmap',
    order: 10,
    checkedDate: 'September 2026',
    tags: ['day-9', 'desktop-ui', 'monaco', 'xterm'],
    content: {
      lead: 'Day 9 wraps the autonomous engine in a polished, responsive desktop interface inspired by modern developer tooling.',
      sections: [
        {
          id: 'day-9-tasks',
          title: 'Key Engineering Tasks',
          body: 'Mount Monaco editor with unified diff preview, embed xterm.js terminal, render live SVG DAG task graph, and stream SSE thoughts.',
        },
      ],
      relatedPages: [
        { title: 'Day 10 — Verification & First Release', slug: '10-day-mvp/day-10-testing-release' },
      ],
    },
  },
  {
    slug: '10-day-mvp/day-10-testing-release',
    title: 'Day 10 — Verification & First Release',
    description: 'End-to-end user goal execution, security penetration testing, binary packaging, and MVP release.',
    section: '10-Day MVP Plan',
    category: 'Daily Roadmap',
    order: 11,
    checkedDate: 'September 2026',
    tags: ['day-10', 'release', 'verification', 'packaging'],
    content: {
      lead: 'Day 10 executes the final verification gauntlet: testing real-world goals, auditing security boundaries, and generating cross-platform desktop installers.',
      sections: [
        {
          id: 'day-10-tasks',
          title: 'Final Release Checklist',
          table: {
            headers: ['Verification Milestone', 'Target Standard', 'Status'],
            rows: [
              ['End-to-End Autonomous Run', 'Goal -> Plan -> Code -> Pass Tests -> Merge', 'VERIFIED PASS'],
              ['Container Escape Audit', 'No host filesystem or root escapes possible', 'VERIFIED PASS'],
              ['Credit Exhaustion Gate', 'Run terminates cleanly on 0 credits without crash', 'VERIFIED PASS'],
              ['Cross-Platform Binaries', 'macOS DMG, Linux AppImage, Windows installer compiled', 'VERIFIED READY'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Release Milestones (MVP → v1.0)', slug: 'roadmap/release-milestones' },
      ],
    },
  },
];
