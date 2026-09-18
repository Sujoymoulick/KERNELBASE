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
    <div
      className="mt-12 pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-4"
      style={{ borderColor: 'var(--kb-border)' }}
    >
      {prev ? (
        <button
          id="pagination-prev"
          onClick={() => onNavigate(prev.slug)}
          className="group flex flex-col p-4 rounded-xl border transition-all text-left shadow-xs"
          style={{
            borderColor: 'var(--kb-border)',
            backgroundColor: 'var(--kb-surface)',
          }}
        >
          <span
            className="text-[11px] font-medium flex items-center space-x-1 mb-1"
            style={{ color: 'var(--kb-text-faint)' }}
          >
            <ChevronLeft
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
              style={{ color: 'var(--kb-accent-bright)' }}
            />
            <span>Previous</span>
          </span>
          <span
            className="text-sm font-semibold transition-colors"
            style={{ color: 'var(--kb-text)' }}
          >
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
          className="group flex flex-col p-4 rounded-xl border transition-all text-right sm:col-start-2 shadow-xs"
          style={{
            borderColor: 'var(--kb-border)',
            backgroundColor: 'var(--kb-surface)',
          }}
        >
          <span
            className="text-[11px] font-medium flex items-center justify-end space-x-1 mb-1"
            style={{ color: 'var(--kb-text-faint)' }}
          >
            <span>Next</span>
            <ChevronRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              style={{ color: 'var(--kb-accent-bright)' }}
            />
          </span>
          <span
            className="text-sm font-semibold transition-colors"
            style={{ color: 'var(--kb-text)' }}
          >
            {next.title}
          </span>
        </button>
      )}
    </div>
  );
};
