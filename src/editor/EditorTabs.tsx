import React from 'react';
import { useIDE } from '../context/IDEContext';
import { X, Circle } from 'lucide-react';

export const EditorTabs: React.FC = () => {
  const { tabs, activeTabId, setActiveTabId, closeTab } = useIDE();

  if (tabs.length === 0) return null;

  return (
    <div className="h-9 bg-[#0b0705] border-b border-[#24130d] flex items-center overflow-x-auto select-none no-scrollbar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`h-full flex items-center space-x-2 px-3 border-r border-[#1f100a] cursor-pointer text-xs transition-colors group ${
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
