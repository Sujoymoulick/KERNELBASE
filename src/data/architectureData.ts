// ============================================================
// Kernel Base System Architecture – Structured Data Source
// Modify this file to update the architecture diagram content.
// ============================================================

export type LayerId =
  | 'ui'
  | 'orchestration'
  | 'runtime'
  | 'data'
  | 'integrations';

export type ConnectionType = 'primary' | 'bidirectional' | 'secondary';

export interface ArchNode {
  id: string;
  layerId: LayerId;
  title: string;
  subtitle: string;
  description: string;
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  related: string[]; // node IDs
  icon: string; // Lucide icon name
  colSpan?: number; // grid column span within layer row
}

export interface ArchConnection {
  id: string;
  source: string;
  target: string;
  type: ConnectionType;
  label?: string;
}

export interface LayerColorTokens {
  accent: string;       // icon / border / badge text color
  bg: string;           // container background
  badge: string;        // label badge bg
  badgeText: string;    // label badge text
  glow: string;         // box-shadow glow (CSS value)
  nodeAccent: string;   // node left-border color
  nodeBg: string;       // node background
}

export interface ArchLayer {
  id: LayerId;
  title: string;
  subtitle: string;
  color: LayerColorTokens;       // dark theme tokens
  lightColor: LayerColorTokens;  // light theme tokens
}

export interface PresetView {
  id: string;
  label: string;
  description: string;
  highlightNodes: string[];
  highlightConnections: string[];
}

// ─── Layers ─────────────────────────────────────────────────

export const ARCH_LAYERS: ArchLayer[] = [
  {
    id: 'ui',
    title: 'User Interface',
    subtitle: 'Entry points for developers',
    color: {
      accent: '#E86526',
      bg: 'rgba(50,19,9,0.5)',
      badge: 'rgba(166,64,17,0.25)',
      badgeText: '#FF6B35',
      glow: 'rgba(232,101,38,0.18)',
      nodeAccent: '#E86526',
      nodeBg: '#1E0D08',
    },
    lightColor: {
      accent: '#C84B19',
      bg: 'rgba(253,247,243,0.85)',
      badge: 'rgba(200,75,25,0.12)',
      badgeText: '#C84B19',
      glow: 'rgba(200,75,25,0.1)',
      nodeAccent: '#C84B19',
      nodeBg: '#FFFFFF',
    },
  },
  {
    id: 'orchestration',
    title: 'Agent Orchestration Layer',
    subtitle: 'Task planning, coordination & lifecycle',
    color: {
      accent: '#FF6B35',
      bg: 'rgba(117,44,18,0.28)',
      badge: 'rgba(166,64,17,0.3)',
      badgeText: '#FF7A45',
      glow: 'rgba(255,107,53,0.22)',
      nodeAccent: '#FF6B35',
      nodeBg: '#24100A',
    },
    lightColor: {
      accent: '#D9531E',
      bg: 'rgba(253,244,239,0.85)',
      badge: 'rgba(217,83,30,0.12)',
      badgeText: '#D9531E',
      glow: 'rgba(217,83,30,0.1)',
      nodeAccent: '#D9531E',
      nodeBg: '#FFFFFF',
    },
  },
  {
    id: 'runtime',
    title: 'Runtime & Execution Layer',
    subtitle: 'Secure, isolated, scalable execution',
    color: {
      accent: '#A64011',
      bg: 'rgba(40,15,8,0.55)',
      badge: 'rgba(166,64,17,0.25)',
      badgeText: '#D9531E',
      glow: 'rgba(166,64,17,0.18)',
      nodeAccent: '#A64011',
      nodeBg: '#1A0B07',
    },
    lightColor: {
      accent: '#A64011',
      bg: 'rgba(250,240,235,0.85)',
      badge: 'rgba(166,64,17,0.12)',
      badgeText: '#A64011',
      glow: 'rgba(166,64,17,0.1)',
      nodeAccent: '#A64011',
      nodeBg: '#FFFFFF',
    },
  },
  {
    id: 'data',
    title: 'Data & State Layer',
    subtitle: 'Persistent storage, memory & knowledge',
    color: {
      accent: '#D97706',
      bg: 'rgba(36,16,10,0.55)',
      badge: 'rgba(217,119,6,0.25)',
      badgeText: '#F59E0B',
      glow: 'rgba(217,119,6,0.18)',
      nodeAccent: '#D97706',
      nodeBg: '#24100A',
    },
    lightColor: {
      accent: '#B45309',
      bg: 'rgba(254,251,243,0.85)',
      badge: 'rgba(180,83,9,0.12)',
      badgeText: '#B45309',
      glow: 'rgba(180,83,9,0.1)',
      nodeAccent: '#B45309',
      nodeBg: '#FFFFFF',
    },
  },
  {
    id: 'integrations',
    title: 'External Integrations',
    subtitle: 'LLMs, search, tools & services',
    color: {
      accent: '#C2410C',
      bg: 'rgba(45,17,9,0.55)',
      badge: 'rgba(194,65,12,0.25)',
      badgeText: '#FB923C',
      glow: 'rgba(194,65,12,0.18)',
      nodeAccent: '#C2410C',
      nodeBg: '#1E0D08',
    },
    lightColor: {
      accent: '#9A3412',
      bg: 'rgba(253,243,238,0.85)',
      badge: 'rgba(154,52,18,0.12)',
      badgeText: '#9A3412',
      glow: 'rgba(154,52,18,0.1)',
      nodeAccent: '#9A3412',
      nodeBg: '#FFFFFF',
    },
  },
];

