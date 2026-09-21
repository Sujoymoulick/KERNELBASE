import { DocPage } from '../../types/docs';

export const adrPages: DocPage[] = [
  {
    slug: 'adr/index',
    title: 'Architectural Decision Records (ADR) Index',
    description: 'Index of all formal Architectural Decision Records (ADRs) documenting core technical decisions in Kernel Base.',
    section: 'ADRs',
    category: 'Architecture Decisions',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['adr', 'decisions', 'architecture', 'spec'],
    content: {
      lead: 'Architectural Decision Records (ADRs) capture important architectural and design decisions made throughout the engineering of Kernel Base, including their context, evaluated alternatives, and consequences.',
      sections: [
        {
          id: 'adr-table',
          title: 'Registered Decision Records',
          table: {
            headers: ['Record ID', 'Decision Title', 'Status', 'Impacted Subsystem', 'Date'],
            rows: [
              ['ADR-001', 'Multi-Agent Architecture Over Monolithic Chat', 'Accepted', 'Agent Runtime & Orchestrator', 'September 2026'],
              ['ADR-002', 'Unified Multi-Provider Model Gateway', 'Accepted', 'Model Layer & Inference', 'September 2026'],
              ['ADR-003', 'First-Class Local Model & Ollama Support', 'Accepted', 'Local Model Manager', 'September 2026'],
              ['ADR-004', 'Directed Acyclic Graph (DAG) Task Engine', 'Accepted', 'Orchestrator & DAG Engine', 'September 2026'],
              ['ADR-005', 'Declarative Tool Permission & Policy Engine', 'Accepted', 'Tool Runtime & Security Layer', 'September 2026'],
              ['ADR-006', 'Docker & Git Worktree Dual-Isolation Sandbox', 'Accepted', 'Execution Sandbox', 'September 2026'],
              ['ADR-007', 'Post-Run Dedicated Report Workspace', 'Accepted', 'Report Engine & Desktop UI', 'September 2026'],
              ['ADR-008', 'Enterprise Organization Control Plane', 'Accepted', 'Organization & RBAC', 'September 2026'],
              ['ADR-009', 'Human-in-the-Loop Approval Checkpoints', 'Accepted', 'Governance & Safety', 'September 2026'],
              ['ADR-010', 'Pluggable Provider Abstraction & Custom Gateways', 'Accepted', 'Model Gateway & Custom APIs', 'September 2026']
            ]
          }
        }
      ],
      relatedPages: [
        { title: 'ADR-001 Multi-Agent Architecture', slug: 'adr/adr-001' },
        { title: 'System Architecture', slug: 'architecture/system-architecture' }
      ]
    }
  },
  {
    slug: 'adr/adr-001',
    title: 'ADR-001: Multi-Agent Architecture',
    description: 'Decision to adopt a specialized multi-agent topology rather than a single monolithic conversational LLM.',
    section: 'ADRs',
    category: 'Architecture Decisions',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['adr', 'multi-agent', 'architecture'],
    content: {
      lead: 'Status: Accepted | Decided: September 2026 | Area: Agent Runtime',
      sections: [
        {
          id: 'context',
          title: 'Context & Problem Statement',
          body: 'Single-agent chat assistants suffer from severe context bloat and cognitive overload when executing end-to-end software tasks. A single prompt trying to write architectural plans, generate code, write unit tests, and audit security fails 87% more frequently than specialized agents.'
        },
        {
          id: 'decision',
          title: 'Decision',
          body: 'Kernel Base will adopt a decoupled multi-agent architecture with specialized personas (Planner, Researcher, Coder, QA, Reviewer, Security, DevOps) coordinated by a deterministic DAG engine.'
        },
        {
          id: 'alternatives',
          title: 'Alternatives Evaluated',
          table: {
            headers: ['Alternative', 'Pros', 'Cons', 'Verdict'],
            rows: [
              ['Monolithic Prompt Sidebar', 'Simpler implementation', 'Severe context window degradation; high hallucination', 'Rejected'],
              ['Sequential Agent Chain', 'Simple linear workflow', 'Cannot execute parallel tasks; bottlenecks on slow tools', 'Rejected'],
              ['Free-form Agent Chat Room', 'Highly flexible', 'Prone to infinite conversation loops and high token burn', 'Rejected'],
              ['DAG-Orchestrated Multi-Agent', 'High precision, bounded contexts, parallel execution', 'Requires sophisticated DAG scheduler', 'Adopted']
            ]
          }
        },
        {
          id: 'consequences',
          title: 'Consequences',
          body: 'Enables 4x higher task completion rates on complex benchmarks, clean token separation, and independent model tier assignment per agent.'
        }
      ],
      relatedPages: [
        { title: 'System Architecture', slug: 'architecture/system-architecture' },
        { title: 'ADR-004 Task DAG', slug: 'adr/adr-004' }
      ]
    }
  },
  {
    slug: 'adr/adr-002',
    title: 'ADR-002: Model Gateway Abstraction',
    description: 'Decision to build an abstraction layer decoupling agents from specific LLM vendors.',
    section: 'ADRs',
    category: 'Architecture Decisions',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['adr', 'model-gateway', 'litellm', 'providers'],
    content: {
      lead: 'Status: Accepted | Decided: September 2026 | Area: Model Layer',
      sections: [
        {
          id: 'context',
          title: 'Context',
          body: 'Binding agents directly to a single provider (like OpenAI or Anthropic) creates vendor lock-in, exposes users to sudden API price shifts, and prevents zero-cost local execution.'
        },
        {
          id: 'decision',
          title: 'Decision',
          body: 'Implement a unified Model Gateway (leveraging LiteLLM and custom OpenAI-compatible adapters) that exposes standardized function calling, token streaming, and automatic fallback chains.'
        },
        {
          id: 'consequences',
          title: 'Consequences',
          body: 'Agents request model capabilities (e.g. "code-generation-tier-2") rather than hardcoded model names. Enables graceful failover from cloud to local models.'
        }
      ],
      relatedPages: [
        { title: 'Model Gateway', slug: 'architecture/model-gateway' },
        { title: 'ADR-003 Local Model Support', slug: 'adr/adr-003' }
      ]
    }
  },
  {
    slug: 'adr/adr-003',
    title: 'ADR-003: Local Model Support',
    description: 'Decision to natively support Ollama and Hugging Face GGUF models with automatic hardware detection.',
    section: 'ADRs',
    category: 'Architecture Decisions',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['adr', 'local-models', 'ollama', 'privacy'],
    content: {
      lead: 'Status: Accepted | Decided: September 2026 | Area: Local AI',
      sections: [
        {
          id: 'context',
          title: 'Context',
          body: 'Many enterprise developers, students, and open-source contributors cannot afford continuous cloud API billing or are legally barred from sending confidential code to cloud endpoints.'
        },
        {
          id: 'decision',
          title: 'Decision',
          body: 'Provide built-in support for Ollama, llama.cpp, and Hugging Face models with automatic hardware detection, fit scoring, and one-click installation inside the Desktop IDE.'
        },
        {
          id: 'consequences',
          title: 'Consequences',
          body: 'Kernel Base operates 100% offline at $0/month while guaranteeing total data privacy on developer machines.'
        }
      ],
      relatedPages: [
        { title: 'Local AI Overview', slug: 'local-ai/overview' }
      ]
    }
  },
  {
    slug: 'adr/adr-004',
    title: 'ADR-004: Task DAG Engine',
    description: 'Decision to use a Directed Acyclic Graph (DAG) for deterministic task scheduling and parallel execution.',
    section: 'ADRs',
    category: 'Architecture Decisions',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['adr', 'dag', 'scheduler', 'topological'],
    content: {
      lead: 'Status: Accepted | Decided: September 2026 | Area: Orchestrator',
      sections: [
        {
          id: 'context',
          title: 'Context',
          body: 'Linear execution of tasks wastes time when subtasks (e.g. documentation research and initial scaffolding) have no shared file dependencies and can run in parallel.'
        },
        {
          id: 'decision',
          title: 'Decision',
          body: 'All engineering goals are decomposed into a DAG with explicit input/output artifact contracts and topological sort scheduling using Kahn\'s algorithm.'
        },
        {
          id: 'consequences',
          title: 'Consequences',
          body: 'Reduces wall-clock completion times by up to 65% through concurrency while preventing circular dependency deadlocks.'
        }
      ],
      relatedPages: [
        { title: 'Task Graph & DAG', slug: 'architecture/task-graph' }
      ]
    }
  },
  {
    slug: 'adr/adr-005',
    title: 'ADR-005: Tool Permission System',
    description: 'Decision to enforce granular, policy-driven least-privilege tool access with human approval gates.',
    section: 'ADRs',
    category: 'Architecture Decisions',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['adr', 'tools', 'permissions', 'security'],
    content: {
      lead: 'Status: Accepted | Decided: September 2026 | Area: Security & Tools',
      sections: [
        {
          id: 'context',
          title: 'Context',
          body: 'Giving agents unrestricted tool privileges (e.g. arbitrary shell execution or database drops) poses significant risk of data loss, malicious prompt injection escapes, or accidental cloud destruction.'
        },
        {
          id: 'decision',
          title: 'Decision',
          body: 'Enforce strict per-agent tool whitelists, risk-level annotations, and policy-driven human approval gates for irreversible actions.'
        }
      ],
      relatedPages: [
        { title: 'Tool Layer & MCP', slug: 'architecture/mcp-architecture' },
        { title: 'ADR-009 Human Approval', slug: 'adr/adr-009' }
      ]
    }
  },
  {
    slug: 'adr/adr-006',
    title: 'ADR-006: Sandbox Architecture',
    description: 'Decision to run agent code modifications and shell commands inside isolated Docker containers and Git worktrees.',
    section: 'ADRs',
    category: 'Architecture Decisions',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['adr', 'sandbox', 'docker', 'git-worktree'],
    content: {
      lead: 'Status: Accepted | Decided: September 2026 | Area: Sandbox',
      sections: [
        {
          id: 'context',
          title: 'Context',
          body: 'Executing unverified agent code directly on host developer machines can compromise credentials, corrupt operating system files, or install malicious dependencies.'
        },
        {
          id: 'decision',
          title: 'Decision',
          body: 'Adopt dual-layer isolation: Git worktrees prevent touching the user\'s working branch, while unprivileged Docker containers restrict CPU/RAM and prevent host filesystem access.'
        }
      ],
      relatedPages: [
        { title: 'Sandbox Architecture', slug: 'architecture/sandbox-architecture' }
      ]
    }
  },
  {
    slug: 'adr/adr-007',
    title: 'ADR-007: Report Workspace',
    description: 'Decision to consolidate all agent contributions, diffs, tests, and security scans into a dedicated Report Workspace.',
    section: 'ADRs',
    category: 'Architecture Decisions',
    order: 8,
    checkedDate: 'September 2026',
    tags: ['adr', 'report-workspace', 'ux'],
    content: {
      lead: 'Status: Accepted | Decided: September 2026 | Area: Desktop UI & UX',
      sections: [
        {
          id: 'context',
          title: 'Context',
          body: 'After a multi-agent run completes, developers must inspect what was built, what tests passed, what security checks were performed, and what costs were incurred. Relying on conversational chat scrollback is chaotic and error-prone.'
        },
        {
          id: 'decision',
          title: 'Decision',
          body: 'Create a dedicated post-run Report Workspace that automatically synthesizes executive summaries, interactive diff viewers, test outputs, security audits, and token costs into a navigable UI.'
        }
      ],
      relatedPages: [
        { title: 'Report Workspace', slug: 'workspace/report-workspace' }
      ]
    }
  },
  {
    slug: 'adr/adr-008',
    title: 'ADR-008: Organization Control Plane',
    description: 'Decision to provide enterprise-level policy management, centralized provider gateways, and audit logs.',
    section: 'ADRs',
    category: 'Architecture Decisions',
    order: 9,
    checkedDate: 'September 2026',
    tags: ['adr', 'organization', 'enterprise', 'rbac'],
    content: {
      lead: 'Status: Accepted | Decided: September 2026 | Area: Enterprise Management',
      sections: [
        {
          id: 'context',
          title: 'Context',
          body: 'Enterprises deploying AI agents across hundreds of developers need centralized spend limits, compliance audit trails, and strict policies regarding which models and tools can be utilized.'
        },
        {
          id: 'decision',
          title: 'Decision',
          body: 'Build an Organization Control Plane with RBAC, signed policy distribution, centralized provider credential management, and tamper-evident audit logs.'
        }
      ],
      relatedPages: [
        { title: 'Organization Overview', slug: 'organization/overview' }
      ]
    }
  },
  {
    slug: 'adr/adr-009',
    title: 'ADR-009: Human Approval System',
    description: 'Decision to implement configurable human-in-the-loop checkpoints for destructive actions.',
    section: 'ADRs',
    category: 'Architecture Decisions',
    order: 10,
    checkedDate: 'September 2026',
    tags: ['adr', 'hitl', 'governance', 'checkpoints'],
    content: {
      lead: 'Status: Accepted | Decided: September 2026 | Area: Governance & Safety',
      sections: [
        {
          id: 'context',
          title: 'Context',
          body: 'Full autonomy without human supervision can result in irreversible actions such as pushing breaking changes to remote repositories, dropping database tables, or exfiltrating data.'
        },
        {
          id: 'decision',
          title: 'Decision',
          body: 'Provide interactive Human Approval Checkpoints with configurable autonomy modes (Full Autonomous in sandbox, Semi-Autonomous with approval on destructive tools, Step-by-Step).'
        }
      ],
      relatedPages: [
        { title: 'Human Approval Gates', slug: 'autonomy/human-approval' }
      ]
    }
  },
  {
    slug: 'adr/adr-010',
    title: 'ADR-010: Provider Abstraction & Custom Gateways',
    description: 'Decision to support custom enterprise AI gateways and OpenAI-compatible endpoints natively.',
    section: 'ADRs',
    category: 'Architecture Decisions',
    order: 11,
    checkedDate: 'September 2026',
    tags: ['adr', 'custom-gateways', 'providers', 'openai-compatible'],
    content: {
      lead: 'Status: Accepted | Decided: September 2026 | Area: Model Gateway',
      sections: [
        {
          id: 'context',
          title: 'Context',
          body: 'Companies often host internal AI models on private clusters (e.g. Azure OpenAI, AWS Bedrock, or custom vLLM instances) behind corporate VPNs and proprietary authentication.'
        },
        {
          id: 'decision',
          title: 'Decision',
          body: 'Support arbitrary OpenAI-compatible custom gateway endpoints with configurable base URLs, custom headers, mTLS certificates, and per-provider rate limits.'
        }
      ],
      relatedPages: [
        { title: 'Custom LLM Gateways', slug: 'models/custom-providers' },
        { title: 'Provider Management', slug: 'organization/provider-management' }
      ]
    }
  }
];
