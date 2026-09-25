import React from 'react';
import { useIDE } from '../context/IDEContext';
import { TitleBar } from './TitleBar';
import { ActivityBar } from './ActivityBar';
import { ProjectExplorer } from '../explorer/ProjectExplorer';
import { GlobalSearch } from './GlobalSearch';
import { CodeEditor } from '../editor/CodeEditor';
import { TerminalPanel } from '../terminal/TerminalPanel';
import { AgentPanel } from '../agents/AgentPanel';
import { StatusBar } from './StatusBar';
import { CommandPalette } from './CommandPalette';
import { QuickOpen } from './QuickOpen';
import { SettingsModal } from './SettingsModal';
import { DiffViewer } from '../diff/DiffViewer';
import { GitBranch, Cpu } from 'lucide-react';

export const IDELayout: React.FC = () => {
  const { activeSidebar, activeBottomPanel, activeDiff } = useIDE();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0c0a09] text-neutral-200 overflow-hidden font-sans select-none">
      {/* 1. Top Title Bar */}
      <TitleBar />

      {/* 2. Main Workspace Body (3-Column Layout) */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0">
        {/* Activity Bar (Far Left Icon Strip) */}
        <ActivityBar />

        {/* Left Dynamic Panel (Explorer / Search / Git / CLI) */}
        {activeSidebar !== 'none' && activeSidebar !== 'agents' && (
          <div className="w-64 bg-[#0d0806] border-r border-[#24130d] flex flex-col shrink-0">
            {activeSidebar === 'explorer' && <ProjectExplorer />}
            {activeSidebar === 'search' && <GlobalSearch />}
            {activeSidebar === 'git' && (
              <div className="p-4 text-xs space-y-3">
                <div className="flex items-center space-x-2 text-[#ff6b35] font-semibold">
                  <GitBranch className="w-4 h-4" />
                  <span>Source Control</span>
                </div>
                <div className="p-3 bg-[#150a06] border border-[#2b140c] rounded-lg text-neutral-400 space-y-2">
                  <p className="font-mono text-neutral-200">Branch: main</p>
                  <p>Status: Working tree clean</p>
                  <div className="pt-2 flex justify-end">
                    <button className="bg-[#ff6b35] text-neutral-950 font-bold px-3 py-1 rounded">
                      Sync Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeSidebar === 'cli' && (
              <div className="p-4 text-xs space-y-3">
                <div className="flex items-center space-x-2 text-[#ff6b35] font-semibold">
                  <Cpu className="w-4 h-4" />
                  <span>CLI Integrations</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-[#150a06] border border-[#2b140c] rounded flex justify-between">
                    <span>Antigravity CLI (agy)</span>
                    <span className="text-emerald-400">v2.0.0</span>
                  </div>
                  <div className="p-2 bg-[#150a06] border border-[#2b140c] rounded flex justify-between">
                    <span>Git</span>
                    <span className="text-emerald-400">v2.39.0</span>
                  </div>
                  <div className="p-2 bg-[#150a06] border border-[#2b140c] rounded flex justify-between">
                    <span>Node.js</span>
                    <span className="text-emerald-400">v20.10.0</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Center Workspace (Editor + Bottom Terminal Panel) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#120a07]">
          {/* Editor / Diff Viewer Container */}
          <div className="flex-1 min-h-0 relative">
            {activeDiff ? <DiffViewer /> : <CodeEditor />}
          </div>

          {/* Bottom Panel (Terminal / Problems / Timeline) */}
          {activeBottomPanel !== 'none' && (
            <div className="h-64 border-t border-[#26130b] flex flex-col shrink-0 bg-[#0e0805]">
              {activeBottomPanel === 'terminal' && <TerminalPanel />}
              {activeBottomPanel === 'problems' && (
                <div className="p-4 text-xs text-neutral-400">
                  <h4 className="font-semibold text-neutral-200 mb-2">Problems</h4>
                  <p>No diagnostics or errors reported in workspace.</p>
                </div>
              )}
              {activeBottomPanel === 'timeline' && (
                <div className="p-4 text-xs text-neutral-400">
                  <h4 className="font-semibold text-neutral-200 mb-2">Agent Timeline</h4>
                  <p>No recent agent actions performed.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Dock: Agent Swarm Roster & Objective Panel */}
        <div className="w-80 bg-[#0f0907] border-l border-[#28150f] flex flex-col shrink-0">
          <AgentPanel />
        </div>
      </div>

      {/* 3. Bottom Status Bar */}
      <StatusBar />

      {/* 4. Global Modals & Overlays */}
      <CommandPalette />
      <QuickOpen />
      <SettingsModal />
    </div>
  );
};