// ─── Nodes ───────────────────────────────────────────────────

export const ARCH_NODES: ArchNode[] = [
  // ── UI Layer ──────────────────────────────────────────────
  {
    id: 'desktop-app',
    layerId: 'ui',
    title: 'Desktop App',
    subtitle: 'Electron / Cross-platform',
    description: 'Native desktop shell providing full IDE access with system-level integrations, file system access, and offline capability.',
    responsibilities: ['Full IDE experience', 'System tray integration', 'Native file dialogs', 'Offline support'],
    inputs: ['User interactions', 'Keyboard shortcuts', 'File system events'],
    outputs: ['Agent commands', 'Task goals', 'Configuration changes'],
    related: ['web-ide', 'planner'],
    icon: 'Monitor',
  },
  {
    id: 'web-ide',
    layerId: 'ui',
    title: 'Web IDE',
    subtitle: 'Browser-based development',
    description: 'Full-featured browser IDE with Monaco editor, real-time collaboration, and zero-install access.',
    responsibilities: ['Monaco editor', 'Real-time streaming', 'DAG task visualizer', 'Diff review UI'],
    inputs: ['User code', 'Agent diffs', 'Task status events'],
    outputs: ['Task submissions', 'Edit approvals', 'Config changes'],
    related: ['desktop-app', 'cli', 'planner'],
    icon: 'Globe',
  },
  {
    id: 'cli',
    layerId: 'ui',
    title: 'CLI',
    subtitle: 'Terminal / scripts',
    description: 'Command-line interface for scripting, automation, CI/CD pipelines, and headless agent execution.',
    responsibilities: ['Agent invocation', 'Pipeline automation', 'Batch task execution', 'Headless mode'],
    inputs: ['Shell commands', 'Script arguments', 'Environment variables'],
    outputs: ['Task submissions', 'Structured output', 'Exit codes'],
    related: ['web-ide', 'planner'],
    icon: 'Terminal',
  },
  {
    id: 'extension-api',
    layerId: 'ui',
    title: 'Extension API',
    subtitle: 'VS Code / plugins',
    description: 'Plugin SDK enabling third-party extensions to invoke agents, register tools, and extend the IDE interface.',
    responsibilities: ['Extension host', 'Plugin SDK', 'VS Code compatibility', 'Custom tool registration'],
    inputs: ['Extension commands', 'Plugin configurations'],
    outputs: ['Agent task requests', 'Tool registrations'],
    related: ['cli', 'planner'],
    icon: 'Puzzle',
  },

  // ── Orchestration Layer ────────────────────────────────────
  {
    id: 'planner',
    layerId: 'orchestration',
    title: 'Task Planner & Scheduler',
    subtitle: 'Decompose · Plan · Coordinate · Monitor',
    description: 'Central orchestration engine that decomposes user goals into dependency-aware task graphs and dispatches them to specialized agents.',
    responsibilities: ['Goal decomposition', 'DAG construction', 'Agent dispatch', 'Progress monitoring', 'Retry management'],
    inputs: ['User goals', 'Repository context', 'Agent capabilities'],
    outputs: ['Task assignments', 'DAG updates', 'Status events'],
    related: ['code-agent', 'research-agent', 'executor-agent', 'comm-bus'],
    icon: 'Network',
    colSpan: 4,
  },
  {
    id: 'code-agent',
    layerId: 'orchestration',
    title: 'Code Agent',
    subtitle: 'Code generation · Refactoring · Bug fixing',
    description: 'Specialized agent for all software engineering tasks including generation, refactoring, debugging, and validation.',
    responsibilities: ['Code generation', 'AST-level refactoring', 'Bug diagnosis & fixing', 'Unit test writing', 'Code review'],
    inputs: ['Task definitions', 'Repository context', 'Agent instructions'],
    outputs: ['Code changes', 'Execution tasks', 'Results'],
    related: ['planner', 'comm-bus', 'tool-runtime'],
    icon: 'Code2',
  },
  {
    id: 'research-agent',
    layerId: 'orchestration',
    title: 'Research Agent',
    subtitle: 'Search & retrieve · Documentation · Web research',
    description: 'Agent responsible for information gathering, documentation lookup, and web research to inform other agents.',
    responsibilities: ['Web search', 'Documentation retrieval', 'API exploration', 'Knowledge synthesis', 'Context enrichment'],
    inputs: ['Research queries', 'Documentation URLs', 'Knowledge gaps'],
    outputs: ['Research summaries', 'Retrieved context', 'Knowledge artifacts'],
    related: ['planner', 'comm-bus', 'vector-store'],
    icon: 'Search',
  },
  {
    id: 'executor-agent',
    layerId: 'orchestration',
    title: 'Executor Agent',
    subtitle: 'Run commands · Manage environment · Validate & test',
    description: 'Agent that runs shell commands, manages the execution environment, and validates results through automated test suites.',
    responsibilities: ['Shell command execution', 'Environment setup', 'Test running', 'Build validation', 'Deployment tasks'],
    inputs: ['Execution plans', 'Test specifications', 'Environment configs'],
    outputs: ['Test results', 'Build artifacts', 'Execution logs'],
    related: ['planner', 'comm-bus', 'sandbox'],
    icon: 'Play',
  },
  {
    id: 'comm-bus',
    layerId: 'orchestration',
    title: 'Agent Communication Bus',
    subtitle: 'Message passing · Event streaming · Shared memory',
    description: 'High-throughput message bus enabling typed inter-agent communication with artifact passing and event streaming.',
    responsibilities: ['Message routing', 'Event broadcasting', 'Artifact transfer', 'Shared context', 'A2A protocol'],
    inputs: ['Agent messages', 'Task artifacts', 'State updates'],
    outputs: ['Routed messages', 'Broadcast events', 'Shared state'],
    related: ['planner', 'code-agent', 'research-agent', 'executor-agent'],
    icon: 'Zap',
    colSpan: 4,
  },

  // ── Runtime Layer ──────────────────────────────────────────
  {
    id: 'tool-runtime',
    layerId: 'runtime',
    title: 'Tool Runtime',
    subtitle: 'Execute tools safely',
    description: 'MCP-compatible tool execution host that dispatches agent tool calls to registered tool servers with permission enforcement.',
    responsibilities: ['MCP tool dispatch', 'Permission enforcement', 'Tool result streaming', 'Timeout management'],
    inputs: ['Tool invocations', 'Permission contexts'],
    outputs: ['Tool results', 'Execution telemetry'],
    related: ['sandbox', 'resource-manager', 'code-agent'],
    icon: 'Wrench',
  },
  {
    id: 'sandbox',
    layerId: 'runtime',
    title: 'Sandbox Environment',
    subtitle: 'Isolated execution · Containers',
    description: 'Docker-based isolated execution environment with strict resource limits, network isolation, and filesystem controls.',
    responsibilities: ['Container management', 'Network isolation', 'Filesystem mounting', 'Syscall filtering', 'Ephemeral worktrees'],
    inputs: ['Execution commands', 'Code artifacts', 'Environment specs'],
    outputs: ['Command results', 'Test verdicts', 'Build outputs'],
    related: ['tool-runtime', 'resource-manager', 'executor-agent'],
    icon: 'Shield',
  },
  {
    id: 'resource-manager',
    layerId: 'runtime',
    title: 'Resource Manager',
    subtitle: 'CPU · Memory · Storage · Quotas',
    description: 'Manages compute resource allocation, enforces budget quotas, and prevents runaway agent processes.',
    responsibilities: ['CPU quota enforcement', 'Memory limits', 'Storage quotas', 'Concurrency control', 'Cost tracking'],
    inputs: ['Resource requests', 'Budget allocations'],
    outputs: ['Resource grants', 'Usage metrics', 'Budget alerts'],
    related: ['sandbox', 'monitoring', 'state-management'],
    icon: 'Gauge',
  },
  {
    id: 'monitoring',
    layerId: 'runtime',
    title: 'Monitoring & Logging',
    subtitle: 'Runtime telemetry · Logs · Traces · Metrics',
    description: 'Observability layer collecting runtime telemetry, structured logs, distributed traces, and performance metrics.',
    responsibilities: ['Log aggregation', 'Trace collection', 'Metric recording', 'Alert management', 'Performance profiling'],
    inputs: ['Runtime events', 'Agent logs', 'System metrics'],
    outputs: ['Structured logs', 'Trace spans', 'Dashboards'],
    related: ['tool-runtime', 'sandbox', 'resource-manager'],
    icon: 'Activity',
  },

  // ── Data Layer ─────────────────────────────────────────────
  {
    id: 'agent-registry',
    layerId: 'data',
    title: 'Agent Registry',
    subtitle: 'Agent definitions · Capabilities · Metadata',
    description: 'Capability catalog storing agent specifications, tool bindings, and model preferences for dynamic agent discovery.',
    responsibilities: ['Agent registration', 'Capability matching', 'Version management', 'Metadata indexing'],
    inputs: ['Agent specs', 'Capability declarations'],
    outputs: ['Agent manifests', 'Capability queries'],
    related: ['planner', 'task-graph'],
    icon: 'BookOpen',
  },
  {
    id: 'task-graph',
    layerId: 'data',
    title: 'Task Graph & DAG',
    subtitle: 'Task decomposition · Dependencies · Status',
    description: 'Persistent Directed Acyclic Graph store tracking task dependencies, execution status, and run artifacts.',
    responsibilities: ['DAG persistence', 'Dependency tracking', 'Status checkpointing', 'Artifact links', 'Deadlock detection'],
    inputs: ['Task definitions', 'Dependency declarations'],
    outputs: ['Execution order', 'Task status', 'Progress events'],
    related: ['planner', 'state-management', 'agent-registry'],
    icon: 'GitBranch',
  },
  {
    id: 'state-management',
    layerId: 'data',
    title: 'State Management',
    subtitle: 'Short-term & long-term memory · Context',
    description: 'ACID-compliant SQLite state store with Git-backed checkpointing enabling deterministic rollbacks to any prior state.',
    responsibilities: ['Run state persistence', 'Context memory', 'Git checkpoints', 'Time-travel rollback', 'Session history'],
    inputs: ['State mutations', 'Context snapshots'],
    outputs: ['State queries', 'Rollback targets', 'History logs'],
    related: ['task-graph', 'vector-store', 'resource-manager'],
    icon: 'Database',
  },
  {
    id: 'vector-store',
    layerId: 'data',
    title: 'Vector Store',
    subtitle: 'Embeddings · Semantic search · Knowledge base',
    description: 'Vector embedding database enabling semantic code search, documentation retrieval, and long-term agent memory.',
    responsibilities: ['Embedding storage', 'Semantic search', 'Code indexing', 'Long-term memory', 'Knowledge retrieval'],
    inputs: ['Documents', 'Code files', 'Research artifacts'],
    outputs: ['Semantic search results', 'Similar code', 'Relevant context'],
    related: ['research-agent', 'state-management'],
    icon: 'Layers',
  },

  // ── Integrations ───────────────────────────────────────────
  {
    id: 'llm-providers',
    layerId: 'integrations',
    title: 'LLM Providers',
    subtitle: 'OpenAI · Anthropic · Gemini · Ollama',
    description: 'Multi-tier LLM gateway with automatic failover, cost routing, and local model support via LiteLLM.',
    responsibilities: ['Model routing', 'API normalization', 'Cost optimization', 'Failover handling', 'Local model support'],
    inputs: ['Inference requests', 'Model preferences'],
    outputs: ['Completions', 'Streaming tokens', 'Tool calls'],
    related: ['planner', 'code-agent', 'research-agent'],
    icon: 'Brain',
  },
  {
    id: 'web-search',
    layerId: 'integrations',
    title: 'Web Search',
    subtitle: 'Search providers',
    description: 'Pluggable web search integration providing real-time information retrieval for research and documentation tasks.',
    responsibilities: ['Query execution', 'Result ranking', 'Content extraction', 'Cache management'],
    inputs: ['Search queries', 'Filter parameters'],
    outputs: ['Search results', 'Extracted content'],
    related: ['research-agent', 'llm-providers'],
    icon: 'Search',
  },
  {
    id: 'knowledge-sources',
    layerId: 'integrations',
    title: 'Knowledge Sources',
    subtitle: 'Docs · GitHub · Notion · APIs',
    description: 'Connectors for external knowledge bases including documentation sites, GitHub repositories, Notion workspaces, and REST APIs.',
    responsibilities: ['Documentation indexing', 'Repository scanning', 'API exploration', 'Content syncing'],
    inputs: ['Source URLs', 'Access credentials', 'Sync schedules'],
    outputs: ['Indexed content', 'Repository context', 'API schemas'],
    related: ['research-agent', 'vector-store'],
    icon: 'BookMarked',
  },
  {
    id: 'tools-services',
    layerId: 'integrations',
    title: 'Tools & Services',
    subtitle: 'Docker · Kubernetes · CI/CD · Databases',
    description: 'External tool and service integrations including container orchestration, CI/CD pipelines, and database connections.',
    responsibilities: ['Container management', 'Deployment pipelines', 'Database access', 'File system ops', 'Build systems'],
    inputs: ['Tool invocations', 'Service configurations'],
    outputs: ['Execution results', 'Deployment status', 'Query results'],
    related: ['executor-agent', 'sandbox', 'tool-runtime'],
    icon: 'Settings',
  },
];

