import { DocPage } from '../../types/docs';

export const referencePages: DocPage[] = [
  {
    slug: 'reference/glossary',
    title: 'Glossary of Terms',
    description: 'Definitions of core multi-agent and system engineering terminology used throughout the documentation.',
    section: 'Reference',
    category: 'Specifications',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['glossary', 'terms', 'definitions'],
    content: {
      lead: 'Standardized vocabulary for the AI-Native IDE architecture and autonomous agent systems.',
      sections: [
        {
          id: 'terms-table',
          title: 'Architectural Terminology',
          table: {
            headers: ['Term', 'Definition'],
            rows: [
              ['Task Graph (DAG)', 'A Directed Acyclic Graph encoding subtasks and strict topological execution dependencies.'],
              ['AgentSpec', 'Declarative configuration defining an agent\'s system prompt, capabilities, and permitted tools.'],
              ['Model Context Protocol (MCP)', 'Open protocol developed by Anthropic for connecting LLM agents to tools and resources over JSON-RPC.'],
              ['Git Worktree', 'A Git primitive that allows checking out multiple branches simultaneously into separate directories on disk.'],
              ['Docker Sandbox', 'An isolated container running untrusted agent-generated code with cgroups CPU/memory quotas.'],
              ['Repair Loop', 'Automated feedback cycle where failing test logs trigger diagnostic reflection and surgical code patches.'],
              ['Credit Budget', 'Hierarchical quota system regulating the number of model inference tokens an agent may burn.'],
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
    tags: ['env', 'config', 'reference'],
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
              ['SANDBOX_ENGINE', 'docker', 'Sandbox virtualization engine (docker or local-process)', 'No'],
              ['DEFAULT_RUN_CREDITS', '200', 'Default credit allowance allocated per run', 'No'],
              ['MAX_PARALLEL_AGENTS', '3', 'Maximum concurrent agent subprocesses', 'No'],
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
    tags: ['api', 'rest', 'endpoints', 'json'],
    content: {
      lead: 'Interact programmatically with the local daemon via REST and Server-Sent Events.',
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
  "eventsUrl": "/api/runs/run_98f12a/events"
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Agent, Task & Event Schemas', slug: 'reference/schemas' },
      ],
    },
  },
  {
    slug: 'reference/schemas',
    title: 'Agent, Task & Event Schemas',
    description: 'JSON Schema and TypeScript definitions for AgentSpec, TaskNode, and SSE event payloads.',
    section: 'Reference',
    category: 'Specifications',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['schema', 'json-schema', 'typescript'],
    content: {
      lead: 'Strict JSON schema contracts governing all internal serialization in the multi-agent IDE.',
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
  role: 'planner' | 'coder' | 'qa' | 'reviewer' | 'researcher' | 'devops';
  systemPrompt: string;
  capabilities: string[];
  tools: string[];
}

export interface TaskNode {
  id: string;
  title: string;
  assignedAgent: string;
  dependencies: string[];
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

export interface AgentTelemetryEvent {
  runId: string;
  agentId: string;
  taskId: string;
  timestamp: number;
  type: 'THOUGHT' | 'TOOL_CALL' | 'DIFF' | 'TEST_RESULT' | 'CREDIT_UPDATE';
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
      lead: 'Straightforward answers to the most common questions about the AI-Native Multi-Agent IDE.',
      sections: [
        {
          id: 'faq-list',
          title: 'Common Questions',
          cards: [
            {
              title: 'Can I use this 100% offline without internet?',
              description: 'Yes. With Ollama and local Docker installed, all planning, coding, and testing run completely offline on your local CPU/GPU.',
              badge: 'Offline',
            },
            {
              title: 'Will the agents modify my current git work without permission?',
              description: 'Never. Agents operate on isolated Git worktrees and require explicit human approval before merging diffs into your working branch.',
              badge: 'Safe',
            },
            {
              title: 'Is this project free for students and commercial use?',
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
