import React, { useEffect, useState } from 'react';
import { DocSection } from '../../types/docs';
import { AlignLeft, ChevronDown, CheckCircle2 } from 'lucide-react';

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
          if (entry.isIntersecting) setActiveId(entry.target.id);
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
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - topOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <div className="hidden xl:block w-64 lg:w-72 shrink-0 pl-6 text-sm select-none">
      <div className="sticky top-20">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--kb-text-faint)' }}>
          <AlignLeft className="h-3.5 w-3.5" style={{ color: 'var(--kb-accent-bright)' }} />
          <span>ON THIS PAGE</span>
        </div>
        <ul className="space-y-1.5 border-l text-xs" style={{ borderColor: 'var(--kb-border)' }}>
          {sections.map((sec) => {
            const isActive = activeId === sec.id;
            return (
              <li key={sec.id}>
                <button
                  id={`toc-${sec.id}`}
                  onClick={() => scrollToSection(sec.id)}
                  className="-ml-px block pl-3.5 py-1 text-left w-full transition-colors border-l-2 truncate text-xs"
                  style={isActive ? {
                    borderLeftColor: 'var(--kb-accent-bright)',
                    color: 'var(--kb-text)',
                    fontWeight: 600,
                    backgroundColor: 'color-mix(in srgb, var(--kb-surface-elevated) 40%, transparent)',
                  } : {
                    borderLeftColor: 'transparent',
                    color: 'var(--kb-text-subtle)',
                  }}
                  title={sec.title}
                >
                  {sec.title}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Technical Specification Box */}
        <div className="mt-8 pt-6 border-t text-xs space-y-2" style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-text-subtle)' }}>
          <p className="font-bold" style={{ color: 'var(--kb-text)' }}>Technical Documentation</p>
          <p style={{ color: 'var(--kb-text-faint)' }}>Verified current: September 2026</p>
          <div className="pt-1 flex items-center">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: 'var(--kb-surface-elevated)',
                color: 'var(--kb-text)',
                borderColor: 'var(--kb-border)',
              }}
            >
              <CheckCircle2 className="h-3 w-3" style={{ color: 'var(--kb-accent-bright)' }} />
              <span className="text-[10px] font-mono" style={{ color: 'var(--kb-text-muted)' }}>Production Spec</span>
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
          if (entry.isIntersecting) setActiveId(entry.target.id);
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
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      setActiveId(id);
      setIsOpen(false);
    }
  };

  const activeSection = sections.find((s) => s.id === activeId) || sections[0];

  return (
    <div
      className="xl:hidden my-4 rounded-lg border backdrop-blur-xs text-xs overflow-hidden"
      style={{ borderColor: 'var(--kb-border)', backgroundColor: 'var(--kb-surface)' }}
    >
      <button
        type="button"
        id="mobile-toc-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left focus:outline-none transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2 truncate">
          <AlignLeft className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--kb-accent-bright)' }} />
          <span className="font-semibold" style={{ color: 'var(--kb-text)' }}>On this page:</span>
          <span className="truncate font-normal" style={{ color: 'var(--kb-text-subtle)' }}>
            {activeSection ? activeSection.title : `${sections.length} sections`}
          </span>
        </div>
        <div className="flex items-center space-x-1 shrink-0 ml-2">
          <span className="text-[10px] font-mono" style={{ color: 'var(--kb-text-faint)' }}>
            {sections.length}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--kb-text-faint)' }}
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t" style={{ borderColor: 'var(--kb-border)' }}>
          <ul className="space-y-1.5 pt-1">
            {sections.map((sec) => {
              const isActive = activeId === sec.id;
              return (
                <li key={sec.id}>
                  <button
                    onClick={() => scrollToSection(sec.id)}
                    className="block w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors truncate border-l-2"
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
