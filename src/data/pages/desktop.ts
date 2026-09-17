import { DocPage } from '../../types/docs';

export const desktopPages: DocPage[] = [
  {
    slug: 'desktop/desktop-architecture',
    title: 'Desktop Architecture',
    description: 'The native desktop application architecture: Main Process, Renderer, IPC Bridges, and Local Daemon.',
    section: 'Desktop App',
    category: 'Desktop System',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['desktop', 'electron', 'tauri', 'architecture', 'ipc'],
    content: {
      lead: 'The desktop application decouples UI rendering from system execution, ensuring smooth 60fps code editing even while multiple agents run intensive compiler suites.',
      interactiveComponent: 'desktop-comparison',
      sections: [
        {
          id: 'desktop-topology',
          title: 'Desktop Subsystem Topology',
          mermaid: `graph TD
    subgraph UI [Desktop Renderer Window]
        Header[Navigation & Status Bar]
        Explorer[File Explorer]
        Monaco[Code & Diff Editor]
        AgentPanel[Agent Activity & Telemetry Panel]
        TerminalUI[xterm.js Integrated Terminal]
    end

    subgraph Main [Main Desktop Process / Bridge]
        Menu[Native Menus & Shortcuts]
        FSWatcher[chokidar File System Watcher]
        IPCRouter[Typed IPC Router]
    end

    subgraph Daemon [Local Agent Daemon]
        AgentMgr[Agent Manager]
        WorktreeMgr[Worktree Manager]
        DockerMgr[Docker Sandbox Client]
        Gateway[LiteLLM / Ollama Client]
    end

    UI <-->|Typed IPC / ContextBridge| IPCRouter
    IPCRouter <-->|Unix Domain Socket / Localhost HTTP| Daemon`,
          diagramTitle: 'Desktop Main vs Renderer Topology',
        },
        {
          id: 'desktop-target-ui',
          title: 'Target UI Layout Specification',
          body: 'The desktop IDE interface organizes the developer\'s screen into five synchronized panes.',
          codeBlocks: [
            {
              filename: 'layout-spec.txt',
              language: 'text',
              code: `---------------------------------------------------------
| Logo | Project | Run | Agents | Search | Settings    |
---------------------------------------------------------
|       |                                         |     |
| FILES |               CODE EDITOR               | AGENT
|       |                                         | PANEL
|       |                                         |     |
|       |                                         |     |
---------------------------------------------------------
| TERMINAL / TASKS / TESTS / LOGS / CHANGES             |
---------------------------------------------------------`,
            },
          ],
        },
        {
          id: 'agent-panel-telemetry',
          title: 'Agent Panel Telemetry Metrics',
          table: {
            headers: ['Telemetry Field', 'Data Type', 'Live Display Format', 'Purpose'],
            rows: [
              ['Agent Name', 'String', 'CodingAgent-01 (Active)', 'Identifies the currently executing persona'],
              ['Status', 'Enum', 'EXECUTING / WAITING_TESTS', 'Visual state pill indicator'],
              ['Current Task', 'String', 'Implement RS256 token verification', 'Active task graph node title'],
              ['Tool in Use', 'String', 'fs.edit_file (src/auth/jwt.ts)', 'Shows real-time tool invocation'],
              ['Tokens Used', 'Integer', '1,420 in / 380 out', 'Real-time inference token tracking'],
              ['Credits Consumed', 'Float', '24.5 / 200.0 Credits', 'Budget burn rate monitor'],
              ['Elapsed Time', 'Duration', '00:04.2', 'Wall-clock performance tracker'],
              ['Files Changed', 'String Array', '3 files (+42 / -12 lines)', 'Pending worktree delta'],
              ['Test Status', 'Boolean / Counts', 'Pass (4/4 tests)', 'Verification outcome'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Runtime & IPC Communication', slug: 'desktop/runtime-ipc' },
        { title: 'Desktop Frameworks Research', slug: 'research/desktop-frameworks' },
      ],
    },
  },
  {
    slug: 'desktop/runtime-ipc',
    title: 'Runtime & IPC Communication',
    description: 'Type-safe asynchronous IPC bridges connecting renderer React components to native system capabilities.',
    section: 'Desktop App',
    category: 'Desktop System',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['ipc', 'electron', 'tauri', 'type-safe'],
    content: {
      lead: 'All renderer interactions flow through a strongly typed IPC channel, ensuring context isolation and defense against remote code execution.',
      sections: [
        {
          id: 'ipc-bridge-interface',
          title: 'Typed IPC Protocol Contract',
          codeBlocks: [
            {
              filename: 'src/desktop/preload/api.ts',
              language: 'typescript',
              code: `export interface DesktopAPI {
  // Project & Files
  openDirectory: () => Promise<string | null>;
  readFile: (path: string) => Promise<string>;
  saveFile: (path: string, content: string) => Promise<void>;
  
  // Agent Control
  startRun: (goal: string, config: RunConfig) => Promise<{ runId: string }>;
  pauseRun: (runId: string) => Promise<void>;
  abortRun: (runId: string) => Promise<void>;
  approveAction: (actionId: string, approved: boolean) => Promise<void>;
  
  // Real-time Event Streaming
  onAgentEvent: (callback: (event: AgentEvent) => void) => () => void;
  onTerminalData: (callback: (chunk: string) => void) => () => void;
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Desktop Architecture', slug: 'desktop/desktop-architecture' },
      ],
    },
  },
  {
    slug: 'desktop/local-agent-runtime',
    title: 'Local Agent Runtime',
    description: 'In-process or background daemon managing LLM streaming, task loops, and SQLite run history.',
    section: 'Desktop App',
    category: 'Desktop System',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['daemon', 'runtime', 'sqlite', 'local'],
    content: {
      lead: 'The local daemon runs as an unprivileged background process, persisting all agent conversations and DAG executions in local SQLite.',
      sections: [
        {
          id: 'daemon-resilience',
          title: 'Daemon Resilience and Crash Recovery',
          body: 'If the desktop window is accidentally closed or refreshed, the daemon continues running in the background. When the user reopens the app, the UI reattaches to the ongoing run seamlessly.',
        },
      ],
      relatedPages: [
        { title: 'Local Workspace & File Explorer', slug: 'desktop/local-workspace' },
      ],
    },
  },
  {
    slug: 'desktop/local-workspace',
    title: 'Local Workspace & File Explorer',
    description: 'High-performance virtualized file tree, chokidar change notifications, and git status decorations.',
    section: 'Desktop App',
    category: 'Desktop System',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['workspace', 'explorer', 'vfs', 'tree'],
    content: {
      lead: 'The file explorer virtualizes 50,000+ files smoothly, highlighting agent modifications with distinctive badge colors and inline diff previews.',
      sections: [
        {
          id: 'status-decorations',
          title: 'File Status Indicators',
          table: {
            headers: ['Badge', 'Meaning', 'Color'],
            rows: [
              ['[MOD]', 'Modified in current agent run', 'Amber text, dot badge'],
              ['[ADD]', 'Newly created by agent', 'Green text, plus badge'],
              ['[DEL]', 'Marked for deletion by agent', 'Red text, minus badge'],
              ['[LOCK]', 'File locked by active agent', 'Blue lock icon'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Terminal & Docker Bridges', slug: 'desktop/docker-terminal-integration' },
      ],
    },
  },
  {
    slug: 'desktop/docker-terminal-integration',
    title: 'Terminal & Docker Bridges',
    description: 'Embedding xterm.js with PTY subprocess allocation, ANSI color rendering, and Docker exec attachments.',
    section: 'Desktop App',
    category: 'IDE Modules',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['xterm', 'pty', 'terminal', 'docker-bridge'],
    content: {
      lead: 'The integrated terminal attaches directly to the running Docker sandbox container via node-pty, giving developers instant shell access.',
      sections: [
        {
          id: 'pty-architecture',
          title: 'PTY Attachment Flow',
          body: 'When an agent executes `npm test`, output streams simultaneously to xterm.js for human observation and to the JSON parser for autonomous diagnosis.',
        },
      ],
      relatedPages: [
        { title: 'Agent Activity & Task Panel', slug: 'desktop/agent-manager' },
      ],
    },
  },
  {
    slug: 'desktop/agent-manager',
    title: 'Agent Activity & Task Panel',
    description: 'Real-time telemetry panel displaying token burn, active agent thoughts, and pending human approvals.',
    section: 'Desktop App',
    category: 'IDE Modules',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['telemetry', 'agent-panel', 'monitoring'],
    content: {
      lead: 'The Agent Panel is mission control for autonomous runs, rendering step-by-step reasoning, tool call arguments, and error logs.',
      sections: [
        {
          id: 'thought-stream-ux',
          title: 'Collapsible Reasoning Thoughts',
          body: 'Internal thinking tokens (such as DeepSeek-R1 reflection blocks) are rendered in a subtle, collapsible accordion to maintain editor cleanliness.',
        },
      ],
      relatedPages: [
        { title: 'Project & Credit Logs', slug: 'desktop/project-manager' },
      ],
    },
  },
  {
    slug: 'desktop/project-manager',
    title: 'Project & Credit Logs',
    description: 'Historical audit logs, token cost breakdowns per project, and exported run summaries.',
    section: 'Desktop App',
    category: 'IDE Modules',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['logs', 'audit', 'credits', 'history'],
    content: {
      lead: 'Every run produces an exportable JSON/Markdown report detailing all modified files, test outputs, token costs, and agent rationale.',
      sections: [
        {
          id: 'audit-log-sample',
          title: 'Audit Report Output Structure',
          codeBlocks: [
            {
              filename: 'run-104-summary.json',
              language: 'json',
              code: `{
  "runId": "run-104",
  "goal": "Add RS256 JWT verification",
  "status": "SUCCESS",
  "durationSeconds": 14.8,
  "creditsUsed": 18.2,
  "tokens": { "input": 3200, "output": 840 },
  "filesModified": ["src/auth/jwt.ts", "tests/jwt.test.ts"],
  "testsPassed": 6,
  "testsFailed": 0,
  "humanApprovals": []
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Desktop Security Model', slug: 'desktop/desktop-security' },
      ],
    },
  },
  {
    slug: 'desktop/desktop-security',
    title: 'Desktop Security Model',
    description: 'Protecting the local machine from malicious prompts, arbitrary shell escapes, and credential exfiltration.',
    section: 'Desktop App',
    category: 'IDE Modules',
    order: 8,
    checkedDate: 'September 2026',
    tags: ['security', 'sandbox', 'desktop-security'],
    content: {
      lead: 'The desktop client employs strict Content Security Policies (CSP), context isolation, and disabled `nodeIntegration` in the renderer.',
      sections: [
        {
          id: 'csp-hardening',
          title: 'Renderer Hardening Checklist',
          table: {
            headers: ['Security Setting', 'Configured Value', 'Defense Purpose'],
            rows: [
              ['nodeIntegration', 'false', 'Prevents compromised renderers from accessing native Node.js'],
              ['contextIsolation', 'true', 'Prevents prototype pollution across IPC boundaries'],
              ['sandbox', 'true', 'Applies Chromium OS sandbox to renderer process'],
              ['webSecurity', 'true', 'Enforces strict CORS and disables file:// protocol in scripts'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Security Model', slug: 'architecture/security-model' },
      ],
    },
  },
];
