import { DocPage } from '../../types/docs';

export const resourcesPages: DocPage[] = [
  {
    slug: 'resources/langgraph',
    title: 'LangGraph vs Custom DAGs',
    description: 'Technical evaluation of LangGraph vs custom TypeScript DAG schedulers for native desktop IDEs.',
    section: 'Resources',
    category: 'Ecosystem & Libraries',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['langgraph', 'dag', 'architecture', 'comparison'],
    content: {
      lead: 'An analysis of state graph libraries: why we implemented a zero-dependency TypeScript DAG engine instead of packaging Python LangGraph inside desktop binaries.',
      sections: [
        {
          id: 'langgraph-tradeoffs',
          title: 'Architectural Comparison',
          table: {
            headers: ['Dimension', 'LangGraph (Python/JS)', 'Custom TypeScript DAG Engine (Ours)'],
            rows: [
              ['Bundle Size Overhead', '~14MB + Python runtime or heavy JS deps', '<40KB zero-dependency TypeScript'],
              ['Memory Footprint', '80 – 150 MB additional RAM', '<5 MB in-memory graph representation'],
              ['State Checkpointing', 'Postgres / Redis checkpointer', 'Local embedded SQLite with instant ACID rollback'],
              ['Desktop Packaging', 'Complex sidecar process management', 'Runs natively inside Node.js or browser context'],
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
    slug: 'resources/openhands-cline',
    title: 'OpenHands & Cline Analysis',
    description: 'Deconstructing architectures, tool primitives, and event streaming in OpenHands and Cline.',
    section: 'Resources',
    category: 'Ecosystem & Libraries',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['openhands', 'cline', 'analysis'],
    content: {
      lead: 'Lessons learned from the pioneer open-source autonomous coding agents: OpenHands (All-Hands-AI) and Cline (formerly Claude Dev).',
      sections: [
        {
          id: 'openhands-lessons',
          title: 'Key Insights from OpenHands',
          body: 'OpenHands demonstrated the absolute necessity of Docker sandboxing. Without container isolation, agents routinely corrupted local python virtualenvs or altered host git configs.',
        },
        {
          id: 'cline-lessons',
          title: 'Key Insights from Cline',
          body: 'Cline proved the usability of step-by-step tool approval dialogs, showing developers demand transparent diff previews before applying file patches.',
        },
      ],
      relatedPages: [
        { title: 'Open-Source Landscape & Competitors', slug: 'research/competitive-analysis' },
      ],
    },
  },
  {
    slug: 'resources/mcp',
    title: 'Model Context Protocol (MCP) Guide',
    description: 'Complete guide to building, testing, and debugging MCP servers for AI IDE integration.',
    section: 'Resources',
    category: 'Ecosystem & Libraries',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['mcp', 'sdk', 'guide', 'tutorial'],
    content: {
      lead: 'Author and connect custom MCP servers over stdio or SSE to extend agent capabilities.',
      sections: [
        {
          id: 'mcp-sdk-example',
          title: 'Authoring an MCP Tool Server in TypeScript',
          codeBlocks: [
            {
              filename: 'mcp-server.ts',
              language: 'typescript',
              code: `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'my-custom-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'run_security_scan',
    description: 'Scans files for vulnerabilities',
    inputSchema: { type: 'object', properties: { path: { type: 'string' } } }
  }]
}));

const transport = new StdioServerTransport();
await server.connect(transport);`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Model Context Protocol (MCP)', slug: 'tools/mcp' },
      ],
    },
  },
  {
    slug: 'resources/litellm-ollama',
    title: 'LiteLLM & Ollama Manual',
    description: 'Deployment patterns, quantization options, and performance tuning for Ollama and LiteLLM.',
    section: 'Resources',
    category: 'Ecosystem & Libraries',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['litellm', 'ollama', 'manual', 'tuning'],
    content: {
      lead: 'Master model serving: configure GPU offloading in Ollama and setup load-balanced LiteLLM proxies.',
      sections: [
        {
          id: 'ollama-tuning',
          title: 'Ollama VRAM Optimization',
          body: 'On machines with 8GB–16GB unified memory, set `OLLAMA_NUM_PARALLEL=2` and `OLLAMA_FLASH_ATTENTION=1` to double inference concurrency without exceeding memory limits.',
        },
      ],
      relatedPages: [
        { title: 'Ollama (Local Tier 1)', slug: 'models/ollama' },
      ],
    },
  },
  {
    slug: 'resources/docker-playwright',
    title: 'Docker, Playwright & Redis',
    description: 'Container setup scripts, headless browser dependencies, and Redis cache configurations.',
    section: 'Resources',
    category: 'Ecosystem & Libraries',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['docker', 'playwright', 'redis', 'infrastructure'],
    content: {
      lead: 'Production compose recipes for running the execution sandbox, browser automation daemon, and rate-limiting cache.',
      sections: [
        {
          id: 'docker-compose-recipe',
          title: 'Local Development Docker Compose',
          codeBlocks: [
            {
              filename: 'docker-compose.yml',
              language: 'yaml',
              code: `version: '3.8'
services:
  sandbox:
    image: node:20-alpine
    container_name: ai_ide_sandbox
    restart: unless-stopped
    volumes:
      - ./worktrees:/workspace:rw
    mem_limit: 2048m
    cpus: 2.0
    network_mode: bridge

  redis:
    image: redis:7-alpine
    container_name: ai_ide_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Docker Execution Sandbox', slug: 'tools/docker' },
      ],
    },
  },
];
