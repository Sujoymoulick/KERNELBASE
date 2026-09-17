import { DocPage } from '../../types/docs';

export const getStartedPages: DocPage[] = [
  {
    slug: 'get-started/overview',
    title: 'Overview',
    description: 'An architectural and technical introduction to the AI-Native Multi-Agent IDE platform.',
    section: 'Get Started',
    category: 'Introduction',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['overview', 'multi-agent', 'ide', 'introduction'],
    content: {
      lead: 'The AI-Native Multi-Agent IDE is an open-source, desktop-first developer platform designed from the ground up for collaborative, autonomous multi-agent software engineering.',
      interactiveComponent: 'architecture-diagram',
      sections: [
        {
          id: 'what-is-it',
          title: 'What is the AI-Native Multi-Agent IDE?',
          body: 'Traditional code editors treat AI as a conversational sidebar or a single-line tab completion engine. The AI-Native Multi-Agent IDE reimagines the editor as a distributed runtime where specialized autonomous agents—Planners, Coders, Researchers, Reviewers, and QA Engineers—collaborate concurrently in an isolated sandbox to plan, write, verify, and repair software.',
          callout: {
            type: 'important',
            title: 'Core Paradigm Shift',
            text: 'Single-agent chat assistants suffer from context drift and failure compounding. The AI-Native IDE treats coding as an iterative graph of discrete, verifiable subtasks assigned to specialized micro-agents with strict capability boundaries.',
          },
        },
        {
          id: 'why-it-exists',
          title: 'Why Does This Project Exist?',
          body: 'Modern software engineering is too broad for a single context window. A real-world pull request requires architectural design, library evaluation, unit test execution, security review, and edge-case diagnosis. Single-agent models hit cognitive saturation and hallucinatory loops when attempting to hold all these responsibilities simultaneously. By decomposing tasks into a Directed Acyclic Graph (DAG) and assigning specialized tools and system prompts to distinct agents, the IDE achieves 4x higher task completion rates on complex refactoring tasks.',
          table: {
            headers: ['Dimension', 'Single-Agent Assistant (Legacy)', 'AI-Native Multi-Agent IDE'],
            rows: [
              ['Task Scope', 'Linear prompt/response, limited memory', 'Dynamic DAG decomposition with dependency tracking'],
              ['Context Window', 'Monolithic (suffers catastrophic forgetting)', 'Scoped per agent (Planner, Coder, QA each get clean contexts)'],
              ['Execution Safety', 'Executes directly on host or requires manual copy-paste', 'Isolated Docker sandbox with worktree branches & permission gates'],
              ['Verification', 'Passive text generation without runtime feedback', 'Autonomous loop: compile -> test -> diagnose -> self-repair'],
              ['Cost & Compute', 'Always burns expensive frontier models', 'Tiered routing: Local Ollama (free) -> OpenRouter -> Frontier'],
            ],
          },
        },
        {
          id: 'high-level-flow',
          title: 'High-Level Execution Topology',
          mermaid: `graph TD
    User([User Goal]) --> UI[Desktop IDE Interface]
    UI --> RM[Run Manager & Event Bus]
    RM --> Orch[Orchestrator]
    Orch --> DAG[Task Graph / DAG Engine]
    DAG --> Reg[Agent Capability Registry]
    Reg --> P[Planner Agent]
    Reg --> C[Coding Agent]
    Reg --> R[Research Agent]
    Reg --> QA[QA & Test Agent]
    C --> SB[(Docker Sandbox)]
    QA --> SB
    SB --> Verif{Test Verification}
    Verif -->|Pass| Report[PR & Summary Report]
    Verif -->|Fail| Repair[Repair Diagnostic Loop]
    Repair --> C`,
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
              title: 'Zero-Cost Student Friendly',
              description: 'Fully functional on 100% free open-source local models (Ollama, DeepSeek, Qwen) or free cloud tiers.',
              badge: 'Accessibility',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'What is the AI-Native IDE?', slug: 'get-started/what-is-ai-native-ide' },
        { title: 'System Architecture', slug: 'architecture/system-architecture' },
        { title: '10-Day MVP Plan', slug: '10-day-mvp/mvp-overview' },
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
          body: 'The IDE surface consists of five synchronized panels designed to expose full transparency into agent reasoning, code diffs, and verification metrics.',
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
    description: 'Fundamental building blocks of the AI-Native IDE: DAGs, Worktrees, MCP, and Sandboxes.',
    section: 'Get Started',
    category: 'Introduction',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['concepts', 'mcp', 'dag', 'sandbox'],
    content: {
      lead: 'Master the fundamental primitives governing state, execution, and safety within the multi-agent IDE.',
      sections: [
        {
          id: 'dag-concept',
          title: '1. Task Graph (DAG)',
          body: 'A Directed Acyclic Graph represents all subtasks required to achieve the user goal. Nodes denote discrete jobs (e.g., "Install bcrypt", "Create User schema", "Write authentication unit tests"). Edges represent strict execution dependencies.',
        },
        {
          id: 'agent-spec-concept',
          title: '2. Agent Specification (AgentSpec)',
          body: 'Every agent in the registry is defined by a declarative specification outlining its system prompt, tool access permissions, model tier, and credit allowance.',
          codeBlocks: [
            {
              filename: 'types/agent.ts',
              language: 'typescript',
              code: `export interface AgentSpec {
  id: string;
  name: string;
  role: 'planner' | 'coder' | 'researcher' | 'qa' | 'reviewer' | 'devops';
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
          title: '3. Docker Sandbox & Git Worktree',
          body: 'To prevent agents from modifying working branch code unintentionally, the IDE creates an isolated Git worktree mounted inside an ephemeral Docker container with resource constraints.',
        },
      ],
      relatedPages: [
        { title: 'System Architecture', slug: 'architecture/system-architecture' },
        { title: 'Credit System', slug: 'architecture/credit-system' },
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
      lead: 'Get the AI-Native Multi-Agent IDE running locally in less than five minutes using open-source tools.',
      sections: [
        {
          id: 'prerequisites',
          title: 'Prerequisites',
          table: {
            headers: ['Software', 'Minimum Version', 'Purpose', 'Free/Open Source?'],
            rows: [
              ['Node.js', 'v20.0.0+ LTS', 'Desktop runtime & API orchestration', 'Yes (MIT)'],
              ['Docker Engine', 'v24.0.0+', 'Container sandbox isolation', 'Yes (Apache 2.0)'],
              ['Git', 'v2.38.0+', 'Repository management & worktrees', 'Yes (GPLv2)'],
              ['Ollama (Optional)', 'v0.5.0+', '100% offline local model inference', 'Yes (MIT)'],
            ],
          },
        },
        {
          id: 'quick-commands',
          title: 'Step-by-Step Setup',
          steps: [
            {
              title: 'Clone the Repository',
              description: 'Clone the official open-source repository.',
              code: 'git clone https://github.com/ai-native-ide/core.git\ncd core',
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
              description: 'Start the orchestrator daemon and development web surface.',
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
              title: 'Human Review & Merge',
              description: 'The IDE presents a clean unified diff with test logs and credit consumption stats for single-click git merge.',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Autonomous Execution', slug: 'autonomy/autonomous-execution' },
        { title: 'Autonomous Test Loop', slug: 'autonomy/test-loop' },
      ],
    },
  },
];
