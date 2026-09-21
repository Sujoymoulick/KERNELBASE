import { DocPage } from '../../types/docs';

export const modelsPages: DocPage[] = [
  {
    slug: 'models/model-architecture',
    title: 'Model Architecture',
    description: 'The three-tier model hierarchy balancing zero-cost local execution with frontier cloud intelligence.',
    section: 'Models',
    category: 'Model Routing & Gateway',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['models', 'architecture', 'tiers', 'routing', 'gateway'],
    content: {
      lead: 'Kernel Base structures model consumption across a decoupled Multi-Provider Model Gateway, supporting cloud providers, custom enterprise endpoints, and 100% offline local models.',
      interactiveComponent: 'credit-calculator',
      sections: [
        {
          id: 'model-gateway-topology',
          title: 'Unified Model Gateway Topology',
          body: 'Rather than binding agents directly to a single vendor, the Model Gateway routes requests dynamically based on task requirements, cognitive complexity, data sensitivity, and cost constraints.',
          mermaid: `graph TD
    Agents[Autonomous Agents] --> GW[Kernel Base Model Gateway]
    GW --> Router[Cognitive & Policy Router]
    Router --> Cloud[1. Cloud Providers\nOpenAI, Anthropic, Google, OpenRouter, Together]
    Router --> Custom[2. Custom LLM Gateways\nInternal vLLM, Azure OpenAI, Corporate Proxies]
    Router --> Local[3. Local Models\nOllama, llama.cpp, LM Studio, GGUF]`,
          diagramTitle: 'Multi-Provider Model Gateway Architecture'
        },
        {
          id: 'unified-abstraction-spec',
          title: 'Unified Model Interface Contract',
          codeBlocks: [
            {
              filename: 'types/model-gateway.ts',
              language: 'typescript',
              code: `export interface ModelProvider {
  id: string;
  name: string;
  type: 'cloud' | 'local' | 'custom';
  apiBase?: string;
  models: ModelMetadata[];
}

export interface ModelMetadata {
  id: string;
  providerId: string;
  displayName: string;
  contextWindow: number;
  capabilities: ('code' | 'reasoning' | 'tools' | 'vision' | 'streaming')[];
  supportsTools: boolean;
  supportsVision: boolean;
  supportsStreaming: boolean;
  costPer1kInputTokensUsd: number;
  costPer1kOutputTokensUsd: number;
  isLocal: boolean;
}`
            }
          ]
        }
      ],
      relatedPages: [
        { title: 'Model Router & Gateway', slug: 'models/model-router' },
        { title: 'Custom LLM Gateways', slug: 'models/custom-providers' },
        { title: 'Automatic Model Selection', slug: 'models/automatic-model-selection' }
      ]
    }
  },
  {
    slug: 'models/model-router',
    title: 'Model Router & Gateway',
    description: 'Dynamic model dispatching, latency-aware load balancing, and automated provider fallbacks.',
    section: 'Models',
    category: 'Model Routing & Gateway',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['router', 'gateway', 'load-balancer', 'fallbacks'],
    content: {
      lead: 'The Model Router evaluates token counts, required capabilities, latency, and budget ceilings to route requests to the most efficient endpoint.',
      sections: [
        {
          id: 'router-rules',
          title: 'Automated Routing Heuristics',
          table: {
            headers: ['Task Type', 'Required Capabilities', 'Default Target Model', 'Fallback Target'],
            rows: [
              ['Task Planning', 'Structured JSON, fast reasoning', 'ollama/qwen2.5-coder:7b', 'openrouter/qwen-2.5-coder-32b'],
              ['Code Writing', 'Long context, 90%+ HumanEval code', 'openrouter/deepseek-coder-v2', 'ollama/deepseek-r1:8b'],
              ['Test Generation', 'Edge case generation, AST syntax', 'openrouter/mistral-small', 'ollama/qwen2.5-coder:7b'],
              ['Security Review', 'Deep reasoning, security rules', 'openrouter/deepseek-r1', 'ollama/qwen2.5-coder:14b'],
              ['Failure Diagnosis', 'Stack trace analysis, reasoning', 'ollama/deepseek-r1:8b', 'anthropic/claude-3-5-sonnet']
            ]
          }
        }
      ],
      relatedPages: [
        { title: 'LiteLLM Integration', slug: 'models/litellm' },
        { title: 'Model Selection & Fallbacks', slug: 'models/model-selection' }
      ]
    }
  },
  {
    slug: 'models/custom-providers',
    title: 'Custom LLM Gateways & Endpoints',
    description: 'Connecting internal enterprise AI infrastructure, self-hosted inference servers, and custom OpenAI-compatible proxies.',
    section: 'Models',
    category: 'Model Routing & Gateway',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['custom-providers', 'enterprise', 'vllm', 'openai-compatible', 'gateways'],
    content: {
      lead: 'Kernel Base allows users and organizations to connect custom OpenAI-compatible API gateways, internal vLLM servers, private cloud instances, and proprietary enterprise endpoints.',
      sections: [
        {
          id: 'custom-gateway-config',
          title: 'Custom Provider Configuration',
          body: 'Custom providers can be configured per workspace (`.ai-ide/providers.json`) or distributed globally through the Organization Control Plane.',
          codeBlocks: [
            {
              filename: 'config/custom-provider.json',
              language: 'json',
              code: `{
  "providerId": "corp-vllm-cluster",
  "name": "Internal Enterprise vLLM Cluster",
  "type": "custom",
  "apiBase": "https://ai-gateway.internal.corp/v1",
  "apiKey": "${`\${env:CORP_AI_TOKEN}`}",
  "authMethod": "bearer",
  "customHeaders": {
    "X-Corporate-Dept": "Engineering",
    "X-Security-Clearance": "Confidential"
  },
  "models": [
    {
      "id": "corp-deepseek-671b",
      "displayName": "Corporate DeepSeek V3 (Private)",
      "contextWindow": 65536,
      "supportsTools": true,
      "supportsStreaming": true,
      "costPer1kInputTokensUsd": 0.00,
      "costPer1kOutputTokensUsd": 0.00
    }
  ],
  "rateLimits": {
    "maxRequestsPerMinute": 120,
    "maxConcurrentStreams": 8
  }
}`
            }
          ]
        },
        {
          id: 'enterprise-use-cases',
          title: 'Supported Enterprise Architectures',
          table: {
            headers: ['Architecture', 'Implementation', 'Authentication', 'Ideal For'],
            rows: [
              ['Self-Hosted vLLM / TGI', 'Dedicated on-prem GPU cluster', 'Static API Key / mTLS', 'Strict air-gapped data sovereignty'],
              ['Azure OpenAI Service', 'Managed Microsoft Azure instance', 'Azure AD OAuth / API Key', 'Enterprise cloud compliance'],
              ['AWS Bedrock Gateway', 'Amazon Bedrock proxy adapter', 'AWS IAM SigV4 / Role ARN', 'AWS-native enterprise teams'],
              ['Corporate Proxy', 'Internal caching & logging proxy', 'Single Sign-On (SSO) Bearer Token', 'Centralized token audit & billing']
            ]
          }
        }
      ],
      relatedPages: [
        { title: 'Provider Management', slug: 'organization/provider-management' },
        { title: 'Automatic Model Selection', slug: 'models/automatic-model-selection' }
      ]
    }
  },
  {
    slug: 'models/automatic-model-selection',
    title: 'Automatic Model Selection Engine',
    description: 'How agents declare capability requirements and the Model Gateway dynamically chooses the optimal model.',
    section: 'Models',
    category: 'Model Routing & Gateway',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['model-selection', 'capabilities', 'automatic', 'modes'],
    content: {
      lead: 'Rather than binding agents to static model names, agents in Kernel Base declare semantic capability requirements (e.g., "high-speed coding with tool support"). The Model Gateway evaluates availability, hardware, budget, and privacy policies to pick the best model.',
      sections: [
        {
          id: 'selection-modes',
          title: 'Three Selection Modes',
          table: {
            headers: ['Mode', 'Description', 'Configured By', 'Behavior'],
            rows: [
              ['Automatic (Default)', 'System evaluates task type, latency, cost, and selects best matching model', 'Kernel Base Router', 'Picks local model when available, escalates to cloud on high ambiguity'],
              ['Manual Override', 'User explicitly locks agent or task to a specific model identifier', 'Developer in IDE UI', 'Strict enforcement; no automatic tier shifts'],
              ['Policy-Based', 'Organization enforces approved provider lists and spend ceilings', 'Organization Admin', 'Rejects non-compliant models; forces local on sensitive tags']
            ]
          }
        },
        {
          id: 'capability-matching-matrix',
          title: 'Capability Matching Criteria',
          body: 'When an agent requests inference, the gateway weighs: 1) Required tools & vision support, 2) Necessary context window depth, 3) Token cost budget, 4) Latency/throughput needs, 5) Privacy constraint (local vs cloud).'
        }
      ],
      relatedPages: [
        { title: 'Model Selection & Fallbacks', slug: 'models/model-selection' },
        { title: 'Resource & AI Limits', slug: 'models/resource-limits' }
      ]
    }
  },
  {
    slug: 'models/litellm',
    title: 'LiteLLM Integration',
    description: 'Universal proxy abstraction supporting 100+ LLMs with unified OpenAI-compatible formatting.',
    section: 'Models',
    category: 'Model Routing & Gateway',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['litellm', 'proxy', 'openai-compatible'],
    content: {
      lead: 'LiteLLM provides a single unified proxy layer, normalizing request formats, token calculations, and function calling across providers.',
      sections: [
        {
          id: 'litellm-config',
          title: 'Configuration Architecture',
          codeBlocks: [
            {
              filename: 'config/litellm.yaml',
              language: 'yaml',
              code: `model_list:
  - model_name: local-planner
    litellm_params:
      model: ollama/qwen2.5-coder:7b
      api_base: http://localhost:11434
  - model_name: cloud-coder
    litellm_params:
      model: openrouter/qwen/qwen-2.5-coder-32b-instruct
      api_key: os.environ/OPENROUTER_API_KEY
  - model_name: frontier-architect
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Ollama (Local Tier 1)', slug: 'models/ollama' },
        { title: 'OpenRouter (Tier 2 Cloud)', slug: 'models/openrouter' },
      ],
    },
  },
  {
    slug: 'models/ollama',
    title: 'Ollama (Local Tier 1)',
    description: 'Running open-source weights locally for 100% offline, private, zero-cost agent intelligence.',
    section: 'Models',
    category: 'Model Routing & Gateway',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['ollama', 'local-ai', 'privacy', 'offline'],
    content: {
      lead: 'Ollama enables full offline operation with zero API tokens, zero subscription costs, and complete code privacy.',
      sections: [
        {
          id: 'recommended-models',
          title: 'Top Local Models for Coding Agents',
          table: {
            headers: ['Model', 'Parameters', 'Quantization', 'RAM Required', 'Primary Role in IDE'],
            rows: [
              ['qwen2.5-coder:7b', '7.6 Billion', 'Q4_K_M', '5.2 GB', 'Fast planning, JSON formatting, test loop'],
              ['deepseek-r1:8b', '8.0 Billion', 'Q4_K_M', '5.8 GB', 'Deep diagnostic reasoning, repair analysis'],
              ['qwen2.5-coder:14b', '14.7 Billion', 'Q4_K_M', '9.4 GB', 'Complex multi-file code authoring'],
              ['llama3.1:8b', '8.0 Billion', 'Q4_K_M', '5.5 GB', 'Documentation and commit generation'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Local & Free Models', slug: 'models/local-free-models' },
        { title: 'Local AI Overview', slug: 'local-ai/overview' }
      ],
    },
  },
  {
    slug: 'models/openrouter',
    title: 'OpenRouter (Tier 2 Cloud)',
    description: 'Accessing dozens of free-tier and micro-cost cloud models with zero recurring commitment.',
    section: 'Models',
    category: 'Model Routing & Gateway',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['openrouter', 'free-tier', 'cloud'],
    content: {
      lead: 'OpenRouter provides unified access to cutting-edge models including free-tier options suitable for students and hobbyists.',
      sections: [
        {
          id: 'free-tier-notice',
          title: 'Free Model Availability',
          callout: {
            type: 'note',
            title: 'Pricing Transparency Notice',
            text: 'While OpenRouter offers models labeled `:free`, availability is subject to provider rate limits. The IDE automatically falls back to local Ollama if free cloud quotas are exhausted.',
          },
        },
      ],
      relatedPages: [
        { title: 'Free LLM Options & Local AI', slug: 'free-tech-stack/free-llms' },
      ],
    },
  },
  {
    slug: 'models/local-free-models',
    title: 'Local & Free Models',
    description: 'Curated list of verified open-weight models optimized for coding, tool use, and structured outputs.',
    section: 'Models',
    category: 'Cost & Resource Controls',
    order: 8,
    checkedDate: 'September 2026',
    tags: ['free-models', 'open-weights', 'benchmarks'],
    content: {
      lead: 'A rigorous benchmark comparison of open-weight coding models on HumanEval, SWE-bench Lite, and tool-calling accuracy.',
      sections: [
        {
          id: 'benchmark-table',
          title: 'Coding Model Performance Benchmarks',
          table: {
            headers: ['Model', 'SWE-bench Lite', 'HumanEval', 'Function Calling Acc.', 'License'],
            rows: [
              ['Qwen 2.5 Coder 32B', '28.4%', '92.7%', '94.2%', 'Apache 2.0'],
              ['DeepSeek Coder V2 16B', '25.1%', '89.2%', '91.0%', 'DeepSeek License'],
              ['Qwen 2.5 Coder 7B', '19.8%', '84.1%', '88.5%', 'Apache 2.0'],
              ['Llama 3.1 8B Instruct', '16.2%', '72.6%', '85.1%', 'Llama 3.1 Community'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Model Selection & Fallbacks', slug: 'models/model-selection' },
      ],
    },
  },
  {
    slug: 'models/model-selection',
    title: 'Model Selection & Fallbacks',
    description: 'Automated fallback chains: how the IDE handles network outages, rate limits, and model degradations.',
    section: 'Models',
    category: 'Cost & Resource Controls',
    order: 9,
    checkedDate: 'September 2026',
    tags: ['fallbacks', 'resilience', 'rate-limits'],
    content: {
      lead: 'The fallback chain ensures uninterrupted development: if an online provider returns 429 or 503, the request drops to local Ollama seamlessly.',
      sections: [
        {
          id: 'fallback-matrix',
          title: 'Graceful Degradation Chain',
          body: '1. Primary Cloud Target (e.g. OpenRouter Qwen 32B) -> 2. Secondary Cloud (Groq Llama 3.3 70B) -> 3. Local Offline Fallback (Ollama Qwen 7B).',
        },
      ],
      relatedPages: [
        { title: 'Token & Cost Management', slug: 'models/token-cost-management' },
      ],
    },
  },
  {
    slug: 'models/token-cost-management',
    title: 'Token & Cost Management',
    description: 'Real-time token counting, caching, cost estimation, and spend guardrails.',
    section: 'Models',
    category: 'Cost & Resource Controls',
    order: 10,
    checkedDate: 'September 2026',
    tags: ['tokens', 'cost', 'caching', 'spend-guardrails'],
    content: {
      lead: 'Precise token accounting guarantees zero surprise bills, with real-time counters displayed in the IDE status bar.',
      sections: [
        {
          id: 'caching-impact',
          title: 'Prompt Caching Benefits',
          body: 'By preserving system prompt prefixes across iterations, prompt caching reduces token costs by up to 90% on supported providers (Anthropic, DeepSeek, Gemini).',
        },
      ],
      relatedPages: [
        { title: 'Resource & AI Limits', slug: 'models/resource-limits' },
        { title: 'Credit Calculation Engine', slug: 'models/credit-calculation' },
      ],
    },
  },
  {
    slug: 'models/resource-limits',
    title: 'Resource & AI Usage Limits',
    description: 'Comprehensive guardrails: token limits, concurrency caps, tool call throttling, and hardware memory protections.',
    section: 'Models',
    category: 'Cost & Resource Controls',
    order: 11,
    checkedDate: 'September 2026',
    tags: ['limits', 'quotas', 'throttling', 'budget', 'runaway-prevention'],
    content: {
      lead: 'Kernel Base implements multi-tier resource limits to prevent runaway loops, exorbitant API bills, and host machine memory exhaustion.',
      sections: [
        {
          id: 'hierarchical-limits-matrix',
          title: 'Hierarchical Limit Enforcements',
          table: {
            headers: ['Scope', 'Enforced Limits', 'Default Setting', 'Action When Exceeded'],
            rows: [
              ['Global / System', 'Max concurrent active agent runs', '3 active runs', 'Queues subsequent run requests'],
              ['Organization', 'Monthly budget ceiling ($ USD)', '$1,000 / month', 'Blocks cloud API calls, falls back to local Ollama'],
              ['Workspace / Project', 'Max credits per project lifecycle', '10,000 credits', 'Prompts project owner for quota top-up'],
              ['Run / Session', 'Max credit allowance & duration', '200 credits / 30 mins', 'Pauses run, alerts developer in UI'],
              ['Agent Subtask', 'Max retries & max token burn', '3 retries / 15k tokens', 'Escalates failure diagnostic to human'],
              ['Local Hardware', 'Max RAM / VRAM allocation', '80% available memory', 'Throttles concurrency, pages out idle weights']
            ]
          }
        },
        {
          id: 'runaway-mitigation',
          title: 'Preventing Runaway Agents & Infinite Loops',
          callout: {
            type: 'warning',
            title: 'Loop Detection Circuit Breaker',
            text: 'If an agent generates two identical code diffs consecutively or executes 5 tool calls without modifying file state or running tests, the Orchestrator trips the circuit breaker and pauses execution.'
          }
        }
      ],
      relatedPages: [
        { title: 'Token & Cost Management', slug: 'models/token-cost-management' },
        { title: 'Credit & Budget System', slug: 'architecture/credit-system' }
      ]
    }
  },
  {
    slug: 'models/credit-calculation',
    title: 'Credit Calculation Engine',
    description: 'Mathematical formulas converting input tokens, output tokens, and tool invocations into credits.',
    section: 'Models',
    category: 'Cost & Resource Controls',
    order: 12,
    checkedDate: 'September 2026',
    tags: ['credits', 'formula', 'accounting'],
    content: {
      lead: 'The credit engine normalizes disparate API pricing models into a simple, predictable unit currency.',
      sections: [
        {
          id: 'formula-definition',
          title: 'The Credit Accounting Formula',
          codeBlocks: [
            {
              filename: 'src/core/budget/calculator.ts',
              language: 'typescript',
              code: `export function calculateTaskCredits(
  inputTokens: number,
  outputTokens: number,
  modelMultiplier: number,
  toolInvocations: number
): number {
  // 1 credit = 10,000 standard input tokens on base tier
  const tokenCost = ((inputTokens * 1.0) + (outputTokens * 3.0)) / 10000;
  const toolCost = toolInvocations * 0.05; // 0.05 credits per sandbox tool execution
  return Math.max(0.1, Number(((tokenCost * modelMultiplier) + toolCost).toFixed(2)));
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Credit & Budget System', slug: 'architecture/credit-system' },
      ],
    },
  },
];
