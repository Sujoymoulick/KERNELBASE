import { DocPage } from '../../types/docs';

export const organizationPages: DocPage[] = [
  {
    slug: 'organization/overview',
    title: 'Organization Control Plane Overview',
    description: 'Centralized administration for enterprise teams: member management, policy enforcement, model quotas, and security governance.',
    section: 'Organization',
    category: 'Team Management',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['organization', 'enterprise', 'control-plane', 'governance'],
    content: {
      lead: 'The Organization Control Plane provides engineering managers, security officers, and enterprise leads with centralized governance over AI models, spending budgets, agent permissions, and compliance audit logs.',
      sections: [
        {
          id: 'org-architecture',
          title: 'Organization Hierarchy & Governance Model',
          mermaid: `graph TD
    Org[Enterprise Organization] --> Teams[Engineering Teams]
    Org --> Policies[Global Security & Spend Policies]
    Org --> Gateways[Central Model Gateways & Keys]
    Org --> AuditVault[Append-Only Audit Log Vault]
    Teams --> Projects[Workspace Projects]
    Teams --> TeamPolicies[Team Budget & Rate Limits]
    Projects --> Runs[Developer Agent Runs]
    Runs --> Sandbox[Enforced Sandboxes]
    Runs --> GatewayEnforcer[Policy & Budget Enforcer]
    GatewayEnforcer --> Providers[Approved LLM Providers]`,
          diagramTitle: 'Organization Control Plane Topology'
        },
        {
          id: 'enterprise-capabilities',
          title: 'Enterprise Management Pillars',
          cards: [
            {
              title: 'Role-Based Access Control (RBAC)',
              description: 'Manage permissions for Owners, Admins, Developers, and Compliance Viewers across projects.',
              badge: 'RBAC'
            },
            {
              title: 'Centralized Model Gateway Secrets',
              description: 'Distribute enterprise OpenAI/Anthropic/custom keys without exposing raw credentials to developers.',
              badge: 'Security'
            },
            {
              title: 'Hierarchical Budget Guardrails',
              description: 'Hard monthly ceilings per organization, team, project, user, and individual agent run.',
              badge: 'Cost Control'
            },
            {
              title: 'Cryptographic Audit Logging',
              description: 'Tamper-proof logs capturing every prompt, tool call, permission approval, and code diff.',
              badge: 'Compliance'
            }
          ]
        }
      ],
      relatedPages: [
        { title: 'Members & Teams', slug: 'organization/members-teams' },
        { title: 'Organization Policies', slug: 'organization/policies' },
        { title: 'Privacy Architecture', slug: 'organization/privacy' }
      ]
    }
  },
  {
    slug: 'organization/members-teams',
    title: 'Members, Roles & Team Management',
    description: 'Hierarchical team structures, role definitions, and capability assignments across enterprise organizations.',
    section: 'Organization',
    category: 'Team Management',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['members', 'roles', 'rbac', 'teams'],
    content: {
      lead: 'Structure developers into teams with customized model access, budget limits, and project permissions.',
      sections: [
        {
          id: 'role-matrix',
          title: 'RBAC Role Matrix',
          table: {
            headers: ['Role', 'Permissions', 'Model Gateway Access', 'Audit Access'],
            rows: [
              ['Organization Owner', 'Full administration, billing, SSO configuration, policy creation', 'Manage all provider keys & gateways', 'Full audit vault access'],
              ['Team Admin', 'Manage team members, project assignments, team budget allocation', 'Assign approved models to team', 'Team-level audit logs'],
              ['Developer / Engineer', 'Launch agent runs, approve tool executions, create projects', 'Execute runs using team-approved models', 'Personal run history only'],
              ['Compliance Auditor', 'Read-only access to all reports, diffs, audit trails, and security scans', 'No execution permissions', 'Full read-only audit vault access']
            ]
          }
        },
        {
          id: 'sso-scim',
          title: 'Enterprise SSO & Directory Sync',
          body: 'Kernel Base supports SAML 2.0 and OIDC (Okta, Microsoft Entra ID, Google Workspace) with automatic SCIM team provisioning.'
        }
      ],
      relatedPages: [
        { title: 'Organization Policies', slug: 'organization/policies' },
        { title: 'Provider Management', slug: 'organization/provider-management' }
      ]
    }
  },
  {
    slug: 'organization/policies',
    title: 'Organization Policies & Guardrails',
    description: 'Declarative policy rules regulating allowed models, maximum tokens, tool whitelists, and local-only constraints.',
    section: 'Organization',
    category: 'Team Management',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['policies', 'guardrails', 'compliance', 'limits'],
    content: {
      lead: 'Policies define non-bypassable rules enforced at the daemon and model gateway layer across all developer machines.',
      sections: [
        {
          id: 'policy-schema',
          title: 'Declarative Organization Policy Example',
          codeBlocks: [
            {
              filename: 'enterprise-policy.json',
              language: 'json',
              code: `{
  "policyVersion": "2026-09",
  "orgId": "acme-fintech",
  "rules": {
    "models": {
      "allowedProviders": ["company-internal-gateway", "ollama-local", "anthropic"],
      "bannedModels": ["unverified-cloud-tier"],
      "forceLocalForTags": ["confidential", "pci-dss", "internal-core"]
    },
    "spending": {
      "monthlyOrgBudgetUsd": 5000,
      "maxCostPerRunUsd": 15.00,
      "alertThresholdPercent": 80
    },
    "tools": {
      "blockedTools": ["dangerous_rm", "direct_host_exec"],
      "mandatoryApprovalTools": ["git.push", "db.drop", "network.outbound"]
    },
    "privacy": {
      "defaultExecutionMode": "hybrid",
      "maskSensitiveKeywords": ["API_KEY", "AWS_SECRET", "SSN", "PRIVATE_KEY"]
    }
  }
}`
            }
          ]
        },
        {
          id: 'policy-enforcement',
          title: 'How Policies are Enforced',
          body: 'Policies are signed by the Organization Control Plane and cached locally by the Desktop IDE daemon. Even if a developer modifies local config files, the daemon rejects model requests that violate the cryptographically verified organization policy.'
        }
      ],
      relatedPages: [
        { title: 'Usage & Cost Tracking', slug: 'organization/usage-tracking' },
        { title: 'Privacy Architecture', slug: 'organization/privacy' }
      ]
    }
  },
  {
    slug: 'organization/provider-management',
    title: 'Model & Provider Management',
    description: 'Centralized configuration of enterprise LLM gateways, private model servers, and provider quotas.',
    section: 'Organization',
    category: 'Team Management',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['providers', 'gateways', 'custom-llm', 'enterprise-keys'],
    content: {
      lead: 'Admins can configure shared enterprise model endpoints, private vLLM clusters, and custom API gateways that automatically populate in developers\' IDEs.',
      sections: [
        {
          id: 'provider-types',
          title: 'Configurable Provider Categories',
          table: {
            headers: ['Category', 'Typical Configuration', 'Credential Distribution', 'Fallback Strategy'],
            rows: [
              ['Commercial Cloud Providers', 'OpenAI, Anthropic, Google, Together, Groq', 'Enterprise API keys injected via signed ephemeral tokens', 'Auto-fallback to secondary provider on 429'],
              ['Custom Enterprise Gateways', 'Internal OpenAI-compatible proxy (`https://ai.internal.corp/v1`)', 'mTLS or corporate SSO Bearer Token', 'Fallback to internal on-prem backup cluster'],
              ['Self-Hosted GPU Clusters', 'vLLM / TGI on Kubernetes or Slurm', 'Internal cluster URL + service token', 'Fallback to developer local Ollama'],
              ['Local Machine Runtimes', 'Ollama, llama.cpp on developer workstations', 'No API keys required ($0 cost)', 'Always available offline']
            ]
          }
        }
      ],
      relatedPages: [
        { title: 'Custom LLM Gateways', slug: 'models/custom-providers' },
        { title: 'Usage & Cost Tracking', slug: 'organization/usage-tracking' }
      ]
    }
  },
  {
    slug: 'organization/usage-tracking',
    title: 'Usage, Token & Cost Tracking',
    description: 'Real-time aggregated metrics on token consumption, cloud costs, agent invocation counts, and efficiency trends.',
    section: 'Organization',
    category: 'Compliance & Security',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['usage', 'cost', 'metrics', 'tokens', 'analytics'],
    content: {
      lead: 'Full visibility into token burn rates, compute duration, and dollar spend broken down by team, project, agent persona, and individual developer.',
      sections: [
        {
          id: 'tracked-analytics',
          title: 'Usage Analytics Dimensions',
          table: {
            headers: ['Dimension', 'Granularity', 'Data Retained', 'Export Options'],
            rows: [
              ['Token Accounting', 'Per request (Input, Output, Cached tokens)', '365 days', 'CSV, Prometheus, Datadog'],
              ['Financial Cost', 'Exact USD calculated against real provider rate cards', '365 days', 'QuickBooks, Stripe, JSON'],
              ['Agent Performance', 'Task success rate, retry counts, time-to-completion', '90 days', 'Grafana dashboard / JSON'],
              ['Local vs Cloud Ratio', 'Percentage of compute executed locally ($0) vs cloud', '365 days', 'Executive cost-savings summary']
            ]
          }
        }
      ],
      relatedPages: [
        { title: 'Audit Logs', slug: 'organization/audit-logs' },
        { title: 'Credit & Budget System', slug: 'architecture/credit-system' }
      ]
    }
  },
  {
    slug: 'organization/audit-logs',
    title: 'Audit Logging & Compliance',
    description: 'Immutable, tamper-evident audit logs capturing all agent decisions, file modifications, and permission approvals.',
    section: 'Organization',
    category: 'Compliance & Security',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['audit', 'compliance', 'security', 'logs', 'soc2'],
    content: {
      lead: 'Enterprise organizations require non-repudiable audit records of all AI actions. Kernel Base logs every prompt, tool execution, git commit, and human sign-off into an immutable audit stream.',
      sections: [
        {
          id: 'audit-event-schema',
          title: 'Structured Audit Record Schema',
          codeBlocks: [
            {
              filename: 'types/audit-event.ts',
              language: 'typescript',
              code: `export interface AuditEvent {
  eventId: string;
  timestamp: number;
  orgId: string;
  teamId: string;
  userId: string;
  userEmail: string;
  runId: string;
  agentId: string;
  modelIdentifier: string;
  eventType: 
    | 'RUN_INITIATED'
    | 'TOOL_CALL_EXECUTED'
    | 'HUMAN_APPROVAL_GRANTED'
    | 'HUMAN_APPROVAL_DENIED'
    | 'FILE_MODIFIED'
    | 'TEST_VERIFICATION_PASSED'
    | 'POLICY_VIOLATION_BLOCKED';
  payload: {
    commandOrPath?: string;
    diffSnippet?: string;
    approvalReason?: string;
    tokensConsumed?: { input: number; output: number };
    costUsd?: number;
  };
  cryptographicSignature: string; // HMAC-SHA256 signature for tamper detection
}`
            }
          ]
        },
        {
          id: 'compliance-standards',
          title: 'Compliance Certifications Support',
          body: 'Designed to satisfy requirements for SOC 2 Type II, ISO 27001, HIPAA, and GDPR compliance by supporting complete data sovereignty, zero data retention (ZDR) contracts, and exportable audit trails.'
        }
      ],
      relatedPages: [
        { title: 'Privacy Architecture', slug: 'organization/privacy' },
        { title: 'Security Model', slug: 'architecture/security-model' }
      ]
    }
  },
  {
    slug: 'organization/privacy',
    title: 'Privacy & Local-Only Architecture',
    description: 'Three-tier privacy modes: Cloud, Hybrid, and 100% Local-Only execution for confidential and air-gapped repositories.',
    section: 'Organization',
    category: 'Compliance & Security',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['privacy', 'local-only', 'air-gap', 'zero-data-retention'],
    content: {
      lead: 'Kernel Base implements a multi-tier privacy architecture ensuring that sensitive intellectual property, proprietary algorithms, and confidential data never leak to third-party AI APIs.',
      sections: [
        {
          id: 'privacy-modes',
          title: 'Execution Privacy Modes',
          table: {
            headers: ['Privacy Mode', 'Inference Engine', 'Data Boundary', 'Permitted Tools'],
            rows: [
              ['Cloud Mode', 'Frontier Cloud Providers (Anthropic, OpenAI, etc.)', 'Encrypted TLS transit; zero-data-retention contracts', 'Full web search, MCP, local sandbox'],
              ['Hybrid Mode (Default)', 'Local Ollama for planning/code; Cloud for complex reasoning', 'Only anonymized AST snippets sent to cloud when authorized', 'Local sandbox + restricted internet'],
              ['100% Local-Only Mode', 'On-device Ollama / llama.cpp models only', 'Zero outbound bytes; 100% data remains on local disk', 'Local sandbox only; outbound internet blocked']
            ]
          }
        },
        {
          id: 'secret-masking-engine',
          title: 'Automatic Prompt Sanitization',
          callout: {
            type: 'important',
            title: 'Dynamic Secret Masking',
            text: 'Before any prompt is dispatched to a cloud model gateway, the Security Layer scans text for API keys, bearer tokens, passwords, and private certificates, replacing them with sanitized placeholders like `<REDACTED_API_KEY>`.'
          }
        }
      ],
      relatedPages: [
        { title: 'Local AI Overview', slug: 'local-ai/overview' },
        { title: 'Security Model', slug: 'architecture/security-model' }
      ]
    }
  }
];
