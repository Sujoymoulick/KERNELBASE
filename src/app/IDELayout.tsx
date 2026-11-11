import React, { useState, useEffect } from 'react';
import { TitleBar } from './TitleBar';
import { ActivityBar } from './ActivityBar';
import { StatusBar } from './StatusBar';
import { CommandPalette } from './CommandPalette';
import { QuickOpen } from './QuickOpen';
import { ProjectExplorer } from '../explorer/ProjectExplorer';
import { GlobalSearch } from './GlobalSearch';
import { GitPanel } from '../git/GitPanel';
import { RunDebugPanel } from '../run/RunDebugPanel';
import { ExtensionsPanel } from '../extensions/ExtensionsPanel';
import { AgentPanel } from '../agents/AgentPanel';
import { CodeEditor } from '../editor/CodeEditor';
import { DiffViewer } from '../diff/DiffViewer';
import { TerminalPanel } from '../terminal/TerminalPanel';
import { ProblemsPanel } from '../problems/ProblemsPanel';
import { OutputPanel, OutputLogItem } from '../output/OutputPanel';
import { SettingsModal } from '../settings/SettingsModal';
import { PermissionModal } from '../agents/PermissionModal';
import { AgentStudio } from '../studio/AgentStudio';
import { useIDE } from '../context/IDEContext';
import { PermissionRequest, RunExecutionResult } from '../types/ide';
import { AlertCircle, Terminal, FileCode, Play, X, ChevronUp, ChevronDown } from 'lucide-react';

