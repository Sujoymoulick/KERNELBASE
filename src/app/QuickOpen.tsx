import React, { useState, useEffect, useRef } from 'react';
import { useIDE } from '../context/IDEContext';
import { Search, FileCode } from 'lucide-react';
import { api } from '../services/api';

export const QuickOpen: React.FC = () => {
  const { isQuickOpenOpen, setIsQuickOpenOpen, openFile, workspace } = useIDE();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuickOpenOpen) {
      setQuery('');
      setSelectedIndex(0);
      loadFiles('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isQuickOpenOpen]);

  const loadFiles = async (q: string) => {
    try {
      const matches = await api.indexing.quickOpen(q);
      setResults(matches);
    } catch (err) {
      console.error('Failed to query quick open:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isQuickOpenOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          openFile(results[selectedIndex]);
          setIsQuickOpenOpen(false);
        }
      } else if (e.key === 'Escape') {
        setIsQuickOpenOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickOpenOpen, results, selectedIndex]);

  if (!isQuickOpenOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24"
      onClick={() => setIsQuickOpenOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[#130b08] border border-[#3d1d13] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-[#2d160e] flex items-center space-x-2 bg-[#180e0a]">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
              loadFiles(e.target.value);
            }}
            placeholder="Search files by name..."
            className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-1 divide-y divide-[#22120b]">
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-500">No files found</div>
          ) : (
            results.map((filePath, idx) => {
              const fileName = filePath.split('/').pop() || filePath;
              const relDir = filePath.replace(workspace?.rootPath || '', '').replace('/' + fileName, '');
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={filePath}
                  onClick={() => {
                    openFile(filePath);
                    setIsQuickOpenOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between rounded-lg transition-colors ${
                    isSelected ? 'bg-[#28140c] text-neutral-100' : 'text-neutral-300 hover:bg-[#1a0e09]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#ff6b35]' : 'text-neutral-500'}`} />
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-medium text-neutral-200 truncate">{fileName}</span>
                      <span className="text-[10px] text-neutral-500 font-mono truncate">{relDir || '/'}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
