import React from 'react';
import { Search, Moon, Sun, Github, Menu, X, Cpu, PanelLeft, PanelLeftClose } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  isDark,
  onToggleTheme,
  onToggleMobileMenu,
  isMobileMenuOpen,
  activeSection,
  onSelectSection,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const topNavItems = [
    { id: 'get-started', label: 'Get Started', targetSlug: 'get-started/overview' },
    { id: 'architecture', label: 'Architecture', targetSlug: 'architecture/system-architecture' },
    { id: 'agents', label: 'Agents', targetSlug: 'agents/agent-taxonomy' },
    { id: 'free-tech-stack', label: 'Free Stack', targetSlug: 'free-tech-stack/open-source-stack' },
    { id: '10-day-mvp', label: '10-Day MVP', targetSlug: '10-day-mvp/mvp-overview' },
    { id: 'research', label: 'Research', targetSlug: 'research/desktop-frameworks' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile / Tablet Toggles & Brand Logo */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Mobile hamburger menu button */}
          <button
            id="mobile-menu-toggle"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 focus:outline-none min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Tablet/Desktop Sidebar collapse toggle button */}
          {onToggleSidebar && (
            <button
              id="desktop-sidebar-toggle"
              onClick={onToggleSidebar}
              className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors focus:outline-none"
              title={isSidebarCollapsed ? 'Show Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle navigation sidebar"
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          )}

          <a
            href="#get-started/overview"
            onClick={(e) => {
              e.preventDefault();
              onSelectSection('get-started/overview');
            }}
            className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Cpu className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight font-extrabold text-sm sm:text-base whitespace-nowrap">
                AI-Native IDE
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 -mt-0.5 hidden xs:inline">
                Research & Docs
              </span>
            </div>
          </a>

          <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            v0.1-mvp
          </span>
        </div>

        {/* Center: Top Navigation Quick Links (Tablet & Desktop, with horizontal scrolling if tight) */}
        <nav className="hidden md:flex items-center space-x-1 overflow-x-auto scrollbar-none py-1 text-xs font-medium text-slate-600 dark:text-slate-300 max-w-xl">
          {topNavItems.map((item) => {
            const isActive = activeSection.startsWith(item.id);
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onSelectSection(item.targetSlug)}
                className={`px-2.5 lg:px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Search, Theme Toggle, GitHub */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Search Trigger Button */}
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-400 text-xs transition-colors w-28 xs:w-36 sm:w-44 md:w-52 justify-between focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[38px]"
            title="Search documentation (Cmd+K)"
          >
            <div className="flex items-center space-x-1.5 sm:space-x-2 truncate">
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate text-slate-500 dark:text-slate-400 text-xs hidden sm:inline">Search docs...</span>
              <span className="truncate text-slate-500 dark:text-slate-400 text-xs sm:hidden">Search</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] bg-white dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shrink-0">
              ⌘K
            </kbd>
          </button>

          {/* Theme Switcher */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors focus:outline-none min-h-[38px] min-w-[38px] flex items-center justify-center"
            title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* GitHub Link */}
          <a
            id="github-repo-link"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors focus:outline-none hidden sm:inline-flex min-h-[38px] min-w-[38px] items-center justify-center"
            title="GitHub Repository"
            aria-label="View source on GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
