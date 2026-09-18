import React from 'react';
import { Search, Github, Menu, X, PanelLeft, PanelLeftClose, User, Sun, Moon } from 'lucide-react';
import { KernelBaseLogo } from './KernelBaseLogo';

interface HeaderProps {
  onOpenSearch: () => void;
  isDark?: boolean;
  isTransitioning?: boolean;
  onToggleTheme?: () => void;
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
  isTransitioning = false,
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
    { id: 'changelog', label: 'Changelog', targetSlug: 'roadmap/release-milestones' },
  ];

  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors"
      style={{
        borderColor: 'var(--kb-border)',
        backgroundColor: 'color-mix(in srgb, var(--kb-surface) 95%, transparent)',
        color: 'var(--kb-text)',
      }}
    >
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile / Tablet Toggles & Brand Logo */}
        <div className="flex items-center space-x-1.5 sm:space-x-4 shrink-0">
          {/* Mobile hamburger menu button */}
          <button
            id="mobile-menu-toggle"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg focus:outline-none min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
            style={{ color: 'var(--kb-text-subtle)' }}
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
              className="hidden md:flex p-1.5 rounded-lg transition-colors focus:outline-none border border-transparent"
              style={{ color: 'var(--kb-text-subtle)' }}
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

          {/* Brand Logo & Wordmark */}
          <a
            href="#get-started/overview"
            onClick={(e) => {
              e.preventDefault();
              onSelectSection('get-started/overview');
            }}
            className="flex items-center space-x-1.5 sm:space-x-2 font-bold text-sm sm:text-base tracking-tight hover:opacity-95 transition-opacity"
            style={{ color: 'var(--kb-text)' }}
          >
            <KernelBaseLogo size={26} showWordmark={true} />
            <span
              className="hidden xs:inline-block px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest ml-0.5"
              style={{
                backgroundColor: 'var(--kb-surface-elevated)',
                color: 'var(--kb-accent-bright)',
                borderColor: 'var(--kb-border)',
                border: '1px solid',
              } as React.CSSProperties}
            >
              DOCS
            </span>
          </a>
        </div>

        {/* Center: Top Navigation Quick Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 overflow-x-auto scrollbar-none py-1 text-xs font-medium">
          {topNavItems.map((item) => {
            const isActive = activeSection.startsWith(item.id) ||
              (item.id === 'directory' && activeSection.startsWith('get-started')) ||
              (item.id === 'api' && activeSection.includes('api')) ||
              (item.id === 'sdks' && activeSection.includes('mcp')) ||
              (item.id === 'changelog' && activeSection.includes('release'));

            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onSelectSection(item.targetSlug)}
                className="px-3.5 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 text-xs border"
                style={isActive ? {
                  color: 'var(--kb-text)',
                  backgroundColor: 'var(--kb-surface-elevated)',
                  borderColor: 'var(--kb-border-hover)',
                  fontWeight: 700,
                } : {
                  color: 'var(--kb-text-subtle)',
                  borderColor: 'transparent',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Search, Theme Toggle, Three-dot Menu, GitHub, User Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* Mobile Search Icon Button (Hidden on desktop) */}
          <button
            id="mobile-header-search-btn"
            onClick={onOpenSearch}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-full border transition-all focus:outline-none"
            style={{
              borderColor: 'var(--kb-border)',
              backgroundColor: 'var(--kb-surface-elevated)',
              color: 'var(--kb-text-subtle)',
            }}
            title="Search documentation"
            aria-label="Search documentation"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Desktop Search Bar Input Pill (Hidden on mobile) */}
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="hidden md:flex items-center justify-between space-x-2 px-3.5 py-1.5 rounded-full border text-xs transition-all w-48 md:w-64 min-h-[36px] focus:outline-none shadow-2xs"
            style={{
              borderColor: 'var(--kb-border)',
              backgroundColor: 'var(--kb-surface)',
              color: 'var(--kb-text-subtle)',
            }}
            title="Search documentation (Cmd+K)"
          >
            <div className="flex items-center space-x-2 truncate">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-xs font-medium">Search documentation...</span>
            </div>
            <kbd
              className="inline-flex items-center font-mono text-[10px] px-1.5 py-0.2 rounded shrink-0 font-semibold"
              style={{
                backgroundColor: 'var(--kb-surface-elevated)',
                borderColor: 'var(--kb-border)',
                color: 'var(--kb-text-muted)',
                border: '1px solid',
              } as React.CSSProperties}
            >
              ⌘ K
            </kbd>
          </button>

          {/* Theme Toggle Button (Always visible on all screen sizes) */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            disabled={isTransitioning}
            className="flex items-center justify-center h-8 w-8 rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-80"
            style={{
              borderColor: 'var(--kb-border)',
              backgroundColor: 'var(--kb-surface-elevated)',
              color: 'var(--kb-text-subtle)',
            }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span
              key={isDark ? 'sun' : 'moon'}
              className="kb-theme-toggle-icon flex items-center justify-center pointer-events-none"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </span>
          </button>

          {/* GitHub Repository Link (Desktop) */}
          <a
            id="github-repo-link"
            href="https://github.com/Sujoymoulick/kernelbase-docs"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg border border-transparent transition-colors focus:outline-none hidden sm:inline-flex min-h-[36px] min-w-[36px] items-center justify-center"
            style={{ color: 'var(--kb-text-subtle)' }}
            title="GitHub Repository"
            aria-label="View source on GitHub"
          >
            <Github className="h-4 w-4" />
          </a>

          {/* User Profile Avatar Icon (Desktop) */}
          <button
            className="p-2 rounded-lg border border-transparent transition-colors focus:outline-none hidden sm:inline-flex min-h-[36px] min-w-[36px] items-center justify-center"
            style={{ color: 'var(--kb-text-subtle)' }}
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
