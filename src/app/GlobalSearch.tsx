import React, { useState } from 'react';
import { useIDE } from '../context/IDEContext';
import { Search, ArrowRight, FileText } from 'lucide-react';
import { api } from '../services/api';
import { SearchResultItem } from '../types/ide';

export const GlobalSearch: React.FC = () => {
  const { openFile, workspace } = useIDE();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.indexing.search(query);
      setResults(res);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0907] border-r border-[#261510] select-none text-xs">
      <div className="p-3 border-b border-[#261510]">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400">Search Workspace</span>
        <form onSubmit={handleSearch} className="mt-2 flex flex-col space-y-2">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search text in files..."
              className="w-full bg-[#180e0a] border border-[#381c12] rounded-md px-2.5 py-1.5 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#ff6b35]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 text-neutral-400 hover:text-[#ff6b35] transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#22120b]">
        {isSearching ? (
          <div className="p-4 text-center text-neutral-500">Searching workspace...</div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-neutral-500">No search results</div>
        ) : (
          results.map((res, idx) => {
            const fileName = res.filePath.split('/').pop() || res.filePath;
            return (
              <div
                key={idx}
                onClick={() => openFile(res.filePath)}
                className="py-2 px-1 hover:bg-[#1c0f0a] rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-1 text-neutral-300 font-medium">
                  <FileText className="w-3.5 h-3.5 text-[#ff6b35]" />
                  <span className="truncate">{fileName}</span>
                  <span className="text-neutral-500 font-mono">:{res.line}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-neutral-400 pl-4 truncate bg-[#120805] p-1 rounded">
                  {res.preview}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
