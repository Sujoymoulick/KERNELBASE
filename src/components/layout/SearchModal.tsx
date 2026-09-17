import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, ArrowRight, CornerDownLeft, X, Sparkles, Hash } from 'lucide-react';
import { ALL_DOC_PAGES } from '../../data/pages';
import { DocPage } from '../../types/docs';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPage,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Search logic across all pages, tags, and section headers
  const results = React.useMemo(() => {
    if (!query.trim()) {
      return ALL_DOC_PAGES.slice(0, 8); // Top default recommended pages
    }

    const q = query.toLowerCase().trim();
    return ALL_DOC_PAGES.filter((page) => {
      const matchTitle = page.title.toLowerCase().includes(q);
      const matchDesc = page.description.toLowerCase().includes(q);
      const matchSection = page.section.toLowerCase().includes(q);
      const matchCategory = page.category ? page.category.toLowerCase().includes(q) : false;
      const matchTags = page.tags?.some((t) => t.toLowerCase().includes(q));
      const matchSubsections = page.content.sections.some((s) =>
        s.title.toLowerCase().includes(q)
      );

      return (
        matchTitle ||
        matchDesc ||
        matchSection ||
        matchCategory ||
        matchTags ||
        matchSubsections
      );
    }).slice(0, 15);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectPage(results[selectedIndex].slug);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onSelectPage]);

  if (!isOpen) return null;

  return (
    <div
      id="search-dialog-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="search-dialog"
        className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <Search className="h-4 w-4 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            id="docs-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search documentation, architecture, agents, free stack, or code..."
            className="w-full py-3.5 text-sm bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 ml-2">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          {results.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-sm mb-1">No documentation matches found</p>
              <p>Try searching for "Orchestrator", "Ollama", "Tauri", "DAG", or "Credits".</p>
            </div>
          ) : (
            results.map((page, index) => {
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={page.slug}
                  id={`search-result-${index}`}
                  onClick={() => {
                    onSelectPage(page.slug);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-lg flex items-start justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3 truncate">
                    <FileText
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                      }`}
                    />
                    <div className="truncate">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {page.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {page.section}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {page.description}
                      </p>
                    </div>
                  </div>

                  <CornerDownLeft
                    className={`h-3.5 w-3.5 shrink-0 ml-2 mt-1 transition-opacity ${
                      isSelected ? 'opacity-100 text-indigo-600 dark:text-indigo-400' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-3">
            <span>
              <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                ↓
              </kbd>{' '}
              to navigate
            </span>
            <span>
              <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                ↵
              </kbd>{' '}
              to select
            </span>
          </div>
          <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
            Pagefind Static Index
          </span>
        </div>
      </div>
    </div>
  );
};
