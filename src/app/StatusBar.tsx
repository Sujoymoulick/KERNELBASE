import React, { useEffect, useState } from 'react';
import { useIDE } from '../context/IDEContext';
import { useAgents } from '../context/AgentContext';
import { GitBranch, AlertCircle, AlertTriangle, Cpu, Terminal, Layers } from 'lucide-react';
import { api } from '../services/api';

export const StatusBar: React.FC = () => {
  const { tabs, activeTabId, activeBottomPanel, setActiveBottomPanel, settings } = useIDE();
  const { agents, isRunning } = useAgents();
  const [gitBranch, setGitBranch] = useState('main');

  useEffect(() => {
    async function loadGit() {
      try {
        const res = await api.git.status();
        setGitBranch(res.branch || 'main');
      } catch (err) {}
    }
    loadGit();
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeAgent = agents.find((a) => a.state !== 'idle') || agents[0];

  return (
    <div className="h-6 bg-[#080504] border-t border-[#20110c] px-3 flex items-center justify-between text-[11px] text-neutral-400 select-none">
      {/* Left items: Git branch + Diagnostics + Active Agent */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {}}
          className="flex items-center space-x-1 hover:text-neutral-200 transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5 text-[#ff6b35]" />
          <span className="font-mono">{gitBranch}</span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>0 Errors</span>
          </div>
          <div className="flex items-center space-x-1 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>0 Warnings</span>
          </div>
        </div>

        {activeAgent && (
          <div className="flex items-center space-x-1.5 bg-[#170c08] px-2 py-0.5 rounded border border-[#2d160e]">
            <span className="text-xs">{activeAgent.avatar}</span>
            <span className="text-neutral-300 font-medium">{activeAgent.name}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
          </div>
        )}
      </div>

      {/* Right items: Bottom panel toggles + Language + Encoding + AI Model */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveBottomPanel(activeBottomPanel === 'terminal' ? 'none' : 'terminal')}
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded transition-colors ${
              activeBottomPanel === 'terminal' ? 'bg-[#26130b] text-[#ff6b35]' : 'hover:text-neutral-200'
            }`}
            title="Toggle Terminal (⌘J)"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setActiveBottomPanel(activeBottomPanel === 'timeline' ? 'none' : 'timeline')}
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded transition-colors ${
              activeBottomPanel === 'timeline' ? 'bg-[#26130b] text-[#ff6b35]' : 'hover:text-neutral-200'
            }`}
            title="Toggle Agent Activity Timeline"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
        </div>

        {activeTab && (
          <>
            <span className="font-mono text-neutral-500">{activeTab.language.toUpperCase()}</span>
            <span>UTF-8</span>
          </>
        )}

        <div className="flex items-center space-x-1 bg-[#1a0e09] px-2 py-0.5 rounded border border-[#35190f] text-neutral-300">
          <Cpu className="w-3 h-3 text-[#ff6b35]" />
          <span>{settings.defaultModel}</span>
        </div>
      </div>
    </div>
  );
};
