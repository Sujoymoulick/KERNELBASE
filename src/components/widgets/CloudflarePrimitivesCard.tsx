import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Database,
  Shield,
  FileCode,
  Globe,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';

interface PrimitiveTab {
  id: string;
  label: string;
  title: string;
  description: string;
  command: string;
  icon: React.ElementType;
  actionText: string;
  subLinks: string[];
}

export const CloudflarePrimitivesCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workers');
  const [copied, setCopied] = useState(false);

  const tabs: PrimitiveTab[] = [
    {
      id: 'workers',
      label: 'Orchestrator Daemon',
      title: 'Local Control Plane Daemon',
      description:
        'Run agent workflows on bare metal or native background daemons without cloud round-trip latency. Direct IPC control of terminal, filesystem, and Docker.',
      command: 'npm run daemon:start -- --port=4000 --local',
      icon: Sparkles,
      actionText: 'Explore Daemon Guide',
      subLinks: ['API Reference', 'Process Architecture', 'Quickstart'],
    },
    {
      id: 'd1',
      label: 'SQLite Transaction DB',
      title: 'Local ACID Event Store',
      description:
        'Embedded SQLite with Write-Ahead Logging (WAL). Zero-config local transactions, audit trails, and DAG checkpoint state.',
      command: 'npx prisma migrate dev --name init_local_sqlite',
      icon: Database,
      actionText: 'Database Architecture',
      subLinks: ['WAL Mode', 'Schema Definitions', 'Zero Latency'],
    },
    {
      id: 'ai',
      label: 'Local LLM Gateway',
      title: 'LiteLLM + Ollama Unified Gateway',
      description:
        'Multi-provider routing layer mapping OpenAI-compatible requests to local Ollama (Qwen, DeepSeek) and cloud free tiers seamlessly.',
      command: 'litellm --config ./litellm-free-tiers.yaml --port 8000',
      icon: Layers,
      actionText: 'Free Model Stack',
      subLinks: ['Ollama Setup', 'OpenRouter Free', 'Cost Estimator'],
    },
    {
      id: 'vectorize',
      label: 'AST & Vector Index',
      title: 'Local Vector & Code Graph Memory',
      description:
        'Embed local source code ASTs using LanceDB or SQLite-vec for semantic search and symbol cross-referencing without external servers.',
      command: 'npm run index:ast -- --workspace=./repo',
      icon: FileCode,
      actionText: 'Codebase Indexing',
      subLinks: ['Tree-Sitter AST', 'LanceDB Setup', 'Context Pruning'],
    },
  ];

  const current = tabs.find((t) => t.id === activeTab) || tabs[0];
  const Icon = current.icon;

  const handleCopy = async () => {
    const success = await copyToClipboard(current.command);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-10 font-sans" style={{ color: 'var(--kb-text)' }}>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-5" style={{ color: 'var(--kb-text)' }}>
        Powerful primitives, seamlessly integrated
      </h2>

      {/* Tab Header Bar */}
      <div
        className="border-b flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none mb-0 rounded-t-xl p-1"
        style={{ borderColor: 'var(--kb-border)', backgroundColor: 'var(--kb-surface-elevated)' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all rounded-t-lg whitespace-nowrap shrink-0 flex items-center space-x-2 border-b-2"
              style={isActive ? {
                borderBottomColor: 'var(--kb-accent-bright)',
                color: 'var(--kb-text)',
                backgroundColor: 'var(--kb-surface)',
                fontWeight: 700,
              } : {
                borderBottomColor: 'transparent',
                color: 'var(--kb-text-subtle)',
              }}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Card Container */}
      <div
        className="p-6 sm:p-8 border rounded-b-xl shadow-md space-y-6"
        style={{ backgroundColor: 'var(--kb-surface)', borderColor: 'var(--kb-border)' }}
      >
        <div className="flex items-start space-x-4">
          <div
            className="p-2.5 rounded-lg border shrink-0"
            style={{
              backgroundColor: 'var(--kb-surface-elevated)',
              borderColor: 'var(--kb-border)',
              color: 'var(--kb-accent-bright)',
            }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--kb-text)' }}>
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--kb-text-muted)' }}>
              {current.description}
            </p>
          </div>
        </div>

        {/* Command Terminal Box */}
        <div className="relative group max-w-3xl">
          <div
            className="flex items-center justify-between px-4 py-3 border rounded-lg font-mono text-xs shadow-inner"
            style={{
              backgroundColor: 'var(--kb-code-bg)',
              borderColor: 'var(--kb-border)',
              color: 'var(--kb-text)',
            }}
          >
            <span className="truncate pr-4 font-medium" style={{ color: 'var(--kb-accent-bright)' }}>
              {current.command}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md transition-colors shrink-0 flex items-center space-x-1"
              style={{ color: 'var(--kb-text-faint)' }}
              title="Copy code to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4" style={{ color: 'var(--kb-accent-bright)' }} />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Action Button & Sub-links Row */}
        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
          <button
            className="px-4 py-2 rounded-full border font-semibold transition-all flex items-center space-x-2 shadow-xs"
            style={{
              backgroundColor: 'var(--kb-accent-bright)',
              borderColor: 'var(--kb-brand-secondary)',
              color: '#FFFFFF',
            }}
          >
            <span>{current.actionText}</span>
            <ArrowRight className="h-3.5 w-3.5 text-white" />
          </button>

          <div className="flex flex-wrap items-center gap-2 font-medium text-xs pl-1" style={{ color: 'var(--kb-text-faint)' }}>
            {current.subLinks.map((link, idx) => (
              <React.Fragment key={link}>
                <span className="cursor-pointer transition-colors hover:underline" style={{ color: 'var(--kb-text-subtle)' }}>
                  {link}
                </span>
                {idx < current.subLinks.length - 1 && <span style={{ color: 'var(--kb-border)' }}>•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