export const IDELayout: React.FC = () => {
  const {
    activeSidebar,
    activeBottomPanel,
    setActiveBottomPanel,
    activeDiff,
    tabs,
    activeTabId,
    workspace,
    diagnostics,
  } = useIDE();

  const [sidebarWidth, setSidebarWidth] = useState<number>(260);
  const [bottomPanelHeight, setBottomPanelHeight] = useState<number>(240);
  const [isResizingSidebar, setIsResizingSidebar] = useState<boolean>(false);
  const [isResizingPanel, setIsResizingPanel] = useState<boolean>(false);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(true);
  const [studioWidth, setStudioWidth] = useState<number>(420);
  const [isResizingStudio, setIsResizingStudio] = useState<boolean>(false);

  // Agent Studio toggle: ⌘⇧L or the activity bar / command palette event
  useEffect(() => {
    const toggle = () => setIsStudioOpen((v) => !v);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('kb:toggle-studio', toggle);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('kb:toggle-studio', toggle);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!isResizingStudio) return;
    const move = (e: MouseEvent) => setStudioWidth(Math.min(800, Math.max(320, window.innerWidth - e.clientX)));
    const up = () => setIsResizingStudio(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [isResizingStudio]);

  const [outputLogs, setOutputLogs] = useState<OutputLogItem[]>([]);
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [pendingPermission, setPendingPermission] = useState<PermissionRequest | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Listen for Electron runtime events (Run output, tool execution, permissions)
  useEffect(() => {
    if (window.kernelBase?.run) {
      const unsubData = window.kernelBase.run.onData((payload) => {
        setOutputLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${Math.random()}`,
            channel: 'Compiler & Build',
            text: payload.data,
            level: payload.stream === 'stderr' ? 'warn' : 'info',
            timestamp: Date.now(),
          },
        ]);
      });

      const unsubExit = window.kernelBase.run.onExit((payload) => {
        setIsRunningCode(false);
        setOutputLogs((prev) => [
          ...prev,
          {
            id: `log-exit-${Date.now()}`,
            channel: 'Compiler & Build',
            text: `[Process completed with exit code ${payload.result.exitCode} in ${payload.result.durationMs}ms]`,
            level: payload.result.success ? 'success' : 'error',
            timestamp: Date.now(),
          },
        ]);
      });

      return () => {
        unsubData();
        unsubExit();
      };
    }
  }, []);

  // Listen for permission requests from the zero-trust gate
  useEffect(() => {
    if (window.kernelBase?.permissions) {
      const unsub = window.kernelBase.permissions.onRequest((req) => {
        setPendingPermission(req);
      });
      return () => unsub();
    }
  }, []);

  const handleRespondPermission = async (id: string, approved: boolean, alwaysAllow?: boolean) => {
    if (window.kernelBase?.permissions) {
      await window.kernelBase.permissions.respond(id, approved, alwaysAllow);
    }
    setPendingPermission(null);
  };

  const handleRunCode = async () => {
    if (!activeTab || isRunningCode) return;
    setIsRunningCode(true);
    setActiveBottomPanel('output');
    setOutputLogs((prev) => [
      ...prev,
      {
        id: `start-${Date.now()}`,
        channel: 'Compiler & Build',
        text: `>>> Compiling & Running ${activeTab.name} (${activeTab.language})...`,
        level: 'info',
        timestamp: Date.now(),
      },
    ]);

    try {
      if (window.kernelBase?.run) {
        const res = await window.kernelBase.run.executeFile({
          filePath: activeTab.path,
          language: activeTab.language,
          workspacePath: workspace?.rootPath || '',
        });

        if (res.stdout) {
          setOutputLogs((prev) => [
            ...prev,
            {
              id: `out-${Date.now()}`,
              channel: 'Compiler & Build',
              text: res.stdout,
              level: 'info',
              timestamp: Date.now(),
            },
          ]);
        }
        if (res.stderr) {
          setOutputLogs((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              channel: 'Compiler & Build',
              text: res.stderr,
              level: 'error',
              timestamp: Date.now(),
            },
          ]);
        }
      } else {
        // Fallback for standalone preview
        setTimeout(() => {
          setIsRunningCode(false);
          setOutputLogs((prev) => [
            ...prev,
            {
              id: `mock-${Date.now()}`,
              channel: 'Compiler & Build',
              text: `[Output for ${activeTab.name}]\nHello Kernel Base World!\nCompilation succeeded (0 errors).`,
              level: 'success',
              timestamp: Date.now(),
            },
          ]);
        }, 600);
      }
    } finally {
      setIsRunningCode(false);
    }
  };

  // Resize handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        const newWidth = Math.max(180, Math.min(600, e.clientX - 48));
        setSidebarWidth(newWidth);
      }
      if (isResizingPanel) {
        const newHeight = Math.max(120, Math.min(600, window.innerHeight - e.clientY));
        setBottomPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingPanel(false);
    };

    if (isResizingSidebar || isResizingPanel) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingPanel]);

  // Global Keybindings (⌘B toggle sidebar, ⌘J toggle panel, ⌘R run code)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        // Toggle sidebar
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setActiveBottomPanel(activeBottomPanel === 'none' ? 'terminal' : 'none');
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRunCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBottomPanel, activeTab, isRunningCode]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0c0a09] text-neutral-200 select-none overflow-hidden font-sans">
      {/* TitleBar with macOS traffic lights offset */}
      <TitleBar />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Activity Bar */}
        <ActivityBar />

        {/* Primary Sidebar */}
        {activeSidebar !== 'none' && (
          <div
            style={{ width: `${sidebarWidth}px` }}
            className="h-full bg-[#120a07] border-r border-[#26130d] flex flex-col shrink-0 relative overflow-hidden"
          >
            {activeSidebar === 'explorer' && <ProjectExplorer />}
            {activeSidebar === 'search' && <GlobalSearch />}
            {activeSidebar === 'git' && <GitPanel />}
            {activeSidebar === 'run' && <RunDebugPanel />}
            {activeSidebar === 'extensions' && <ExtensionsPanel />}
            {activeSidebar === 'agents' && <AgentPanel />}

            {/* Sidebar horizontal drag handle */}
            <div
              onMouseDown={() => setIsResizingSidebar(true)}
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#ff6b35]/60 transition-colors z-20"
            />
          </div>
        )}

        {/* Editor Workspace & Bottom Panel */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#120a07]">
          {/* Main Editor Area */}
          <div className="flex-1 flex overflow-hidden relative">
            {activeDiff ? (
              <DiffViewer />
            ) : (
              <CodeEditor onRunCode={handleRunCode} isRunning={isRunningCode} />
            )}
          </div>

          {/* Bottom Dock Panel (Problems, Output, Terminal, Debug) */}
          {activeBottomPanel !== 'none' && (
            <div
              style={{ height: `${bottomPanelHeight}px` }}
              className="border-t border-[#26130d] bg-[#0e0805] flex flex-col relative shrink-0"
            >
              {/* Panel vertical drag handle */}
              <div
                onMouseDown={() => setIsResizingPanel(true)}
                className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-[#ff6b35]/60 transition-colors z-20"
              />

              {/* Panel Tab Bar */}
              <div className="h-8 bg-[#140b07] border-b border-[#24130d] flex items-center justify-between px-2 text-xs">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveBottomPanel('problems')}
                    className={`px-3 py-1 font-medium rounded flex items-center space-x-1.5 transition-colors ${
                      activeBottomPanel === 'problems'
                        ? 'text-neutral-100 bg-[#221008] border-b-2 border-[#ff6b35]'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1a0e09]'
                    }`}
                  >
                    <span>Problems</span>
                    {diagnostics.length > 0 && (
                      <span className="text-[10px] bg-red-950/80 text-red-300 px-1.5 rounded-full border border-red-900/40">
                        {diagnostics.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveBottomPanel('output')}
                    className={`px-3 py-1 font-medium rounded flex items-center space-x-1.5 transition-colors ${
                      activeBottomPanel === 'output'
                        ? 'text-neutral-100 bg-[#221008] border-b-2 border-[#ff6b35]'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1a0e09]'
                    }`}
                  >
                    <span>Output</span>
                    {isRunningCode && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-ping" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveBottomPanel('terminal')}
                    className={`px-3 py-1 font-medium rounded flex items-center space-x-1.5 transition-colors ${
                      activeBottomPanel === 'terminal'
                        ? 'text-neutral-100 bg-[#221008] border-b-2 border-[#ff6b35]'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1a0e09]'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Terminal</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveBottomPanel('none')}
                    className="p-1 hover:bg-[#20100a] text-neutral-400 hover:text-neutral-200 rounded transition-colors"
                    title="Close Panel (⌘J)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Panel Content Body */}
              <div className="flex-1 overflow-hidden">
                {activeBottomPanel === 'problems' && <ProblemsPanel />}
                {activeBottomPanel === 'output' && (
                  <OutputPanel logs={outputLogs} onClear={() => setOutputLogs([])} />
                )}
                {activeBottomPanel === 'terminal' && <TerminalPanel />}
              </div>
            </div>
          )}
        </div>

        {/* Right side panel: Agent Studio (parallel CLI agents) */}
        {isStudioOpen && (
          <div
            style={{ width: `${studioWidth}px` }}
            className="h-full border-l border-[#26130d] shrink-0 relative overflow-hidden"
          >
            <div
              onMouseDown={() => setIsResizingStudio(true)}
              className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-[#ff6b35]/60 transition-colors z-20"
            />
            <AgentStudio onClose={() => setIsStudioOpen(false)} />
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Floating Modals & Overlays */}
      <CommandPalette />
      <QuickOpen />
      <SettingsModal />
      <PermissionModal request={pendingPermission} onRespond={handleRespondPermission} />
    </div>
  );
};
