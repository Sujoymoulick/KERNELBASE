import { DocPage } from '../../types/docs';

export const workspacePages: DocPage[] = [
  {
    slug: 'workspace/overview',
    title: 'Workspace Architecture Overview',
    description: 'Structure of the Kernel Base Workspace: Project boundaries, task lifecycle, artifact trees, and report generation.',
    section: 'Workspace',
    category: 'Project Workspace',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['workspace', 'projects', 'artifacts', 'reports'],
    content: {
      lead: 'The Kernel Base Workspace is the persistent execution environment governing project contexts, task trees, produced artifacts, and post-run reports across multiple agent runs.',
      sections: [
        {
          id: 'workspace-entities',
          title: 'Core Workspace Entities',
          mermaid: `graph TD
    Project[Project Root] --> Config[.ai-ide Project Config]
    Project --> Runs[Agent Execution Runs]
    Runs --> Tasks[Task Graph / DAG Nodes]
    Tasks --> AgentLogs[Agent Thoughts & Traces]
    Tasks --> Artifacts[Artifact System]
    Tasks --> Verification[Test & Security Outputs]
    Runs --> ReportWS[Report Workspace]
    ReportWS --> Summary[Summary & Highlights]
    ReportWS --> DiffViewer[Interactive Diff Viewer]
    ReportWS --> TestResults[Test Logs & Coverage]
    ReportWS --> SecReport[Security Audit Report]
    ReportWS --> Export[Export Markdown / HTML / JSON]`,
          diagramTitle: 'Workspace Entity Hierarchy'
        },
        {
          id: 'workspace-isolation-guarantee',
          title: 'Clean Workspace Boundary',
          body: 'All agent state, run metadata, SQLite run logs, and temporary worktrees are encapsulated inside `.ai-ide/` in the project root, keeping the user\'s active working tree completely clean and version-control friendly.'
        }
      ],
      relatedPages: [
        { title: 'Task Management', slug: 'workspace/task-management' },
        { title: 'Artifact System', slug: 'workspace/artifact-system' },
        { title: 'Report Workspace', slug: 'workspace/report-workspace' }
      ]
    }
  },
  {
    slug: 'workspace/task-management',
    title: 'Task Management & Lifecycle',
    description: 'Granular tracking of user goals, subtask transitions, retry states, and multi-agent assignment.',
    section: 'Workspace',
    category: 'Project Workspace',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['tasks', 'lifecycle', 'states', 'management'],
    content: {
      lead: 'Every engineering assignment decomposes into discrete tasks that transition through formal state boundaries, ensuring deterministic execution and crash resilience.',
      sections: [
        {
          id: 'task-state-machine',
          title: 'Task State Transition Lifecycle',
          mermaid: `stateDiagram-v2
    [*] --> PENDING: Decomposed by Planner
    PENDING --> SCHEDULED: Dependencies Satisfied
    SCHEDULED --> EXECUTING: Assigned to Agent
    EXECUTING --> AWAITING_APPROVAL: High-Risk Action Triggered
    AWAITING_APPROVAL --> EXECUTING: Approved by User
    AWAITING_APPROVAL --> FAILED: Denied / Aborted
    EXECUTING --> VERIFYING: Code Edits Completed
    VERIFYING --> COMPLETED: Tests & Linters Pass
    VERIFYING --> REPAIRING: Tests Failed (Attempt < 3)
    REPAIRING --> EXECUTING: Diagnostic Patch Generated
    VERIFYING --> ESCALATED: Max Retries Exceeded
    COMPLETED --> [*]
    FAILED --> [*]`,
          diagramTitle: 'Task Node State Transitions'
        },
        {
          id: 'task-metrics-schema',
          title: 'Task Telemetry Schema',
          codeBlocks: [
            {
              filename: 'types/task-record.ts',
              language: 'typescript',
              code: `export interface TaskRecord {
  id: string;
  runId: string;
  title: string;
  description: string;
  assignedAgent: string;
  modelUsed: string;
  dependencies: string[];
  status: 'PENDING' | 'SCHEDULED' | 'EXECUTING' | 'VERIFYING' | 'COMPLETED' | 'FAILED' | 'ESCALATED';
  retryCount: number;
  inputArtifacts: string[];
  outputArtifacts: string[];
  timing: {
    scheduledAt: number;
    startedAt?: number;
    completedAt?: number;
    durationMs?: number;
  };
  metrics: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    toolCallCount: number;
  };
}`
            }
          ]
        }
      ],
      relatedPages: [
        { title: 'Artifact System', slug: 'workspace/artifact-system' },
        { title: 'Task Graph & DAG', slug: 'architecture/task-graph' }
      ]
    }
  },
  {
    slug: 'workspace/artifact-system',
    title: 'Artifact Architecture & Management',
    description: 'Immutable, versioned artifact storage for code diffs, research briefs, test reports, and security scans.',
    section: 'Workspace',
    category: 'Project Workspace',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['artifacts', 'diffs', 'storage', 'versioning'],
    content: {
      lead: 'Artifacts represent the concrete, verifiable outputs generated by agents during execution. Every artifact is cryptographically hashed, versioned, and linked to its parent task.',
      sections: [
        {
          id: 'artifact-taxonomy',
          title: 'Artifact Taxonomy & Formats',
          table: {
            headers: ['Artifact Category', 'Typical Producer', 'Format / Schema', 'Primary Consumer'],
            rows: [
              ['Code Diff & AST Patch', 'Coding Agent', 'Unified Diff / Tree-Sitter Edit', 'Git Worktree & Reviewer Agent'],
              ['Research Brief', 'Research Agent', 'Structured Markdown + Citations', 'Planner & Coding Agent'],
              ['Test Suite & TAP Verdict', 'QA / Testing Agent', 'JSON / TAP / JUnit XML', 'Repair Loop & Verification Engine'],
              ['Security & Vulnerability Audit', 'Security Agent', 'SARIF v2.1.0 / Markdown', 'Reviewer Agent & Report Workspace'],
              ['Database Migration Plan', 'Data Analyst Agent', 'SQL Migration + Rollback Script', 'Developer Approval Modal'],
              ['Architecture Diagram', 'Documentation Agent', 'Mermaid.js / SVG', 'Report Workspace & Project Docs']
            ]
          }
        },
        {
          id: 'artifact-linking',
          title: 'Provenance & Lineage Tracking',
          callout: {
            type: 'tip',
            title: 'Full Audit Lineage',
            text: 'Every line of generated code can be traced backward through its parent artifact to the exact model prompt, tool output, test verdict, and human approval that produced it.'
          }
        }
      ],
      relatedPages: [
        { title: 'Report Workspace', slug: 'workspace/report-workspace' },
        { title: 'Verification Architecture', slug: 'architecture/verification-architecture' }
      ]
    }
  },
  {
    slug: 'workspace/report-workspace',
    title: 'Report Workspace',
    description: 'The dedicated post-run analytics and review workspace consolidating all agent contributions into a single pane.',
    section: 'Workspace',
    category: 'Report Workspace',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['report-workspace', 'reports', 'diff-viewer', 'summary', 'audit'],
    content: {
      lead: 'The Report Workspace is a premier feature of Kernel Base. When an agent run completes, it generates a comprehensive, interactive workspace consolidating executive summaries, file diffs, test logs, security scans, architectural decisions, and token costs.',
      sections: [
        {
          id: 'report-layout',
          title: 'Report Workspace Interface Modules',
          mermaid: `graph TD
    ReportRoot[Report Workspace]
    ReportRoot --> Tab1[1. Executive Summary & Goals]
    ReportRoot --> Tab2[2. Agent Contribution Logs]
    ReportRoot --> Tab3[3. Unified File Diffs & AST Changes]
    ReportRoot --> Tab4[4. Automated Test Suites & Coverage]
    ReportRoot --> Tab5[5. Security & CVE Audit Scan]
    ReportRoot --> Tab6[6. Architectural Decisions & Tradeoffs]
    ReportRoot --> Tab7[7. Token, Model & Cost Breakdown]
    ReportRoot --> Tab8[8. Remaining Issues & Next Steps]`,
          diagramTitle: 'Report Workspace Navigation Structure'
        },
        {
          id: 'report-components',
          title: 'Detailed Module Breakdown',
          table: {
            headers: ['Report Module', 'Contents & Visual Presentation', 'Action Available to User'],
            rows: [
              ['Executive Summary', 'High-level accomplishment overview, key files modified, verification status', 'Copy summary to clipboard / PR description'],
              ['Interactive Diff Viewer', 'Side-by-side Monaco diff showing all additions and deletions across branches', 'Accept/reject individual file patches'],
              ['Test Output & Logs', 'Passing/failing test matrix, execution time, stack trace history', 'Re-run individual tests in sandbox'],
              ['Security & Compliance', 'Secret scans, dependency CVEs, AST security warnings', 'Override with security justification'],
              ['Cost & Token Accounting', 'Input/output tokens per agent, model tier usage, dollar cost calculation', 'Export cost receipt for expense tracking'],
              ['Next Steps Recommendations', 'Suggested follow-up tasks (e.g. documentation updates, integration tests)', 'One-click launch next task run']
            ]
          }
        }
      ],
      relatedPages: [
        { title: 'Report Generation', slug: 'workspace/report-generation' },
        { title: 'Report Export', slug: 'workspace/report-export' }
      ]
    }
  },
  {
    slug: 'workspace/report-generation',
    title: 'Report Generation Engine',
    description: 'How the Report Engine compiles distributed agent outputs into an authoritative, structured report.',
    section: 'Workspace',
    category: 'Report Workspace',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['report-engine', 'generation', 'synthesis', 'markdown'],
    content: {
      lead: 'The Report Engine coordinates the automated aggregation, deduplication, and synthesis of artifacts produced across all DAG execution nodes.',
      sections: [
        {
          id: 'generation-pipeline',
          title: 'Report Synthesis Pipeline',
          steps: [
            {
              title: '1. Artifact Ingestion',
              description: 'Reads all TaskRecords, Git diffs, test logs, and security results associated with the Run ID from local SQLite.'
            },
            {
              title: '2. Metrics Calculation',
              description: 'Sums total tokens, compute duration, cost in USD, and pass/fail counts.'
            },
            {
              title: '3. Documentation Agent Synthesis',
              description: 'Invokes Documentation Agent to produce an objective, bulleted executive summary and architectural explanation.'
            },
            {
              title: '4. AST Diff Normalization',
              description: 'Stitches multi-file edits into a unified reviewable Git patch.'
            },
            {
              title: '5. Persistence & Rendering',
              description: 'Writes `.ai-ide/reports/run-<id>.json` and `.md`, immediately opening the interactive Report Workspace UI.'
            }
          ]
        }
      ],
      relatedPages: [
        { title: 'Report Workspace', slug: 'workspace/report-workspace' },
        { title: 'Report Export', slug: 'workspace/report-export' }
      ]
    }
  },
  {
    slug: 'workspace/report-export',
    title: 'Report Export & Integrations',
    description: 'Exporting reports to GitHub Pull Requests, Markdown summaries, standalone HTML, and JSON audit logs.',
    section: 'Workspace',
    category: 'Report Workspace',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['export', 'github-pr', 'markdown', 'html', 'json'],
    content: {
      lead: 'Reports generated by Kernel Base can be exported with one click to various destinations, enabling seamless handoff to human teammates and CI/CD pipelines.',
      sections: [
        {
          id: 'export-targets',
          title: 'Supported Export Formats & Targets',
          table: {
            headers: ['Export Target', 'Format', 'Intended Audience / Destination'],
            rows: [
              ['GitHub Pull Request', 'Formatted Markdown with collapsible diffs & test badges', 'PR description posted via GitHub API or CLI'],
              ['Local Markdown File', 'Standalone `REPORT.md` with links to artifacts', 'Committed to repository root or documentation wiki'],
              ['Self-Contained HTML', 'Interactive single-page HTML with dark mode & syntax highlighting', 'Shareable audit document for security & compliance teams'],
              ['JSON Data Bundle', 'Strict JSON conforming to KernelBaseReport schema', 'Ingestion into enterprise analytics or CI/CD dashboards']
            ]
          }
        },
        {
          id: 'github-pr-template',
          title: 'Example GitHub PR Summary Output',
          codeBlocks: [
            {
              filename: 'github-pr-body.md',
              language: 'markdown',
              code: `## 🤖 Kernel Base Multi-Agent Run Summary: #108
**Goal:** Implement Webhook Retry with Idempotency Keys
**Status:** ✅ 100% Tests Passing | 🛡️ 0 Security Vulnerabilities | ⚡ Duration: 38.4s

### 📋 Key Changes
- Created \`src/services/webhookRetry.ts\` with exponential backoff & jitter
- Added Redis idempotency locking in \`src/middleware/idempotency.ts\`
- Added 12 unit & integration tests in \`tests/webhookRetry.test.ts\`

### 🧪 Verification Summary
- **Vitest:** 12/12 passing (142ms)
- **Security:** TruffleHog (0 secrets), Bandit (Clean AST)
- **Models Used:** Qwen 2.5 Coder 14B (Local) + DeepSeek R1 8B (Local)
- **Total Cost:** $0.00 (100% Local Inference)`
            }
          ]
        }
      ],
      relatedPages: [
        { title: 'Report Workspace', slug: 'workspace/report-workspace' },
        { title: 'Organization Audit Logs', slug: 'organization/audit-logs' }
      ]
    }
  }
];