// ─── Connections ──────────────────────────────────────────────

export const ARCH_CONNECTIONS: ArchConnection[] = [
  // UI → Orchestration (primary)
  { id: 'c-ui-orch', source: 'desktop-app', target: 'planner', type: 'primary', label: 'Task goal' },
  { id: 'c-web-orch', source: 'web-ide', target: 'planner', type: 'primary', label: 'Task goal' },
  { id: 'c-cli-orch', source: 'cli', target: 'planner', type: 'primary' },
  { id: 'c-ext-orch', source: 'extension-api', target: 'planner', type: 'primary' },

  // Orchestration internal
  { id: 'c-plan-code', source: 'planner', target: 'code-agent', type: 'primary', label: 'Assign task' },
  { id: 'c-plan-research', source: 'planner', target: 'research-agent', type: 'primary', label: 'Assign task' },
  { id: 'c-plan-exec', source: 'planner', target: 'executor-agent', type: 'primary', label: 'Assign task' },
  { id: 'c-code-bus', source: 'code-agent', target: 'comm-bus', type: 'bidirectional' },
  { id: 'c-research-bus', source: 'research-agent', target: 'comm-bus', type: 'bidirectional' },
  { id: 'c-exec-bus', source: 'executor-agent', target: 'comm-bus', type: 'bidirectional' },

  // Orchestration → Runtime (primary)
  { id: 'c-orch-runtime', source: 'planner', target: 'tool-runtime', type: 'primary', label: 'Execute' },
  { id: 'c-exec-sandbox', source: 'executor-agent', target: 'sandbox', type: 'primary' },
  { id: 'c-code-toolrt', source: 'code-agent', target: 'tool-runtime', type: 'primary' },

  // Runtime internal
  { id: 'c-toolrt-sandbox', source: 'tool-runtime', target: 'sandbox', type: 'primary' },
  { id: 'c-sandbox-resmgr', source: 'sandbox', target: 'resource-manager', type: 'bidirectional' },
  { id: 'c-resmgr-monitor', source: 'resource-manager', target: 'monitoring', type: 'primary' },
  { id: 'c-sandbox-monitor', source: 'sandbox', target: 'monitoring', type: 'secondary' },

  // Runtime ↔ Data
  { id: 'c-runtime-state', source: 'tool-runtime', target: 'state-management', type: 'bidirectional' },
  { id: 'c-sandbox-taskgraph', source: 'sandbox', target: 'task-graph', type: 'secondary' },

  // Orchestration ↔ Data
  { id: 'c-plan-registry', source: 'planner', target: 'agent-registry', type: 'bidirectional' },
  { id: 'c-plan-taskgraph', source: 'planner', target: 'task-graph', type: 'bidirectional' },
  { id: 'c-research-vector', source: 'research-agent', target: 'vector-store', type: 'bidirectional' },

  // Orchestration ↔ Integrations (bidirectional)
  { id: 'c-orch-llm', source: 'planner', target: 'llm-providers', type: 'bidirectional', label: 'Inference' },
  { id: 'c-code-llm', source: 'code-agent', target: 'llm-providers', type: 'bidirectional' },
  { id: 'c-research-llm', source: 'research-agent', target: 'llm-providers', type: 'bidirectional' },
  { id: 'c-research-search', source: 'research-agent', target: 'web-search', type: 'bidirectional' },
  { id: 'c-research-knowledge', source: 'research-agent', target: 'knowledge-sources', type: 'bidirectional' },
  { id: 'c-exec-tools', source: 'executor-agent', target: 'tools-services', type: 'bidirectional' },
  { id: 'c-toolrt-tools', source: 'tool-runtime', target: 'tools-services', type: 'bidirectional' },
];

