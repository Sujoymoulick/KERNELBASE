import React from 'react';
import { useIDE, ActiveSidebarView } from '../context/IDEContext';
import { Files, Bot, GitBranch, Search, Terminal, Sliders, Cpu } from 'lucide-react';

interface ActivityItem {
  id: ActiveSidebarView;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const ActivityBar: React.FC = () => {
  const { activeSidebar, setActiveSidebar, setIsSettingsOpen } = useIDE();

  const items: ActivityItem[] = [
    { id: 'explorer', label: 'Explorer (⌘⇧E)', icon: Files },
    { id: 'agents', label: 'Agent Swarm (⌘⇧A)', icon: Bot },
    { id: 'git', label: 'Source Control (⌘⇧G)', icon: GitBranch },
    { id: 'search', label: 'Global Search (⌘⇧F)', icon: Search },
    { id: 'cli', label: 'CLI Integrations', icon: Cpu },
  ];

  return (
    <div className="w-12 bg-[#0a0705] border-r border-[#22130e] flex flex-col items-center justify-between py-2 select-none z-10">
      {/* Top action icons */}
      <div className="flex flex-col items-center space-y-1 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSidebar === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSidebar(isActive ? 'none' : item.id)}
              className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                isActive
                  ? 'text-[#ff6b35] bg-[#1a0e09] border border-[#3d1f14] shadow-[inset_0_1px_0_rgba(255,107,53,0.2)]'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#140b07]'
              }`}
              title={item.label}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#ff6b35] rounded-r" />
              )}
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Bottom settings icon */}
      <div className="flex flex-col items-center w-full">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-[#140b07] transition-all"
          title="Settings (⌘,)"
        >
          <Sliders className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
