import React, { useState, useEffect, useRef } from 'react';
import { useIDE } from '../context/IDEContext';
import { useAgents } from '../context/AgentContext';
import {
  Sparkles,
  Search,
  Minus,
  Square,
  Copy,
  X,
  ArrowLeft,
  ArrowRight,
  PanelLeft,
  PanelBottom,
  Atom,
  FolderInput,
  Save,
  Terminal as TerminalIcon,
  Sliders,
  HelpCircle,
  Cpu,
  Settings,
  GitBranch,
  Menu as MenuIcon,
  Folder,
  ChevronDown,
  RefreshCw,
  Layers,
  Terminal,
  Columns3,
} from 'lucide-react';
import { api } from '../services/api';

type DropdownType = 'menu' | 'workspace' | 'swarm' | null;

export const TitleBar: React.FC = () => {
  const {
    workspace,
    setWorkspace,
    setIsCommandPaletteOpen,
    setIsQuickOpenOpen,
    setIsSettingsOpen,
    setActiveSidebar,
    setActiveBottomPanel,
    activeSidebar,
    activeBottomPanel,
    isAgentPanelOpen,
    toggleAgentPanel,
    saveActiveFile,
    closeAllTabs,
    refreshFiles,
  } = useIDE();
  const { currentPlan, isRunning } = useAgents();

  const [showDoneStatus, setShowDoneStatus] = useState<boolean>(false);

  useEffect(() => {
    if (!currentPlan) return;
    const completedCount = currentPlan.steps.filter((s) => s.status === 'completed').length;
    const isAllDone = currentPlan.steps.length > 0 && completedCount === currentPlan.steps.length;

    if (isAllDone) {
      setShowDoneStatus(true);
      const timer = setTimeout(() => {
        setShowDoneStatus(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShowDoneStatus(false);
    }
  }, [currentPlan]);

  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.kernelBase?.system?.isMaximized) {
      window.kernelBase.system.isMaximized().then(setIsMaximized).catch(() => {});
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMinimize = () => {
    if (window.kernelBase?.system?.minimize) {
      window.kernelBase.system.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.kernelBase?.system?.maximize) {
      window.kernelBase.system.maximize();
      setIsMaximized((prev) => !prev);
    }
  };

  const handleClose = () => {
    if (window.kernelBase?.system?.close) {
      window.kernelBase.system.close();
    }
  };

  const handleOpenFolder = async () => {
    setActiveDropdown(null);
    try {
      const result = await api.workspace.selectFolder();
      if (result.success && result.folderPath) {
        await setWorkspace({
          rootPath: result.folderPath,
          name: result.folderPath.split(/[/\\]/).filter(Boolean).pop() || 'Workspace',
          projectType: 'generic',
        });
      }
    } catch (err) {
      console.error('Failed to select folder:', err);
    }
  };

  const toggleDropdown = (type: DropdownType) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  return (
    <div
      ref={containerRef}
      className="h-10 bg-[#070403]/95 backdrop-blur-2xl border-b border-[#2b140b]/80 flex items-center justify-between px-3 select-none app-drag-region text-xs text-neutral-300 relative z-50 shadow-2xl shadow-black/90"
    >
      {/* Dynamic gradient bottom highlight line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff6b35]/40 to-transparent pointer-events-none" />

      {/* LEFT SECTION: Brand Logo, Interactive Workspace Pill & Mega Menu */}
      <div className="flex items-center space-x-2.5 no-drag-region shrink-0">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-2.5 pl-0.5 pr-1">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b35] to-amber-500 rounded-lg blur-sm opacity-30 group-hover:opacity-80 transition duration-300" />
            {!imgError ? (
              <img
                src="./logo.png"
                alt="Kernel Base"
                className="relative w-5 h-5 object-contain rounded-md shadow-md shadow-[#ff6b35]/40 group-hover:scale-105 transition-transform"
                onError={() => setImgError(true)}
              />
            ) : (
              <Atom className="relative w-4.5 h-4.5 text-[#ff6b35] stroke-[2.2]" />
            )}
          </div>
          <span className="font-bold text-neutral-100 font-mono tracking-wider text-[12px] bg-gradient-to-r from-[#ff6b35] via-amber-300 to-[#ff8c42] bg-clip-text text-transparent drop-shadow-sm">
            Kernel Base
          </span>
        </div>

        {/* Global IDE Command Menu Drawer */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('menu')}
            className={`p-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1 ${
              activeDropdown === 'menu'
                ? 'bg-[#2b130a] text-[#ff6b35] border border-[#482012] shadow-md shadow-[#ff6b35]/10'
                : 'hover:bg-[#1c0c07] text-neutral-400 hover:text-neutral-100 border border-transparent'
            }`}
            title="IDE Main Menu"
          >
            <MenuIcon className="w-4 h-4" />
          </button>

          {activeDropdown === 'menu' && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-[#110805]/98 border border-[#3d1a0e] rounded-xl shadow-2xl backdrop-blur-2xl py-2 text-[11px] text-neutral-300 z-50 divide-y divide-[#26110a] animate-in fade-in zoom-in-95 duration-150">
              {/* File Operations */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#ff6b35]/90">
                  File Operations
                </div>
                <button
                  onClick={handleOpenFolder}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2c150d] hover:text-[#ff6b35] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <FolderInput className="w-3.5 h-3.5 text-[#ff6b35]" />
                    <span>Open Folder...</span>
                  </span>
                  <kbd className="text-neutral-500 font-mono text-[9px] bg-[#1d0e09] px-1.5 py-0.5 rounded border border-[#36180e]">
                    Ctrl+K O
                  </kbd>
                </button>
                <button
                  onClick={() => {
                    saveActiveFile();
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2c150d] hover:text-[#ff6b35] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    <span>Save Active File</span>
                  </span>
                  <kbd className="text-neutral-500 font-mono text-[9px] bg-[#1d0e09] px-1.5 py-0.5 rounded border border-[#36180e]">
                    Ctrl+S
                  </kbd>
                </button>
                <button
                  onClick={() => {
                    closeAllTabs();
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2c150d] hover:text-[#ff6b35] flex items-center space-x-2 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  <span>Close All Editor Tabs</span>
                </button>
              </div>

              {/* View & Navigation */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#ff6b35]/90">
                  Navigation & Workspace
                </div>
                <button
                  onClick={() => {
                    setActiveSidebar('explorer');
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2c150d] hover:text-[#ff6b35] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Folder className="w-3.5 h-3.5 text-[#ff6b35]" />
                    <span>Toggle File Explorer</span>
                  </span>
                  <kbd className="text-neutral-500 font-mono text-[9px] bg-[#1d0e09] px-1.5 py-0.5 rounded border border-[#36180e]">
                    Ctrl+Shift+E
                  </kbd>
                </button>
                <button
                  onClick={() => {
                    setActiveSidebar('agents');
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2c150d] hover:text-[#ff6b35] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Agent Swarm</span>
                  </span>
                  <kbd className="text-neutral-500 font-mono text-[9px] bg-[#1d0e09] px-1.5 py-0.5 rounded border border-[#36180e]">
                    Ctrl+Shift+A
                  </kbd>
                </button>
                <button
                  onClick={() => {
                    setActiveBottomPanel('terminal');
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2c150d] hover:text-[#ff6b35] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Terminal Panel</span>
                  </span>
                  <kbd className="text-neutral-500 font-mono text-[9px] bg-[#1d0e09] px-1.5 py-0.5 rounded border border-[#36180e]">
                    Ctrl+`
                  </kbd>
                </button>
              </div>

              {/* Preferences & System */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2c150d] hover:text-[#ff6b35] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Settings & Preferences</span>
                  </span>
                  <kbd className="text-neutral-500 font-mono text-[9px] bg-[#1d0e09] px-1.5 py-0.5 rounded border border-[#36180e]">
                    Ctrl+,
                  </kbd>
                </button>
                <button
                  onClick={handleClose}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-950/50 text-rose-400 flex items-center space-x-2 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Exit Window</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Workspace Breadcrumb Selector */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('workspace')}
            className="flex items-center space-x-1.5 bg-[#170c07] hover:bg-[#24120a] border border-[#32170d] hover:border-[#ff6b35]/60 px-2.5 py-1 rounded-lg text-[11px] text-neutral-200 transition-all shadow-sm group"
          >
            <Folder className="w-3.5 h-3.5 text-[#ff6b35] group-hover:scale-110 transition-transform" />
            <span className="font-semibold truncate max-w-[140px] text-[#e8ded8]">
              {workspace?.name || 'Workspace'}
            </span>
            <ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
          </button>

          {activeDropdown === 'workspace' && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-[#110805]/98 border border-[#3d1a0e] rounded-xl shadow-2xl backdrop-blur-2xl py-1 text-[11px] text-neutral-300 z-50">
              <button
                onClick={handleOpenFolder}
                className="w-full text-left px-3 py-1.5 hover:bg-[#2c150d] hover:text-[#ff6b35] flex items-center space-x-2 transition-colors"
              >
                <FolderInput className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span>Open Folder...</span>
              </button>
              <button
                onClick={() => {
                  refreshFiles();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#2c150d] hover:text-[#ff6b35] flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Refresh Explorer</span>
              </button>
            </div>
          )}
        </div>

        {/* Branch Pill */}
        <div className="hidden md:flex items-center space-x-1.5 bg-[#140a06] border border-[#2b140b] px-2.5 py-0.5 rounded-full text-[10.5px] text-neutral-400">
          <GitBranch className="w-3 h-3 text-[#ff6b35]" />
          <span className="font-mono text-neutral-300">main</span>
        </div>

        {/* History Nav */}
        <div className="flex items-center space-x-0.5 text-neutral-400 pl-0.5">
          <button
            className="p-1 hover:bg-[#200f09] hover:text-neutral-100 rounded-md transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 hover:bg-[#200f09] hover:text-neutral-100 rounded-md transition-colors"
            title="Go Forward"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CENTERPIECE: FLOATING COMMAND CAPSULE DOCK */}
      <div className="flex-1 flex justify-center items-center px-4 max-w-lg">
        <button
          onClick={() => setIsQuickOpenOpen(true)}
          className="no-drag-region w-full max-w-md h-7 px-3 bg-[#120a06]/90 hover:bg-[#1c0e08] border border-[#33180e] hover:border-[#ff6b35]/70 rounded-full flex items-center justify-between text-[#a09088] hover:text-neutral-100 transition-all duration-200 group shadow-lg shadow-black/80 cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center space-x-2 truncate">
            <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#ff6b35] shrink-0 transition-colors" />
            <span className="truncate text-[11px] font-sans font-medium">
              Search files, symbols & commands...
            </span>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <kbd className="bg-[#24120a] group-hover:bg-[#2f160b] text-[#ff6b35] text-[9.5px] px-1.5 py-0.2 rounded-md border border-[#3e1d10] font-mono font-semibold transition-colors">
              Ctrl+P
            </kbd>
          </div>
        </button>
      </div>

      {/* RIGHT SECTION: Multi-Agent Swarm Intelligence Hub, Segmented Layout Controls & Window Suite */}
      <div className="flex items-center space-x-2 no-drag-region shrink-0">
        {/* Agent Swarm Cockpit Status Toggle */}
        <button
          onClick={toggleAgentPanel}
          className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer border ${
            isAgentPanelOpen
              ? 'bg-[#2b130a] text-[#ff6b35] border-[#4d2213] shadow-sm'
              : 'bg-[#170c07] hover:bg-[#24120a] border-[#36190e] hover:border-[#ff6b35]/40 text-neutral-300'
          }`}
          title="Toggle Agent Swarm Panel (Ctrl+Shift+A)"
        >
          <Cpu className={`w-3.5 h-3.5 ${isRunning ? 'text-emerald-400 animate-spin' : 'text-[#ff6b35]'}`} />
          {currentPlan && showDoneStatus ? (
            <span className="font-mono text-emerald-400 font-semibold text-[10.5px]">
              {currentPlan.steps.length}/{currentPlan.steps.length} Steps Done
            </span>
          ) : currentPlan && isRunning ? (
            <span className="font-mono text-neutral-200">
              {currentPlan.steps.filter((s) => s.status === 'completed').length}/{currentPlan.steps.length} Steps
            </span>
          ) : (
            <span className="font-mono text-emerald-400/90 text-[10.5px]">Swarm Ready</span>
          )}
        </button>

        {/* Minimal AI Command Launcher Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="p-1.5 rounded-lg bg-[#190c07] hover:bg-[#28130a] border border-[#3a1b0f] hover:border-[#ff6b35]/70 text-[#ff6b35] hover:text-white transition-all shadow-sm group cursor-pointer"
          title="Trigger AI Command Palette (Ctrl+Shift+P)"
        >
          <Sparkles className="w-4 h-4 text-[#ff6b35] group-hover:scale-110 group-hover:rotate-12 transition-transform" />
        </button>

        {/* Segmented Layout Toggles */}
        <div className="flex items-center bg-[#140b07] border border-[#2d150b] rounded-lg p-0.5 text-neutral-400">
          <button
            onClick={() => setActiveSidebar(activeSidebar === 'explorer' ? 'none' : 'explorer')}
            className={`p-1 hover:text-neutral-100 rounded-md transition-colors ${
              activeSidebar === 'explorer' ? 'bg-[#29140c] text-[#ff6b35]' : 'hover:bg-[#200f09]'
            }`}
            title="Toggle Primary Explorer (Ctrl+Shift+E)"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveBottomPanel(activeBottomPanel === 'none' ? 'terminal' : 'none')}
            className={`p-1 hover:text-neutral-100 rounded-md transition-colors ${
              activeBottomPanel !== 'none' ? 'bg-[#29140c] text-[#ff6b35]' : 'hover:bg-[#200f09]'
            }`}
            title="Toggle Terminal Panel (Ctrl+`)"
          >
            <PanelBottom className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-1 hover:bg-[#200f09] hover:text-neutral-100 rounded-md transition-colors"
            title="Command Palette"
          >
            <Columns3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Custom Window Control Suite */}
        <div className="flex items-center space-x-0.5 pl-1.5 border-l border-[#29130a]">
          <button
            onClick={handleMinimize}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-[#22110a] rounded-md transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleMaximize}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-[#22110a] rounded-md transition-colors"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Copy className="w-3 h-3 rotate-180" /> : <Square className="w-3 h-3" />}
          </button>

          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-rose-600 rounded-md transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};



