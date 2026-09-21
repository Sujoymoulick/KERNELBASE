import { DocPage } from '../../types/docs';

export const getStartedPages: DocPage[] = [
  {
    slug: 'get-started/overview',
    title: 'Overview',
    description: 'An architectural and technical introduction to the Kernel Base AI-Native Multi-Agent IDE platform.',
    section: 'Get Started',
    category: 'Introduction',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['overview', 'multi-agent', 'ide', 'introduction', 'kernel-base', 'vision'],
    content: {
      lead: 'Kernel Base is an AI-Native Multi-Agent Desktop IDE that allows users and organizations to delegate complex development, research, analysis, automation, and engineering tasks to coordinated AI agent teams while supporting cloud models, custom LLM gateways, and local open-source models running entirely on your machine.',
      interactiveComponent: 'architecture-diagram',
      sections: [
        {
          id: 'what-is-kernel-base',
          title: 'What is Kernel Base?',
          body: 'Traditional code editors treat AI as a conversational sidebar or a single-line tab completion engine. Kernel Base reimagines the developer workspace as an AI-Native operating system where specialized autonomous agent teams collaborate concurrently in an isolated sandbox to plan, research, write, verify, and repair software.',
          callout: {
            type: 'important',
            title: 'The Kernel Base Paradigm: Beyond "IDE + AI Chat"',
            text: 'Kernel Base is not simply an editor with an LLM chat plugin. It is a complete multi-agent runtime incorporating a Task Graph DAG Engine, Multi-Provider Model Gateway (cloud, custom, local), Tool Runtime, Dual-Isolation Sandbox, Report Engine, and Organization Control Plane.',
          },
        },
        {
          id: 'product-vision-architecture',
          title: 'Kernel Base Architecture Overview',
          body: 'The platform integrates twelve core architectural subsystems coordinated seamlessly under the Desktop IDE shell:',
          mermaid: `graph TD
    KB[Kernel Base Platform]
    KB --> IDE[Desktop IDE]
    KB --> Runtime[Agent Runtime]
    KB --> Orch[Agent Orchestrator]
    KB --> DAG[Task Graph / DAG Engine]
    KB --> MG[Model Gateway]
    KB --> Tools[Tool Runtime]
    KB --> SB[Sandbox]
    KB --> LocalMgr[Local Model Manager]
    KB --> ProvGW[Provider Gateway]
    KB --> WSMgr[Workspace Manager]
    KB --> RepEngine[Report Engine]
    KB --> SecLayer[Security Layer]
    KB --> OrgPlane[Organization Control Plane]`,
          diagramTitle: 'Kernel Base Subsystem Architecture Map',
        },
        {
          id: 'why-it-exists',
          title: 'Why Does Kernel Base Exist?',
          body: 'Modern software engineering is too broad for a single context window. A real-world pull request requires architectural design, library evaluation, unit test execution, security review, and edge-case diagnosis. Single-agent models hit cognitive saturation and hallucinatory loops when attempting to hold all these responsibilities simultaneously. By decomposing tasks into a Directed Acyclic Graph (DAG) and assigning specialized tools and system prompts to distinct agents, Kernel Base achieves significantly higher task completion rates on complex engineering tasks.',
          table: {
            headers: ['Dimension', 'Single-Agent Assistant (Legacy)', 'Kernel Base Multi-Agent IDE'],
            rows: [
              ['Task Scope', 'Linear prompt/response, limited memory', 'Dynamic DAG decomposition with dependency tracking'],
              ['Context Window', 'Monolithic (suffers catastrophic forgetting)', 'Scoped per agent — Planner, Coder, QA each get clean contexts'],
              ['Execution Safety', 'Executes directly on host or requires manual copy-paste', 'Isolated Docker sandbox with worktree branches & permission gates'],
              ['Verification', 'Passive text generation without runtime feedback', 'Autonomous loop: compile → test → diagnose → self-repair'],
              ['Model Diversity', 'Locked to single proprietary cloud provider', 'Multi-Provider Model Gateway: Cloud, Custom Gateways, Local Ollama ($0/mo)'],
              ['Team Execution', 'Single chat assistant', 'Predefined & custom Agent Teams collaborating in parallel'],
              ['Report Output', 'Transient chat stream', 'Comprehensive Report Workspace (diffs, tests, security, costs)'],
              ['Privacy & Governance', 'All data leaves machine', '100% Local-Only mode + Organization Control Plane & Audit Logs'],
            ],
          },
        },
        {
          id: 'high-level-flow',
          title: 'High-Level Execution Topology',
          mermaid: `graph TD
    User([User Goal]) --> UI[Desktop IDE Interface]
    UI --> RM[Run Manager & Event Bus]
    RM --> Orch[Agent Orchestrator]
    Orch --> DAG[Task Graph / DAG Engine]
    DAG --> Reg[Agent Capability Registry]
    Reg --> P[Planner Agent]
    Reg --> C[Coding Agent]
    Reg --> R[Research Agent]
    Reg --> QA[QA & Test Agent]
    C --> MG[Model Gateway]
    R --> MG
    QA --> MG
    MG --> Cloud[Cloud LLMs]
    MG --> Custom[Custom Gateways]
    MG --> Local[Local Models / Ollama]
    C --> SB[(Docker Sandbox)]
    QA --> SB
    SB --> Verif{Test Verification}
    Verif -->|Pass| Report[Report Workspace]
    Verif -->|Fail| Repair[Repair Diagnostic Loop]
    Repair --> C
    Report --> Export[PR / Diff Export]`,
          diagramTitle: 'End-to-End Multi-Agent Orchestration Flow',
        },
        {
          id: 'key-pillars',
          title: 'Architectural Pillars',
          cards: [
            {
              title: 'Deterministic Orchestration',
              description: 'Task planning outputs strict JSON DAGs with topological sorting, preventing deadlocks and infinite loops.',
              badge: 'Engine',
            },
            {
              title: 'Ephemerally Isolated Sandboxes',
              description: 'Code modification and shell execution run in ephemeral Docker containers or isolated Git worktrees.',
              badge: 'Security',
            },
            {
              title: 'Model Context Protocol (MCP)',
              description: 'Standardized tool integration across local files, terminals, databases, browsers, and remote APIs.',
              badge: 'Protocol',
            },
            {
              title: 'Unified Model Gateway',
              description: 'Single abstraction layer routing to cloud providers, custom enterprise gateways, or local Ollama models with no vendor lock-in.',
              badge: 'Gateway',
            },
            {
              title: 'Local AI First ($0 / mo)',
              description: 'One-click local model installation via Ollama and Hugging Face. Hardware detection recommends optimal models for your machine.',
              badge: 'Local AI',
            },
            {
              title: 'Dedicated Report Workspace',
              description: 'Consolidates all agent outputs, unified diffs, test logs, CVE audits, and token costs into an interactive review pane.',
              badge: 'Reports',
            },
            {
              title: 'Organization Control Plane',
              description: 'Centralized policy enforcement, RBAC, spending budgets, private gateway distribution, and tamper-evident audit trails.',
              badge: 'Enterprise',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'What is the AI-Native IDE?', slug: 'get-started/what-is-ai-native-ide' },
        { title: 'System Architecture', slug: 'architecture/system-architecture' },
        { title: 'Agent Teams Overview', slug: 'agent-teams/overview' },
        { title: 'Local AI Overview', slug: 'local-ai/overview' },
      ],
    },
  },
  {
    slug: 'get-started/what-is-ai-native-ide',
    title: 'What is the AI-Native IDE?',
    description: 'Detailed breakdown of the IDE interface, local runtime, and autonomous workspace model.',
    section: 'Get Started',
    category: 'Introduction',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['concepts', 'ide', 'workspace'],
    content: {
      lead: 'An AI-Native IDE is not a text editor with a plugin; it is a collaborative operating system for human-agent software co-creation.',
      sections: [
        {
          id: 'anatomy-of-workspace',
          title: 'Anatomy of the Workspace',
          body: 'The IDE surface consists of synchronized panels designed to expose full transparency into agent reasoning, code diffs, and verification metrics.',
          codeBlocks: [
            {
              filename: 'workspace-layout.txt',
              language: 'text',
              code: `+-------------------------------------------------------------------------------+
| LOGO | Project: my-microservice | Run #42 [RUNNING] | Models: Ollama+OpenRouter |
+-------------------------------------------------------------------------------+
| [FILES]          | [MAIN CODE EDITOR]               | [AGENT RUNTIME PANEL]   |
| > src/           | // src/auth/jwt.ts               | Active: CodingAgent-01  |
|   auth/          | export function verifyToken(...) | Task: "Implement RS256" |
|     jwt.ts [MOD] | {                                | Tool: fs.write_file     |
|     session.ts   |   // Implemented RS256 algorithm | Credits: 24 / 200 used  |
| > tests/         |   ...                            | Elapsed: 4.2s           |
| package.json     | }                                | Tokens: 1,840 in/out    |
+-------------------------------------------------------------------------------+
| [TERMINAL & TEST OUTPUT]                            | [DAG TASK GRAPH]        |
| $ npm test                                          | [Plan] -> [Code] -> [QA]|
| PASS tests/jwt.test.ts (4 tests, 28ms)              | Status: QA Verifying... |
+-------------------------------------------------------------------------------+`,
            },
          ],
        },
        {
          id: 'agent-human-collaboration',
          title: 'Human-in-the-Loop Interactivity',
          body: 'Users maintain continuous oversight. When an agent attempts an irreversible command (such as dropping a database table, modifying security credentials, or pushing to remote git branches), the IDE runtime pauses execution and requests explicit human sign-off via an interactive modal.',
          callout: {
            type: 'tip',
            title: 'Configurable Autonomy Levels',
            text: 'Choose between "Full Autonomous" (pre-approved safe sandbox), "Semi-Autonomous" (approvals required on destructive actions), and "Step-by-Step" (inspect every plan node before execution).',
          },
        },
      ],
      relatedPages: [
        { title: 'Why Multi-Agent?', slug: 'get-started/why-multi-agent' },
        { title: 'Desktop Architecture', slug: 'desktop/desktop-architecture' },
      ],
    },
  },
  {
    slug: 'get-started/why-multi-agent',
    title: 'Why Multi-Agent?',
    description: 'The mathematical, empirical, and architectural case for specialized multi-agent systems over monolithic LLMs.',
    section: 'Get Started',
    category: 'Introduction',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['multi-agent', 'research', 'dag'],
    content: {
      lead: 'Decomposing complex engineering challenges into discrete micro-agents with dedicated roles increases accuracy and eliminates context bloat.',
      sections: [
        {
          id: 'empirical-evidence',
          title: 'The Context Bloat Trap in Monolithic Agents',
          body: 'As a single conversation grows beyond 30,000 tokens, LLM attention degrades. Research shows an error in step 2 of an 8-step programming task causes compounding hallucinations in 87% of single-agent sessions. By contrast, a Multi-Agent architecture resets context windows for each role, passing only strict structured summaries.',
          callout: {
            type: 'note',
            title: 'Attention Degradation Principle',
            text: 'By keeping individual agent context windows under 8,000 tokens of highly curated information, we operate in the highest-accuracy retrieval regime of modern models.',
          },
        },
        {
          id: 'role-specialization',
          title: 'Role Specialization Matrix',
          table: {
            headers: ['Agent Role', 'Primary Prompt Bias', 'Permitted Tools', 'Typical Context Size'],
            rows: [
              ['Planner', 'Decomposition, dependency analysis, risk assessment', 'read_project_tree, read_package_json', '4k tokens'],
              ['Researcher', 'Search, documentation synthesis, API reference', 'web_search, fetch_docs, mcp_query', '6k tokens'],
              ['Coder', 'High-density code generation, syntax adherence', 'read_file, edit_file, create_file', '8k tokens'],
              ['Debugger', 'Root-cause diagnosis, stack trace analysis', 'terminal_exec, parse_stack, git_diff', '6k tokens'],
              ['QA & Tester', 'Pessimistic verification, edge-case generation', 'terminal_exec, npm_test, inspect_logs', '6k tokens'],
              ['Reviewer', 'Security, style guidelines, cyclomatic complexity', 'git_diff, ast_lint, security_audit', '5k tokens'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Agent Architecture', slug: 'architecture/agent-architecture' },
        { title: 'Task Decomposition', slug: 'architecture/task-decomposition' },
      ],
    },
  },
  {
    slug: 'get-started/core-concepts',
    title: 'Core Concepts',
    description: 'Fundamental building blocks of Kernel Base: DAGs, Worktrees, Model Gateway, Sandboxes, and Report Workspace.',
    section: 'Get Started',
    category: 'Introduction',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['concepts', 'mcp', 'dag', 'sandbox', 'reports'],
    content: {
      lead: 'Master the fundamental primitives governing state, execution, model routing, and safety within Kernel Base.',
      sections: [
        {
          id: 'dag-concept',
          title: '1. Task Graph (DAG)',
          body: 'A Directed Acyclic Graph represents all subtasks required to achieve the user goal. Nodes denote discrete jobs (e.g., "Install bcrypt", "Create User schema", "Write authentication unit tests"). Edges represent strict execution dependencies.',
        },
        {
          id: 'model-gateway-concept',
          title: '2. Multi-Provider Model Gateway',
          body: 'A unified abstraction layer allowing agents to seamlessly invoke frontier cloud providers (Claude 3.5 Sonnet, GPT-4o), custom enterprise LLM gateways, or local offline models (Ollama Qwen 2.5 Coder) without vendor lock-in.',
        },
        {
          id: 'agent-spec-concept',
          title: '3. Agent Specification (AgentSpec)',
          body: 'Every agent in the registry is defined by a declarative specification outlining its system prompt, tool access permissions, model tier, and credit allowance.',
          codeBlocks: [
            {
              filename: 'types/agent.ts',
              language: 'typescript',
              code: `export interface AgentSpec {
  id: string;
  name: string;
  role: 'planner' | 'coder' | 'researcher' | 'qa' | 'reviewer' | 'devops' | 'debugger';
  systemPrompt: string;
  allowedTools: string[];
  modelTier: 'local' | 'free-cloud' | 'frontier';
  budgetCredits: number;
  permissions: {
    canWriteFiles: boolean;
    canRunShell: boolean;
    canAccessInternet: boolean;
    requiresHumanApproval: boolean;
  };
}`,
            },
          ],
        },
        {
          id: 'sandbox-concept',
          title: '4. Docker Sandbox & Git Worktree',
          body: 'To prevent agents from modifying working branch code unintentionally, the IDE creates an isolated Git worktree mounted inside an ephemeral Docker container with resource constraints.',
        },
        {
          id: 'report-workspace-concept',
          title: '5. Report Workspace',
          body: 'A dedicated post-run interface that automatically consolidates all agent logs, AST file diffs, test outputs, and security scans into an authoritative review pane.',
        },
      ],
      relatedPages: [
        { title: 'System Architecture', slug: 'architecture/system-architecture' },
        { title: 'Model Gateway', slug: 'architecture/model-gateway' },
        { title: 'Report Workspace', slug: 'workspace/report-workspace' },
      ],
    },
  },
  {
    slug: 'get-started/installation',
    title: 'Installation',
    description: 'Install prerequisites, configure local LLMs, and launch the development runtime.',
    section: 'Get Started',
    category: 'Quick Start',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['install', 'setup', 'cli', 'ollama'],
    content: {
      lead: 'Get Kernel Base running locally in less than five minutes using open-source tools.',
      sections: [
        {
          id: 'prerequisites',
          title: 'Prerequisites',
          table: {
            headers: ['Software', 'Minimum Version', 'Purpose', 'Free/Open Source?'],
            rows: [
              ['Node.js', 'v18.0.0+ LTS / v20.0.0+ LTS (recommended)', 'Desktop runtime & API orchestration', 'Yes (MIT)'],
              ['Docker Engine', 'v24.0.0+', 'Container sandbox isolation', 'Yes (Apache 2.0)'],
              ['Git', 'v2.38.0+', 'Repository management & worktrees', 'Yes (GPLv2)'],
              ['Ollama (Optional)', 'v0.5.0+', '100% offline local model inference ($0/mo)', 'Yes (MIT)'],
            ],
          },
        },
        {
          id: 'quick-commands',
          title: 'Step-by-Step Setup',
          steps: [
            {
              title: 'Clone the Repository',
              description: 'Clone the official Kernel Base repository.',
              code: 'git clone https://github.com/kernel-base/kernel-base.git\ncd kernel-base',
              language: 'bash',
            },
            {
              title: 'Install Dependencies',
              description: 'Install Node.js packages and compile native workspace bindings.',
              code: 'npm install',
              language: 'bash',
            },
            {
              title: 'Pull Free Local Models via Ollama',
              description: 'If you plan to run completely free and offline, pull the recommended lightweight models.',
              code: '# Fast planner and router\nollama pull qwen2.5-coder:7b\n# High quality reasoning\nollama pull deepseek-r1:8b',
              language: 'bash',
            },
            {
              title: 'Launch the Development Environment',
              description: 'Start the orchestrator daemon and development desktop interface.',
              code: 'npm run dev',
              language: 'bash',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Desktop App Setup', slug: 'get-started/desktop-app' },
        { title: 'Free LLM Options', slug: 'free-tech-stack/free-llms' },
      ],
    },
  },
  {
    slug: 'get-started/desktop-app',
    title: 'Desktop App Setup',
    description: 'Native packaging, Electron/Tauri builds, and cross-platform installation instructions.',
    section: 'Get Started',
    category: 'Quick Start',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['desktop', 'tauri', 'electron', 'cross-platform'],
    content: {
      lead: 'Deploy the native desktop application on macOS, Linux, or Windows with local terminal and sandbox integration.',
      sections: [
        {
          id: 'platform-builds',
          title: 'Cross-Platform Build Targets',
          body: 'The desktop client packages the IDE UI alongside the local daemon process, providing native menu bars, system tray shortcuts, and kernel-level process isolation.',
          codeBlocks: [
            {
              filename: 'desktop-build.sh',
              language: 'bash',
              code: `# For macOS (Universal DMG)
npm run package:mac

# For Linux (AppImage & Deb)
npm run package:linux

# For Windows (NSIS Installer)
npm run package:win`,
            },
          ],
        },
        {
          id: 'hardware-requirements',
          title: 'Recommended Hardware Matrix',
          table: {
            headers: ['Tier', 'RAM', 'GPU / NPU', 'Model Hosting', 'Target Experience'],
            rows: [
              ['Minimal', '8 GB', 'Integrated', 'Cloud Free Tier (OpenRouter)', 'Full speed cloud, 0 local models'],
              ['Recommended', '16 GB', 'Apple M1/M2/M3 or RTX 3060', 'Local 7B/8B Q4 Quantized', 'Fast local planner + free cloud coder'],
              ['Heavy Local', '32 GB+', 'RTX 4090 / 64GB Unified', 'Local 14B/32B Q4 Models', '100% offline air-gapped engineering'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Desktop Architecture', slug: 'desktop/desktop-architecture' },
        { title: 'Desktop Frameworks Research', slug: 'research/desktop-frameworks' },
      ],
    },
  },
  {
    slug: 'get-started/first-project',
    title: 'First Project',
    description: 'Creating your first workspace, indexing codebase symbols, and establishing safety policies.',
    section: 'Get Started',
    category: 'Quick Start',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['workspace', 'project', 'ast', 'indexing'],
    content: {
      lead: 'Initialize a new repository or connect an existing multi-package project for multi-agent assistance.',
      sections: [
        {
          id: 'project-init',
          title: 'Initializing a Project',
          body: 'When you open a directory, the IDE runs a non-destructive lightweight AST scan to build the Project Index file (`.ai-ide/project-manifest.json`).',
          codeBlocks: [
            {
              filename: '.ai-ide/project-manifest.json',
              language: 'json',
              code: `{
  "projectName": "payment-service",
  "language": "typescript",
  "framework": "express",
  "testRunner": "vitest",
  "entryPoint": "src/server.ts",
  "budgetLimitCredits": 500,
  "defaultSandbox": "docker-isolated",
  "modelTierPreferences": {
    "planner": "ollama/qwen2.5-coder:7b",
    "coder": "openrouter/qwen-2.5-coder-32b",
    "qa": "ollama/qwen2.5-coder:7b"
  }
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'First Multi-Agent Run', slug: 'get-started/first-multi-agent-run' },
        { title: 'Workspace Isolation', slug: 'architecture/workspace-isolation' },
      ],
    },
  },
  {
    slug: 'get-started/first-multi-agent-run',
    title: 'First Multi-Agent Run',
    description: 'Walkthrough of a complete end-to-end task: goal entry, DAG generation, execution, testing, and approval.',
    section: 'Get Started',
    category: 'Quick Start',
    order: 8,
    checkedDate: 'September 2026',
    tags: ['run', 'dag', 'demo', 'tutorial'],
    content: {
      lead: 'Execute your first autonomous engineering session and observe agents coordinating in real time.',
      sections: [
        {
          id: 'step-by-step-run',
          title: 'End-to-End Walkthrough',
          steps: [
            {
              title: 'Input the High-Level Goal',
              description: 'Enter your objective in the IDE command prompt: "Add rate limiting middleware using Redis with unit tests in Vitest."',
            },
            {
              title: 'Planner Decomposes Goal into DAG',
              description: 'The Planner Agent queries project dependencies and produces a 4-node execution graph with topological constraints.',
              code: `1. [Research] Check existing express middleware & redis dependencies
2. [Coder] Create src/middleware/rateLimiter.ts
3. [Coder] Mount rate limiter in src/app.ts
4. [QA] Write and execute tests/rateLimiter.test.ts`,
              language: 'text',
            },
            {
              title: 'Coding Agent Implements Code',
              description: 'The Coding Agent edits files in an ephemeral git branch `ai-agent/run-101`.',
            },
            {
              title: 'QA Agent Runs Vitest in Docker Sandbox',
              description: 'Test runner executes tests. If a test fails, the Repair Loop diagnoses the stack trace and commands the Coding Agent to patch the file.',
            },
            {
              title: 'Human Review in Report Workspace',
              description: 'The Report Workspace presents a clean unified diff with test logs, security audit, and credit consumption stats for single-click git merge.',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Autonomous Execution', slug: 'autonomy/autonomous-execution' },
        { title: 'Report Workspace', slug: 'workspace/report-workspace' },
      ],
    },
  },
];
