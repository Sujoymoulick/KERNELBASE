import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { IDEProvider } from './context/IDEContext';
import { AgentProvider } from './context/AgentContext';
import { TerminalProvider } from './context/TerminalContext';
import { IDELayout } from './app/IDELayout';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SearchModal } from './components/layout/SearchModal';
import { DocRenderer } from './components/docs/DocRenderer';
import { OnThisPage } from './components/docs/OnThisPage';
import { getDocPageBySlug, ALL_DOC_PAGES } from './data/pages';
import { useDocJsonLd } from './hooks/useDocJsonLd';
import { ThemeTransitionOverlay } from './components/common/ThemeTransitionOverlay';

function DocsViewer() {
  const [currentSlug, setCurrentSlug] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash && getDocPageBySlug(hash)) return hash;
    return 'get-started/overview';
  });

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const { isDark, toggleTheme, isTransitioning, targetTheme, isFallback } = useTheme();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash && getDocPageBySlug(hash)) {
        setCurrentSlug(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectPage = (slug: string) => {
    window.location.hash = slug;
    setCurrentSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPage = getDocPageBySlug(currentSlug) || ALL_DOC_PAGES[0];
  useDocJsonLd(currentPage);

  return (
    <div
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

export default function App() {
  const [mode, setMode] = useState<'ide' | 'docs'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'docs' || window.location.hash.startsWith('#docs')) {
      return 'docs';
    }
    return 'ide';
  });

  return (
    <ThemeProvider>
      {mode === 'docs' ? (
        <DocsViewer />
      ) : (
        <IDEProvider>
          <AgentProvider>
            <TerminalProvider>
              <IDELayout />
            </TerminalProvider>
          </AgentProvider>
        </IDEProvider>
      )}
    </ThemeProvider>
  );
}
