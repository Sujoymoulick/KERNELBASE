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
  { label: 'Agents', slug: 'agents/agent-taxonomy' },
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
  // All sections open by default
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
    <div className="h-full flex flex-col justify-between py-4 sm:py-5 px-3 text-xs overflow-y-auto overscroll-contain">
      <div className="space-y-4 sm:space-y-5">
        {NAVIGATION_SECTIONS.map((section: NavSection) => {
          const IconComponent = SECTION_ICONS[section.id] || LayoutGrid;
          const isOpen = openSections[section.id] !== false;
          
          const hasActiveChild = section.items.some((cat: NavCategory) =>
            cat.items.some((item: NavItem) => item.slug === currentSlug)
          );

          return (
            <div key={section.id} id={`nav-section-${section.id}`} className="space-y-1">
              <button
                id={`toggle-section-${section.id}`}
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors text-left min-h-[34px] ${
                  hasActiveChild
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <IconComponent className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="pl-3 ml-2 border-l border-slate-200 dark:border-slate-800 space-y-3 mt-1">
                  {section.items.map((cat: NavCategory, catIdx: number) => (
                    <div key={catIdx} className="space-y-0.5">
                      {cat.title && (
                        <div className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                            className={`w-full text-left px-2.5 py-2 sm:py-1.5 rounded-md text-[11px] transition-colors flex items-center justify-between group min-h-[34px] ${
                              isActive
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-850/60'
                            }`}
                          >
                            <span className="truncate">{item.title}</span>
                            {item.badge && (
                              <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ml-1 shrink-0">
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
      <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 px-2 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-between">
          <span>Documentation Engine</span>
          <span className="font-mono text-[10px]">v0.1.0</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Open Source AI Developer Environment
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sticky Left Sidebar */}
      {!isCollapsed && (
        <aside className="hidden md:block w-64 lg:w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] sticky top-14 sm:top-16 transition-all">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Drawer with Header & Close Button */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-150">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] bg-white dark:bg-slate-950 h-full shadow-2xl z-10 flex flex-col border-r border-slate-200 dark:border-slate-800">
            {/* Mobile Drawer Top Header */}
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Cpu className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="leading-tight font-extrabold text-sm text-slate-900 dark:text-white">
                    Documentation
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    AI-Native IDE
                  </span>
                </div>
              </div>
              <button
                id="mobile-drawer-close"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 min-h-[38px] min-w-[38px] flex items-center justify-center focus:outline-none"
                aria-label="Close navigation drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Search Button inside drawer */}
            {onOpenSearch && (
              <div className="p-3 border-b border-slate-100 dark:border-slate-850">
                <button
                  onClick={() => {
                    onCloseMobile();
                    onOpenSearch();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 text-xs shadow-2xs"
                >
                  <span className="flex items-center space-x-2">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400">Search all documentation...</span>
                  </span>
                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                    ⌘K
                  </span>
                </button>
              </div>
            )}

            {/* Quick jump pills row */}
            <div className="px-3 pt-2.5 pb-1 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1.5 px-1">
                Quick Jump
              </span>
              <div className="flex flex-wrap gap-1 pb-1">
                {QUICK_JUMP_TABS.map((tab) => (
                  <button
                    key={tab.slug}
                    onClick={() => handleNavClick(tab.slug)}
                    className="px-2 py-1 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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
