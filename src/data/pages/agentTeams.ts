import { DocPage } from '../../types/docs';

export const agentTeamsPages: DocPage[] = [
  {
    slug: 'agent-teams/overview',
    title: 'Agent Teams Overview',
    description: 'Architecture and coordination of specialized agent teams executing complex engineering and research tasks.',
    section: 'Agent Teams',
    category: 'Team System',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['agent-teams', 'multi-agent', 'orchestration', 'collaboration'],
    content: {
      lead: 'Agent Teams in Kernel Base represent coordinated groups of specialized autonomous agents configured to collaborate on complex development, research, analysis, and engineering tasks with shared context and defined communication topologies.',
      sections: [
        {
          id: 'what-are-teams',
          title: 'Why Agent Teams?',
          body: 'Single-agent architectures struggle with complex tasks due to cognitive saturation, context window dilution, and competing prompt objectives. Kernel Base introduces Agent Teams: cohesive units where each agent retains a specialized role (Planner, Researcher, Coder, QA, Security, Reviewer), dedicated tool access, and distinct model pairings.',
          callout: {
            type: 'important',
            title: 'Specialization Over Monoliths',
            text: 'Rather than forcing a single LLM to simultaneously plan architecture, write code, run security audits, and execute test suites, Kernel Base distributes responsibilities across a team coordinated by a DAG orchestrator.'
          }
        },
        {
          id: 'team-topologies',
          title: 'Team Collaboration Topologies',
          body: 'Kernel Base supports three primary coordination topologies depending on task complexity and independence:',
          mermaid: `graph TD
    subgraph Topology A [Sequential Pipeline]
        P1[Planner] --> C1[Coder] --> Q1[QA] --> R1[Reviewer]
    end
    subgraph Topology B [Parallel Fan-Out / Fan-In]
        P2[Planner] --> R2A[Research Agent]
        P2 --> R2B[Data Agent]
        P2 --> C2[Coding Agent]
        R2A --> S2[Sync / Aggregator]
        R2B --> S2
        C2 --> S2
        S2 --> Q2[QA Agent]
    end
    subgraph Topology C [Hierarchical Review Gates]
        C3[Coding Agent] --> T3[Testing Agent]
        T3 --> S3[Security Agent]
        S3 --> Rev3[Reviewer Agent]
        Rev3 -->|Approved| Done[Report Engine]
        Rev3 -->|Needs Fix| C3
    end`,
          diagramTitle: 'Agent Team Coordination Topologies'
        },
        {
          id: 'team-comparison',
          title: 'Agent Configuration Models',
          table: {
            headers: ['Model', 'Composition', 'Coordination', 'Best For'],
            rows: [
              ['Solo Agent', 'Single specialized agent', 'Direct prompt-response loop', 'Quick single-file edits, documentation lookups'],
              ['Predefined Team', 'Curated multi-agent template', 'Standard DAG workflow with verification', 'Full-stack features, security audits, migrations'],
              ['Custom Team', 'User-defined agent roster & tools', 'Configurable DAG & approval gates', 'Domain-specific enterprise workflows, custom pipelines'],
              ['Auto-Selected Team', 'Dynamically assembled by Planner', 'Dynamic DAG based on goal analysis', 'Open-ended ambiguous software goals']
            ]
          }
        }
      ],
      relatedPages: [
        { title: 'Predefined Teams', slug: 'agent-teams/predefined-teams' },
        { title: 'Team Execution Flow', slug: 'agent-teams/team-execution' },
        { title: 'Agent Catalog', slug: 'agents/agent-system' }
      ]
    }
  },
  {
    slug: 'agent-teams/predefined-teams',
    title: 'Predefined Teams',
    description: 'Production-ready agent team templates built into Kernel Base for common development, QA, and security workflows.',
    section: 'Agent Teams',
    category: 'Team System',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['teams', 'templates', 'catalog', 'predefined'],
    content: {
      lead: 'Kernel Base includes pre-configured team templates optimized for standard software engineering patterns, balancing throughput, token cost, and verification rigour.',
      sections: [
        {
          id: 'team-catalog',
          title: 'Built-in Team Catalog',
          table: {
            headers: ['Team Template', 'Agent Roster', 'Primary Use Case', 'Default Execution Pattern'],
            rows: [
              ['Full-Stack Feature Team', 'Planner, Researcher, Coding Agent, QA Agent, Reviewer, DevOps', 'End-to-end full-stack feature development with automated tests', 'Parallel research/code + sequential QA & review'],
              ['Bug Hunter & Repair Team', 'Planner, Debugger Agent, Coding Agent, Testing Agent', 'Root-cause diagnosis and regression test patch generation', 'Iterative test-repair loop'],
              ['Security & Compliance Team', 'Planner, Security Agent, Code Review Agent, Documentation Agent', 'Vulnerability scanning, AST audit, secret detection, SARIF reports', 'Sequential inspection pipeline'],
              ['Data & Migration Team', 'Planner, Data Agent, Coding Agent, Testing Agent', 'SQL schema migrations, zero-downtime alterations, data profiling', 'Transactional dry-run with verification'],
              ['UI/UX & Accessibility Team', 'Planner, UI/UX Agent, Coding Agent, QA Agent (Playwright)', 'Design system implementation, responsive layouts, a11y checks', 'Component authoring with visual diff testing'],
              ['Research & Architecture Team', 'Planner, Research Agent (x2), Documentation Agent', 'Technology evaluation, RFC authoring, competitive analysis', 'Fan-out web research with synthesis'],
              ['Documentation & SEO Team', 'Planner, Documentation Agent, SEO Agent, Reviewer Agent', 'API docs, README generation, metadata optimization, diagramming', 'Pipeline generation with lint verification']
            ]
          }
        },
        {
          id: 'team-selection-ui',
          title: 'Selecting and Launching Teams',
          body: 'Users can trigger predefined teams from the Desktop IDE Command Palette (`Cmd+K` -> "Launch Team: Full-Stack Feature"), via the Teams sidebar panel, or programmatically through the REST API.',
          codeBlocks: [
            {
              filename: 'launch-team-request.json',
              language: 'json',
              code: `{
  "teamId": "full-stack-feature-team",
  "goal": "Implement Stripe webhook handling with idempotency and retry logic",
  "projectPath": "/Users/developer/code/billing-service",
  "modelTier": "auto",
  "budgetLimitCredits": 300,
  "approvalMode": "semi-autonomous"
}`
            }
          ]
        }
      ],
      relatedPages: [
        { title: 'Custom Teams', slug: 'agent-teams/custom-teams' },
        { title: 'Team Execution Flow', slug: 'agent-teams/team-execution' }
      ]
    }
  },
  {
    slug: 'agent-teams/custom-teams',
    title: 'Custom Teams',
    description: 'Defining, configuring, and sharing custom agent team specifications for organization-specific workflows.',
    section: 'Agent Teams',
    category: 'Team System',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['custom-teams', 'configuration', 'json', 'teams'],
    content: {
      lead: 'Organizations can define custom agent team templates with specific agent combinations, customized system prompts, dedicated tool whitelists, and model routing overrides.',
      sections: [
        {
          id: 'team-config-schema',
          title: 'Custom Team Specification Schema',
          body: 'Custom teams are stored in `.ai-ide/teams/*.json` within the workspace or centralized in the Organization Control Plane.',
          codeBlocks: [
            {
              filename: '.ai-ide/teams/fintech-compliance-team.json',
              language: 'json',
              code: `{
  "id": "fintech-compliance-team",
  "name": "Fintech Compliance & Audit Team",
  "version": "1.2.0",
  "description": "Enforces strict financial auditing, PCI-DSS compliance, and zero-leakage policies",
  "agents": [
    {
      "agentId": "planner-agent",
      "modelOverride": "tier2-cloud",
      "role": "lead-architect"
    },
    {
      "agentId": "coding-agent",
      "modelOverride": "tier3-frontier",
      "role": "secure-implementer",
      "toolWhitelist": ["fs.read", "fs.edit", "git.branch"]
    },
    {
      "agentId": "security-agent",
      "modelOverride": "tier3-frontier",
      "role": "compliance-auditor",
      "toolWhitelist": ["security.trufflehog", "security.bandit", "security.semgrep"],
      "strictMode": true
    },
    {
      "agentId": "testing-agent",
      "modelOverride": "tier1-local",
      "role": "unit-tester"
    },
    {
      "agentId": "report-agent",
      "modelOverride": "tier1-local",
      "role": "audit-summarizer"
    }
  ],
  "topology": "hierarchical-gate",
  "budgetLimits": {
    "maxCredits": 600,
    "maxExecutionMinutes": 45,
    "maxConcurrentAgents": 3
  },
  "requiredApprovalCheckpoints": [
    "fs.delete",
    "git.push",
    "network.outbound"
  ]
}`
            }
          ]
        },
        {
          id: 'team-lifecycle',
          title: 'Team Lifecycle Management',
          steps: [
            {
              title: '1. Definition',
              description: 'Create the team specification JSON or configure it visually via the Team Builder UI.'
            },
            {
              title: '2. Validation',
              description: 'Kernel Base validates that all referenced agents, tools, and model gateways are available and licensed.'
            },
            {
              title: '3. Registration',
              description: 'The team appears in the IDE Team Picker and becomes callable via `@team-name` in chat or task runs.'
            },
            {
              title: '4. Governance & Sync',
              description: 'Teams can be committed to Git repo (`.ai-ide/teams/`) or synced organization-wide via Cloud Control Plane.'
            }
          ]
        }
      ],
      relatedPages: [
        { title: 'Agent Collaboration Patterns', slug: 'agent-teams/collaboration-patterns' },
        { title: 'Organization Policies', slug: 'organization/policies' }
      ]
    }
  },
  {
    slug: 'agent-teams/team-execution',
    title: 'Team Execution Flow',
    description: 'End-to-end orchestration flow of multi-agent teams executing across the Task Graph DAG with shared state.',
    section: 'Agent Teams',
    category: 'Team System',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['execution', 'dag', 'shared-state', 'orchestrator'],
    content: {
      lead: 'When an Agent Team is invoked, the Orchestrator executes a structured multi-stage workflow from goal decomposition to final report generation.',
      sections: [
        {
          id: 'execution-workflow',
          title: 'The Team Execution Pipeline',
          mermaid: `sequenceDiagram
    autonumber
    actor User as Developer
    participant UI as Desktop IDE UI
    participant Orch as DAG Orchestrator
    participant Team as Agent Team
    participant MG as Model Gateway
    participant Tool as Tool Runtime & Sandbox
    participant Rep as Report Engine

    User->>UI: Submit Task: "Add Webhook Retry Architecture"
    UI->>Orch: Initialize Team Run (Full-Stack Team)
    Orch->>Team: Invoke Planner Agent
    Team->>MG: Generate DAG Plan
    MG-->>Team: Return 5-Node DAG
    Orch->>UI: Stream DAG Initialized Event

    par Parallel Execution
        Orch->>Team: Dispatch Research Agent (Examine Stripe Specs)
        Team->>Tool: Search Web / MCP Docs
        and
        Orch->>Team: Dispatch Coding Agent (Scaffold Handlers)
        Team->>Tool: Write files in Git Worktree
    end

    Orch->>Team: Dispatch QA Agent (Run Vitest Suite)
    Tool-->>Team: Test Output (Pass 4, Fail 1)
    Team->>Team: Auto-Repair Diagnostic & Patch
    Tool-->>Team: Test Output (Pass 5, Fail 0)

    Orch->>Team: Dispatch Security Agent (Scan CVEs & Secrets)
    Team-->>Orch: Security Verdict: Clean

    Orch->>Rep: Consolidate Artifacts & Logs
    Rep-->>UI: Render Final Report Workspace
    UI->>User: Display Diffs, Tests, Security & Summary`,
          diagramTitle: 'End-to-End Team Execution Sequence'
        },
        {
          id: 'shared-task-state',
          title: 'Shared Task State Architecture',
          body: 'Agents in a team do not share an unwieldy conversational transcript. Instead, they interact via a strongly typed Shared Task State persisted in SQLite and synchronized via the Event Bus:',
          codeBlocks: [
            {
              filename: 'types/shared-task-state.ts',
              language: 'typescript',
              code: `export interface SharedTaskState {
  runId: string;
  teamId: string;
  goal: string;
  status: 'PLANNING' | 'EXECUTING' | 'VERIFYING' | 'COMPLETED' | 'FAILED';
  dag: {
    nodes: TaskNode[];
    edges: { from: string; to: string }[];
  };
  artifacts: ArtifactReference[];
  decisions: ArchitecturalDecision[];
  agentOutputs: Record<string, AgentExecutionSummary>;
  verification: {
    testSuiteResults: TestVerdict[];
    securityAudit: SecurityScanResult;
    linterStatus: LintReport;
  };
  resourceMetrics: {
    totalTokens: { input: number; output: number };
    creditsBurned: number;
    costUsd: number;
    wallClockDurationMs: number;
  };
}`
            }
          ]
        }
      ],
      relatedPages: [
        { title: 'Agent Collaboration Patterns', slug: 'agent-teams/collaboration-patterns' },
        { title: 'Report Workspace', slug: 'workspace/report-workspace' }
      ]
    }
  },
  {
    slug: 'agent-teams/collaboration-patterns',
    title: 'Agent Collaboration Patterns',
    description: 'Design patterns for agent-to-agent communication, artifact handoffs, and verification gates in multi-agent systems.',
    section: 'Agent Teams',
    category: 'Team System',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['patterns', 'collaboration', 'handoffs', 'gates'],
    content: {
      lead: 'Formal collaboration patterns ensure that agent teams operate deterministically, avoiding infinite discussion loops, conflicting edits, and context drift.',
      sections: [
        {
          id: 'collaboration-patterns-table',
          title: 'Core Multi-Agent Patterns',
          table: {
            headers: ['Pattern Name', 'Mechanism', 'Failure Mode Mitigated', 'Applicable Agent Pairs'],
            rows: [
              ['Contract Handoff', 'Upstream agent produces typed artifact schema; downstream consumes it as strict input', 'Ambiguous prompt interpretations', 'Planner → Coder; Data Analyst → Coder'],
              ['Adversarial Verification', 'QA agent independently writes tests against spec before reading Coder\'s implementation', 'Blind confirmation bias in self-testing', 'Coder ↔ QA / Testing Agent'],
              ['Security Gatekeeper', 'Security agent halts pipeline if CVE, secret, or unsafe shell command is detected', 'Accidental deployment of vulnerabilities', 'Coder → Security Agent → Reviewer'],
              ['Context Pruning Summarizer', 'Intermediate agent compresses large logs/diffs into structured markdown before handoff', 'Context window exhaustion in downstream agents', 'Researcher → Planner; QA → Repair Loop'],
              ['Parallel Worktree Partitioning', 'Coders operate on separate Git worktree sub-branches with explicit file path locks', 'Git merge conflicts & race conditions', 'Coding Agent A ↔ Coding Agent B']
            ]
          }
        },
        {
          id: 'preventing-loops',
          title: 'Infinite Loop Prevention Mechanism',
          callout: {
            type: 'important',
            title: 'Deterministic Termination Guarantee',
            text: 'Kernel Base forbids open-ended conversation loops between agents. Every interaction must be triggered by a DAG node transition with a maximum retry ceiling (default: 3) and hard timeout limits.'
          }
        }
      ],
      relatedPages: [
        { title: 'Agent Teams Overview', slug: 'agent-teams/overview' },
        { title: 'Autonomous Test Loop', slug: 'autonomy/test-loop' }
      ]
    }
  }
];
