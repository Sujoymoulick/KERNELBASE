import React, { useState, useEffect } from 'react';
import { WorkbenchProvider } from './workbench/store';
import { Workbench } from './workbench/Workbench';

// Documentation sub-view imports
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SearchModal } from './components/layout/SearchModal';
import { DocRenderer } from './components/docs/DocRenderer';
import { OnThisPage } from './components/docs/OnThisPage';
import { getDocPageBySlug, ALL_DOC_PAGES } from './data/pages';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useDocJsonLd } from './hooks/useDocJsonLd';
import { ThemeTransitionOverlay } from './components/common/ThemeTransitionOverlay';

function DocsContent({ onSwitchToIDE }: { onSwitchToIDE: () => void }) {
  const [currentSlug, setCurrentSlug] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash && hash !== 'docs' && getDocPageBySlug(hash)) {
      return hash;
    }
    return 'get-started/overview';
  });

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const { isDark, toggleTheme, isTransitioning, targetTheme, isFallback } = useTheme();

  const handleSelectPage = (slug: string) => {
    window.location.hash = slug;
    setCurrentSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPage = getDocPageBySlug(currentSlug) || ALL_DOC_PAGES[0];
  useDocJsonLd(currentPage);

  return (
    <div
      key="app-theme-root"
      className="min-h-screen flex flex-col font-sans transition-colors"
      style={{
        backgroundColor: 'var(--kb-bg)',
        color: 'var(--kb-text)',
      }}
    >
      <ThemeTransitionOverlay
        isTransitioning={isTransitioning}
        targetTheme={targetTheme}
        isFallback={isFallback}
      />

      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        isDark={isDark}
        isTransitioning={isTransitioning}
        onToggleTheme={toggleTheme}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
        activeSection={currentPage.slug}
        onSelectSection={handleSelectPage}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Banner to switch back to IDE */}
      <div className="bg-[#1b0d07] border-b border-[#3d1d13] px-4 py-2 flex items-center justify-between text-xs">
        <span className="text-neutral-400">Viewing Kernel Base Documentation.</span>
        <button
          onClick={onSwitchToIDE}
          className="bg-[#ff6b35] hover:bg-[#ff804d] text-black font-semibold px-3 py-1 rounded text-xs transition-colors"
        >
          Return to IDE Workbench →
        </button>
      </div>

      <div className="max-w-[1720px] mx-auto w-full flex-1 flex">
        <Sidebar
          currentSlug={currentPage.slug}
          onSelectPage={handleSelectPage}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="flex-1 min-w-0 pt-6 sm:pt-8 md:pt-10 px-4 sm:px-8 lg:px-12 flex justify-between gap-8 lg:gap-12">
          <DocRenderer
            page={currentPage}
            onNavigate={handleSelectPage}
            isDark={isDark}
          />
          <OnThisPage sections={currentPage.content.sections} />
        </main>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={handleSelectPage}
      />
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: 'fixed', inset: 0, background: '#1f1f1f', color: '#cccccc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: '-apple-system, system-ui, sans-serif', fontSize: 13 }}>
          <div style={{ fontSize: 18, color: '#e5e5e5' }}>Kernel Base hit an error</div>
          <pre style={{ maxWidth: 560, maxHeight: 200, overflow: 'auto', background: '#181818', border: '1px solid #2b2b2b', borderRadius: 4, padding: 10, fontSize: 12, whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message || 'An unexpected runtime error occurred.'}
          </pre>
          <button onClick={() => window.location.reload()} style={{ background: '#0078d4', color: '#fff', border: 0, borderRadius: 4, padding: '6px 14px', cursor: 'pointer' }}>
            Reload Window
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [appMode, setAppMode] = useState<'ide' | 'docs'>(() => {
    // If URL contains ?view=docs or #docs, show docs; otherwise default to IDE
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('view') === 'docs' || window.location.hash.startsWith('#docs')) {
        return 'docs';
      }
    } catch {}
    return 'ide';
  });

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.startsWith('#docs')) {
        setAppMode('docs');
      } else if (window.location.hash === '#ide') {
        setAppMode('ide');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <ErrorBoundary>
      {appMode === 'docs' ? (
        <ThemeProvider>
          <DocsContent onSwitchToIDE={() => setAppMode('ide')} />
        </ThemeProvider>
      ) : (
        <WorkbenchProvider>
          <Workbench />
        </WorkbenchProvider>
      )}
    </ErrorBoundary>
  );
}
