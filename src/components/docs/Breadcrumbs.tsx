import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  section: string;
  category?: string;
  title: string;
  onNavigateHome: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  section,
  category,
  title,
  onNavigateHome,
}) => {
  return (
    <nav
      aria-label="Breadcrumbs"
      className="flex items-center space-x-1.5 text-xs mb-6 overflow-x-auto whitespace-nowrap font-medium select-none"
      style={{ color: 'var(--kb-text-subtle)' }}
    >
      <button
        onClick={onNavigateHome}
        className="flex items-center transition-colors p-0.5 rounded"
        style={{ color: 'var(--kb-text-subtle)' }}
        title="Home"
        aria-label="Back to documentation home"
      >
        <Home className="h-3.5 w-3.5" style={{ color: 'var(--kb-accent-bright)' }} />
      </button>

      <ChevronRight className="h-3 w-3 shrink-0" style={{ color: 'var(--kb-text-faint)' }} />
      <span className="font-semibold" style={{ color: 'var(--kb-text-muted)' }}>{section}</span>

      {category && (
        <>
          <ChevronRight className="h-3 w-3 shrink-0" style={{ color: 'var(--kb-text-faint)' }} />
          <span style={{ color: 'var(--kb-text-subtle)' }}>{category}</span>
        </>
      )}

      <ChevronRight className="h-3 w-3 shrink-0" style={{ color: 'var(--kb-text-faint)' }} />
      <span className="font-bold truncate max-w-[240px]" style={{ color: 'var(--kb-text)' }}>
        {title}
      </span>
    </nav>
  );
};
