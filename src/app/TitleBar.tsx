import React from 'react';
import { useIDE } from '../context/IDEContext';
import { useAgents } from '../context/AgentContext';
import { Play, Sparkles, Search, Settings } from 'lucide-react';

export const TitleBar: React.FC = () => {
  const { workspace, setIsCommandPaletteOpen, setIsQuickOpenOpen, setIsSettingsOpen } = useIDE();
  const { currentPlan, isRunning } = useAgents();

  return (
    <div className="h-10 bg-[#0d0907] border-b border-[#2a1711] flex items-center justify-between px-3 select-none app-drag-region text-xs text-neutral-300">
      {/* Left Brand */}
      <div className="flex items-center space-x-3 pl-2">
        <div className="flex items-center space-x-2">
          <img src="./logo.png" alt="Kernel Base Logo" className="w-5 h-5 object-contain rounded-md" />
          <span className="font-bold text-neutral-100 tracking-wide">Kernel Base</span>
        </div>
        <span className="text-neutral-600">/</span>
        <span className="text-neutral-400 font-medium">{workspace?.name || 'Workspace'}</span>
      </div>

      {/* Center Search / Command Launcher */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsQuickOpenOpen(true)}
          className="no-drag-region flex items-center space-x-2 bg-[#160e0a] hover:bg-[#221510] border border-[#331c14] text-neutral-400 hover:text-neutral-200 px-3 py-1 rounded-md transition-colors w-64 justify-between"
        >
          <div className="flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <span className="truncate">Search files...</span>
          </div>
          <kbd className="bg-[#2a1711] text-neutral-400 text-[10px] px-1.5 py-0.5 rounded border border-[#3a2016]">Ctrl+P</kbd>
        </button>

        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="no-drag-region flex items-center space-x-1 bg-[#160e0a] hover:bg-[#221510] border border-[#331c14] text-neutral-400 hover:text-neutral-200 px-2 py-1 rounded-md transition-colors"
          title="Command Palette (Ctrl+Shift+P)"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ff6b35]" />
          <span className="text-[11px]">Palette</span>
        </button>
      </div>

      {/* Right Swarm Status + Settings */}
      <div className="flex items-center space-x-3 no-drag-region">
        {currentPlan && (
          <div className="flex items-center space-x-1.5 bg-[#1f100a] px-2.5 py-1 rounded-md border border-[#3d1e13]">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[11px] text-neutral-300 font-mono">
              {currentPlan.steps.filter((s) => s.status === 'completed').length}/{currentPlan.steps.length} Steps
            </span>
          </div>
        )}

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 hover:bg-[#221510] text-neutral-400 hover:text-neutral-200 rounded-md transition-colors"
          title="Settings (Ctrl+,)"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
