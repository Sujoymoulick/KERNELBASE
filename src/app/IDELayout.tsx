import React, { useState, useEffect, useRef } from 'react';
import { useIDE } from '../context/IDEContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
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
import { ExtensionsPanel } from '../extensions/ExtensionsPanel';
import { GitBranch, Cpu } from 'lucide-react';

export const IDELayout: React.FC = () => {
  const { activeSidebar, activeBottomPanel, activeDiff, isAgentPanelOpen, settings } = useIDE();
  useKeyboardShortcuts();

  // Dynamic panel dimensions state (in pixels)
  const [leftWidth, setLeftWidth] = useState<number>(260);
  const [bottomHeight, setBottomHeight] = useState<number>(260);
  const [rightWidth, setRightWidth] = useState<number>(320);

  // Active dragging flags
  const [isResizingLeft, setIsResizingLeft] = useState<boolean>(false);
  const [isResizingBottom, setIsResizingBottom] = useState<boolean>(false);
  const [isResizingRight, setIsResizingRight] = useState<boolean>(false);

  const startResizingLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
  };

  const startResizingBottom = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingBottom(true);
  };

  const startResizingRight = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        // Left ActivityBar width is 48px (w-12)
        const newWidth = Math.max(180, Math.min(650, e.clientX - 48));
        setLeftWidth(newWidth);
        window.dispatchEvent(new Event('resize'));
      } else if (isResizingBottom) {
        // Bottom height from window bottom minus status bar (24px)
        const newHeight = Math.max(100, Math.min(650, window.innerHeight - e.clientY - 24));
        setBottomHeight(newHeight);
        window.dispatchEvent(new Event('resize'));
      } else if (isResizingRight) {
        const newWidth = Math.max(220, Math.min(750, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
        window.dispatchEvent(new Event('resize'));
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingBottom(false);
      setIsResizingRight(false);
      window.dispatchEvent(new Event('resize'));
    };

    if (isResizingLeft || isResizingBottom || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingBottom, isResizingRight]);

  const isDraggingAny = isResizingLeft || isResizingBottom || isResizingRight;

  return (
    <div
      data-theme={settings.theme || 'dark'}
      className={`h-screen w-screen flex flex-col bg-[#0c0a09] text-neutral-200 overflow-hidden font-sans ${
        isDraggingAny ? 'select-none cursor-grabbing' : 'select-none'
      }`}
    >
      {/* 1. Top Title Bar */}
      <TitleBar />

      {/* 2. Main Workspace Body (3-Column Resizable Layout) */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0 relative">
        {/* Activity Bar (Far Left Fixed Dock) */}
        <ActivityBar />

        {/* Left Dynamic Panel (Explorer / Search / Git / Extensions / CLI) */}
        {activeSidebar !== 'none' && (
          <>
            <div
              style={{ width: `${leftWidth}px` }}
              className="bg-[#0d0806] flex flex-col shrink-0 overflow-hidden"
            >
              {activeSidebar === 'explorer' && <ProjectExplorer />}
              {activeSidebar === 'search' && <GlobalSearch />}
              {activeSidebar === 'extensions' && <ExtensionsPanel />}
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

            {/* Left Resizer Handle (Drag Left / Right) */}
            <div
              onMouseDown={startResizingLeft}
              className={`w-1 hover:w-1.5 bg-[#24130d] hover:bg-[#ff6b35] cursor-col-resize shrink-0 transition-all z-20 ${
                isResizingLeft ? 'bg-[#ff6b35] w-1.5' : ''
              }`}
              title="Drag right/left to resize Left Panel"
            />
          </>
        )}

        {/* Center Workspace (Editor + Bottom Terminal Panel) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#120a07]">
          {/* Editor / Diff Viewer Container */}
          <div className="flex-1 min-h-0 relative">
            {activeDiff ? <DiffViewer /> : <CodeEditor />}
          </div>

          {/* Bottom Panel (Terminal / Problems / Timeline) */}
          {activeBottomPanel !== 'none' && (
            <>
              {/* Bottom Resizer Handle (Drag Up / Down) */}
              <div
                onMouseDown={startResizingBottom}
                className={`h-1 hover:h-1.5 bg-[#24130d] hover:bg-[#ff6b35] cursor-row-resize shrink-0 transition-all z-20 ${
                  isResizingBottom ? 'bg-[#ff6b35] h-1.5' : ''
                }`}
                title="Drag up/down to resize Terminal Panel"
              />

              <div
                style={{ height: `${bottomHeight}px` }}
                className="flex flex-col shrink-0 bg-[#0e0805] overflow-hidden"
              >
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
            </>
          )}
        </div>

        {/* Right Dock: Agent Swarm Roster & Objective Panel */}
        {isAgentPanelOpen && (
          <>
            {/* Right Resizer Handle (Drag Left / Right) */}
            <div
              onMouseDown={startResizingRight}
              className={`w-1 hover:w-1.5 bg-[#24130d] hover:bg-[#ff6b35] cursor-col-resize shrink-0 transition-all z-20 ${
                isResizingRight ? 'bg-[#ff6b35] w-1.5' : ''
              }`}
              title="Drag left/right to resize Agent Swarm Panel"
            />

            <div
              style={{ width: `${rightWidth}px` }}
              className="bg-[#0f0907] flex flex-col shrink-0 overflow-hidden"
            >
              <AgentPanel />
            </div>
          </>
        )}
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
