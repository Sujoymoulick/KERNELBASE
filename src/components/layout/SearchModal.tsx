import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, CornerDownLeft, X } from 'lucide-react';
import { ALL_DOC_PAGES } from '../../data/pages';

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

  const results = React.useMemo(() => {
    if (!query.trim()) {
      return ALL_DOC_PAGES.slice(0, 8);
    }
    const q = query.toLowerCase().trim();
    return ALL_DOC_PAGES.filter((page) => {
      return (
        page.title.toLowerCase().includes(q) ||
        page.description.toLowerCase().includes(q) ||
        page.section.toLowerCase().includes(q) ||
        (page.category ? page.category.toLowerCase().includes(q) : false) ||
        page.tags?.some((t) => t.toLowerCase().includes(q)) ||
        page.content.sections.some((s) => s.title.toLowerCase().includes(q))
      );
    }).slice(0, 15);
  }, [query]);

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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="search-dialog"
        className="w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden"
        style={{ borderColor: 'var(--kb-border)', backgroundColor: 'var(--kb-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div
          className="flex items-center px-4 border-b"
          style={{ borderColor: 'var(--kb-border)', backgroundColor: 'var(--kb-surface-elevated)' }}
        >
          <Search className="h-4 w-4 shrink-0 mr-3" style={{ color: 'var(--kb-text-faint)' }} />
          <input
            ref={inputRef}
            id="docs-search-input"
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search documentation, architecture, agents, free stack, or code..."
            className="w-full py-3.5 text-sm bg-transparent focus:outline-none"
            style={{ color: 'var(--kb-text)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--kb-text-faint)' }}>
              <X className="h-4 w-4" />
            </button>
          )}
          <span
            className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border ml-2 font-semibold"
            style={{
              backgroundColor: 'var(--kb-bg)',
              borderColor: 'var(--kb-border)',
              color: 'var(--kb-text-muted)',
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y" style={{ borderColor: 'var(--kb-border)' }}>
          {results.length === 0 ? (
            <div className="py-12 text-center text-xs" style={{ color: 'var(--kb-text-faint)' }}>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--kb-text)' }}>No documentation matches found</p>
              <p>Try searching for "Orchestrator", "Ollama", "Tauri", "DAG", or "Credits".</p>
            </div>
          ) : (
            results.map((page, index) => {
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={page.slug}
                  id={`search-result-${index}`}
                  onClick={() => { onSelectPage(page.slug); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className="p-3 rounded-lg flex items-start justify-between cursor-pointer transition-colors border-l-2"
                  style={isSelected ? {
                    backgroundColor: 'color-mix(in srgb, var(--kb-brand-secondary) 25%, transparent)',
                    borderLeftColor: 'var(--kb-accent-bright)',
                    color: 'var(--kb-text)',
                  } : {
                    borderLeftColor: 'transparent',
                    color: 'var(--kb-text-muted)',
                  }}
                >
                  <div className="flex items-start space-x-3 truncate">
                    <FileText
                      className="h-4 w-4 mt-0.5 shrink-0"
                      style={{ color: isSelected ? 'var(--kb-accent-bright)' : 'var(--kb-text-faint)' }}
                    />
                    <div className="truncate">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-semibold text-xs truncate" style={{ color: 'var(--kb-text)' }}>
                          {page.title}
                        </span>
                        <span
                          className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border shrink-0"
                          style={{
                            backgroundColor: 'var(--kb-surface-elevated)',
                            color: 'var(--kb-accent-bright)',
                            borderColor: 'var(--kb-border)',
                          }}
                        >
                          {page.section}
                        </span>
                      </div>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--kb-text-subtle)' }}>
                        {page.description}
                      </p>
                    </div>
                  </div>
                  <CornerDownLeft
                    className="h-3.5 w-3.5 shrink-0 ml-2 mt-1 transition-opacity"
                    style={{
                      opacity: isSelected ? 1 : 0,
                      color: 'var(--kb-accent-bright)',
                    }}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          className="p-3 border-t flex items-center justify-between text-[11px]"
          style={{ backgroundColor: 'var(--kb-surface)', borderColor: 'var(--kb-border)', color: 'var(--kb-text-faint)' }}
        >
          <div className="flex items-center space-x-3">
            <span>
              <kbd className="font-mono px-1.5 py-0.5 rounded border text-[10px]" style={{ backgroundColor: 'var(--kb-surface-elevated)', borderColor: 'var(--kb-border)', color: 'var(--kb-text-muted)' }}>↑</kbd>{' '}
              <kbd className="font-mono px-1.5 py-0.5 rounded border text-[10px]" style={{ backgroundColor: 'var(--kb-surface-elevated)', borderColor: 'var(--kb-border)', color: 'var(--kb-text-muted)' }}>↓</kbd>{' '}
              to navigate
            </span>
            <span>
              <kbd className="font-mono px-1.5 py-0.5 rounded border text-[10px]" style={{ backgroundColor: 'var(--kb-surface-elevated)', borderColor: 'var(--kb-border)', color: 'var(--kb-text-muted)' }}>↵</kbd>{' '}
              to select
            </span>
          </div>
          <span className="font-mono text-[10px]" style={{ color: 'var(--kb-accent-bright)' }}>
            Kernel Base Quick Search
          </span>
        </div>
      </div>
    </div>
  );
};
