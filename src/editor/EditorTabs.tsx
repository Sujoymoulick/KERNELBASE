import React from 'react';
import { useIDE } from '../context/IDEContext';
import { X, Circle } from 'lucide-react';

export const EditorTabs: React.FC = () => {
  const { tabs, activeTabId, setActiveTabId, closeTab } = useIDE();

  if (tabs.length === 0) return null;

  return (
    <div className="h-9 bg-[#0a0604] border-b border-[#24130d] flex items-center px-1 overflow-x-auto select-none no-scrollbar gap-1 pt-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`h-8 flex items-center space-x-2 px-3 rounded-t-lg border-t border-x cursor-pointer text-xs transition-all duration-150 group relative ${
              isActive
                ? 'bg-[#140b07] text-[#ff6b35] border-[#381a10] font-semibold shadow-sm shadow-[#ff6b35]/10'
                : 'bg-[#0e0805] text-neutral-400 hover:bg-[#120a06] hover:text-neutral-200 border-[#1c0f0a]'
            }`}
          >
            {isActive && (
              <div className="absolute top-0 left-2 right-2 h-[2px] bg-gradient-to-r from-[#ff6b35] to-amber-400 rounded-full" />
            )}
            <span className="truncate max-w-[150px]">{tab.name}</span>
            {tab.isDirty ? (
              <Circle className="w-2 h-2 fill-amber-400 text-amber-400 shrink-0" />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-[#28130a] text-neutral-400 hover:text-neutral-100 p-0.5 rounded transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
