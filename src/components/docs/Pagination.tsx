import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  prev: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
  onNavigate: (slug: string) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ prev, next, onNavigate }) => {
  if (!prev && !next) return null;

  return (
    <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prev ? (
        <button
          id="pagination-prev"
          onClick={() => onNavigate(prev.slug)}
          className="group flex flex-col p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all text-left"
        >
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1 mb-1">
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Previous</span>
          </span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {prev.title}
          </span>
        </button>
      ) : (
        <div />
      )}

      {next && (
        <button
          id="pagination-next"
          onClick={() => onNavigate(next.slug)}
          className="group flex flex-col p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all text-right sm:col-start-2"
        >
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-end space-x-1 mb-1">
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {next.title}
          </span>
        </button>
      )}
    </div>
  );
};