// ─── Preset Views ─────────────────────────────────────────────

export const PRESET_VIEWS: PresetView[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Complete system architecture',
    highlightNodes: [], // empty = all
    highlightConnections: [],
  },
  {
    id: 'agent-flow',
    label: 'Agent Flow',
    description: 'User → Planner → Agents → Bus → Runtime',
    highlightNodes: ['web-ide', 'desktop-app', 'cli', 'planner', 'code-agent', 'research-agent', 'executor-agent', 'comm-bus', 'tool-runtime', 'sandbox'],
    highlightConnections: ['c-ui-orch', 'c-web-orch', 'c-cli-orch', 'c-ext-orch', 'c-plan-code', 'c-plan-research', 'c-plan-exec', 'c-code-bus', 'c-research-bus', 'c-exec-bus', 'c-orch-runtime', 'c-exec-sandbox'],
  },
  {
    id: 'runtime',
    label: 'Runtime',
    description: 'Orchestration → Execution → Monitoring',
    highlightNodes: ['planner', 'executor-agent', 'tool-runtime', 'sandbox', 'resource-manager', 'monitoring', 'state-management'],
    highlightConnections: ['c-orch-runtime', 'c-exec-sandbox', 'c-code-toolrt', 'c-toolrt-sandbox', 'c-sandbox-resmgr', 'c-resmgr-monitor', 'c-sandbox-monitor', 'c-runtime-state'],
  },
  {
    id: 'data-flow',
    label: 'Data Flow',
    description: 'Agents → Task Graph → State → Vector Store',
    highlightNodes: ['planner', 'code-agent', 'research-agent', 'executor-agent', 'agent-registry', 'task-graph', 'state-management', 'vector-store'],
    highlightConnections: ['c-plan-registry', 'c-plan-taskgraph', 'c-research-vector', 'c-runtime-state', 'c-sandbox-taskgraph'],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Orchestration ↔ External services',
    highlightNodes: ['planner', 'code-agent', 'research-agent', 'executor-agent', 'llm-providers', 'web-search', 'knowledge-sources', 'tools-services'],
    highlightConnections: ['c-orch-llm', 'c-code-llm', 'c-research-llm', 'c-research-search', 'c-research-knowledge', 'c-exec-tools', 'c-toolrt-tools'],
  },
];
