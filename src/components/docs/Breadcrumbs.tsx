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
    <nav aria-label="Breadcrumbs" className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 overflow-x-auto whitespace-nowrap">
      <button
        onClick={onNavigateHome}
        className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 rounded"
        title="Home"
        aria-label="Back to documentation home"
      >
        <Home className="h-3.5 w-3.5" />
      </button>

      <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
      <span className="font-medium text-slate-600 dark:text-slate-300">{section}</span>

      {category && (
        <>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">{category}</span>
        </>
      )}

      <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
      <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[240px]">
        {title}
      </span>
    </nav>
  );
};
