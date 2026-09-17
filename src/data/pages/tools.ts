import { DocPage } from '../../types/docs';

export const toolsPages: DocPage[] = [
  {
    slug: 'tools/mcp',
    title: 'Model Context Protocol (MCP)',
    description: 'Implementation of the Anthropic Model Context Protocol for interoperable tool and resource integration.',
    section: 'Tools & MCP',
    category: 'Standard Protocols',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['mcp', 'tools', 'protocol', 'json-rpc'],
    content: {
      lead: 'The IDE implements the open Model Context Protocol (MCP) as its core tool bus, allowing any MCP-compliant tool or dataset to be mounted instantly.',
      sections: [
        {
          id: 'mcp-overview',
          title: 'How MCP Operates in the IDE',
          body: 'MCP provides a client-server architecture over JSON-RPC. When an agent requires database access, it queries the `postgresql-mcp` server, which exposes tools like `query`, `list_tables`, and `explain_query`.',
          codeBlocks: [
            {
              filename: 'mcp-config.json',
              language: 'json',
              code: `{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["./servers/filesystem.js", "--root", "/workspace"]
    },
    "postgres": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/postgres", "--conn", "postgres://user:pass@localhost:5432/devdb"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Tool Layer & MCP Architecture', slug: 'architecture/mcp-architecture' },
        { title: 'Custom Tool Registry & Permissions', slug: 'tools/custom-tools' },
      ],
    },
  },
  {
    slug: 'tools/filesystem',
    title: 'Filesystem Tools',
    description: 'Safe file reading, atomic writing, AST-based symbol searching, and directory traversal.',
    section: 'Tools & MCP',
    category: 'Standard Protocols',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['filesystem', 'diff', 'read', 'write'],
    content: {
      lead: 'Filesystem tools provide atomic, audited file mutations confined strictly to the designated project root.',
      sections: [
        {
          id: 'available-fs-tools',
          title: 'Filesystem Tool Primitives',
          table: {
            headers: ['Tool Name', 'Arguments', 'Return Value', 'Safety Check'],
            rows: [
              ['read_file', 'filePath, startLine?, endLine?', 'File content with line numbers', 'Cannot read outside project root'],
              ['edit_file', 'filePath, targetContent, replacementContent', 'Diff patch status', 'Requires exact string or AST match'],
              ['create_file', 'filePath, content, overwrite?', 'Path, byte length', 'Refuses overwrite without explicit flag'],
              ['list_dir', 'dirPath, recursive?, depth?', 'Array of file metadata', 'Filters out .git, node_modules, dist'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Git & Worktree Isolation', slug: 'tools/git' },
      ],
    },
  },
  {
    slug: 'tools/terminal',
    title: 'Terminal & Command Runner',
    description: 'Sandbox command execution with output streaming, timeouts, and command allowlisting.',
    section: 'Tools & MCP',
    category: 'Standard Protocols',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['terminal', 'bash', 'sandbox', 'commands'],
    content: {
      lead: 'The Command Runner executes shell commands inside the Docker sandbox, intercepting destructive calls and streaming stdout/stderr.',
      sections: [
        {
          id: 'command-allowlist',
          title: 'Command Allowlists and Blocklists',
          body: 'Commands like `rm -rf /`, `mkfs`, or direct network port forwards are blocked by default. Safe tools like `npm`, `git`, `pytest`, `cargo`, and `cat` execute with 60-second timeouts.',
        },
      ],
      relatedPages: [
        { title: 'Docker Execution Sandbox', slug: 'tools/docker' },
      ],
    },
  },
  {
    slug: 'tools/git',
    title: 'Git & Worktree Isolation',
    description: 'Branch management, programmatic commits, worktree isolation, and conflict resolution.',
    section: 'Tools & MCP',
    category: 'Standard Protocols',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['git', 'worktree', 'branches', 'diff'],
    content: {
      lead: 'Git worktrees provide hardware-level filesystem isolation, allowing agents to edit and build code on dedicated branches without touching your active editor files.',
      sections: [
        {
          id: 'worktree-commands',
          title: 'Underlying Worktree Operations',
          codeBlocks: [
            {
              filename: 'worktree-manager.ts',
              language: 'typescript',
              code: `# Creating isolated workspace for run-104
git worktree add -b ai/run-104 .ai-ide/worktrees/run-104 HEAD

# Cleanup after merge or abort
git worktree remove --force .ai-ide/worktrees/run-104
git branch -D ai/run-104`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Workspace Isolation', slug: 'architecture/workspace-isolation' },
      ],
    },
  },
  {
    slug: 'tools/docker',
    title: 'Docker Execution Sandbox',
    description: 'Disposable Linux containers, volume isolation, CPU/memory quotas, and offline networks.',
    section: 'Tools & MCP',
    category: 'Execution Environments',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['docker', 'sandbox', 'containers', 'security'],
    content: {
      lead: 'Docker sandboxing encapsulates all agent-generated code execution inside ephemeral containers.',
      sections: [
        {
          id: 'docker-compose-template',
          title: 'Sandbox Container Specification',
          codeBlocks: [
            {
              filename: 'sandbox/Dockerfile',
              language: 'dockerfile',
              code: `FROM node:20-alpine
RUN apk add --no-cache git bash python3 py3-pip curl
RUN adduser -D -u 1001 agentuser
WORKDIR /workspace
USER agentuser
ENV NODE_ENV=development
# Security hardening: no root privileges
ENTRYPOINT ["/bin/bash"]`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Sandbox Architecture', slug: 'architecture/sandbox-architecture' },
      ],
    },
  },
  {
    slug: 'tools/playwright',
    title: 'Browser & Playwright Automation',
    description: 'Headless browser execution for research, web crawling, UI screenshot diffing, and E2E testing.',
    section: 'Tools & MCP',
    category: 'Execution Environments',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['playwright', 'browser', 'e2e', 'automation'],
    content: {
      lead: 'Playwright automation enables the Research Agent to read web documentation and the QA Agent to verify frontend UI renders.',
      sections: [
        {
          id: 'screenshot-verification',
          title: 'Visual Regression Testing',
          body: 'The QA Agent can spin up the application in a headless browser, take full-page screenshots, and verify that layouts render without broken images or console errors.',
        },
      ],
      relatedPages: [
        { title: 'QA Agent', slug: 'agents/qa-agent' },
      ],
    },
  },
  {
    slug: 'tools/postgresql',
    title: 'Database (PostgreSQL / SQLite)',
    description: 'Schema introspection, safe transaction testing, query optimization, and SQLite fallback.',
    section: 'Tools & MCP',
    category: 'Execution Environments',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['postgres', 'sqlite', 'database', 'sql'],
    content: {
      lead: 'Database tools allow agents to inspect schemas, execute safe rollbacked migrations, and benchmark query performance.',
      sections: [
        {
          id: 'safe-dry-run',
          title: 'Transactional Dry-Run Policy',
          body: 'All test queries are wrapped inside `BEGIN ... ROLLBACK` transactions unless explicitly authorized by the developer, preventing data corruption during testing.',
        },
      ],
      relatedPages: [
        { title: 'Data Analyst Agent', slug: 'agents/data-analyst-agent' },
      ],
    },
  },
  {
    slug: 'tools/custom-tools',
    title: 'Custom Tool Registry & Permissions',
    description: 'Authoring custom MCP tools with JSON schemas, validation, and security access policies.',
    section: 'Tools & MCP',
    category: 'Execution Environments',
    order: 8,
    checkedDate: 'September 2026',
    tags: ['custom-tools', 'tool-spec', 'mcp-server'],
    content: {
      lead: 'Add proprietary CLI scripts or internal company APIs as first-class tools accessible to all registered agents.',
      sections: [
        {
          id: 'custom-tool-schema',
          title: 'Custom Tool JSON Schema',
          codeBlocks: [
            {
              filename: 'tools/deploy-preview.json',
              language: 'json',
              code: `{
  "name": "deploy_preview",
  "description": "Deploys an ephemeral preview branch to Cloudflare Pages",
  "parameters": {
    "type": "object",
    "properties": {
      "branchName": { "type": "string" },
      "buildCommand": { "type": "string", "default": "npm run build" }
    },
    "required": ["branchName"]
  },
  "requiresApproval": true,
  "timeoutSeconds": 180
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Creating Custom Agents', slug: 'agents/creating-custom-agents' },
      ],
    },
  },
];
