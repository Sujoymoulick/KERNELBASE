import { DocPage } from '../../types/docs';

export const roadmapPages: DocPage[] = [
  {
    slug: 'roadmap/release-milestones',
    title: 'Release Milestones (MVP → v1.0)',
    description: 'The complete phased release schedule: MVP, v0.2, v0.5, and v1.0 Production.',
    section: 'Roadmap',
    category: 'Releases & Future',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['roadmap', 'milestones', 'v1.0'],
    content: {
      lead: 'Our engineering roadmap charts the progression from the 10-day single-developer MVP to an enterprise-grade collaborative multi-agent platform.',
      sections: [
        {
          id: 'milestone-table',
          title: 'Phased Release Milestones',
          table: {
            headers: ['Version', 'Focus', 'Key Capabilities Delivered', 'Target Horizon'],
            rows: [
              ['v0.1 MVP', 'Local Core', '11 built-in agents, SQLite runs, Docker sandbox, Ollama + OpenRouter', 'Month 1 (Immediate)'],
              ['v0.2', 'Tooling & Git', 'Full Git worktree visual manager, Playwright E2E testing, custom MCP registry', 'Month 2 – 3'],
              ['v0.5', 'Team IDE', 'Multi-developer shared agent sessions, peer code reviews, Tauri v2 migration', 'Month 4 – 6'],
              ['v1.0', 'Production', 'Agent Marketplace, A2A federated agent protocol, enterprise RBAC', 'Month 7 – 9'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Desktop & Cloud Collaboration', slug: 'roadmap/desktop-cloud' },
        { title: 'Agent Marketplace & A2A', slug: 'roadmap/marketplace-a2a' },
      ],
    },
  },
  {
    slug: 'roadmap/desktop-cloud',
    title: 'Desktop & Cloud Collaboration',
    description: 'Hybrid architecture bridging local desktop execution with optional remote GPU compute clusters.',
    section: 'Roadmap',
    category: 'Releases & Future',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['cloud', 'collaboration', 'hybrid'],
    content: {
      lead: 'Empower teams to offload long-running test suites and 70B parameter models to remote company servers while retaining instant desktop UI responsiveness.',
      sections: [
        {
          id: 'hybrid-execution',
          title: 'Hybrid Compute Topology',
          body: 'Developers with lightweight laptops can connect their local IDE to an on-premise Kubernetes or Slurm GPU cluster running vLLM and Docker sandboxes.',
        },
      ],
      relatedPages: [
        { title: 'Agent Marketplace & A2A', slug: 'roadmap/marketplace-a2a' },
      ],
    },
  },
  {
    slug: 'roadmap/marketplace-a2a',
    title: 'Agent Marketplace & A2A Protocol',
    description: 'Community plugin marketplace and implementation of Agent-to-Agent (A2A) protocol standards.',
    section: 'Roadmap',
    category: 'Releases & Future',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['marketplace', 'a2a', 'plugins'],
    content: {
      lead: 'A federated ecosystem where developers can publish verified domain agents and interconnect agents across organizational boundaries.',
      sections: [
        {
          id: 'a2a-protocol',
          title: 'The Agent-to-Agent (A2A) Standard',
          body: 'Implementing Google and open consortium A2A protocols, enabling an internal SecurityAgent to negotiate automated vulnerability audits with third-party verification bots.',
        },
      ],
      relatedPages: [
        { title: 'Release Milestones (MVP → v1.0)', slug: 'roadmap/release-milestones' },
      ],
    },
  },
];
