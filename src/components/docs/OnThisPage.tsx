import React, { useEffect, useState } from 'react';
import { DocSection } from '../../types/docs';
import { AlignLeft, ChevronDown } from 'lucide-react';

interface OnThisPageProps {
  sections: DocSection[];
}

export const OnThisPage: React.FC<OnThisPageProps> = ({ sections }) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (sections.length === 0) return;
    setActiveId(sections[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveId(id);
    }
  };

  return (
    <div className="hidden xl:block w-64 shrink-0 pl-8 text-sm">
      <div className="sticky top-20">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          <AlignLeft className="h-3.5 w-3.5" />
          <span>On this page</span>
        </div>
        <ul className="space-y-2 border-l border-slate-200 dark:border-slate-800 text-xs">
          {sections.map((sec) => {
            const isActive = activeId === sec.id;
            return (
              <li key={sec.id}>
                <button
                  id={`toc-${sec.id}`}
                  onClick={() => scrollToSection(sec.id)}
                  className={`-ml-px block pl-4 py-1 text-left w-full transition-colors border-l-2 truncate ${
                    isActive
                      ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  title={sec.title}
                >
                  {sec.title}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Feedback / Meta box */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
          <p className="font-medium text-slate-700 dark:text-slate-300">Technical Documentation</p>
          <p>Verified current: September 2026</p>
          <div className="pt-2 flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              Zero-Cost Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MobileTableOfContents: React.FC<OnThisPageProps> = ({ sections }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (sections.length === 0) return;
    setActiveId(sections[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-70px 0px -60% 0px' }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  if (sections.length <= 1) return null;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveId(id);
      setIsOpen(false);
    }
  };

  const activeSection = sections.find((s) => s.id === activeId) || sections[0];

  return (
    <div className="xl:hidden my-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 backdrop-blur-xs text-xs overflow-hidden">
      <button
        type="button"
        id="mobile-toc-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left focus:outline-none hover:bg-slate-100/60 dark:hover:bg-slate-850/60 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2 truncate">
          <AlignLeft className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            On this page:
          </span>
          <span className="text-slate-500 dark:text-slate-400 truncate font-normal">
            {activeSection ? activeSection.title : `${sections.length} sections`}
          </span>
        </div>
        <div className="flex items-center space-x-1 shrink-0 ml-2">
          <span className="text-[10px] text-slate-400 font-mono">
            {sections.length}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-200 dark:border-slate-800">
          <ul className="space-y-1.5 pt-1">
            {sections.map((sec) => {
              const isActive = activeId === sec.id;
              return (
                <li key={sec.id}>
                  <button
                    onClick={() => scrollToSection(sec.id)}
                    className={`block w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors truncate ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {sec.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
