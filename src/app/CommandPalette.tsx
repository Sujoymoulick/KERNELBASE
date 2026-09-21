import React, { useState, useEffect, useRef } from 'react';
import { useIDE } from '../context/IDEContext';
import { useAgents } from '../context/AgentContext';
import { Sparkles, Terminal, Files, GitBranch, Settings, Play, Save } from 'lucide-react';

interface PaletteCommand {
  id: string;
  title: string;
  category: string;
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveSidebar,
    setActiveBottomPanel,
    saveActiveFile,
    setIsSettingsOpen,
  } = useIDE();
  const { submitGoal } = useAgents();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: PaletteCommand[] = [
    {
      id: 'agent:goal',
      title: 'Agent: Submit New Development Goal',
      category: 'Agent Swarm',
      icon: Sparkles,
      action: () => {
        setIsCommandPaletteOpen(false);
        setActiveSidebar('agents');
      },
    },
    {
      id: 'file:save',
      title: 'File: Save Active File',
      category: 'File',
      shortcut: '⌘S',
      icon: Save,
      action: () => saveActiveFile(),
    },
    {
      id: 'view:explorer',
      title: 'View: Toggle Project Explorer',
      category: 'View',
      shortcut: '⌘⇧E',
      icon: Files,
      action: () => setActiveSidebar('explorer'),
    },
    {
      id: 'view:agents',
      title: 'View: Toggle Agent Swarm Panel',
      category: 'View',
      shortcut: '⌘⇧A',
      icon: Sparkles,
      action: () => setActiveSidebar('agents'),
    },
    {
      id: 'view:git',
      title: 'View: Toggle Git Source Control',
      category: 'View',
      shortcut: '⌘⇧G',
      icon: GitBranch,
      action: () => setActiveSidebar('git'),
    },
    {
      id: 'view:terminal',
      title: 'View: Toggle Interactive Terminal',
      category: 'View',
      shortcut: '⌘J',
      icon: Terminal,
      action: () => setActiveBottomPanel('terminal'),
    },
    {
      id: 'settings:open',
      title: 'Preferences: Open IDE & AI Settings',
      category: 'Preferences',
      shortcut: '⌘,',
      icon: Settings,
      action: () => setIsSettingsOpen(true),
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          setIsCommandPaletteOpen(false);
        }
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filtered, selectedIndex]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[#130b08] border border-[#3d1d13] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-[#2d160e] flex items-center space-x-2 bg-[#180e0a]">
          <Sparkles className="w-4 h-4 text-[#ff6b35]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-1 divide-y divide-[#22120b]">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-500">No matching commands</div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between rounded-lg transition-colors ${
                    isSelected ? 'bg-[#28140c] text-neutral-100' : 'text-neutral-300 hover:bg-[#1a0e09]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#ff6b35]' : 'text-neutral-500'}`} />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{cmd.title}</span>
                      <span className="text-[10px] text-neutral-500">{cmd.category}</span>
                    </div>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="bg-[#1f100a] text-neutral-400 text-[10px] px-1.5 py-0.5 rounded border border-[#381c12]">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
