import React, { useState } from 'react';
import { Blocks, Search, Check, Download, Shield, Sparkles, RefreshCw } from 'lucide-react';

interface ExtensionItem {
  id: string;
  name: string;
  publisher: string;
  description: string;
  version: string;
  downloads: string;
  rating: string;
  installed: boolean;
  category: 'Popular' | 'AI & LLMs' | 'Languages' | 'Tools';
}

const DEFAULT_EXTENSIONS: ExtensionItem[] = [
  {
    id: 'ext-antigravity',
    name: 'Antigravity Swarm Engine',
    publisher: 'Google DeepMind',
    description: 'Autonomous multi-agent task execution and code synthesis engine.',
    version: 'v2.1.0',
    downloads: '1.2M',
    rating: '5.0',
    installed: true,
    category: 'AI & LLMs',
  },
  {
    id: 'ext-[#]supabase',
    name: 'Supabase MCP Integration',
    publisher: 'Supabase',
    description: 'Postgres database schemas, edge function deployment, and migrations.',
    version: 'v1.4.2',
    downloads: '840K',
    rating: '4.9',
    installed: true,
    category: 'Tools',
  },
  {
    id: 'ext-typescript',
    name: 'TypeScript & React Tools',
    publisher: 'Microsoft',
    description: 'Rich IntelliSense, JSX refactoring, and type validation for TS/TSX.',
    version: 'v5.3.0',
    downloads: '15.4M',
    rating: '4.8',
    installed: true,
    category: 'Languages',
  },
  {
    id: 'ext-tailwind',
    name: 'Tailwind CSS IntelliSense',
    publisher: 'Tailwind Labs',
    description: 'Autocomplete, syntax highlighting, and class linting for Tailwind CSS.',
    version: 'v0.9.11',
    downloads: '8.9M',
    rating: '4.9',
    installed: true,
    category: 'Popular',
  },
  {
    id: 'ext-python',
    name: 'Python Data Science Pack',
    publisher: 'Microsoft',
    description: 'Linting, debugging, Jupyter Notebooks, and PyLance language support.',
    version: 'v2024.2.0',
    downloads: '42.1M',
    rating: '4.7',
    installed: false,
    category: 'Languages',
  },
  {
    id: 'ext-prettier',
    name: 'Prettier - Code Formatter',
    publisher: 'Prettier',
    description: 'Opinionated code formatter for JS, TS, HTML, CSS, JSON, and Markdown.',
    version: 'v10.1.0',
    downloads: '31.2M',
    rating: '4.6',
    installed: false,
    category: 'Popular',
  },
];

export const ExtensionsPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [extensions, setExtensions] = useState<ExtensionItem[]>(DEFAULT_EXTENSIONS);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const toggleInstall = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) => (ext.id === id ? { ...ext, installed: !ext.installed } : ext))
    );
  };

  const filtered = extensions.filter((ext) => {
    const matchesSearch =
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || ext.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-[#0d0806] text-xs select-none relative">
      {/* Panel Header */}
      <div className="p-3 border-b border-[#24130d] flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[#ff6b35] font-semibold">
          <Blocks className="w-4 h-4" />
          <span className="uppercase tracking-wider text-[11px] text-neutral-200">
            Extensions & Marketplace
          </span>
        </div>
        <span className="text-[10px] bg-[#1d0e08] text-[#ff6b35] px-2 py-0.5 rounded-full border border-[#3d1d13] font-mono">
          {extensions.filter((e) => e.installed).length} Installed
        </span>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-[#24130d] bg-[#140b08] space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extensions in marketplace..."
            className="w-full bg-[#0d0705] border border-[#381c13] rounded-lg pl-8 pr-3 py-1.5 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#ff6b35]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-1">
          {['All', 'AI & LLMs', 'Popular', 'Languages', 'Tools'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-colors shrink-0 ${
                filterCategory === cat
                  ? 'bg-[#ff6b35] text-neutral-950 font-bold'
                  : 'bg-[#1b0e08] text-neutral-400 hover:text-neutral-200 border border-[#381c13]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Extensions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filtered.map((ext) => (
          <div
            key={ext.id}
            className="p-3 bg-[#130b07] border border-[#2b140c] hover:border-[#482012] rounded-xl flex items-start justify-between space-x-2 transition-all shadow-sm group"
          >
            <div className="flex flex-col space-y-1 min-w-0 pr-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-neutral-100 truncate text-xs group-hover:text-[#ff6b35] transition-colors">
                  {ext.name}
                </span>
                <span className="text-[9.5px] text-neutral-500 font-mono shrink-0">{ext.version}</span>
              </div>

              <span className="text-[10px] text-neutral-400 font-sans leading-relaxed line-clamp-2">
                {ext.description}
              </span>

              <div className="flex items-center space-x-3 pt-1 text-[9.5px] text-neutral-500 font-mono">
                <span>By {ext.publisher}</span>
                <span>★ {ext.rating}</span>
                <span>↓ {ext.downloads}</span>
              </div>
            </div>

            <button
              onClick={() => toggleInstall(ext.id)}
              className={`shrink-0 px-2.5 py-1 rounded-lg font-semibold text-[10.5px] flex items-center space-x-1 transition-all ${
                ext.installed
                  ? 'bg-[#1e0f09] text-emerald-400 border border-emerald-900/40 hover:border-rose-900/40 hover:text-rose-400'
                  : 'bg-[#ff6b35] hover:bg-[#e85a26] text-neutral-950 shadow-sm shadow-[#ff6b35]/20'
              }`}
            >
              {ext.installed ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Installed</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  <span>Install</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
