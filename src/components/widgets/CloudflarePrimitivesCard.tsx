import React, { useState } from 'react';
import { Terminal, Cpu, Database, Layers, Copy, Check, ArrowRight } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';

export const CloudflarePrimitivesCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compute' | 'ai' | 'storage' | 'media'>('compute');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'compute', label: 'Compute', icon: Terminal },
    { id: 'ai', label: 'AI', icon: Cpu },
    { id: 'storage', label: 'Storage & Databases', icon: Database },
    { id: 'media', label: 'Media', icon: Layers },
  ] as const;

  const content = {
    compute: {
      icon: Terminal,
      title: 'Deploy with one command',
      description:
        'Build and deploy serverless functions and full-stack apps on the AI-Native platform. No servers to manage. No cold starts or region complexity.',
      command: 'npm create ai-native-ide@latest my-app',
      actionText: 'Create your first Worker',
      subLinks: ['Workers', 'Containers', 'Durable Objects', 'Queues', 'Flagship'],
    },
    ai: {
      icon: Cpu,
      title: 'Orchestrate multi-agent workflows',
      description:
        'Run multi-agent LLM inference with tiered routing across local $0 Ollama models, OpenRouter budget cloud, and frontier commercial APIs.',
      command: 'npx ai-native-ide add-agent --role coder --tier local',
      actionText: 'Explore Model Router',
      subLinks: ['LiteLLM', 'Ollama', 'Qwen 2.5', 'DeepSeek V3', 'Claude 3.5'],
    },
    storage: {
      icon: Database,
      title: 'ACID State & Run Persistence',
      description:
        'Local SQLite transactional storage coupled with temporary Git worktree branches enabling instant time-travel rollback for any execution step.',
      command: 'ai-native-ide state:checkpoint --worktree .ai-ide/worktrees',
      actionText: 'View State Architecture',
      subLinks: ['SQLite', 'Git Worktrees', 'Time Travel', 'Run Persistence'],
    },
    media: {
      icon: Layers,
      title: 'Isolated Docker Sandboxing',
      description:
        'Containerized execution environment with non-root Linux permissions, memory cgroups caps, and automated Vitest/TAP test execution.',
      command: 'docker run --rm -v $(pwd):/workspace ai-sandbox test',
      actionText: 'View Container Hardening',
      subLinks: ['Docker Engine', 'Alpine', 'TAP Test Runner', 'Non-Root'],
    },
  };

  const current = content[activeTab];
  const Icon = current.icon;

  const handleCopy = async () => {
    const success = await copyToClipboard(current.command);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-10 text-white font-sans">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-5">
        Powerful primitives, seamlessly integrated
      </h2>

      {/* Tab Header Bar */}
      <div className="border-b border-slate-200 dark:border-[#1D2430] flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none mb-0 bg-slate-100 dark:bg-[#0B0D11] rounded-t-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap shrink-0 flex items-center space-x-2 ${
                isActive
                  ? 'border-[#f38020] text-slate-900 dark:text-[#F5F7FA] bg-white dark:bg-[#0D1118]'
                  : 'border-transparent text-slate-500 dark:text-[#A7AFBD] hover:text-slate-900 dark:hover:text-[#F5F7FA] hover:bg-slate-200/50 dark:hover:bg-[#141C2B]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Card Container */}
      <div className="p-6 sm:p-8 bg-white dark:bg-[#0D1118] border border-slate-200 dark:border-[#1D2430] rounded-b-xl shadow-2xl space-y-6">
        <div className="flex items-start space-x-4">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-[#172033] border border-indigo-200 dark:border-[#233558] text-indigo-600 dark:text-[#70a5ff] shrink-0">
            <Icon className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#F5F7FA] tracking-tight">
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A7AFBD] leading-relaxed">
              {current.description}
            </p>
          </div>
        </div>

        {/* Command Terminal Box */}
        <div className="relative group max-w-3xl">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 dark:bg-[#090C12] border border-slate-800 dark:border-[#1D2430] rounded-lg font-mono text-xs text-slate-200 dark:text-[#F5F7FA] shadow-inner">
            <span className="truncate pr-4 text-orange-400 font-medium">
              {current.command}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 flex items-center space-x-1"
              title="Copy code to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Action Button & Sub-links Row */}
        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
          <button className="px-4 py-2 rounded-full border border-slate-300 dark:border-[#1D2430] bg-slate-100 dark:bg-[#101624] hover:border-[#f38020] text-slate-900 dark:text-[#F5F7FA] font-semibold transition-all flex items-center space-x-2">
            <span>{current.actionText}</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#f38020]" />
          </button>

          <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-[#707987] font-medium text-xs pl-1">
            {current.subLinks.map((link, idx) => (
              <React.Fragment key={link}>
                <span className="hover:text-slate-900 dark:hover:text-[#F5F7FA] cursor-pointer transition-colors">{link}</span>
                {idx < current.subLinks.length - 1 && <span className="text-slate-400 dark:text-[#1D2430]">•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
