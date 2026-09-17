import { DocPage } from '../../types/docs';

export const modelsPages: DocPage[] = [
  {
    slug: 'models/model-architecture',
    title: 'Model Architecture',
    description: 'The three-tier model hierarchy balancing zero-cost local execution with frontier cloud intelligence.',
    section: 'Models',
    category: 'Model Routing',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['models', 'architecture', 'tiers', 'routing'],
    content: {
      lead: 'The IDE structures model consumption into three clear tiers, ensuring students and open-source contributors can build complex software for $0/month.',
      interactiveComponent: 'credit-calculator',
      sections: [
        {
          id: 'three-tier-model',
          title: 'The Three-Tier Model Strategy',
          body: 'Rather than binding every task to a $20/million-token frontier model, tasks are routed according to cognitive complexity.',
          mermaid: `graph TD
    Task([Subtask]) --> Router{Model Router}
    Router -- Simple / Summarize / Format --> T1[Tier 1: Local Offline\nOllama / Qwen 2.5 Coder 7B\nCost: $0.00]
    Router -- Standard Code / QA / Refactor --> T2[Tier 2: Free/Low-Cost Cloud\nOpenRouter / DeepSeek / Mistral\nCost: Free or <$0.001]
    Router -- High Ambiguity / Complex Debug --> T3[Tier 3: Frontier Model\nUser Configured Claude / GPT-4o\nCost: User Key]`,
          diagramTitle: 'Three-Tier Routing Architecture',
        },
      ],
      relatedPages: [
        { title: 'Model Router & Gateway', slug: 'models/model-router' },
        { title: 'Local & Free Models', slug: 'models/local-free-models' },
      ],
    },
  },
  {
    slug: 'models/model-router',
    title: 'Model Router & Gateway',
    description: 'Dynamic model dispatching, latency-aware load balancing, and automated provider fallbacks.',
    section: 'Models',
    category: 'Model Routing',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['router', 'gateway', 'load-balancer'],
    content: {
      lead: 'The Model Router evaluates token counts, rate limits, and latency to route requests to the most efficient available endpoint.',
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
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'LiteLLM Integration', slug: 'models/litellm' },
        { title: 'Model Selection & Fallbacks', slug: 'models/model-selection' },
      ],
    },
  },
  {
    slug: 'models/litellm',
    title: 'LiteLLM Integration',
    description: 'Universal proxy abstraction supporting 100+ LLMs with unified OpenAI-compatible formatting.',
    section: 'Models',
    category: 'Model Routing',
    order: 3,
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
    category: 'Model Routing',
    order: 4,
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
      ],
    },
  },
  {
    slug: 'models/openrouter',
    title: 'OpenRouter (Tier 2 Cloud)',
    description: 'Accessing dozens of free-tier and micro-cost cloud models with zero recurring commitment.',
    section: 'Models',
    category: 'Model Routing',
    order: 5,
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
    category: 'Cost & Selection',
    order: 6,
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
    category: 'Cost & Selection',
    order: 7,
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
    category: 'Cost & Selection',
    order: 8,
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
        { title: 'Credit Calculation Engine', slug: 'models/credit-calculation' },
      ],
    },
  },
  {
    slug: 'models/credit-calculation',
    title: 'Credit Calculation Engine',
    description: 'Mathematical formulas converting input tokens, output tokens, and tool invocations into credits.',
    section: 'Models',
    category: 'Cost & Selection',
    order: 9,
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
