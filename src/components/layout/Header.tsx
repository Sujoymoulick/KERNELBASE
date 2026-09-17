import React from 'react';
import { Search, Moon, Sun, Github, Menu, X, PanelLeft, PanelLeftClose, User } from 'lucide-react';

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
    { id: 'directory', label: 'Directory', targetSlug: 'get-started/overview' },
    { id: 'api', label: 'API', targetSlug: 'reference/api-reference' },
    { id: 'sdks', label: 'SDKs', targetSlug: 'tools/mcp' },
    { id: 'changelog', label: 'Changelog', targetSlug: 'roadmap/features-timeline' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-[#1D2430] bg-white/95 dark:bg-[#0B0D11]/95 backdrop-blur-md transition-colors text-slate-900 dark:text-[#F5F7FA]">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile / Tablet Toggles & Brand Logo */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          {/* Mobile hamburger menu button */}
          <button
            id="mobile-menu-toggle"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-500 dark:text-[#A7AFBD] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101624] focus:outline-none min-h-[40px] min-w-[40px] flex items-center justify-center"
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
              className="hidden md:flex p-1.5 rounded-lg text-slate-500 dark:text-[#A7AFBD] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101624] transition-colors focus:outline-none"
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

          {/* Cloudflare Style Brand Logo */}
          <a
            href="#get-started/overview"
            onClick={(e) => {
              e.preventDefault();
              onSelectSection('get-started/overview');
            }}
            className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-bold text-base tracking-tight hover:opacity-95 transition-opacity"
          >
            {/* Orange Cloud Icon */}
            <div className="flex items-center justify-center">
              <svg className="h-6 w-8 text-[#f38020]" viewBox="0 0 24 16" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
              </svg>
            </div>
            <div className="flex items-center space-x-2">
              <span className="leading-tight font-extrabold text-sm sm:text-base tracking-wider uppercase text-slate-900 dark:text-white font-sans">
                KERNEL BASE
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#171e2e] text-slate-600 dark:text-[#A7AFBD] border border-slate-200 dark:border-[#273248] uppercase tracking-widest">
                DOCS
              </span>
            </div>
          </a>
        </div>

        {/* Center: Top Navigation Quick Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 overflow-x-auto scrollbar-none py-1 text-xs font-medium text-slate-600 dark:text-[#A7AFBD]">
          {topNavItems.map((item) => {
            const isActive = activeSection.startsWith(item.id);
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onSelectSection(item.targetSlug)}
                className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs ${
                  isActive
                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-[#101624] font-semibold'
                    : 'text-slate-600 dark:text-[#A7AFBD] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101624]/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Search, Theme Toggle, GitHub, User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Reference Image Rounded Pill Search Trigger Button */}
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="flex items-center justify-between space-x-2 px-4 py-1.5 rounded-full border border-slate-200 dark:border-[#1D2430] bg-slate-50 dark:bg-[#101624] hover:border-slate-300 dark:hover:border-[#273248] text-slate-400 dark:text-[#A7AFBD] text-xs transition-all w-48 sm:w-60 md:w-72 min-h-[36px] focus:outline-none focus:ring-1 focus:ring-orange-500"
            title="Search documentation (Cmd+K)"
          >
            <div className="flex items-center space-x-2 truncate">
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-[#707987]" />
              <span className="truncate text-slate-500 dark:text-[#A7AFBD] text-xs">Search documentation...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273248] text-slate-500 dark:text-[#A7AFBD] px-1.5 py-0.2 rounded shrink-0">
              ⌘ K
            </kbd>
          </button>

          {/* Theme Switcher */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-[#A7AFBD] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101624] transition-colors focus:outline-none min-h-[36px] min-w-[36px] flex items-center justify-center"
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
            className="p-2 rounded-lg text-slate-500 dark:text-[#A7AFBD] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101624] transition-colors focus:outline-none hidden sm:inline-flex min-h-[36px] min-w-[36px] items-center justify-center"
            title="GitHub Repository"
            aria-label="View source on GitHub"
          >
            <Github className="h-4 w-4" />
          </a>

          {/* User Profile Avatar Icon */}
          <button
            className="p-2 rounded-lg text-slate-500 dark:text-[#A7AFBD] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#101624] transition-colors focus:outline-none hidden sm:inline-flex min-h-[36px] min-w-[36px] items-center justify-center"
            title="User Profile & Settings"
            aria-label="User Profile"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
