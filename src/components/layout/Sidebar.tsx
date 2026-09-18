import React, { useState } from 'react';
import {
  Rocket,
  LayoutGrid,
  Bot,
  Activity,
  Cpu,
  Wrench,
  Monitor,
  Layers,
  Terminal,
  Calendar,
  BookOpen,
  Compass,
  Map,
  FileCode,
  ChevronDown,
  ChevronRight,
  X,
  Search,
} from 'lucide-react';
import { NAVIGATION_SECTIONS } from '../../data/navigation';
import { NavSection, NavCategory, NavItem } from '../../types/docs';

interface SidebarProps {
  currentSlug: string;
  onSelectPage: (slug: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onOpenSearch?: () => void;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  'get-started': Rocket,
  'architecture': LayoutGrid,
  'agents': Bot,
  'autonomy': Activity,
  'models': Cpu,
  'tools': Wrench,
  'desktop': Monitor,
  'free-tech-stack': Layers,
  'build': Terminal,
  '10-day-mvp': Calendar,
  'research': BookOpen,
  'resources': Compass,
  'roadmap': Map,
  'reference': FileCode,
};

const QUICK_JUMP_TABS = [
  { label: 'Get Started', slug: 'get-started/overview' },
  { label: 'Architecture', slug: 'architecture/system-architecture' },
  { label: 'Agents', slug: 'agents/agent-system' },
  { label: 'Free Stack', slug: 'free-tech-stack/open-source-stack' },
  { label: '10-Day MVP', slug: '10-day-mvp/mvp-overview' },
  { label: 'Research', slug: 'research/desktop-frameworks' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentSlug,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onOpenSearch,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'get-started': true,
    'architecture': true,
    'agents': true,
    'autonomy': true,
    'models': true,
    'tools': true,
    'desktop': true,
    'free-tech-stack': true,
    'build': true,
    '10-day-mvp': true,
    'research': true,
    'resources': true,
    'roadmap': true,
    'reference': true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNavClick = (slug: string) => {
    onSelectPage(slug);
    onCloseMobile();
  };

  const sidebarContent = (
    <div
      className="h-full flex flex-col justify-between py-3.5 px-3 text-xs overflow-y-auto overscroll-contain select-none"
      style={{ backgroundColor: 'var(--kb-surface)', color: 'var(--kb-text-subtle)' }}
    >
      <div className="space-y-4">
        {/* Filter sidebar input */}
        <div className="relative mb-2">
          <div
            className="flex items-center rounded-md px-2.5 py-1.5 text-xs border transition-colors"
            style={{ backgroundColor: 'var(--kb-surface-elevated)', borderColor: 'var(--kb-border)' }}
          >
            <svg className="h-3.5 w-3.5 shrink-0 mr-2" style={{ color: 'var(--kb-text-faint)' }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter sidebar..."
              className="w-full bg-transparent placeholder-[color:var(--kb-text-faint)] focus:outline-none text-xs pr-4 font-medium"
              style={{ color: 'var(--kb-text)' }}
            />
            <kbd
              className="font-mono text-[10px] px-1.5 py-0.2 rounded border shrink-0 pointer-events-none font-semibold"
              style={{
                backgroundColor: 'var(--kb-bg)',
                color: 'var(--kb-text-muted)',
                borderColor: 'var(--kb-border)',
              } as React.CSSProperties}
            >
              /
            </kbd>
          </div>
        </div>

        {NAVIGATION_SECTIONS.map((section: NavSection) => {
          const IconComponent = SECTION_ICONS[section.id] || LayoutGrid;
          const isOpen = openSections[section.id] !== false || filterQuery.trim().length > 0;
          
          const hasActiveChild = section.items.some((cat: NavCategory) =>
            cat.items.some((item: NavItem) => item.slug === currentSlug)
          );

          const filteredCategories = section.items.map((cat: NavCategory) => ({
            ...cat,
            items: cat.items.filter((item: NavItem) =>
              item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
              section.title.toLowerCase().includes(filterQuery.toLowerCase())
            )
          })).filter((cat) => cat.items.length > 0);

          if (filterQuery.trim().length > 0 && filteredCategories.length === 0) {
            return null;
          }

          return (
            <div key={section.id} id={`nav-section-${section.id}`} className="space-y-1">
              <button
                id={`toggle-section-${section.id}`}
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors text-left min-h-[32px]"
                style={hasActiveChild ? {
                  color: 'var(--kb-text)',
                  fontWeight: 700,
                  backgroundColor: 'color-mix(in srgb, var(--kb-surface-elevated) 40%, transparent)',
                } : {
                  color: 'var(--kb-text-muted)',
                }}
              >
                <div className="flex items-center space-x-2 truncate">
                  <IconComponent
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: hasActiveChild ? 'var(--kb-accent-bright)' : 'var(--kb-text-faint)' }}
                  />
                  <span className="truncate uppercase tracking-wider text-[11px] font-bold">{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--kb-text-faint)' }} />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--kb-text-faint)' }} />
                )}
              </button>

              {isOpen && (
                <div className="pl-2 ml-1 border-l space-y-2 mt-1" style={{ borderColor: 'var(--kb-border)' }}>
                  {filteredCategories.map((cat: NavCategory, catIdx: number) => (
                    <div key={catIdx} className="space-y-0.5">
                      {cat.title && (
                        <div
                          className="px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider font-mono"
                          style={{ color: 'var(--kb-text-faint)' }}
                        >
                          {cat.title}
                        </div>
                      )}
                      {cat.items.map((item: NavItem) => {
                        const isActive = currentSlug === item.slug;
                        return (
                          <button
                            key={item.slug}
                            id={`nav-item-${item.slug.replace(/\//g, '-')}`}
                            onClick={() => handleNavClick(item.slug)}
                            className="w-full text-left px-3 py-1.5 rounded-md text-[11px] transition-colors flex items-center justify-between group min-h-[30px] border-l-2"
                            style={isActive ? {
                              backgroundColor: 'color-mix(in srgb, var(--kb-brand-secondary) 20%, transparent)',
                              color: 'var(--kb-text)',
                              fontWeight: 600,
                              borderLeftColor: 'var(--kb-accent-bright)',
                            } : {
                              color: 'var(--kb-text-subtle)',
                              borderLeftColor: 'transparent',
                            }}
                          >
                            <span className="truncate">{item.title}</span>
                            {item.badge && (
                              <span
                                className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border ml-1 shrink-0"
                                style={isActive ? {
                                  backgroundColor: 'var(--kb-brand-secondary)',
                                  color: 'var(--kb-text)',
                                  borderColor: 'var(--kb-accent-bright)',
                                } : {
                                  backgroundColor: 'var(--kb-surface-elevated)',
                                  color: 'var(--kb-accent-bright)',
                                  borderColor: 'var(--kb-border)',
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div
        className="mt-8 pt-4 border-t px-2 space-y-1.5 text-[11px]"
        style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-text-faint)' }}
      >
        <div className="flex items-center justify-between">
          <span>AI-Native IDE Platform</span>
          <span className="font-mono text-[10px]" style={{ color: 'var(--kb-accent-bright)' }}>v0.1.0</span>
        </div>
        <p className="text-[10px]">
          Kernel Base Documentation
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sticky Left Sidebar */}
      {!isCollapsed && (
        <aside
          className="hidden md:block w-64 lg:w-72 shrink-0 border-r h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] sticky top-14 sm:top-16 transition-all"
          style={{ borderColor: 'var(--kb-border)', backgroundColor: 'var(--kb-surface)' }}
        >
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Drawer with Header & Close Button */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-150">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10 flex flex-col border-r"
            style={{ backgroundColor: 'var(--kb-surface)', borderColor: 'var(--kb-border)' }}
          >
            {/* Mobile Drawer Top Header */}
            <div
              className="p-3.5 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--kb-border)', backgroundColor: 'var(--kb-surface-elevated)' }}
            >
              <div className="flex items-center space-x-2">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: 'var(--kb-brand-secondary)', color: 'var(--kb-text)' }}
                >
                  <Cpu className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="leading-tight font-extrabold text-sm" style={{ color: 'var(--kb-text)' }}>
                    Kernel Base Docs
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--kb-text-faint)' }}>
                    AI-Native IDE Architecture
                  </span>
                </div>
              </div>
              <button
                id="mobile-drawer-close"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg min-h-[38px] min-w-[38px] flex items-center justify-center focus:outline-none"
                style={{ color: 'var(--kb-text-faint)' }}
                aria-label="Close navigation drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Search Button inside drawer */}
            {onOpenSearch && (
              <div className="p-3 border-b" style={{ borderColor: 'var(--kb-border)' }}>
                <button
                  onClick={() => {
                    onCloseMobile();
                    onOpenSearch();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs shadow-2xs"
                  style={{
                    borderColor: 'var(--kb-border)',
                    backgroundColor: 'var(--kb-surface-elevated)',
                    color: 'var(--kb-text-faint)',
                  }}
                >
                  <span className="flex items-center space-x-2">
                    <Search className="h-3.5 w-3.5" />
                    <span style={{ color: 'var(--kb-text-subtle)' }}>Search documentation...</span>
                  </span>
                  <span
                    className="font-mono text-[10px] px-1 py-0.2 rounded border"
                    style={{
                      backgroundColor: 'var(--kb-bg)',
                      color: 'var(--kb-text-muted)',
                      borderColor: 'var(--kb-border)',
                    } as React.CSSProperties}
                  >
                    ⌘K
                  </span>
                </button>
              </div>
            )}

            {/* Quick jump pills row */}
            <div
              className="px-3 pt-2.5 pb-1 border-b"
              style={{ borderColor: 'var(--kb-border)', backgroundColor: 'var(--kb-surface-elevated)' }}
            >
              <span
                className="text-[10px] uppercase font-semibold tracking-wider block mb-1.5 px-1"
                style={{ color: 'var(--kb-text-faint)' }}
              >
                Quick Jump
              </span>
              <div className="flex flex-wrap gap-1 pb-1">
                {QUICK_JUMP_TABS.map((tab) => (
                  <button
                    key={tab.slug}
                    onClick={() => handleNavClick(tab.slug)}
                    className="px-2 py-1 rounded text-[10px] font-medium border transition-colors"
                    style={{
                      backgroundColor: 'var(--kb-surface-secondary)',
                      color: 'var(--kb-text-muted)',
                      borderColor: 'var(--kb-border)',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Nav Tree */}
            <div className="flex-1 overflow-hidden">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
