export type Theme = 'light' | 'dark' | 'system';

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  section: string;
  category?: string;
  order: number;
  tags?: string[];
  lastUpdated?: string;
  checkedDate?: string;
  content: DocContent;
}

export interface DocContent {
  lead?: string;
  sections: DocSection[];
  relatedPages?: { title: string; slug: string }[];
  interactiveComponent?: 'tech-matrix' | 'desktop-comparison' | 'credit-calculator' | 'architecture-diagram' | 'agent-spec' | 'mvp-tracker';
}

export interface DocCallout {
  type: 'note' | 'tip' | 'warning' | 'info' | 'important';
  title?: string;
  text: string;
}

export interface DocCodeBlock {
  filename?: string;
  language: string;
  code: string;
  highlightLines?: number[];
}

export interface DocCard {
  title: string;
  description: string;
  badge?: string;
  link?: string;
  href?: string;
  code?: string;
}

export interface AgentCardData {
  id: string;
  name: string;
  role: string;
  description: string;
  recommendedModel: string;
  tools: string[];
}

export interface DocSection {
  id: string;
  title: string;
  level?: 2 | 3;
  body?: string;
  callout?: DocCallout;
  codeBlocks?: DocCodeBlock[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  steps?: {
    title: string;
    description: string;
    code?: string;
    language?: string;
  }[];
  mermaid?: string;
  diagramTitle?: string;
  cards?: DocCard[];
}

export interface NavSection {
  id: string;
  title: string;
  badge?: string;
  items: NavCategory[];
}

export interface NavCategory {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  title: string;
  slug: string;
  badge?: string;
  isNew?: boolean;
}

export interface SearchResult {
  slug: string;
  title: string;
  section: string;
  snippet: string;
  matchedTerm: string;
  headingMatch?: string;
}

export interface TechItem {
  name: string;
  purpose: string;
  license: string;
  isOpenSource: boolean;
  freeLocal: boolean;
  freeCloud: boolean;
  studentFriendly: boolean;
  recommendedUse: string;
  alternative: string;
  category: 'agent-runtime' | 'llm-gateway' | 'local-ai' | 'sandbox' | 'database' | 'frontend' | 'desktop' | 'automation';
}
