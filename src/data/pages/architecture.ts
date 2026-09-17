import { DocPage } from '../../types/docs';

export const architecturePages: DocPage[] = [
  {
    slug: 'architecture/system-architecture',
    title: 'System Architecture',
    description: 'Comprehensive overview of the distributed desktop architecture, core daemons, and subsystem boundaries.',
    section: 'Architecture',
    category: 'System Foundations',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['architecture', 'system', 'subsystems', 'ipc'],
    content: {
      lead: 'The AI-Native Multi-Agent IDE is structured as a decoupled client-daemon system, separating user interface rendering from heavy agent runtime execution and containerized sandboxing.',
      interactiveComponent: 'architecture-diagram',
      sections: [
        {
          id: 'architectural-layers',
          title: 'Layered Architectural Model',
          body: 'The architecture is stratified into four discrete planes: UI Presentation, Orchestration & Event Dispatch, Agent & Model Gateway, and Execution Sandboxing.',
          mermaid: `graph TD
    subgraph Client [Desktop UI / Renderer Plane]
        UI[IDE Shell / Monaco Editor]
        State[Zustand Client Store]
        Bridge[IPC Client / WebSocket]
    end

    subgraph Daemon [Local Agent Daemon / Control Plane]
        Bus[Event Bus / SSE Server]
        Orch[DAG Orchestrator]
        Reg[Agent Capability Registry]
        Budget[Credit & Token Engine]
        Gateway[Model Gateway / LiteLLM]
    end

    subgraph Tooling [Tool & Protocol Plane]
        MCP[MCP Host Server]
        Git[Git Worktree Manager]
        DockerMgr[Docker Sandbox Daemon]
    end

    subgraph Sandbox [Execution & Verification Plane]
        Container[(Isolated Container)]
        FS[(Ephemeral Virtual FS)]
        Runner[Test / Linter Runner]
    end

    UI --> Bridge
    Bridge --> Bus
    Bus --> Orch
    Orch --> Reg
    Orch --> Budget
    Orch --> Gateway
    Orch --> MCP
    MCP --> Git
    MCP --> DockerMgr
    DockerMgr --> Container
    Container --> FS
    Container --> Runner`,
          diagramTitle: 'Four-Plane System Topology',
        },
        {
          id: 'subsystem-responsibilities',
          title: 'Subsystem Responsibilities',
          table: {
            headers: ['Subsystem', 'Runtime Layer', 'Primary Responsibility', 'Fault Boundary'],
            rows: [
              ['UI Shell', 'Renderer (Web/Electron/Tauri)', 'Editor rendering, live diff display, visual DAG inspector', 'UI thread crashes do not terminate ongoing agent jobs'],
              ['Control Plane', 'Node.js / Rust Daemon', 'Task scheduling, dependency resolution, event broadcasting', 'Maintains transactional run state in SQLite'],
              ['Model Gateway', 'LiteLLM / Ollama Proxy', 'Token accounting, load balancing, model fallbacks', 'Handles provider outages and rate-limiting gracefully'],
              ['Sandbox Host', 'Docker / libcontainer', 'Safe execution of agent-generated shell commands and tests', 'Zero access to host network or host root filesystem'],
            ],
          },
        },
        {
          id: 'system-architecture-spec',
          title: 'System Architecture Flow & Communication Matrix',
          body: 'The diagram above illustrates the end-to-end telemetry and execution boundary separating the desktop presentation layer from the sandboxed agent processes. Communication between the UI Shell and Control Plane Daemon relies strictly on non-blocking Server-Sent Events (SSE) and JSON-RPC over WebSocket.',
          callout: {
            type: 'important',
            title: 'Fault Isolation Guarantee',
            text: 'Because the Agent Daemon and Docker Sandbox are isolated from the UI renderer process, heavy compilation tasks or agent runtime panics will never freeze the Monaco editor UI or cause data loss to unsaved user files.',
          },
          mermaid: `sequenceDiagram
    autonumber
    actor Dev as Developer
    participant UI as Desktop UI (Monaco)
    participant Daemon as Control Plane Daemon
    participant Gate as Model Gateway (LiteLLM)
    participant MCP as MCP Tool Host
    participant Sandbox as Docker Sandbox

    Dev->>UI: Submit Feature Goal: "Implement JWT Auth"
    UI->>Daemon: POST /api/runs (Create Run)
    Daemon->>Daemon: Decompose Goal into DAG Tasks
    Daemon-->>UI: SSE Stream: "DAG_INITIALIZED" (4 tasks)

    loop Topological Execution
        Daemon->>Gate: Request Task Plan & Code Edits
        Gate-->>Daemon: Return Tool Invocation: edit_file(auth.ts)
        Daemon->>MCP: Call tool: apply_ast_patch
        MCP->>Sandbox: Write file to Ephemeral Worktree
        Daemon->>Sandbox: Execute "pnpm vitest run tests/auth.test.ts"
        Sandbox-->>Daemon: Test Verdict (TAP / Exit Code)
        Daemon-->>UI: SSE Stream: "TASK_STATUS_UPDATED"
    end

    Daemon-->>UI: Run Completed: 100% Tests Passing
    Dev->>UI: Review Side-by-Side AST Diff & Merge`,
          diagramTitle: 'End-to-End System Execution Sequence',
        },
      ],
      relatedPages: [
        { title: 'Runtime Architecture', slug: 'architecture/runtime-architecture' },
        { title: 'Orchestrator', slug: 'architecture/orchestrator' },
        { title: 'Sandbox Architecture', slug: 'architecture/sandbox-architecture' },
      ],
    },
  },
  {
    slug: 'architecture/runtime-architecture',
    title: 'Runtime Architecture',
    description: 'Detailed lifecycle of execution runs, daemon process management, and thread pool allocation.',
    section: 'Architecture',
    category: 'System Foundations',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['runtime', 'process', 'lifecycle'],
    content: {
      lead: 'The runtime coordinates asynchronous agent workers, managing memory limits, subprocess pipelines, and WebSocket streaming back to the editor.',
      sections: [
        {
          id: 'process-lifecycle',
          title: 'Run Lifecycle State Machine',
          body: 'Every user goal spawns an isolated `Run` instance with its own SQLite transaction boundary and Git worktree.',
          codeBlocks: [
            {
              filename: 'types/run.ts',
              language: 'typescript',
              code: `export type RunStatus = 
  | 'QUEUED' 
  | 'PLANNING' 
  | 'AWAITING_APPROVAL' 
  | 'EXECUTING' 
  | 'VERIFYING' 
  | 'REPAIRING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export interface RunInstance {
  runId: string;
  projectId: string;
  goal: string;
  status: RunStatus;
  worktreePath: string;
  totalTokensConsumed: { input: number; output: number };
  totalCreditsUsed: number;
  activeAgents: string[];
  createdAt: number;
  completedAt?: number;
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'System Architecture', slug: 'architecture/system-architecture' },
        { title: 'Event System', slug: 'architecture/event-system' },
      ],
    },
  },
  {
    slug: 'architecture/agent-architecture',
    title: 'Agent Architecture',
    description: 'Internal micro-architecture of individual agents: context managers, tool bindings, and prompt pipelines.',
    section: 'Architecture',
    category: 'System Foundations',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['agent', 'micro-agent', 'spec', 'prompt'],
    content: {
      lead: 'Each agent is an autonomous actor instantiated with a strict role specification, isolated memory buffer, and constrained tool access.',
      sections: [
        {
          id: 'agent-anatomy',
          title: 'Anatomy of an Autonomous Agent',
          body: 'An agent is not simply an LLM prompt; it is a stateful micro-process comprised of four internal engines: the Prompt Compiler, the Context Compressor, the Tool Dispatcher, and the Reflection Loop.',
          mermaid: `graph LR
    Task([Subtask Input]) --> Comp[Prompt Compiler]
    Comp --> Ctx[Context Window Pruner]
    Ctx --> Model{Model Gateway}
    Model --> Decision{Tool Call or Result?}
    Decision -->|Tool Call| Disp[Tool Dispatcher & MCP]
    Disp --> Exec[Execution in Sandbox]
    Exec --> Ctx
    Decision -->|Output| Refl[Self-Verification Reflection]
    Refl -->|Verified| Res([AgentResult Output])
    Refl -->|Needs Edit| Comp`,
          diagramTitle: 'Agent Internal Loop',
        },
        {
          id: 'agent-spec-reference',
          title: 'The AgentSpec Interface',
          body: 'Standardized schema defining every agent in the runtime.',
          codeBlocks: [
            {
              filename: 'src/core/agent/AgentSpec.ts',
              language: 'typescript',
              code: `export interface AgentSpec {
  id: string;
  name: string;
  description: string;
  role: 'planner' | 'coder' | 'qa' | 'researcher' | 'reviewer' | 'security';
  systemPrompt: string;
  capabilities: string[];
  tools: string[];
  modelPreference: {
    primary: string;
    fallback: string;
    maxTokens: number;
    temperature: number;
  };
  budget: {
    maxCredits: number;
    maxCostUsd: number;
    maxInvocations: number;
  };
  permissions: {
    writeFiles: boolean;
    terminalCommands: boolean;
    networkOutbound: boolean;
    dangerousCommandApproval: boolean;
  };
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Agent Registry', slug: 'architecture/agent-registry' },
        { title: 'Agent System Overview', slug: 'agents/agent-system' },
      ],
    },
  },
  {
    slug: 'architecture/orchestrator',
    title: 'Orchestrator',
    description: 'Central engine governing DAG traversal, parallel job scheduling, and dynamic dependency resolution.',
    section: 'Architecture',
    category: 'System Foundations',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['orchestrator', 'dag', 'scheduler', 'concurrency'],
    content: {
      lead: 'The Orchestrator is the conductor of the multi-agent system, evaluating graph topologies and dispatching ready tasks to specialized agents concurrently.',
      sections: [
        {
          id: 'orchestration-algorithm',
          title: 'Topological Scheduling Loop',
          body: 'The orchestrator executes an event-driven tick loop. As parent tasks complete with valid artifacts, child tasks with satisfied dependencies are immediately promoted to the execution pool.',
          codeBlocks: [
            {
              filename: 'src/core/orchestrator/scheduler.ts',
              language: 'typescript',
              code: `export class DAGOrchestrator {
  private taskGraph: Map<string, TaskNode> = new Map();

  public getSchedulableTasks(): TaskNode[] {
    const ready: TaskNode[] = [];
    for (const [id, node] of this.taskGraph.entries()) {
      if (node.status !== 'PENDING') continue;
      
      const allDependenciesMet = node.dependencies.every(depId => {
        const depNode = this.taskGraph.get(depId);
        return depNode && depNode.status === 'COMPLETED';
      });

      if (allDependenciesMet) {
        ready.push(node);
      }
    }
    return ready;
  }
}`,
            },
          ],
        },
        {
          id: 'concurrency-limits',
          title: 'Concurrency & Resource Throttling',
          body: 'To prevent CPU saturation and API rate limits, the Orchestrator imposes configurable limits: maximum parallel agent invocations (default: 3), maximum Docker memory (default: 2GB per worker), and global credit ceilings.',
        },
      ],
      relatedPages: [
        { title: 'Task Graph & DAG', slug: 'architecture/task-graph' },
        { title: 'Task Decomposition', slug: 'architecture/task-decomposition' },
      ],
    },
  },
  {
    slug: 'architecture/task-graph',
    title: 'Task Graph & DAG',
    description: 'Representation and manipulation of Directed Acyclic Graphs representing complex software engineering workflows.',
    section: 'Architecture',
    category: 'Task & State',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['dag', 'graph', 'tasks', 'nodes'],
    content: {
      lead: 'The Task Graph provides deterministic execution order, deadlock detection, and incremental state checkpointing.',
      sections: [
        {
          id: 'task-node-schema',
          title: 'Task Node Data Structure',
          codeBlocks: [
            {
              filename: 'types/dag.ts',
              language: 'typescript',
              code: `export interface TaskNode {
  id: string;
  title: string;
  description: string;
  assignedAgent: string; // e.g. 'coding-agent'
  dependencies: string[]; // parent task IDs
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  inputArtifacts: string[];
  outputArtifacts: string[];
  retryCount: number;
  maxRetries: number;
  executionMetrics: {
    durationMs: number;
    tokensUsed: number;
    creditsUsed: number;
  };
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Task Decomposition', slug: 'architecture/task-decomposition' },
        { title: 'Orchestrator', slug: 'architecture/orchestrator' },
      ],
    },
  },
  {
    slug: 'architecture/task-decomposition',
    title: 'Task Decomposition',
    description: 'How the Planner Agent analyzes ambiguous user requests and produces dependency-aware tasks.',
    section: 'Architecture',
    category: 'Task & State',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['planner', 'decomposition', 'prompting', 'dag'],
    content: {
      lead: 'Task Decomposition transforms high-level architectural goals into tightly scoped, independently verifiable code and test assignments.',
      sections: [
        {
          id: 'decomposition-heuristic',
          title: 'The 3-Step Decomposition Heuristic',
          body: 'The Planner Agent employs a strict 3-phase reasoning process: 1) Repository Reconnaissance (identifying framework, package managers, and test runner), 2) Atomic Task Slicing (capping each task to under 5 file modifications), and 3) Dependency Inversion (ensuring tests and schemas precede implementations).',
        },
        {
          id: 'decomposition-example',
          title: 'Real-World Example: Adding OAuth Auth',
          body: 'Given the goal: "Implement GitHub OAuth login with JWT sessions and protected routes."',
          codeBlocks: [
            {
              filename: 'output-dag.json',
              language: 'json',
              code: `{
  "tasks": [
    {
      "id": "task-1",
      "title": "Analyze environment variables and auth dependencies",
      "agent": "research-agent",
      "dependencies": []
    },
    {
      "id": "task-2",
      "title": "Create User schema and migration",
      "agent": "coding-agent",
      "dependencies": ["task-1"]
    },
    {
      "id": "task-3",
      "title": "Implement GitHub OAuth strategy & JWT generator",
      "agent": "coding-agent",
      "dependencies": ["task-2"]
    },
    {
      "id": "task-4",
      "title": "Add auth middleware with token verification",
      "agent": "coding-agent",
      "dependencies": ["task-3"]
    },
    {
      "id": "task-5",
      "title": "Write end-to-end authentication tests",
      "agent": "qa-agent",
      "dependencies": ["task-4"]
    }
  ]
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Planner Agent', slug: 'agents/planner-agent' },
        { title: 'Coding Agent', slug: 'agents/coding-agent' },
      ],
    },
  },
  {
    slug: 'architecture/agent-registry',
    title: 'Agent Registry',
    description: 'Dynamic discovery, versioning, capability matching, and lifecycle registration of agents.',
    section: 'Architecture',
    category: 'Task & State',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['registry', 'discovery', 'capabilities'],
    content: {
      lead: 'The Agent Registry serves as the capability catalog, resolving task requirements to the best available agent and model pairing.',
      sections: [
        {
          id: 'registry-implementation',
          title: 'Capability Matchmaking',
          body: 'When the Orchestrator needs an agent for a task tagged `[python, data-analysis, plotting]`, it queries the Registry. The registry ranks agents using weighted capability scoring.',
          codeBlocks: [
            {
              filename: 'src/core/registry/AgentRegistry.ts',
              language: 'typescript',
              code: `export class AgentRegistry {
  private agents: Map<string, AgentSpec> = new Map();

  public findBestAgent(requiredCapabilities: string[]): AgentSpec | null {
    let bestMatch: AgentSpec | null = null;
    let highestScore = -1;

    for (const agent of this.agents.values()) {
      const matchCount = requiredCapabilities.filter(cap => 
        agent.capabilities.includes(cap)
      ).length;

      if (matchCount > highestScore) {
        highestScore = matchCount;
        bestMatch = agent;
      }
    }
    return bestMatch;
  }
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Creating Custom Agents', slug: 'agents/creating-custom-agents' },
        { title: 'Agent System Overview', slug: 'agents/agent-system' },
      ],
    },
  },
  {
    slug: 'architecture/agent-communication',
    title: 'Agent Communication',
    description: 'Structured message protocols, artifact passing, and Inter-Agent Communication (A2A).',
    section: 'Architecture',
    category: 'Task & State',
    order: 8,
    checkedDate: 'September 2026',
    tags: ['a2a', 'messaging', 'protocols', 'artifacts'],
    content: {
      lead: 'Agents do not engage in unstructured chat. All communication occurs via typed artifacts and message envelopes with cryptographic verification.',
      sections: [
        {
          id: 'message-envelope',
          title: 'Standard Message Envelope',
          codeBlocks: [
            {
              filename: 'types/message.ts',
              language: 'typescript',
              code: `export interface AgentMessageEnvelope<T = unknown> {
  id: string;
  senderAgentId: string;
  targetAgentId: string | 'orchestrator' | 'broadcast';
  taskId: string;
  timestamp: number;
  type: 'TASK_PROPOSAL' | 'ARTIFACT_DELIVERY' | 'VERIFICATION_REPORT' | 'REPAIR_REQUEST';
  payload: T;
  evidence: {
    filesRead: string[];
    filesModified: string[];
    testResults?: { passed: number; failed: number };
  };
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Event System', slug: 'architecture/event-system' },
        { title: 'Agent Marketplace & A2A', slug: 'roadmap/marketplace-a2a' },
      ],
    },
  },
  {
    slug: 'architecture/event-system',
    title: 'Event System & SSE',
    description: 'High-throughput event bus streaming real-time agent thoughts, diffs, and tool logs to the UI via Server-Sent Events.',
    section: 'Architecture',
    category: 'Task & State',
    order: 9,
    checkedDate: 'September 2026',
    tags: ['events', 'sse', 'streaming', 'websocket'],
    content: {
      lead: 'Server-Sent Events (SSE) and local IPC streams provide millisecond-latency streaming of agent reasoning and file diffs.',
      sections: [
        {
          id: 'event-types',
          title: 'Core Event Taxonomy',
          table: {
            headers: ['Event Topic', 'Payload Description', 'UI Component Bound'],
            rows: [
              ['agent:thought', 'Streamed chunk of internal reasoning tokens', 'Agent Runtime Panel'],
              ['agent:tool_call', 'Tool name, arguments, and permission requirement', 'Interactive Tool Approval Modal'],
              ['file:patch_applied', 'Unified diff showing file additions & removals', 'Monaco Diff Editor'],
              ['test:result', 'Pass/fail count, runtime duration, stack trace', 'Test Output Panel'],
              ['budget:updated', 'Tokens consumed and remaining credit balance', 'Credit & Quota Counter'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'State Management', slug: 'architecture/state-management' },
        { title: 'REST & WebSocket API Reference', slug: 'reference/api-reference' },
      ],
    },
  },
  {
    slug: 'architecture/state-management',
    title: 'State Management',
    description: 'Deterministic state persistence combining local SQLite storage, Git commits, and memory snapshots.',
    section: 'Architecture',
    category: 'Task & State',
    order: 10,
    checkedDate: 'September 2026',
    tags: ['sqlite', 'state', 'persistence', 'git'],
    content: {
      lead: 'Every execution run is backed by an ACID-compliant local SQLite database with Git tree commits enabling instant time-travel rollback.',
      sections: [
        {
          id: 'rollback-guarantee',
          title: 'Deterministic Time-Travel Rollbacks',
          body: 'If a multi-agent run fails or makes unwanted changes, the user can click "Rollback Step" to restore the exact Git worktree commit and SQLite state that existed before the agent executed.',
        },
      ],
      relatedPages: [
        { title: 'Database Schema', slug: 'build/database-schema' },
        { title: 'Git Worktree Isolation', slug: 'tools/git' },
      ],
    },
  },
  {
    slug: 'architecture/workspace-isolation',
    title: 'Workspace Isolation',
    description: 'Protection of the host developer machine through Git worktrees, chroot, and permission layers.',
    section: 'Architecture',
    category: 'Execution & Security',
    order: 11,
    checkedDate: 'September 2026',
    tags: ['workspace', 'isolation', 'git', 'security'],
    content: {
      lead: 'Agents never edit your working branch directly. Every run operates on a temporary Git worktree created in a segregated directory.',
      sections: [
        {
          id: 'git-worktree-flow',
          title: 'Git Worktree Isolation Topology',
          mermaid: `graph TD
    Main[Host Working Directory\nmain branch] -->|git worktree add| WT[Segregated Worktree\nai-run-branch]
    WT --> Mount[Mounted into Docker Container]
    Mount --> Agent[Coding & QA Agents]
    Agent -->|Edits & Tests| WT
    WT --> Review{User Approves Diff?}
    Review -->|Yes| Merge[Fast-Forward Git Merge to main]
    Review -->|No| Discard[Delete Worktree & Prune Branch]`,
          diagramTitle: 'Git Worktree Separation',
        },
      ],
      relatedPages: [
        { title: 'Sandbox Architecture', slug: 'architecture/sandbox-architecture' },
        { title: 'Security Model', slug: 'architecture/security-model' },
      ],
    },
  },
  {
    slug: 'architecture/sandbox-architecture',
    title: 'Sandbox Architecture',
    description: 'Deep dive into Docker sandbox containers, cgroups, network virtualization, and syscall filtering.',
    section: 'Architecture',
    category: 'Execution & Security',
    order: 12,
    checkedDate: 'September 2026',
    tags: ['docker', 'sandbox', 'cgroups', 'seccomp'],
    content: {
      lead: 'Docker sandboxing provides kernel-level enforcement preventing agent processes from accessing host memory, local networks, or private files.',
      sections: [
        {
          id: 'sandbox-specs',
          title: 'Container Hardening Matrix',
          table: {
            headers: ['Security Primitive', 'Enforcement Mechanism', 'Value / Policy'],
            rows: [
              ['CPU Quotas', 'Linux cgroups v2', 'Capped to 2 cores maximum per run'],
              ['Memory Limits', 'cgroups memory.max', 'Capped to 2048 MB with zero host swap'],
              ['Network Access', 'Docker bridge / iptables', 'Restricted to whitelisted package registries only (npm, pypi)'],
              ['Filesystem Mounts', 'Read-Only root + tmpfs', 'Only `/workspace` is mounted read-write'],
              ['Privilege Level', 'Non-root user (uid 1001)', '`--cap-drop=ALL` (no setuid, raw sockets, or ptrace)'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Docker Execution Sandbox', slug: 'tools/docker' },
        { title: 'Security Model', slug: 'architecture/security-model' },
      ],
    },
  },
  {
    slug: 'architecture/verification-architecture',
    title: 'Verification Architecture',
    description: 'Multi-layer verification engine running linters, typecheckers, unit tests, and security audits.',
    section: 'Architecture',
    category: 'Execution & Security',
    order: 13,
    checkedDate: 'September 2026',
    tags: ['verification', 'testing', 'linter', 'types'],
    content: {
      lead: 'Software cannot be declared complete by an LLM alone. The Verification Engine executes a 4-tier automated gate before presenting results.',
      sections: [
        {
          id: 'verification-pipeline',
          title: 'The 4-Tier Verification Gate',
          steps: [
            {
              title: 'Tier 1: Syntax & AST Integrity',
              description: 'Validates that modified files parse without syntax or AST corruption using tree-sitter or native compiler.',
            },
            {
              title: 'Tier 2: Static Typing & Linting',
              description: 'Executes `tsc --noEmit`, `mypy`, or `cargo check` inside the sandbox to catch type mismatches.',
            },
            {
              title: 'Tier 3: Automated Test Suites',
              description: 'Executes Vitest, Jest, pytest, or Go test, capturing structured JSON test results and line coverage.',
            },
            {
              title: 'Tier 4: Security & Static Analysis',
              description: 'Scans for hardcoded secrets, injection vulnerabilities, and destructive commands.',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Autonomous Test Loop', slug: 'autonomy/test-loop' },
        { title: 'Automatic Repair', slug: 'autonomy/repair-loop' },
      ],
    },
  },
  {
    slug: 'architecture/credit-system',
    title: 'Credit & Budget System',
    description: 'Hierarchical token and cost controls preventing accidental runaway API spend.',
    section: 'Architecture',
    category: 'Execution & Security',
    order: 14,
    checkedDate: 'September 2026',
    tags: ['credits', 'budget', 'tokens', 'cost-control'],
    content: {
      lead: 'A strictly enforced budget hierarchy ensures agents never consume credits without active, measurable progress.',
      interactiveComponent: 'credit-calculator',
      sections: [
        {
          id: 'budget-hierarchy',
          title: 'Hierarchical Budget Tree',
          body: 'Credits cascade downward through five distinct organizational levels.',
          mermaid: `graph TD
    P[Project Budget\n1,000 Credits] --> R[Run Budget\n300 Credits]
    R --> A1[Coder Agent Budget\n150 Credits]
    R --> A2[QA Agent Budget\n50 Credits]
    R --> A3[Researcher Budget\n30 Credits]
    R --> A4[Unused Agent Pool\n0 Credits]
    A1 --> T1[Task 1 Budget\n75 Credits]
    A1 --> T2[Task 2 Budget\n75 Credits]`,
          diagramTitle: 'Budget Cascade Architecture',
        },
        {
          id: 'consumption-rule',
          title: 'Zero Idle Consumption Principle',
          callout: {
            type: 'important',
            title: 'Absolute Rule',
            text: 'Credits are NEVER deducted merely because an agent exists or is registered in the capability catalog. Only actual model inference tokens and validated tool invocations consume credits.',
          },
        },
        {
          id: 'cost-tracking-table',
          title: 'Tracked Execution Metrics',
          table: {
            headers: ['Metric', 'Measurement Unit', 'Formula / Accounting'],
            rows: [
              ['Input Tokens', 'Count (e.g. 1,420 tokens)', 'Recorded per LLM API completion request'],
              ['Output Tokens', 'Count (e.g. 380 tokens)', 'Recorded per LLM response chunk'],
              ['Model Rate Factor', 'Ratio (e.g. 1.0x for Local Ollama, 10.0x for Frontier)', 'Calibrated against local baseline (Ollama = 0 credits)'],
              ['Wall-clock Duration', 'Milliseconds', 'Monitors tool hanging and enforces 60s subprocess timeout'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Model Gateway', slug: 'architecture/model-gateway' },
        { title: 'Token & Cost Management', slug: 'models/token-cost-management' },
      ],
    },
  },
  {
    slug: 'architecture/model-gateway',
    title: 'Model Gateway',
    description: 'Unified abstraction layer for LiteLLM, Ollama, OpenRouter, and local models with automatic failover.',
    section: 'Architecture',
    category: 'Execution & Security',
    order: 15,
    checkedDate: 'September 2026',
    tags: ['model-gateway', 'litellm', 'ollama', 'openrouter'],
    content: {
      lead: 'The Model Gateway normalizes diverse LLM APIs into a unified interface supporting streaming, function calling, and dynamic tier routing.',
      sections: [
        {
          id: 'tier-breakdown',
          title: 'The Three-Tier Model Strategy',
          table: {
            headers: ['Tier', 'Example Providers', 'Target Workloads', 'Typical Cost'],
            rows: [
              ['Tier 1: Local Offline', 'Ollama (Qwen 2.5 Coder 7B, DeepSeek R1 8B)', 'Task planning, JSON formatting, commit messages, summarization', '$0.00 / Free'],
              ['Tier 2: Free / Low-Cost Cloud', 'OpenRouter free tiers, Groq, Mistral', 'Full code generation, unit test creation, refactoring', '$0.00 – $0.001 / run'],
              ['Tier 3: Frontier / User API', 'Claude 3.5 Sonnet, GPT-4o, Gemini 2.5 Pro', 'Complex architectural debugging, ambiguous multi-file refactors', 'User-managed key'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'LiteLLM Integration', slug: 'models/litellm' },
        { title: 'Ollama (Local Tier 1)', slug: 'models/ollama' },
      ],
    },
  },
  {
    slug: 'architecture/mcp-architecture',
    title: 'Tool Layer & MCP Architecture',
    description: 'Standardized Model Context Protocol (MCP) server integration, tool definitions, and permission barriers.',
    section: 'Architecture',
    category: 'Execution & Security',
    order: 16,
    checkedDate: 'September 2026',
    tags: ['mcp', 'tools', 'model-context-protocol'],
    content: {
      lead: 'The IDE implements the open Model Context Protocol (MCP), allowing agents to discover and invoke tools across local processes and remote services.',
      sections: [
        {
          id: 'mcp-integration-flow',
          title: 'MCP Host-Client Topology',
          body: 'The IDE acts as an MCP Host, spawning lightweight MCP tool servers via standard JSON-RPC over stdin/stdout.',
          mermaid: `graph LR
    Agent[Agent Runtime] --> Host[IDE MCP Host Manager]
    Host --> S1[Filesystem MCP Server]
    Host --> S2[Git Worktree MCP Server]
    Host --> S3[Docker Sandbox MCP Server]
    Host --> S4[Playwright Browser MCP Server]
    Host --> S5[PostgreSQL MCP Server]`,
          diagramTitle: 'MCP Tool Architecture',
        },
      ],
      relatedPages: [
        { title: 'Model Context Protocol (MCP)', slug: 'tools/mcp' },
        { title: 'Custom Tool Registry & Permissions', slug: 'tools/custom-tools' },
      ],
    },
  },
  {
    slug: 'architecture/security-model',
    title: 'Security Model',
    description: 'Defense-in-depth principles, blast radius containment, secret masking, and production environment protection.',
    section: 'Architecture',
    category: 'Execution & Security',
    order: 17,
    checkedDate: 'September 2026',
    tags: ['security', 'isolation', 'secrets', 'blast-radius'],
    content: {
      lead: 'The cardinal rule of the platform: Never give an autonomous coding agent unrestricted access to a user\'s production environment.',
      sections: [
        {
          id: 'security-principles',
          title: 'Core Security Commandments',
          callout: {
            type: 'warning',
            title: 'Critical Security Boundary',
            text: 'Autonomous agents must never be supplied with production database credentials, production cloud keys, or unrestricted shell permissions without human authorization gates.',
          },
        },
        {
          id: 'security-checklist',
          title: 'Enforced Security Matrix',
          table: {
            headers: ['Vector', 'Attack / Risk Scenario', 'Hardened Defense'],
            rows: [
              ['Prompt Injection', 'Malicious README or PR comments injecting commands', 'Command allowlisting and tool argument JSON schema validation'],
              ['Host Destruction', 'Agent running `rm -rf /` or modifying system binaries', 'Runs exclusively inside disposable container without sudo'],
              ['Secret Exfiltration', 'Agent attempting to read `~/.ssh/id_rsa` or `.env`', 'Host homedir unmounted; secrets dynamically masked from prompts'],
              ['Fork Bombs & OOM', 'Agent spawning infinite child processes', 'Container `pids.max = 64` and memory capped to 2GB'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Sandbox Architecture', slug: 'architecture/sandbox-architecture' },
        { title: 'Security Checklist & Troubleshooting', slug: 'reference/security-troubleshooting' },
      ],
    },
  },
];
