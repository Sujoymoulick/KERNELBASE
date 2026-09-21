import React from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useIDE } from '../context/IDEContext';
import { Check, X, Split, FileCode } from 'lucide-react';

export const DiffViewer: React.FC = () => {
  const { activeDiff, closeDiff, acceptDiff, rejectDiff } = useIDE();

  if (!activeDiff) {
    return (
      <div className="h-full flex items-center justify-center bg-[#100906] text-neutral-500 text-xs">
        No active diff to review
      </div>
    );
  }

  const fileName = activeDiff.path.split('/').pop() || activeDiff.path;

  return (
    <div className="h-full flex flex-col bg-[#100906]">
      {/* Diff Toolbar */}
      <div className="h-9 px-3 bg-[#170d09] border-b border-[#2d170f] flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <Split className="w-4 h-4 text-[#ff6b35]" />
          <span className="text-xs font-semibold text-neutral-200">Reviewing Diff:</span>
          <span className="text-xs font-mono text-neutral-400">{fileName}</span>
          <span className="text-[10px] bg-[#2a140c] text-[#ff6b35] px-1.5 py-0.5 rounded border border-[#3e1e12]">
            {activeDiff.status.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => acceptDiff(activeDiff)}
            className="flex items-center space-x-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-2.5 py-1 rounded transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept Changes</span>
          </button>
          <button
            onClick={() => rejectDiff(activeDiff)}
            className="flex items-center space-x-1 bg-red-900/60 hover:bg-red-800 text-red-200 text-xs px-2.5 py-1 rounded border border-red-700/50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* Side-by-side Diff Editor */}
      <div className="flex-1 w-full relative">
        <DiffEditor
          height="100%"
          original={activeDiff.oldContent}
          modified={activeDiff.newContent}
          language="typescript"
          theme="vs-dark"
          options={{
            readOnly: true,
            renderSideBySide: true,
            smoothScrolling: true,
            automaticLayout: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
};
