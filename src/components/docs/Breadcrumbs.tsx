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
    <nav aria-label="Breadcrumbs" className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-[#A7AFBD] mb-6 overflow-x-auto whitespace-nowrap font-medium">
      <button
        onClick={onNavigateHome}
        className="flex items-center text-slate-500 dark:text-[#A7AFBD] hover:text-slate-900 dark:hover:text-[#F5F7FA] transition-colors p-0.5 rounded"
        title="Home"
        aria-label="Back to documentation home"
      >
        <Home className="h-3.5 w-3.5" />
      </button>

      <ChevronRight className="h-3 w-3 text-slate-400 dark:text-[#707987] shrink-0" />
      <span className="font-medium text-slate-600 dark:text-[#A7AFBD]">{section}</span>

      {category && (
        <>
          <ChevronRight className="h-3 w-3 text-slate-400 dark:text-[#707987] shrink-0" />
          <span className="text-slate-500 dark:text-[#A7AFBD]">{category}</span>
        </>
      )}

      <ChevronRight className="h-3 w-3 text-slate-400 dark:text-[#707987] shrink-0" />
      <span className="text-slate-900 dark:text-[#F5F7FA] font-semibold truncate max-w-[240px]">
        {title}
      </span>
    </nav>
  );
};
