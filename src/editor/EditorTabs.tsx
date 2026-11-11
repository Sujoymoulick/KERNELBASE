import React from 'react';
import { useIDE } from '../context/IDEContext';
import { X, Circle, Play, SplitSquareVertical, MoreHorizontal } from 'lucide-react';

interface EditorTabsProps {
  onRunCode?: () => void;
  isRunning?: boolean;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({ onRunCode, isRunning }) => {
  const { tabs, activeTabId, setActiveTabId, closeTab } = useIDE();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="h-9 bg-[#0b0705] border-b border-[#24130d] flex items-center justify-between select-none">
      {/* Scrollable Tabs */}
      <div className="flex-1 flex items-center overflow-x-auto no-scrollbar h-full">
        {(Array.isArray(tabs) ? tabs : []).map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`h-full flex items-center space-x-2 px-3 border-r border-[#1f100a] cursor-pointer text-xs transition-colors group shrink-0 ${
                isActive
                  ? 'bg-[#150c08] text-neutral-100 border-t-2 border-t-[#ff6b35]'
                  : 'text-neutral-400 hover:bg-[#100906] hover:text-neutral-200'
              }`}
            >
              <span className="truncate max-w-[140px] font-medium">{tab.name}</span>
              {tab.isDirty ? (
                <Circle className="w-2 h-2 fill-amber-400 text-amber-400" />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-[#28140c] text-neutral-400 hover:text-neutral-100 p-0.5 rounded transition-opacity"
                  title="Close tab (⌘W)"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Editor Action Buttons (Run Code, Split, More) */}
      {activeTab && (
        <div className="flex items-center space-x-1 px-2 border-l border-[#24130d] bg-[#0d0805] h-full shrink-0">
          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="flex items-center space-x-1 px-2 py-1 bg-[#221008] hover:bg-[#ff6b35] hover:text-black text-[#ff804d] rounded text-[11px] font-semibold transition-colors group shadow-sm"
            title="Run Code (⌘R)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="font-sans">Run</span>
          </button>
          <button
            className="p-1 hover:bg-[#20100a] text-neutral-400 hover:text-neutral-200 rounded transition-colors"
            title="Split Editor Right (⌘\)"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 hover:bg-[#20100a] text-neutral-400 hover:text-neutral-200 rounded transition-colors"
            title="More Actions..."
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
