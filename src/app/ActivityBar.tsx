import React from 'react';
import { useIDE, ActiveSidebarView } from '../context/IDEContext';
import { Files, Bot, GitBranch, Search, Terminal, Sliders, Cpu, Blocks } from 'lucide-react';

interface ActivityItem {
  id: ActiveSidebarView;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const ActivityBar: React.FC = () => {
  const { activeSidebar, setActiveSidebar, isAgentPanelOpen, toggleAgentPanel, setIsSettingsOpen } = useIDE();

  const items: ActivityItem[] = [
    { id: 'explorer', label: 'Explorer (Ctrl+Shift+E)', icon: Files },
    { id: 'agents', label: 'Agent Swarm (Ctrl+Shift+A)', icon: Bot },
    { id: 'git', label: 'Source Control (Ctrl+Shift+G)', icon: GitBranch },
    { id: 'search', label: 'Global Search (Ctrl+Shift+F)', icon: Search },
    { id: 'extensions', label: 'Extensions & Marketplace (Ctrl+Shift+X)', icon: Blocks },
    { id: 'cli', label: 'CLI Integrations', icon: Cpu },
  ];

  return (
    <div className="w-12 bg-[#080503] border-r border-[#24130b] flex flex-col items-center justify-between py-2.5 select-none z-10 shadow-lg">
      {/* Top action icons */}
      <div className="flex flex-col items-center space-y-1.5 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === 'agents' ? isAgentPanelOpen : activeSidebar === item.id;
          const handleClick = () => {
            if (item.id === 'agents') {
              toggleAgentPanel();
            } else {
              setActiveSidebar(activeSidebar === item.id ? 'none' : item.id);
            }
          };

          return (
            <button
              key={item.id}
              onClick={handleClick}
              className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'text-[#ff6b35] bg-[#1d0e08] border border-[#482012] shadow-md shadow-[#ff6b35]/15'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-[#150b07]'
              }`}
              title={item.label}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-[#ff6b35] to-amber-500 rounded-r-full shadow-sm shadow-[#ff6b35]" />
              )}
              <Icon className={`w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'stroke-[2.2]' : ''}`} />
            </button>
          );
        })}
      </div>

      {/* Bottom settings icon */}
      <div className="flex flex-col items-center w-full">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-[#150b07] transition-all group"
          title="Settings (Ctrl+,)"
        >
          <Sliders className="w-4.5 h-4.5 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};
