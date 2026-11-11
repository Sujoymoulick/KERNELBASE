import React, { useState, useEffect } from 'react';
import { Play, Square, Cpu, CheckCircle2, XCircle, Terminal, AlertCircle } from 'lucide-react';
import { useIDE } from '../context/IDEContext';
import { api } from '../services/api';
import { ToolchainInfo } from '../types/ide';

export const RunDebugPanel: React.FC = () => {
  const { tabs, activeTabId, workspace, setActiveBottomPanel } = useIDE();
  const [toolchains, setToolchains] = useState<ToolchainInfo[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [activeOutput, setActiveOutput] = useState<string>('');

  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    async function loadToolchains() {
      try {
        if (window.kernelBase?.run) {
          const list = await window.kernelBase.run.detectToolchains();
          setToolchains(list);
        } else {
          // Browser preview mock
          setToolchains([
            { language: 'python', compiler: 'python3', isAvailable: true, version: 'Python 3.12.2' },
            { language: 'c', compiler: 'clang', isAvailable: true, version: 'Apple clang 16.0.0' },
            { language: 'rust', compiler: 'rustc', isAvailable: true, version: 'rustc 1.85.0' },
            { language: 'typescript', compiler: 'tsx', isAvailable: true, version: 'tsx 4.23.0' },
            { language: 'javascript', compiler: 'node', isAvailable: true, version: 'v22.14.0' },
          ]);
        }
      } catch (err) {
        console.error('Failed to load toolchains:', err);
      }
    }
    loadToolchains();
  }, []);

  const handleRun = async () => {
    if (!activeTab || isRunning) return;
    setIsRunning(true);
    setActiveBottomPanel('output');
    setActiveOutput(`[Starting compilation/execution for ${activeTab.name}...]`);

    try {
      if (window.kernelBase?.run) {
        const res = await window.kernelBase.run.executeFile({
          filePath: activeTab.path,
          language: activeTab.language,
          workspacePath: workspace?.rootPath || '',
        });
        setLastDuration(res.durationMs);
        setActiveOutput(res.stdout || res.stderr || '[Process finished with code 0]');
      } else {
        // Standalone preview
        setTimeout(() => {
          setIsRunning(false);
          setLastDuration(124);
          setActiveOutput(`Hello from standalone preview of ${activeTab.name}!`);
        }, 800);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleStop = async () => {
    if (window.kernelBase?.run) {
      await window.kernelBase.run.stop();
    }
    setIsRunning(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#120a07] text-neutral-300 font-sans text-xs select-none">
      {/* Header */}
      <div className="h-9 px-3 bg-[#170c08] border-b border-[#29140d] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Play className="w-4 h-4 text-[#ff6b35]" />
          <span className="font-semibold text-neutral-200">RUN & COMPILE</span>
        </div>
      </div>

      <div className="p-3 space-y-4 flex-1 overflow-y-auto">
        {/* Active File Run Target */}
        <div className="bg-[#180e09] border border-[#2e150d] rounded-lg p-3 space-y-2">
          <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
            Active Target
          </div>
          {activeTab ? (
            <div className="space-y-1">
              <div className="text-neutral-100 font-medium truncate">{activeTab.name}</div>
              <div className="text-[10px] text-neutral-500 font-mono truncate">{activeTab.path}</div>
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] bg-[#29140c] text-[#ff804d] px-1.5 py-0.5 rounded font-mono">
                  {activeTab.language}
                </span>
                {lastDuration !== null && (
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Last: {lastDuration}ms
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-neutral-500 italic text-[11px]">
              No active editor tab. Open a file to run.
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {!isRunning ? (
              <button
                onClick={handleRun}
                disabled={!activeTab}
                className="w-full bg-[#ff6b35] hover:bg-[#ff804d] disabled:opacity-40 text-black font-semibold py-2 px-3 rounded flex items-center justify-center space-x-2 transition-all shadow-[0_2px_8px_rgba(255,107,53,0.3)]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run Code (⌘R)</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-3 rounded flex items-center justify-center space-x-2 transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Execution</span>
              </button>
            )}
          </div>
        </div>

        {/* System Toolchains Detector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
            <span>Detected Toolchains</span>
            <Cpu className="w-3.5 h-3.5 text-neutral-500" />
          </div>

          <div className="bg-[#180e09] border border-[#2e150d] rounded-lg divide-y divide-[#221009] overflow-hidden">
            {(Array.isArray(toolchains) ? toolchains : []).map((tc) => (
              <div key={tc.compiler} className="px-3 py-2 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-neutral-200 font-mono text-[11px] flex items-center space-x-1.5">
                    <span>{tc.compiler}</span>
                    <span className="text-[10px] text-neutral-500">({tc.language})</span>
                  </div>
                  {tc.version && (
                    <div className="text-[9px] text-neutral-500 truncate max-w-[160px]">
                      {tc.version}
                    </div>
                  )}
                </div>
                {tc.isAvailable ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-neutral-600 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-2 flex flex-col space-y-1">
          <button
            onClick={() => setActiveBottomPanel('output')}
            className="text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-[#1a0e09] p-2 rounded flex items-center space-x-2 text-left transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-[#ff6b35]" />
            <span>Open Output Console</span>
          </button>
          <button
            onClick={() => setActiveBottomPanel('problems')}
            className="text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-[#1a0e09] p-2 rounded flex items-center space-x-2 text-left transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>View Compiler Diagnostics</span>
          </button>
        </div>
      </div>
    </div>
  );
};
