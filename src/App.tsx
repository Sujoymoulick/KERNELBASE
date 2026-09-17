import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SearchModal } from './components/layout/SearchModal';
import { DocRenderer } from './components/docs/DocRenderer';
import { OnThisPage } from './components/docs/OnThisPage';
import { getDocPageBySlug, ALL_DOC_PAGES } from './data/pages';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useDocJsonLd } from './hooks/useDocJsonLd';

function AppContent() {
  const [currentSlug, setCurrentSlug] = useState<string>(() => {
    // 1. Hash route fallback
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash && getDocPageBySlug(hash)) {
      return hash;
    }
    // 2. Query param (?page=... or ?p=...)
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const queryParam = searchParams.get('page') || searchParams.get('p') || searchParams.get('slug');
      if (queryParam && getDocPageBySlug(queryParam)) {
        return queryParam;
      }
    } catch (_) {}
    // 3. Pathname fallback
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    if (path && getDocPageBySlug(path)) {
      return path;
    }
    return 'get-started/overview';
  });

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Active theme from centralized ThemeContext
  const { isDark, toggleTheme } = useTheme();

  // Hash route listener
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

  // Update hash when slug changes
  const handleSelectPage = (slug: string) => {
    window.location.hash = slug;
    setCurrentSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPage = getDocPageBySlug(currentSlug) || ALL_DOC_PAGES[0];

  // Dynamically generate and inject JSON-LD structured data and head metadata for SEO
  useDocJsonLd(currentPage);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div
      key={`app-theme-root-${isDark ? 'dark' : 'light'}`}
      className="min-h-screen bg-white dark:bg-[#08090B] text-slate-900 dark:text-[#F5F7FA] flex flex-col font-sans transition-colors selection:bg-orange-500/20 selection:text-orange-300"
    >
      {/* Top Fixed Header with immediate theme toggler */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
        activeSection={currentPage.slug}
        onSelectSection={handleSelectPage}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main 3-Zone Desktop Container Layout */}
      <div className="max-w-[1720px] mx-auto w-full flex-1 flex">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentSlug={currentPage.slug}
          onSelectPage={handleSelectPage}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Center Content & Right TOC */}
        <main className="flex-1 min-w-0 pt-6 sm:pt-8 md:pt-10 px-4 sm:px-8 lg:px-12 flex justify-between gap-8 lg:gap-12">
          <DocRenderer
            page={currentPage}
            onNavigate={handleSelectPage}
            isDark={isDark}
          />
          <OnThisPage sections={currentPage.content.sections} />
        </main>
      </div>

      {/* Global Quick Search Modal (Cmd+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={handleSelectPage}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
