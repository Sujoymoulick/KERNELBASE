import { DocPage } from '../../types/docs';

export const agentsPages: DocPage[] = [
  {
    slug: 'agents/agent-system',
    title: 'Agent System Overview',
    description: 'Overview of the 11 specialized agent personas, collaboration topologies, and capability matching.',
    section: 'Agents',
    category: 'Agent Directory',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['agents', 'personas', 'system-overview'],
    content: {
      lead: 'The AI-Native Multi-Agent IDE provides 11 built-in specialized agent personas, each engineered with specialized system prompts, tool whitelists, and validation metrics.',
      interactiveComponent: 'agent-spec',
      sections: [
        {
          id: 'agent-matrix',
          title: 'Built-in Agent Personas',
          table: {
            headers: ['Agent Persona', 'Primary Responsibility', 'Default Model Tier', 'Key Tools'],
            rows: [
              ['Planner', 'High-level architectural decomposition & DAG construction', 'Tier 1 Local / Tier 2 Cloud', 'read_tree, read_manifest'],
              ['Orchestrator', 'Runtime scheduling, dependency checks, agent assignment', 'Deterministic Code', 'task_graph_api, event_bus'],
              ['Coder', 'Source code modification, algorithmic implementation', 'Tier 2 Cloud / Tier 3 Frontier', 'read_file, edit_file, create_file'],
              ['Researcher', 'Documentation search, library evaluations, API specs', 'Tier 2 Cloud / Search', 'web_search, fetch_docs, query_mcp'],
              ['Data Analyst', 'SQL query generation, schema migrations, data profiling', 'Tier 2 Cloud', 'sql_query, python_exec, csv_profile'],
              ['QA & Tester', 'Unit/integration test generation, edge-case analysis', 'Tier 2 Cloud / Tier 1 Local', 'terminal_exec, npm_test, parse_tap'],
              ['Reviewer', 'Code quality audits, stylistic adherence, refactoring', 'Tier 2 Cloud', 'git_diff, ast_lint, complexity_check'],
              ['DevOps', 'Dockerfiles, CI/CD workflows, build scripts, packaging', 'Tier 2 Cloud', 'dockerfile_lint, github_actions_val'],
              ['Security', 'Vulnerability scanning, secret detection, input sanitization', 'Tier 2 Cloud / Tier 3', 'trufflehog_scan, bandit_check'],
              ['Documentation', 'API docs, README generation, architectural schemas', 'Tier 1 Local', 'write_markdown, generate_mermaid'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Coding Agent', slug: 'agents/coding-agent' },
        { title: 'QA Agent', slug: 'agents/qa-agent' },
        { title: 'Creating Custom Agents', slug: 'agents/creating-custom-agents' },
      ],
    },
  },
  {
    slug: 'agents/planner-agent',
    title: 'Planner Agent',
    description: 'Specialized agent for decomposing user goals into dependency-ordered DAGs.',
    section: 'Agents',
    category: 'Agent Directory',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['planner', 'dag', 'architecture'],
    content: {
      lead: 'The Planner Agent never writes application code. Its sole objective is to inspect the project structure, identify dependencies, and emit a structured Task Graph.',
      sections: [
        {
          id: 'planner-prompt',
          title: 'System Prompt Architecture',
          codeBlocks: [
            {
              filename: 'prompts/planner.system.md',
              language: 'markdown',
              code: `You are the Lead Architectural Planner Agent for an AI-Native IDE.
Your task is to decompose the user's high-level goal into an optimal, acyclic Task Graph (DAG).
RULES:
1. Every task must be assigned to exactly one specialized agent (coder, researcher, qa, devops, security).
2. Decompose large goals into atomic steps affecting no more than 3-5 related files.
3. Establish strict dependencies: tests and data schemas must be written or prepared before dependent business logic.
4. Output strictly valid JSON matching the TaskGraph schema.`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Task Decomposition', slug: 'architecture/task-decomposition' },
        { title: 'Orchestrator Agent', slug: 'agents/orchestrator-agent' },
      ],
    },
  },
  {
    slug: 'agents/orchestrator-agent',
    title: 'Orchestrator Agent',
    description: 'Deterministic supervisor managing task dispatching, DAG traversal, and credit limits.',
    section: 'Agents',
    category: 'Agent Directory',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['orchestrator', 'supervision', 'scheduling'],
    content: {
      lead: 'The Orchestrator Agent balances deterministic algorithmic scheduling with dynamic failure handling and budget allocation.',
      sections: [
        {
          id: 'orchestrator-role',
          title: 'Hybrid Algorithmic & LLM Supervision',
          body: 'Unlike purely prompt-based orchestrators, the AI-Native IDE Orchestrator uses deterministic TypeScript code for DAG topological sorting and event dispatching, invoking an LLM only when dynamic replanning or ambiguous conflict resolution is required.',
        },
      ],
      relatedPages: [
        { title: 'Orchestrator Engine', slug: 'architecture/orchestrator' },
        { title: 'Autonomous Execution', slug: 'autonomy/autonomous-execution' },
      ],
    },
  },
  {
    slug: 'agents/coding-agent',
    title: 'Coding Agent',
    description: 'Precision implementation agent with AST awareness, surgical diffing, and sandbox tools.',
    section: 'Agents',
    category: 'Agent Directory',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['coder', 'implementation', 'diff', 'ast'],
    content: {
      lead: 'The Coding Agent performs source code generation, surgical block editing, and atomic file creation within an ephemeral Git worktree.',
      sections: [
        {
          id: 'surgical-diffing',
          title: 'Surgical Diff Protocol vs Full-File Rewrite',
          body: 'Rewriting entire 500-line files wastes tokens and introduces syntax omissions. The Coding Agent uses an AST-aware surgical diffing protocol that replaces only target blocks with verified character accuracy.',
          codeBlocks: [
            {
              filename: 'tools/edit_file.json',
              language: 'json',
              code: `{
  "tool": "edit_file",
  "arguments": {
    "filePath": "src/services/payment.ts",
    "targetContent": "async processPayment(amount: number) {\\n    return this.gateway.charge(amount);\\n  }",
    "replacementContent": "async processPayment(amount: number, idempotencyKey: string) {\\n    if (!idempotencyKey) throw new Error('Missing idempotencyKey');\\n    return this.gateway.chargeWithKey(amount, idempotencyKey);\\n  }"
  }
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'QA Agent', slug: 'agents/qa-agent' },
        { title: 'Filesystem Tools', slug: 'tools/filesystem' },
      ],
    },
  },
  {
    slug: 'agents/research-agent',
    title: 'Research Agent',
    description: 'Web, MCP, and documentation search agent summarizing external APIs, libraries, and best practices.',
    section: 'Agents',
    category: 'Agent Directory',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['researcher', 'web-search', 'docs', 'mcp'],
    content: {
      lead: 'The Research Agent resolves external library changes, verifies API endpoints, and prevents code hallucination by querying live documentation.',
      sections: [
        {
          id: 'researcher-flow',
          title: 'Documentation Grounding Loop',
          body: 'Before the Coding Agent writes code against a new third-party package, the Research Agent fetches the package\'s latest export types, release notes, and deprecation warnings.',
        },
      ],
      relatedPages: [
        { title: 'Browser & Playwright Automation', slug: 'tools/playwright' },
        { title: 'Model Context Protocol (MCP)', slug: 'tools/mcp' },
      ],
    },
  },
  {
    slug: 'agents/data-analyst-agent',
    title: 'Data Analyst Agent',
    description: 'Database schema modeling, SQL query optimization, data migrations, and profile benchmarks.',
    section: 'Agents',
    category: 'Agent Directory',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['data', 'sql', 'postgres', 'migrations'],
    content: {
      lead: 'The Data Analyst Agent specializes in relational data modeling, query explain-plans, and migration safety.',
      sections: [
        {
          id: 'migration-safety',
          title: 'Zero-Downtime Migration Policy',
          body: 'The Data Analyst Agent evaluates migrations against zero-downtime rules (e.g. forbidding table locks, requiring non-null column additions to have safe defaults, and isolating index creation).',
        },
      ],
      relatedPages: [
        { title: 'Database (PostgreSQL / SQLite)', slug: 'tools/postgresql' },
      ],
    },
  },
  {
    slug: 'agents/qa-agent',
    title: 'QA Agent',
    description: 'Automated test suite generation, adversarial fuzzing, and test-driven verification in sandbox.',
    section: 'Agents',
    category: 'Agent Directory',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['qa', 'tests', 'vitest', 'verification'],
    content: {
      lead: 'The QA Agent operates with an adversarial mindset, seeking to break the Coding Agent\'s implementations through edge-case test suites.',
      sections: [
        {
          id: 'qa-strategy',
          title: 'Test Generation Methodology',
          body: 'The QA Agent inspects the function interface and systematically generates: 1) Happy path scenarios, 2) Boundary condition tests (empty strings, integer overflows, nullables), 3) Error handling verification, and 4) Concurrency race conditions.',
        },
      ],
      relatedPages: [
        { title: 'Autonomous Test Loop', slug: 'autonomy/test-loop' },
        { title: 'Verification Architecture', slug: 'architecture/verification-architecture' },
      ],
    },
  },
  {
    slug: 'agents/reviewer-agent',
    title: 'Reviewer Agent',
    description: 'Static analysis, architectural adherence, cyclomatic complexity auditing, and pull request reviews.',
    section: 'Agents',
    category: 'Agent Directory',
    order: 8,
    checkedDate: 'September 2026',
    tags: ['reviewer', 'linting', 'pr-review', 'ast'],
    content: {
      lead: 'The Reviewer Agent simulates a senior software engineer conducting a rigorous code review on all agent-generated pull requests.',
      sections: [
        {
          id: 'review-criteria',
          title: 'Code Review Checklist',
          table: {
            headers: ['Inspection Area', 'Passing Standard', 'Automated Check'],
            rows: [
              ['Type Safety', 'No implicit any, strict null checks enabled', 'tsc --noEmit'],
              ['Complexity', 'Cyclomatic complexity <= 10 per function', 'eslint complexity rule'],
              ['Error Handling', 'All promise rejections handled, custom error types', 'AST visitor check'],
              ['Documentation', 'Exported interfaces have TSDoc comments', 'typedoc validator'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Security Agent', slug: 'agents/security-agent' },
      ],
    },
  },
  {
    slug: 'agents/devops-agent',
    title: 'DevOps Agent',
    description: 'Container definitions, multi-stage Docker builds, GitHub Actions workflows, and deployment manifests.',
    section: 'Agents',
    category: 'Agent Directory',
    order: 9,
    checkedDate: 'September 2026',
    tags: ['devops', 'docker', 'ci-cd', 'github-actions'],
    content: {
      lead: 'The DevOps Agent creates production-ready CI/CD automation pipelines, hardened Dockerfiles, and packaging scripts.',
      sections: [
        {
          id: 'devops-capabilities',
          title: 'Hardened Dockerfile Generation',
          body: 'The agent enforces unprivileged execution (`USER nonroot`), minimal base images (Alpine or distroless), and multi-stage builds to optimize image layer caching.',
        },
      ],
      relatedPages: [
        { title: 'Free CI/CD, Search & Storage', slug: 'free-tech-stack/free-devops' },
      ],
    },
  },
  {
    slug: 'agents/security-agent',
    title: 'Security Agent',
    description: 'Vulnerability triage, secret leakage detection, dependency CVE scanning, and AST security rules.',
    section: 'Agents',
    category: 'Agent Directory',
    order: 10,
    checkedDate: 'September 2026',
    tags: ['security', 'cve', 'audit', 'trufflehog'],
    content: {
      lead: 'The Security Agent intercepts every tool call and file change to prevent credential leaks, prompt injections, and vulnerable dependencies.',
      sections: [
        {
          id: 'secret-leak-detection',
          title: 'Entropy & Pattern Secret Scanning',
          body: 'Any commit or tool output containing high-entropy strings matching AWS keys, GitHub tokens, or private keys is immediately sanitized and flagged for user approval.',
        },
      ],
      relatedPages: [
        { title: 'Security Model', slug: 'architecture/security-model' },
      ],
    },
  },
  {
    slug: 'agents/documentation-agent',
    title: 'Documentation Agent',
    description: 'Automated API reference generation, architectural Mermaid diagramming, and README maintenance.',
    section: 'Agents',
    category: 'Agent Directory',
    order: 11,
    checkedDate: 'September 2026',
    tags: ['docs', 'mermaid', 'readme', 'api-reference'],
    content: {
      lead: 'The Documentation Agent ensures that codebase documentation, API references, and Mermaid architecture diagrams stay synchronized with code changes.',
      sections: [
        {
          id: 'diagram-generation',
          title: 'Automatic Mermaid Diagram Maintenance',
          body: 'Whenever models or architectural dependencies change, the Documentation Agent updates the project\'s system architecture diagrams automatically.',
        },
      ],
      relatedPages: [
        { title: 'Model Context Protocol (MCP) Guide', slug: 'resources/mcp' },
      ],
    },
  },
  {
    slug: 'agents/creating-custom-agents',
    title: 'Creating Custom Agents',
    description: 'Step-by-step tutorial on defining, registering, and testing bespoke agent personas with custom tools.',
    section: 'Agents',
    category: 'Custom Agents',
    order: 12,
    checkedDate: 'September 2026',
    tags: ['custom-agent', 'tutorial', 'sdk'],
    content: {
      lead: 'Extend the IDE with custom agents tailored to your organization\'s proprietary frameworks, internal APIs, or domain workflows.',
      sections: [
        {
          id: 'step-by-step-agent',
          title: 'Tutorial: Creating a "LocalizationAgent"',
          steps: [
            {
              title: '1. Create the Agent Specification File',
              description: 'Define the agent metadata, system prompt, and allowed tools in `.ai-ide/agents/localization.json`.',
              code: `{
  "id": "localization-agent",
  "name": "Localization Agent",
  "description": "Translates UI strings and maintains i18n JSON translation bundles",
  "capabilities": ["i18n", "json-editing", "translation"],
  "tools": ["fs.read_file", "fs.edit_file", "mcp.translate"],
  "modelPreference": {
    "primary": "openrouter/qwen-2.5-coder-32b",
    "fallback": "ollama/qwen2.5-coder:7b"
  },
  "budget": {
    "maxCredits": 50
  }
}`,
              language: 'json',
            },
            {
              title: '2. Register in Agent Registry',
              description: 'The IDE automatically loads custom specifications from `.ai-ide/agents/*.json` on startup.',
            },
            {
              title: '3. Test the Custom Agent',
              description: 'Invoke the agent directly in the command palette: `@localization-agent Add Spanish and French translations for auth error messages`.',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Agent Capability Registry', slug: 'agents/capability-registry' },
        { title: 'Agent System Overview', slug: 'agents/agent-system' },
      ],
    },
  },
  {
    slug: 'agents/capability-registry',
    title: 'Agent Capability Registry',
    description: 'How tasks are matched to agents based on capability tags, languages, and performance benchmarks.',
    section: 'Agents',
    category: 'Custom Agents',
    order: 13,
    checkedDate: 'September 2026',
    tags: ['capability', 'matching', 'registry'],
    content: {
      lead: 'The Capability Registry enables dynamic plug-and-play matching between task requirements and registered agent skills.',
      sections: [
        {
          id: 'tag-scoring',
          title: 'Capability Scoring Algorithm',
          body: 'The matcher calculates compatibility scores based on programming language, framework familiarity, and historical success rates on similar tasks.',
        },
      ],
      relatedPages: [
        { title: 'Agent Registry', slug: 'architecture/agent-registry' },
      ],
    },
  },
  {
    slug: 'agents/agent-permissions',
    title: 'Agent Permissions',
    description: 'Granular least-privilege security controls governing filesystem, terminal, and network access per agent.',
    section: 'Agents',
    category: 'Custom Agents',
    order: 14,
    checkedDate: 'September 2026',
    tags: ['permissions', 'security', 'least-privilege'],
    content: {
      lead: 'Each agent is bound by strict least-privilege permissions. Research agents cannot write files; review agents cannot run shell commands.',
      sections: [
        {
          id: 'permission-flags',
          title: 'Configurable Permission Flags',
          table: {
            headers: ['Permission Flag', 'Allowed Action', 'Default Assigned Agents'],
            rows: [
              ['canWriteFiles', 'Edit or create files on disk', 'Coding Agent, DevOps Agent, Doc Agent'],
              ['canRunShell', 'Execute commands inside Docker sandbox', 'QA Agent, DevOps Agent'],
              ['canAccessInternet', 'Query outbound HTTP / search APIs', 'Research Agent'],
              ['canModifyGit', 'Create branches, commit worktree diffs', 'Orchestrator Agent'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Security Model', slug: 'architecture/security-model' },
      ],
    },
  },
  {
    slug: 'agents/agent-context-management',
    title: 'Agent Context Management',
    description: 'Context pruning, AST summarizing, and token compression strategies keeping conversations under 8k tokens.',
    section: 'Agents',
    category: 'Custom Agents',
    order: 15,
    checkedDate: 'September 2026',
    tags: ['context', 'compression', 'tokens', 'ast'],
    content: {
      lead: 'Context management prunes noisy output, compresses stack traces, and replaces full files with AST interface signatures to maintain peak LLM attention.',
      sections: [
        {
          id: 'compression-techniques',
          title: 'Context Optimization Techniques',
          cards: [
            {
              title: 'AST Interface Extraction',
              description: 'Replaces large dependency files with their TypeScript `type` and `interface` declarations, reducing tokens by 80%.',
              badge: 'Token Saver',
            },
            {
              title: 'Stack Trace Truncation',
              description: 'Filters out node_modules frames from test logs, isolating only repository source code locations.',
              badge: 'Clean Context',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Token & Cost Management', slug: 'models/token-cost-management' },
      ],
    },
  },
];
