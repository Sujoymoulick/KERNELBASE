import { DocPage } from '../../types/docs';

export const referencePages: DocPage[] = [
  {
    slug: 'reference/glossary',
    title: 'Glossary of Terms',
    description: 'Definitions of core multi-agent and system engineering terminology used throughout Kernel Base.',
    section: 'Reference',
    category: 'Specifications',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['glossary', 'terms', 'definitions', 'terminology'],
    content: {
      lead: 'Standardized vocabulary for the Kernel Base AI-Native Multi-Agent IDE architecture and autonomous agent systems.',
      sections: [
        {
          id: 'terms-table',
          title: 'Architectural Terminology',
          table: {
            headers: ['Term', 'Definition'],
            rows: [
              ['Task Graph (DAG)', 'A Directed Acyclic Graph encoding atomic subtasks and topological execution dependencies.'],
              ['AgentSpec', 'Declarative configuration defining an agent\'s system prompt, capabilities, and permitted tools.'],
              ['Agent Team', 'A cohesive group of specialized agents assigned to execute a complex multi-stage goal collaboratively.'],
              ['Model Gateway', 'Unified multi-provider abstraction layer routing prompts across cloud, custom enterprise, and local models.'],
              ['Local Model Manager', 'Subsystem providing hardware profiling, model discovery, and one-click Ollama/GGUF installation.'],
              ['Model Context Protocol (MCP)', 'Open standard developed by Anthropic for connecting LLM agents to tools and resources over JSON-RPC.'],
              ['Git Worktree Isolation', 'Git primitive allowing agents to make edits on separate branches in isolated directories without touching the active editor.'],
              ['Docker Sandbox', 'Ephemeral container running untrusted agent-generated commands with strict cgroups CPU/memory quotas.'],
              ['Report Workspace', 'Dedicated post-run interactive interface consolidating executive summaries, AST diffs, test logs, security scans, and token costs.'],
              ['Organization Control Plane', 'Centralized enterprise governance system managing RBAC, spending ceilings, model policies, and audit logs.'],
              ['Circuit Breaker', 'Safety mechanism that pauses agent execution when repetitive loops, identical diffs, or budget limits are detected.'],
              ['Repair Loop', 'Automated feedback cycle where failing test logs trigger diagnostic reflection and surgical code patches.']
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Environment Variables & Config', slug: 'reference/env-config' },
        { title: 'REST & WebSocket API Reference', slug: 'reference/api-reference' },
      ],
    },
  },
  {
    slug: 'reference/env-config',
    title: 'Environment Variables & Config',
    description: 'Complete reference of daemon environment variables, project configs, and sandbox parameters.',
    section: 'Reference',
    category: 'Specifications',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['env', 'config', 'reference', 'variables'],
    content: {
      lead: 'All configuration options can be passed via environment variables, `.env` files, or `.ai-ide/config.json`.',
      sections: [
        {
          id: 'env-table',
          title: 'Daemon Environment Variables',
          table: {
            headers: ['Variable Name', 'Default Value', 'Description', 'Required?'],
            rows: [
              ['PORT', '3000', 'Local HTTP & WebSocket server port', 'No'],
              ['OLLAMA_API_BASE', 'http://localhost:11434', 'Local Ollama endpoint for Tier 1 inference', 'No'],
              ['OPENROUTER_API_KEY', '""', 'API key for Tier 2 cloud free/paid models', 'Optional'],
              ['ANTHROPIC_API_KEY', '""', 'API key for Claude 3.5 Sonnet frontier models', 'Optional'],
              ['OPENAI_API_KEY', '""', 'API key for GPT-4o frontier models', 'Optional'],
              ['CUSTOM_LLM_GATEWAY_URL', '""', 'Base URL for custom enterprise OpenAI-compatible gateway', 'Optional'],
              ['SANDBOX_ENGINE', 'docker', 'Sandbox virtualization engine (docker or local-process)', 'No'],
              ['DEFAULT_RUN_CREDITS', '200', 'Default credit allowance allocated per run', 'No'],
              ['MAX_PARALLEL_AGENTS', '3', 'Maximum concurrent agent subprocesses', 'No'],
              ['PRIVACY_MODE', 'hybrid', 'Default execution privacy mode (cloud, hybrid, local-only)', 'No'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'REST & WebSocket API Reference', slug: 'reference/api-reference' },
      ],
    },
  },
  {
    slug: 'reference/api-reference',
    title: 'REST & WebSocket API Reference',
    description: 'Formal HTTP endpoints, request bodies, query parameters, and Server-Sent Event formats.',
    section: 'Reference',
    category: 'Specifications',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['api', 'rest', 'endpoints', 'json', 'websocket'],
    content: {
      lead: 'Interact programmatically with the local Kernel Base daemon via REST and Server-Sent Events.',
      sections: [
        {
          id: 'post-run',
          title: 'POST /api/runs',
          body: 'Create and launch a new autonomous run.',
          codeBlocks: [
            {
              filename: 'request.json',
              language: 'json',
              code: `{
  "goal": "Refactor authentication service to use Argon2",
  "projectPath": "/Users/developer/code/my-service",
  "teamId": "full-stack-feature-team",
  "modelTier": "auto",
  "maxCredits": 250,
  "autoApprove": false
}`,
            },
            {
              filename: 'response.json',
              language: 'json',
              code: `{
  "runId": "run_98f12a",
  "status": "PLANNING",
  "createdAt": 1726588800000,
  "eventsUrl": "/api/runs/run_98f12a/events",
  "reportUrl": "/api/runs/run_98f12a/report"
}`,
            },
          ],
        },
        {
          id: 'get-report',
          title: 'GET /api/runs/:runId/report',
          body: 'Fetch the structured report bundle produced by the Report Engine.',
          codeBlocks: [
            {
              filename: 'report-response.json',
              language: 'json',
              code: `{
  "runId": "run_98f12a",
  "status": "SUCCESS",
  "summary": "Implemented Argon2 password hashing with 100% test coverage",
  "durationMs": 34800,
  "totalCostUsd": 0.00,
  "filesModified": ["src/auth/password.ts", "tests/password.test.ts"],
  "testsPassed": 8,
  "securityAuditsPassed": true
}`
            }
          ]
        }
      ],
      relatedPages: [
        { title: 'Agent, Task & Event Schemas', slug: 'reference/schemas' },
      ],
    },
  },
  {
    slug: 'reference/schemas',
    title: 'Agent, Task, Report & Event Schemas',
    description: 'JSON Schema and TypeScript definitions for AgentSpec, TaskNode, ReportRecord, and SSE event payloads.',
    section: 'Reference',
    category: 'Specifications',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['schema', 'json-schema', 'typescript', 'types'],
    content: {
      lead: 'Strict JSON schema contracts governing all internal serialization in Kernel Base.',
      sections: [
        {
          id: 'schemas-code',
          title: 'Complete Core Type Definitions',
          codeBlocks: [
            {
              filename: 'types.ts',
              language: 'typescript',
              code: `export interface AgentSpec {
  id: string;
  name: string;
  role: 'planner' | 'coder' | 'qa' | 'reviewer' | 'researcher' | 'devops' | 'debugger' | 'security' | 'report';
  systemPrompt: string;
  capabilities: string[];
  tools: string[];
}

export interface TaskNode {
  id: string;
  title: string;
  assignedAgent: string;
  dependencies: string[];
  status: 'PENDING' | 'SCHEDULED' | 'RUNNING' | 'VERIFYING' | 'COMPLETED' | 'FAILED' | 'REPAIRING';
  retryCount: number;
}

export interface ReportRecord {
  runId: string;
  goal: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  executiveSummary: string;
  filesModified: { path: string; additions: number; deletions: number }[];
  testResults: { total: number; passed: number; failed: number };
  securityFindings: { severity: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'; description: string }[];
  decisions: { decision: string; rationale: string }[];
  costMetrics: { totalTokens: number; costUsd: number; localTokensRatio: number };
}

export interface AgentTelemetryEvent {
  runId: string;
  agentId: string;
  taskId: string;
  timestamp: number;
  type: 'THOUGHT' | 'TOOL_CALL' | 'DIFF' | 'TEST_RESULT' | 'CREDIT_UPDATE' | 'REPORT_READY';
  payload: Record<string, unknown>;
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Security Checklist & Troubleshooting', slug: 'reference/security-troubleshooting' },
      ],
    },
  },
  {
    slug: 'reference/security-troubleshooting',
    title: 'Security Checklist & Troubleshooting',
    description: 'Hardening verification checklists, common error codes, and recovery procedures.',
    section: 'Reference',
    category: 'Specifications',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['security', 'troubleshooting', 'checklist', 'errors'],
    content: {
      lead: 'Comprehensive production verification checklist and resolution guide for common operational errors.',
      sections: [
        {
          id: 'troubleshooting-table',
          title: 'Common Operational Error Codes',
          table: {
            headers: ['Error Code', 'Cause', 'Resolution'],
            rows: [
              ['ERR_SANDBOX_DOCKER_DOWN', 'Docker daemon is not running on host machine', 'Start Docker Desktop or run `sudo systemctl start docker`'],
              ['ERR_CREDITS_EXHAUSTED', 'Run consumed all assigned credit allowance', 'Increase `maxCredits` in run settings or switch to Tier 1 Local models'],
              ['ERR_REPAIR_CIRCUIT_BREAKER', 'Agent failed 3 consecutive test repair attempts', 'Inspect test failure logs; provide manual prompt guidance or fix syntax'],
              ['ERR_WORKTREE_LOCK', 'Another agent holds a lock on the requested file', 'Wait for task completion or check git worktree status'],
              ['ERR_LOCAL_MODEL_OOM', 'Local model parameter size exceeded available VRAM/RAM', 'Switch to a lower parameter size (e.g. 7B instead of 32B) or higher quantization (Q4_K_M)'],
              ['ERR_POLICY_VIOLATION', 'Model request blocked by Organization Policy', 'Check organization allowed models or run in local-only mode'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Frequently Asked Questions (FAQ)', slug: 'reference/faq' },
      ],
    },
  },
  {
    slug: 'reference/faq',
    title: 'Frequently Asked Questions (FAQ)',
    description: 'Answers to frequently asked technical, licensing, and architectural questions.',
    section: 'Reference',
    category: 'Specifications',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['faq', 'questions', 'support'],
    content: {
      lead: 'Straightforward answers to the most common questions about the Kernel Base AI-Native Multi-Agent IDE.',
      sections: [
        {
          id: 'faq-list',
          title: 'Common Questions',
          cards: [
            {
              title: 'Can I use Kernel Base 100% offline without internet?',
              description: 'Yes. With Ollama / llama.cpp and local Docker installed, all task planning, coding, and testing run completely offline on your local CPU/GPU with $0 API costs.',
              badge: 'Offline',
            },
            {
              title: 'Will the agents modify my current git work without permission?',
              description: 'Never. Agents operate on isolated Git worktrees and require explicit human approval before merging diffs into your working branch.',
              badge: 'Safe',
            },
            {
              title: 'Can our company connect internal AI endpoints & private vLLM clusters?',
              description: 'Yes. The Model Gateway supports any OpenAI-compatible custom gateway with configurable base URLs, custom headers, and mTLS certificates.',
              badge: 'Enterprise',
            },
            {
              title: 'What is the Report Workspace?',
              description: 'The Report Workspace is a dedicated post-run interface that automatically consolidates all agent contributions, interactive AST diffs, test logs, and security audits into a single navigable pane.',
              badge: 'Reports',
            },
            {
              title: 'Is this project free for students and open-source use?',
              description: 'Yes. The core IDE, orchestrator, and default agent specifications are published under the permissive MIT Open Source license.',
              badge: 'MIT License',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Overview', slug: 'get-started/overview' },
      ],
    },
  },
];
