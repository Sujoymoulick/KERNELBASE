import { DocPage } from '../../types/docs';

export const freeTechStackPages: DocPage[] = [
  {
    slug: 'free-tech-stack/open-source-stack',
    title: 'Open-Source Stack Directory',
    description: 'Comprehensive directory of all 26+ open-source technologies, libraries, and frameworks powering the IDE.',
    section: 'Free Tech Stack',
    category: 'Student & Zero-Cost Stack',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['open-source', 'free-tech', 'students', 'directory'],
    content: {
      lead: 'The AI-Native Multi-Agent IDE is built entirely on open-source and free-tier infrastructure, enabling students, researchers, and independent developers to build with zero cloud bills.',
      interactiveComponent: 'tech-matrix',
      sections: [
        {
          id: 'stack-philosophy',
          title: 'Open-Source vs Free Tier Clarity',
          body: 'We distinguish strictly between: 1) True Open Source (permissive licenses like MIT, Apache 2.0 with inspectable source code), 2) Free Local (software that runs 100% offline without payment), and 3) Free Cloud Tier (cloud services offering free quotas that may change over time).',
          callout: {
            type: 'important',
            title: 'No Hidden Cloud Lock-in',
            text: 'We never claim that cloud API usage is permanently free. The entire system is architected to run 100% offline on open-weight models (Ollama, Qwen, DeepSeek) and local SQLite/Docker whenever cloud access is unavailable.',
          },
        },
      ],
      relatedPages: [
        { title: 'Free LLM Options & Local AI', slug: 'free-tech-stack/free-llms' },
        { title: 'Student Budget Architecture ($0/mo)', slug: 'free-tech-stack/student-budget' },
      ],
    },
  },
  {
    slug: 'free-tech-stack/free-llms',
    title: 'Free LLM Options & Local AI',
    description: 'Running top open-weight models locally with Ollama, vLLM, and utilizing free cloud tiers like OpenRouter and Groq.',
    section: 'Free Tech Stack',
    category: 'Student & Zero-Cost Stack',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['local-ai', 'free-llm', 'ollama', 'groq', 'openrouter'],
    content: {
      lead: 'Developers do not need $20/month AI subscriptions. You can achieve state-of-the-art multi-agent coding using 100% free models.',
      sections: [
        {
          id: 'free-options-table',
          title: 'Zero-Cost AI Inference Matrix',
          table: {
            headers: ['Option / Provider', 'Type', 'Cost / Quota', 'Models Available', 'Hardware Needed'],
            rows: [
              ['Ollama', 'Local Offline', '100% Free Forever', 'Qwen 2.5 Coder, DeepSeek R1, Llama 3.1', '8GB - 16GB RAM'],
              ['OpenRouter Free Tier', 'Cloud Free Tier', 'Free with rate limits', 'Qwen 2.5 72B, DeepSeek R1, Gemma 2', 'Any machine (browser / thin client)'],
              ['Groq Cloud Free', 'Cloud Free Tier', '30 RPM free tier', 'Llama 3.3 70B, Gemma 2 9B', 'Zero local GPU needed'],
              ['Google AI Studio Free', 'Cloud Free Tier', '15 RPM free tier', 'Gemini 2.5 Flash, Gemini 1.5 Pro', 'Standard developer account'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Ollama (Local Tier 1)', slug: 'models/ollama' },
        { title: 'OpenRouter (Tier 2 Cloud)', slug: 'models/openrouter' },
      ],
    },
  },
  {
    slug: 'free-tech-stack/free-infra',
    title: 'Free Databases & Hosting',
    description: 'PostgreSQL, SQLite, Supabase, Neon, Fly.io, Cloudflare Pages, and Render zero-cost tiers.',
    section: 'Free Tech Stack',
    category: 'Student & Zero-Cost Stack',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['database', 'hosting', 'sqlite', 'neon', 'cloudflare'],
    content: {
      lead: 'Deploy and host your agents, documentation, and databases using perpetual free tiers without credit card requirements.',
      sections: [
        {
          id: 'free-infra-breakdown',
          title: 'Zero-Cost Infrastructure Providers',
          table: {
            headers: ['Service', 'Category', 'Free Tier Allowance', 'Open Source Alternative'],
            rows: [
              ['SQLite / LibSQL', 'Database', 'Unlimited local storage, zero latency', 'Embedded SQLite (Public Domain)'],
              ['Neon Postgres', 'Serverless SQL', '0.5 GB storage, scale-to-zero compute', 'Local Docker PostgreSQL'],
              ['Cloudflare Pages', 'Static Hosting', 'Unlimited bandwidth, 500 builds/month', 'Local Nginx / Caddy'],
              ['Render / Koyeb', 'Container Hosting', 'Free web service tier (sleeps on idle)', 'Local Docker Compose'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Free CI/CD, Search & Storage', slug: 'free-tech-stack/free-devops' },
      ],
    },
  },
  {
    slug: 'free-tech-stack/free-devops',
    title: 'Free CI/CD, Search & Storage',
    description: 'GitHub Actions, Pagefind, MinIO, Docker Hub, and Prometheus monitoring without spend.',
    section: 'Free Tech Stack',
    category: 'Student & Zero-Cost Stack',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['ci-cd', 'github-actions', 'pagefind', 'minio', 'devops'],
    content: {
      lead: 'Complete DevOps lifecycle using GitHub Actions free runner minutes, static Pagefind search, and Docker Hub registries.',
      sections: [
        {
          id: 'free-devops-tools',
          title: 'Zero-Cost DevOps Tooling',
          cards: [
            {
              title: 'GitHub Actions',
              description: '2,000 free runner minutes per month for private repositories; unlimited for public open-source.',
              badge: 'CI/CD',
            },
            {
              title: 'Pagefind Search',
              description: 'Static-first search engine generating zero server compute costs with instant client-side indexing.',
              badge: 'Search',
            },
            {
              title: 'Docker Hub',
              description: 'Free public and private image repository hosting for agent execution sandbox containers.',
              badge: 'Registry',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Open-Source Stack Directory', slug: 'free-tech-stack/open-source-stack' },
      ],
    },
  },
  {
    slug: 'free-tech-stack/student-budget',
    title: 'Student Budget Architecture ($0/mo)',
    description: 'A complete blueprint for running the multi-agent IDE on a laptop with zero monthly expenditure.',
    section: 'Free Tech Stack',
    category: 'Student & Zero-Cost Stack',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['student', 'budget', 'zero-cost', 'blueprint'],
    content: {
      lead: 'Students can master multi-agent AI engineering with $0 upfront or recurring costs.',
      sections: [
        {
          id: 'student-recipe',
          title: 'The $0/Month Architecture Recipe',
          steps: [
            {
              title: '1. Local Compute: Ollama Qwen 2.5 Coder 7B',
              description: 'Runs offline on 8GB RAM laptops, consuming zero API credits for planning, test looping, and formatting.',
            },
            {
              title: '2. Free Cloud Burst: OpenRouter Free Models',
              description: 'Used for heavy refactoring tasks where a 32B model is preferred.',
            },
            {
              title: '3. Local Database: SQLite embedded in run directory',
              description: 'Zero setup, zero cloud credentials, full ACID compliance.',
            },
            {
              title: '4. Sandbox: Local Docker Engine',
              description: 'Runs disposable Linux containers on the developer machine for isolated testing.',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Free LLM Options & Local AI', slug: 'free-tech-stack/free-llms' },
        { title: '10-Day MVP Plan', slug: '10-day-mvp/mvp-overview' },
      ],
    },
  },
];
