import { NavSection } from '../types/docs';

export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    id: 'get-started',
    title: 'Get Started',
    badge: 'Guide',
    items: [
      {
        title: 'Introduction',
        items: [
          { title: 'Overview', slug: 'get-started/overview' },
          { title: 'What is the AI-Native IDE?', slug: 'get-started/what-is-ai-native-ide' },
          { title: 'Why Multi-Agent?', slug: 'get-started/why-multi-agent' },
          { title: 'Core Concepts', slug: 'get-started/core-concepts' },
        ],
      },
      {
        title: 'Quick Start',
        items: [
          { title: 'Installation', slug: 'get-started/installation' },
          { title: 'Desktop App Setup', slug: 'get-started/desktop-app' },
          { title: 'First Project', slug: 'get-started/first-project' },
          { title: 'First Multi-Agent Run', slug: 'get-started/first-multi-agent-run' },
        ],
      },
    ],
  },
  {
    id: 'architecture',
    title: 'Architecture',
    badge: 'Core',
    items: [
      {
        title: 'System Foundations',
        items: [
          { title: 'System Architecture', slug: 'architecture/system-architecture' },
          { title: 'Runtime Architecture', slug: 'architecture/runtime-architecture' },
          { title: 'Agent Architecture', slug: 'architecture/agent-architecture' },
          { title: 'Orchestrator', slug: 'architecture/orchestrator' },
        ],
      },
      {
        title: 'Task & State',
        items: [
          { title: 'Task Graph & DAG', slug: 'architecture/task-graph' },
          { title: 'Task Decomposition', slug: 'architecture/task-decomposition' },
          { title: 'Agent Registry', slug: 'architecture/agent-registry' },
          { title: 'Agent Communication', slug: 'architecture/agent-communication' },
          { title: 'Event System & SSE', slug: 'architecture/event-system' },
          { title: 'State Management', slug: 'architecture/state-management' },
        ],
      },
      {
        title: 'Execution & Security',
        items: [
          { title: 'Workspace Isolation', slug: 'architecture/workspace-isolation' },
          { title: 'Sandbox Architecture', slug: 'architecture/sandbox-architecture' },
          { title: 'Verification Architecture', slug: 'architecture/verification-architecture' },
          { title: 'Credit & Budget System', slug: 'architecture/credit-system' },
          { title: 'Model Gateway', slug: 'architecture/model-gateway' },
          { title: 'Tool Layer & MCP', slug: 'architecture/mcp-architecture' },
          { title: 'Security Model', slug: 'architecture/security-model' },
        ],
      },
    ],
  },
  {
    id: 'agents',
    title: 'Agents',
    badge: 'Catalog',
    items: [
      {
        title: 'Agent Directory',
        items: [
          { title: 'Agent System Overview', slug: 'agents/agent-system' },
          { title: 'Planner Agent', slug: 'agents/planner-agent' },
          { title: 'Orchestrator Agent', slug: 'agents/orchestrator-agent' },
          { title: 'Coding Agent', slug: 'agents/coding-agent' },
          { title: 'Debugger Agent', slug: 'agents/debugger-agent' },
          { title: 'Research Agent', slug: 'agents/research-agent' },
          { title: 'Data Analyst Agent', slug: 'agents/data-analyst-agent' },
          { title: 'QA & Testing Agent', slug: 'agents/qa-agent' },
          { title: 'Code Review Agent', slug: 'agents/reviewer-agent' },
          { title: 'Security Agent', slug: 'agents/security-agent' },
          { title: 'UI/UX Agent', slug: 'agents/ui-ux-agent' },
          { title: 'SEO Agent', slug: 'agents/seo-agent' },
          { title: 'Documentation Agent', slug: 'agents/documentation-agent' },
          { title: 'DevOps Agent', slug: 'agents/devops-agent' },
          { title: 'Report Agent', slug: 'agents/report-agent' },
        ],
      },
      {
        title: 'Custom Agents & Config',
        items: [
          { title: 'Creating Custom Agents', slug: 'agents/creating-custom-agents' },
          { title: 'Capability Registry', slug: 'agents/capability-registry' },
          { title: 'Agent Permissions', slug: 'agents/agent-permissions' },
          { title: 'Context Management', slug: 'agents/agent-context-management' },
        ],
      },
    ],
  },
  {
    id: 'agent-teams',
    title: 'Agent Teams',
    badge: 'Teams',
    items: [
      {
        title: 'Team System',
        items: [
          { title: 'Agent Teams Overview', slug: 'agent-teams/overview' },
          { title: 'Predefined Teams', slug: 'agent-teams/predefined-teams' },
          { title: 'Custom Teams', slug: 'agent-teams/custom-teams' },
          { title: 'Team Execution Flow', slug: 'agent-teams/team-execution' },
          { title: 'Collaboration Patterns', slug: 'agent-teams/collaboration-patterns' },
        ],
      },
    ],
  },
  {
    id: 'autonomy',
    title: 'Autonomy',
    badge: 'Loop',
    items: [
      {
        title: 'Autonomous Engine',
        items: [
          { title: 'Autonomous Execution', slug: 'autonomy/autonomous-execution' },
          { title: 'Task Planning', slug: 'autonomy/task-planning' },
          { title: 'Parallel Execution', slug: 'autonomy/parallel-execution' },
          { title: 'Dependency Resolution', slug: 'autonomy/dependency-resolution' },
        ],
      },
      {
        title: 'Test & Repair Loop',
        items: [
          { title: 'Autonomous Test Loop', slug: 'autonomy/test-loop' },
          { title: 'Failure Diagnosis', slug: 'autonomy/failure-diagnosis' },
          { title: 'Automatic Repair', slug: 'autonomy/repair-loop' },
          { title: 'Retesting & Retry Limits', slug: 'autonomy/retry-limits' },
        ],
      },
      {
        title: 'Governance',
        items: [
          { title: 'Human-in-the-Loop', slug: 'autonomy/human-in-the-loop' },
          { title: 'Human Approval Gates', slug: 'autonomy/human-approval' },
          { title: 'Autonomous Safety Bounds', slug: 'autonomy/autonomous-safety' },
        ],
      },
    ],
  },
  {
    id: 'models',
    title: 'Models',
    badge: 'Gateway',
    items: [
      {
        title: 'Model Routing & Gateway',
        items: [
          { title: 'Model Architecture', slug: 'models/model-architecture' },
          { title: 'Model Router & Gateway', slug: 'models/model-router' },
          { title: 'Custom LLM Gateways', slug: 'models/custom-providers' },
          { title: 'Automatic Model Selection', slug: 'models/automatic-model-selection' },
          { title: 'LiteLLM Integration', slug: 'models/litellm' },
          { title: 'Ollama (Local Tier 1)', slug: 'models/ollama' },
          { title: 'OpenRouter (Tier 2 Cloud)', slug: 'models/openrouter' },
        ],
      },
      {
        title: 'Cost & Resource Controls',
        items: [
          { title: 'Local & Free Models', slug: 'models/local-free-models' },
          { title: 'Model Selection & Fallbacks', slug: 'models/model-selection' },
          { title: 'Token & Cost Management', slug: 'models/token-cost-management' },
          { title: 'Resource & AI Limits', slug: 'models/resource-limits' },
          { title: 'Credit Calculation Engine', slug: 'models/credit-calculation' },
        ],
      },
    ],
  },
  {
    id: 'local-ai',
    title: 'Local AI',
    badge: 'On-Device',
    items: [
      {
        title: 'Local Model Manager',
        items: [
          { title: 'Local AI Overview', slug: 'local-ai/overview' },
          { title: 'Hardware Detection & Profiling', slug: 'local-ai/hardware-detection' },
          { title: 'Model Discovery & Installation', slug: 'local-ai/model-discovery' },
          { title: 'Ollama Runtime Integration', slug: 'local-ai/ollama-runtime' },
          { title: 'Hugging Face Integration', slug: 'local-ai/huggingface' },
          { title: 'llama.cpp & Other Runtimes', slug: 'local-ai/llama-cpp' },
          { title: 'Automatic Model Recommendations', slug: 'local-ai/model-recommendations' },
          { title: 'Health & Resource Monitoring', slug: 'local-ai/health-monitoring' },
        ],
      },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & MCP',
    badge: 'MCP Std',
    items: [
      {
        title: 'Standard Protocols',
        items: [
          { title: 'Model Context Protocol (MCP)', slug: 'tools/mcp' },
          { title: 'Filesystem Tools', slug: 'tools/filesystem' },
          { title: 'Terminal & Command Runner', slug: 'tools/terminal' },
          { title: 'Git & Worktree Isolation', slug: 'tools/git' },
        ],
      },
      {
        title: 'Execution Environments',
        items: [
          { title: 'Docker Execution Sandbox', slug: 'tools/docker' },
          { title: 'Browser & Playwright Automation', slug: 'tools/playwright' },
          { title: 'Database (PostgreSQL / SQLite)', slug: 'tools/postgresql' },
          { title: 'Custom Tool Registry & Permissions', slug: 'tools/custom-tools' },
        ],
      },
    ],
  },
  {
    id: 'desktop',
    title: 'Desktop App',
    badge: 'UI / Runtime',
    items: [
      {
        title: 'Desktop System',
        items: [
          { title: 'Desktop Architecture', slug: 'desktop/desktop-architecture' },
          { title: 'Runtime & IPC Communication', slug: 'desktop/runtime-ipc' },
          { title: 'Local Agent Engine', slug: 'desktop/local-agent-runtime' },
          { title: 'Workspace & File Explorer', slug: 'desktop/local-workspace' },
        ],
      },
      {
        title: 'IDE Modules',
        items: [
          { title: 'Terminal & Docker Bridges', slug: 'desktop/docker-terminal-integration' },
          { title: 'Agent Activity & Task Panel', slug: 'desktop/agent-manager' },
          { title: 'Project & Credit Logs', slug: 'desktop/project-manager' },
          { title: 'Desktop Security Model', slug: 'desktop/desktop-security' },
        ],
      },
    ],
  },
  {
    id: 'workspace',
    title: 'Workspace',
    badge: 'Reports',
    items: [
      {
        title: 'Project Workspace',
        items: [
          { title: 'Workspace Architecture Overview', slug: 'workspace/overview' },
          { title: 'Task Management & Lifecycle', slug: 'workspace/task-management' },
          { title: 'Artifact Architecture & Management', slug: 'workspace/artifact-system' },
        ],
      },
      {
        title: 'Report Workspace',
        items: [
          { title: 'Report Workspace', slug: 'workspace/report-workspace' },
          { title: 'Report Generation Engine', slug: 'workspace/report-generation' },
          { title: 'Report Export & Integrations', slug: 'workspace/report-export' },
        ],
      },
    ],
  },
  {
    id: 'free-tech-stack',
    title: 'Free Tech Stack',
    badge: 'Zero-Cost',
    items: [
      {
        title: 'Student & Zero-Cost Stack',
        items: [
          { title: 'Open-Source Stack Directory', slug: 'free-tech-stack/open-source-stack' },
          { title: 'Free LLM Options & Local AI', slug: 'free-tech-stack/free-llms' },
          { title: 'Free Databases & Hosting', slug: 'free-tech-stack/free-infra' },
          { title: 'Free CI/CD, Search & Storage', slug: 'free-tech-stack/free-devops' },
          { title: 'Student Budget Architecture ($0/mo)', slug: 'free-tech-stack/student-budget' },
        ],
      },
    ],
  },
  {
    id: 'build',
    title: 'Build & Implementation',
    badge: 'Code / API',
    items: [
      {
        title: 'Codebase Foundations',
        items: [
          { title: 'Development Environment', slug: 'build/dev-environment' },
          { title: 'Repository Structure', slug: 'build/repo-structure' },
          { title: 'Database Schema', slug: 'build/database-schema' },
          { title: 'REST API & WebSocket Specs', slug: 'build/api-architecture' },
        ],
      },
      {
        title: 'Core Engine Impl',
        items: [
          { title: 'Agent Registry Implementation', slug: 'build/agent-registry-impl' },
          { title: 'Orchestrator DAG Engine', slug: 'build/orchestrator-impl' },
          { title: 'Verification Engine', slug: 'build/verification-impl' },
          { title: 'Credit System Implementation', slug: 'build/credit-system-impl' },
        ],
      },
    ],
  },
  {
    id: '10-day-mvp',
    title: '10-Day MVP Plan',
    badge: 'Sprint',
    items: [
      {
        title: 'Daily Roadmap',
        items: [
          { title: '10-Day Sprint Overview', slug: '10-day-mvp/mvp-overview' },
          { title: 'Day 1 — Architecture & Workspace', slug: '10-day-mvp/day-1-architecture' },
          { title: 'Day 2 — Agent Registry & MCP', slug: '10-day-mvp/day-2-agent-registry' },
          { title: 'Day 3 — Orchestrator & DAG', slug: '10-day-mvp/day-3-orchestrator' },
          { title: 'Day 4 — Coding Agent Sandbox', slug: '10-day-mvp/day-4-coding-agent' },
          { title: 'Day 5 — Research Agent & Web', slug: '10-day-mvp/day-5-research-agent' },
          { title: 'Day 6 — QA Agent & Test Loop', slug: '10-day-mvp/day-6-qa-agent' },
          { title: 'Day 7 — Failure Diagnosis & Repair', slug: '10-day-mvp/day-7-repair-loop' },
          { title: 'Day 8 — Credit System & Rate Limiting', slug: '10-day-mvp/day-8-credits' },
          { title: 'Day 9 — Desktop UI & Multi-Panel', slug: '10-day-mvp/day-9-desktop-ui' },
          { title: 'Day 10 — Verification & First Release', slug: '10-day-mvp/day-10-testing-release' },
        ],
      },
    ],
  },
  {
    id: 'research',
    title: 'Research',
    badge: 'Papers',
    items: [
      {
        title: 'Academic & Industry Research',
        items: [
          { title: 'Multi-Agent Systems & Topologies', slug: 'research/multi-agent-systems' },
          { title: 'Desktop Runtime Matrix (Electron vs Tauri)', slug: 'research/desktop-frameworks' },
          { title: 'Autonomous Coding & Repair', slug: 'research/autonomous-coding' },
          { title: 'Sandbox Security in Agentic IDEs', slug: 'research/sandbox-security' },
          { title: 'LLM Cost Optimization Techniques', slug: 'research/cost-optimization' },
          { title: 'Open-Source Landscape & Competitors', slug: 'research/competitive-analysis' },
        ],
      },
    ],
  },
  {
    id: 'resources',
    title: 'Resources',
    badge: 'Tools',
    items: [
      {
        title: 'Ecosystem & Libraries',
        items: [
          { title: 'LangGraph vs Custom DAGs', slug: 'resources/langgraph' },
          { title: 'OpenHands & Cline Analysis', slug: 'resources/openhands-cline' },
          { title: 'Model Context Protocol (MCP) Guide', slug: 'resources/mcp' },
          { title: 'LiteLLM & Ollama Manual', slug: 'resources/litellm-ollama' },
          { title: 'Docker, Playwright & Redis', slug: 'resources/docker-playwright' },
        ],
      },
    ],
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    badge: '2026-2027',
    items: [
      {
        title: 'Releases & Future',
        items: [
          { title: 'Release Milestones (MVP → v1.0)', slug: 'roadmap/release-milestones' },
          { title: 'Desktop & Cloud Collaboration', slug: 'roadmap/desktop-cloud' },
          { title: 'Agent Marketplace & A2A Protocol', slug: 'roadmap/marketplace-a2a' },
        ],
      },
    ],
  },
  {
    id: 'organization',
    title: 'Organization',
    badge: 'Enterprise',
    items: [
      {
        title: 'Team Management',
        items: [
          { title: 'Organization Overview', slug: 'organization/overview' },
          { title: 'Members, Roles & Teams', slug: 'organization/members-teams' },
          { title: 'Organization Policies', slug: 'organization/policies' },
          { title: 'Model & Provider Management', slug: 'organization/provider-management' },
        ],
      },
      {
        title: 'Compliance & Security',
        items: [
          { title: 'Usage, Token & Cost Tracking', slug: 'organization/usage-tracking' },
          { title: 'Audit Logging & Compliance', slug: 'organization/audit-logs' },
          { title: 'Privacy & Local-Only Architecture', slug: 'organization/privacy' },
        ],
      },
    ],
  },
  {
    id: 'adr',
    title: 'ADRs',
    badge: 'Decisions',
    items: [
      {
        title: 'Architecture Decisions',
        items: [
          { title: 'ADR Index', slug: 'adr/index' },
          { title: 'ADR-001 Multi-Agent Architecture', slug: 'adr/adr-001' },
          { title: 'ADR-002 Model Gateway Abstraction', slug: 'adr/adr-002' },
          { title: 'ADR-003 Local Model Support', slug: 'adr/adr-003' },
          { title: 'ADR-004 Task DAG Engine', slug: 'adr/adr-004' },
          { title: 'ADR-005 Tool Permission System', slug: 'adr/adr-005' },
          { title: 'ADR-006 Sandbox Architecture', slug: 'adr/adr-006' },
          { title: 'ADR-007 Report Workspace', slug: 'adr/adr-007' },
          { title: 'ADR-008 Organization Architecture', slug: 'adr/adr-008' },
          { title: 'ADR-009 Human Approval Checkpoints', slug: 'adr/adr-009' },
          { title: 'ADR-010 Provider Abstraction', slug: 'adr/adr-010' },
        ],
      },
    ],
  },
  {
    id: 'reference',
    title: 'Reference',
    badge: 'API / Spec',
    items: [
      {
        title: 'Specifications',
        items: [
          { title: 'Glossary of Terms', slug: 'reference/glossary' },
          { title: 'Environment Variables & Config', slug: 'reference/env-config' },
          { title: 'REST & WebSocket API Reference', slug: 'reference/api-reference' },
          { title: 'Agent, Task & Event Schemas', slug: 'reference/schemas' },
          { title: 'Security Checklist & Troubleshooting', slug: 'reference/security-troubleshooting' },
          { title: 'Frequently Asked Questions (FAQ)', slug: 'reference/faq' },
        ],
      },
    ],
  },
];
