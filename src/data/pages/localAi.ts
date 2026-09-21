import { DocPage } from '../../types/docs';

export const localAiPages: DocPage[] = [
  {
    slug: 'local-ai/overview',
    title: 'Local AI Overview',
    description: 'First-class on-device AI model management, local runtimes, privacy-first execution, and zero-cost inference.',
    section: 'Local AI',
    category: 'Local Model Manager',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['local-ai', 'ollama', 'privacy', 'on-device', 'offline'],
    content: {
      lead: 'Kernel Base treats Local AI as a first-class citizen. Developers and organizations can discover, install, configure, and execute open-weight AI models locally with one click — enabling 100% offline, private, zero-cost engineering.',
      sections: [
        {
          id: 'why-local-ai',
          title: 'The Case for Local AI in the IDE',
          body: 'While cloud frontier models provide state-of-the-art reasoning for complex refactoring, a vast portion of software development tasks — code completions, lint fixes, JSON schemas, documentation, and unit tests — can be executed at zero marginal cost with modern 7B–32B open-weight models.',
          cards: [
            {
              title: '100% Data Sovereignty & Privacy',
              description: 'Proprietary source code, environment secrets, and internal schemas never leave the developer workstation.',
              badge: 'Privacy'
            },
            {
              title: '$0.00 / Month Running Cost',
              description: 'Run limitless agent loops, test iterations, and background refactorings without burning API credits.',
              badge: 'Zero-Cost'
            },
            {
              title: 'Air-Gapped & Offline Capable',
              description: 'Continue building and delegating agent tasks on airplanes, secure enterprise facilities, or during network outages.',
              badge: 'Offline'
            },
            {
              title: 'Low Latency & High Throughput',
              description: 'Zero network round-trips for token streaming and immediate tool-call execution.',
              badge: 'Speed'
            }
          ]
        },
        {
          id: 'local-manager-architecture',
          title: 'Local Model Manager Architecture',
          mermaid: `graph TD
    UI[Desktop Model Manager UI] --> LMM[Local Model Manager Engine]
    LMM --> HW[Hardware Detection Engine]
    HW --> Probe[CPU, RAM, GPU, VRAM Probing]
    LMM --> Disc[Model Discovery Hub]
    Disc --> OLib[Ollama Library]
    Disc --> HF[Hugging Face GGUF Hub]
    Disc --> Custom[Custom Registries]
    LMM --> Rec[Recommendation Engine]
    Rec --> DL[Downloader & Verifier]
    DL --> Runtimes[Runtime Manager]
    Runtimes --> OllamaR[Ollama Runtime]
    Runtimes --> LlamaCppR[llama.cpp Server]
    Runtimes --> LMStudioR[LM Studio Bridge]
    Runtimes --> Health[Health & Memory Monitor]`,
          diagramTitle: 'Local Model Manager Subsystem Topology'
        }
      ],
      relatedPages: [
        { title: 'Hardware Detection', slug: 'local-ai/hardware-detection' },
        { title: 'Model Discovery & Installation', slug: 'local-ai/model-discovery' },
        { title: 'Ollama Runtime', slug: 'local-ai/ollama-runtime' }
      ]
    }
  },
  {
    slug: 'local-ai/hardware-detection',
    title: 'Hardware Detection & Profiling',
    description: 'Automated hardware capability scanning to determine optimal parameter sizes, quantizations, and GPU layer offloading.',
    section: 'Local AI',
    category: 'Local Model Manager',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['hardware', 'gpu', 'vram', 'quantization', 'metal', 'cuda'],
    content: {
      lead: 'Before recommending or running local models, Kernel Base executes non-invasive hardware probing to analyze available compute resources, avoiding out-of-memory kernel panics.',
      sections: [
        {
          id: 'probed-hardware-matrix',
          title: 'Hardware Probing Dimensions',
          table: {
            headers: ['Hardware Dimension', 'Detection Mechanism', 'Impact on Model Execution'],
            rows: [
              ['CPU & Instruction Set', 'AVX2, AVX-512, ARM NEON instruction probing', 'Determines CPU quantization acceleration speed (Q4_K_M vs Q8)'],
              ['System RAM', 'Total OS physical RAM & current free buffer', 'Hard ceiling for CPU-offloaded model weights and context memory'],
              ['GPU Architecture', 'Apple Metal (Unified Memory), NVIDIA CUDA, AMD ROCm', 'Hardware acceleration backend selection'],
              ['VRAM / Unified Memory', 'VRAM query (NVML, Metal API, rocm-smi)', 'Determines maximum parameter size that fits 100% in high-bandwidth memory'],
              ['Storage Disk Space', 'Storage volume free space analysis', 'Ensures sufficient SSD space for 4GB–40GB model weight files'],
              ['Thermals & Power Profile', 'AC power vs Battery status detection', 'Adjusts background agent batching when running on laptop battery']
            ]
          }
        },
        {
          id: 'hardware-profile-sample',
          title: 'Example Hardware Profile Output',
          codeBlocks: [
            {
              filename: 'hardware-profile.json',
              language: 'json',
              code: `{
  "system": {
    "os": "darwin",
    "arch": "arm64",
    "chipset": "Apple M3 Pro",
    "cpuCores": 12,
    "totalRamBytes": 38654705664,
    "formattedRam": "36.0 GB Unified Memory"
  },
  "gpu": {
    "type": "apple-metal",
    "cores": 18,
    "availableVramBytes": 27917287424,
    "formattedVram": "26.0 GB Usable VRAM"
  },
  "disk": {
    "freeSpaceBytes": 182536110080,
    "formattedFree": "170 GB Free SSD"
  },
  "compatibilityTier": "TIER_HIGH_LOCAL",
  "recommendations": {
    "maxParameterSize": "32B",
    "optimalQuantization": "Q4_K_M",
    "recommendedModels": [
      "qwen2.5-coder:14b",
      "deepseek-r1:14b",
      "qwen2.5-coder:32b"
    ]
  }
}`
            }
          ]
        }
      ],
      relatedPages: [
        { title: 'Model Recommendations', slug: 'local-ai/model-recommendations' },
        { title: 'Model Discovery & Installation', slug: 'local-ai/model-discovery' }
      ]
    }
  },
  {
    slug: 'local-ai/model-discovery',
    title: 'Model Discovery & Installation',
    description: 'One-click discovery, verification, download, and quantization selection from Ollama Library and Hugging Face.',
    section: 'Local AI',
    category: 'Local Model Manager',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['discovery', 'installation', 'huggingface', 'download', 'gguf'],
    content: {
      lead: 'The Model Discovery Hub provides a unified marketplace inside the Desktop IDE to browse, evaluate benchmark scores, and install verified open-source models with a single click.',
      sections: [
        {
          id: 'one-click-install-flow',
          title: 'The One-Click Installation Workflow',
          mermaid: `graph LR
    Search[Search Model Catalog] --> Check[Hardware Check & Fit Rating]
    Check --> Quant[Select Quantization Q4/Q5/Q8]
    Quant --> Download[Resume-Capable Download]
    Download --> Checksum[SHA256 Verification]
    Checksum --> RuntimeReg[Register in Runtime & Model Gateway]
    RuntimeReg --> TestRun[Run Health-Check Prompt]
    TestRun --> Ready[Model Ready for Agents]`,
          diagramTitle: 'Model Installation Pipeline'
        },
        {
          id: 'supported-registries',
          title: 'Supported Model Registries',
          table: {
            headers: ['Registry Source', 'Target Format', 'Supported Runtimes', 'Authentication'],
            rows: [
              ['Ollama Library', 'Ollama Manifest / GGUF', 'Ollama Daemon', 'None (Free Public)'],
              ['Hugging Face Hub', 'GGUF / Safetensors', 'llama.cpp, LM Studio, Ollama Import', 'Optional HF Token for Gated Models'],
              ['Local File Import', 'Direct `.gguf` file path', 'llama.cpp / Ollama', 'Local Filesystem Access'],
              ['Custom Enterprise Registry', 'Internal OCI / HTTP Endpoint', 'Any compatible local runner', 'Bearer Token / mTLS']
            ]
          }
        }
      ],
      relatedPages: [
        { title: 'Ollama Runtime', slug: 'local-ai/ollama-runtime' },
        { title: 'Hugging Face Integration', slug: 'local-ai/huggingface' }
      ]
    }
  },
  {
    slug: 'local-ai/ollama-runtime',
    title: 'Ollama Runtime Integration',
    description: 'Deep integration with the Ollama inference engine: lifecycle management, model pulls, and tool calling.',
    section: 'Local AI',
    category: 'Local Model Manager',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['ollama', 'runtime', 'tool-calling', 'streaming'],
    content: {
      lead: 'Ollama serves as the default native local inference engine in Kernel Base, providing turnkey model management, fast GPU acceleration, and OpenAI-compatible API endpoints.',
      sections: [
        {
          id: 'ollama-lifecycle',
          title: 'Automated Lifecycle Management',
          body: 'Kernel Base automatically detects existing Ollama installations (`http://localhost:11434`). If Ollama is not running, the IDE can spawn and supervise the background Ollama daemon process automatically.',
          codeBlocks: [
            {
              filename: 'config/ollama-integration.json',
              language: 'json',
              code: `{
  "runtime": "ollama",
  "endpoint": "http://127.0.0.1:11434",
  "autoStart": true,
  "keepAlive": "15m",
  "numGpuLayers": "auto",
  "numCtx": 16384,
  "defaultModels": {
    "planner": "qwen2.5-coder:7b",
    "coder": "qwen2.5-coder:14b",
    "qa": "qwen2.5-coder:7b",
    "reasoning": "deepseek-r1:8b"
  }
}`
            }
          ]
        },
        {
          id: 'verified-ollama-models',
          title: 'Top Verified Ollama Models for Kernel Base',
          table: {
            headers: ['Model Tag', 'Parameters', 'RAM/VRAM Footprint', 'IDE Role Recommendation'],
            rows: [
              ['qwen2.5-coder:7b', '7.6B', '~5.2 GB', 'Fast task planning, JSON structure parsing, unit test creation'],
              ['qwen2.5-coder:14b', '14.7B', '~9.4 GB', 'Multi-file code implementation, AST refactoring, bug fixes'],
              ['qwen2.5-coder:32b', '32.5B', '~20.2 GB', 'Frontier-grade coding, complex architecture, deep reasoning'],
              ['deepseek-r1:8b', '8.0B', '~5.8 GB', 'Failure diagnosis, stack trace analysis, security auditing'],
              ['deepseek-r1:14b', '14.7B', '~9.8 GB', 'Deep algorithmic optimization and mathematical proofs'],
              ['llama3.1:8b', '8.0B', '~5.5 GB', 'Documentation authoring, PR summaries, commit messages']
            ]
          }
        }
      ],
      relatedPages: [
        { title: 'Hugging Face Integration', slug: 'local-ai/huggingface' },
        { title: 'Model Gateway', slug: 'architecture/model-gateway' }
      ]
    }
  },
  {
    slug: 'local-ai/huggingface',
    title: 'Hugging Face Integration',
    description: 'Direct model discovery and GGUF download from the Hugging Face Hub with compatibility filtering.',
    section: 'Local AI',
    category: 'Local Model Manager',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['huggingface', 'hub', 'gguf', 'models'],
    content: {
      lead: 'Kernel Base connects directly to Hugging Face Hub APIs to enable developers to browse, filter, and import thousands of community GGUF models directly into local runtimes.',
      sections: [
        {
          id: 'hf-search-filter',
          title: 'Hugging Face GGUF Discovery Engine',
          body: 'The IDE filters Hugging Face repositories based on task tags (`text-generation`, `code`), format (`GGUF`), quantization compatibility with user hardware, and community download popularity.',
          codeBlocks: [
            {
              filename: 'src/core/local/huggingface.ts',
              language: 'typescript',
              code: `export interface HFModelEntry {
  id: string;
  author: string;
  downloads: number;
  likes: number;
  quantizations: {
    filename: string;
    quantType: 'Q4_K_M' | 'Q5_K_M' | 'Q8_0';
    sizeBytes: number;
    fitsInVram: boolean;
    downloadUrl: string;
  }[];
}`
            }
          ]
        },
        {
          id: 'hf-gated-models',
          title: 'Gated & Commercial Models',
          callout: {
            type: 'note',
            title: 'Hugging Face Access Tokens',
            text: 'For models requiring license acceptance (such as Llama 3 or Gemma 2), users can store their Hugging Face access token securely in the Desktop IDE settings.'
          }
        }
      ],
      relatedPages: [
        { title: 'llama.cpp & LM Studio', slug: 'local-ai/llama-cpp' },
        { title: 'Model Recommendations', slug: 'local-ai/model-recommendations' }
      ]
    }
  },
  {
    slug: 'local-ai/llama-cpp',
    title: 'llama.cpp & Other Model Runtimes',
    description: 'Support for high-performance llama.cpp server, LM Studio, vLLM, and custom local inference backends.',
    section: 'Local AI',
    category: 'Local Model Manager',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['llama-cpp', 'lm-studio', 'vllm', 'inference-engine'],
    content: {
      lead: 'In addition to Ollama, Kernel Base provides adapter layers for llama.cpp server, LM Studio local endpoints, vLLM, and any OpenAI-compatible inference server.',
      sections: [
        {
          id: 'runtime-adapters',
          title: 'Supported Local Runtimes',
          table: {
            headers: ['Runtime', 'Connection Protocol', 'Special Capabilities', 'Ideal For'],
            rows: [
              ['llama.cpp server', 'OpenAI-compatible HTTP `/v1/chat/completions`', 'Raw C++ performance, custom RoPE scaling, grammar-based sampling', 'Advanced users, maximum tokens/sec'],
              ['LM Studio', 'Local HTTP bridge (`http://localhost:1234`)', 'Visual UI, prompt inspection, multi-model switching', 'Interactive model testing & visual playground'],
              ['vLLM', 'High-throughput PagedAttention server', 'Continuous batching, multi-GPU tensor parallelism', 'Local multi-agent high-concurrency workstations'],
              ['ExLlamaV2', 'Python REST bridge', 'Extremely fast EXL2 quantization inference on NVIDIA GPUs', 'Dedicated NVIDIA RTX desktop rigs']
            ]
          }
        },
        {
          id: 'generic-openai-endpoint',
          title: 'Configuring Generic Local Endpoints',
          codeBlocks: [
            {
              filename: 'config/custom-local-endpoint.json',
              language: 'json',
              code: `{
  "providerId": "lm-studio-local",
  "name": "LM Studio Bridge",
  "type": "local",
  "apiBase": "http://localhost:1234/v1",
  "apiKey": "not-needed",
  "supportsStreaming": true,
  "supportsTools": true,
  "contextWindow": 16384
}`
            }
          ]
        }
      ],
      relatedPages: [
        { title: 'Custom LLM Gateways', slug: 'models/custom-providers' },
        { title: 'Model Recommendations', slug: 'local-ai/model-recommendations' }
      ]
    }
  },
  {
    slug: 'local-ai/model-recommendations',
    title: 'Automatic Model Recommendation Engine',
    description: 'Algorithmic matching of user hardware specs to the best-performing open-source models for coding and reasoning.',
    section: 'Local AI',
    category: 'Local Model Manager',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['recommendations', 'hardware-matching', 'benchmarks', 'fit'],
    content: {
      lead: 'Kernel Base dynamically computes a hardware-to-model compatibility index to suggest model configurations that guarantee high tokens/sec without swap thrashing.',
      sections: [
        {
          id: 'recommendation-tiers',
          title: 'Hardware Profile Recommendations',
          table: {
            headers: ['Machine Tier', 'Specs Sample', 'Recommended Local Setup', 'Expected Performance'],
            rows: [
              ['Entry (8 GB RAM)', 'Intel/AMD CPU, no GPU', 'DeepSeek Coder 1.3B / Qwen 2.5 3B (Q4)', '~15-25 tokens/s (Fast assistance, basic linting)'],
              ['Standard (16 GB RAM / 8GB VRAM)', 'Apple M1/M2/M3 or RTX 3060/4060', 'Qwen 2.5 Coder 7B (Q4) + DeepSeek R1 8B', '~45-75 tokens/s (Full multi-agent planning & coding)'],
              ['Pro Workstation (32-64 GB RAM / 16GB+ VRAM)', 'Apple M2/M3 Pro/Max or RTX 4080/4090', 'Qwen 2.5 Coder 14B/32B (Q4/Q5) + DeepSeek R1 14B', '~35-60 tokens/s (Frontier-grade local development)'],
              ['Studio/Server (64-128 GB Unified/VRAM)', 'Apple M2/M3 Ultra or Dual RTX 4090 / A6000', 'Qwen 2.5 Coder 32B/72B (Q8) + DeepSeek R1 70B', '~20-40 tokens/s (Completely air-gapped enterprise grade)']
            ]
          }
        },
        {
          id: 'recommendation-rule',
          title: 'Memory Budgeting Safety Factor',
          callout: {
            type: 'important',
            title: '20% Headroom Reserve Policy',
            text: 'Kernel Base always reserves 20% of system memory for Docker sandboxes, compiler processes (like `tsc` or `cargo`), and desktop OS operations, ensuring smooth IDE interactivity while running local models.'
          }
        }
      ],
      relatedPages: [
        { title: 'Health & Resource Monitoring', slug: 'local-ai/health-monitoring' },
        { title: 'Hardware Detection', slug: 'local-ai/hardware-detection' }
      ]
    }
  },
  {
    slug: 'local-ai/health-monitoring',
    title: 'Health & Resource Monitoring',
    description: 'Real-time telemetry on local inference engines: VRAM allocation, tokens-per-second, temperature, and crash recovery.',
    section: 'Local AI',
    category: 'Local Model Manager',
    order: 8,
    checkedDate: 'September 2026',
    tags: ['health', 'telemetry', 'vram', 'monitoring', 'performance'],
    content: {
      lead: 'The Local Model Health Monitor tracks active VRAM footprint, inference latency, generation speed, and daemon responsiveness in real time.',
      sections: [
        {
          id: 'monitored-telemetry-metrics',
          title: 'Real-Time Health Metrics',
          table: {
            headers: ['Metric', 'Update Frequency', 'Target Threshold', 'Mitigation Triggered'],
            rows: [
              ['Tokens / Second', 'Per streaming chunk', '> 15 tok/s minimum', 'Suggests lower quantization if throughput degrades'],
              ['VRAM Allocation', 'Every 2 seconds', '< 85% total VRAM', 'Automatically unloads inactive models from memory'],
              ['Context Window Usage', 'Per prompt assembly', '< 95% model limit', 'Triggers AST context pruning & summary compression'],
              ['Process Health & Heartbeat', 'Every 5 seconds', 'HTTP 200 within 500ms', 'Restarts background inference daemon if frozen']
            ]
          }
        },
        {
          id: 'auto-unload-policy',
          title: 'Intelligent Model Unloading',
          body: 'To prevent memory lockups when the developer is editing code or running tests, local model weights are automatically kept resident for a configurable idle window (default: 15 minutes) before being gracefully paged out.'
        }
      ],
      relatedPages: [
        { title: 'Local AI Overview', slug: 'local-ai/overview' },
        { title: 'Hardware Detection', slug: 'local-ai/hardware-detection' }
      ]
    }
  }
];
