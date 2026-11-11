import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Download,
  Trash2,
  Upload,
  Check,
  Star,
  RefreshCw,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { ExtensionItem } from '../types/ide';

export const ExtensionsPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'marketplace' | 'installed'>('marketplace');
  const [extensions, setExtensions] = useState<ExtensionItem[]>([]);
  const [installedList, setInstalledList] = useState<ExtensionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [installingId, setInstallingId] = useState<string | null>(null);

  const fetchExtensions = async (query = '') => {
    setIsLoading(true);
    try {
      if (window.kernelBase?.extensions) {
        const results = await window.kernelBase.extensions.search(query);
        setExtensions(results);
        const inst = await window.kernelBase.extensions.listInstalled();
        setInstalledList(inst);
      } else {
        // Fallback for preview
        const mock: ExtensionItem[] = [
          {
            id: 'zhuangtongfa.Material-theme',
            namespace: 'zhuangtongfa',
            name: 'Material-theme',
            displayName: 'One Dark Pro',
            description: "Atom's iconic One Dark theme for Visual Studio Code",
            version: '3.19.1',
            publisher: 'zhuangtongfa',
            downloads: 7200000,
            rating: 4.9,
            categories: ['Themes'],
            isInstalled: true,
          },
          {
            id: 'dracula-theme.theme-dracula',
            namespace: 'dracula-theme',
            name: 'theme-dracula',
            displayName: 'Dracula Official',
            description: 'Official Dracula Theme for Visual Studio Code',
            version: '2.25.1',
            publisher: 'dracula-theme',
            downloads: 6500000,
            rating: 4.8,
            categories: ['Themes'],
            isInstalled: false,
          },
          {
            id: 'rust-lang.rust-analyzer',
            namespace: 'rust-lang',
            name: 'rust-analyzer',
            displayName: 'Rust Analyzer',
            description: 'Rust language support for Visual Studio Code',
            version: '0.4.2340',
            publisher: 'rust-lang',
            downloads: 4100000,
            rating: 4.9,
            categories: ['Programming Languages'],
            isInstalled: true,
          },
          {
            id: 'ms-python.python',
            namespace: 'ms-python',
            name: 'python',
            displayName: 'Python',
            description: 'Python language support with extension capabilities',
            version: '2025.2.0',
            publisher: 'ms-python',
            downloads: 9800000,
            rating: 4.7,
            categories: ['Programming Languages'],
            isInstalled: true,
          },
          {
            id: 'llvm-vs-code-extensions.vscode-clangd',
            namespace: 'llvm-vs-code-extensions',
            name: 'vscode-clangd',
            displayName: 'clangd (C/C++)',
            description: 'C/C++ completion, navigation, and refactoring with clangd',
            version: '0.1.32',
            publisher: 'llvm-vs-code-extensions',
            downloads: 2800000,
            rating: 4.8,
            categories: ['Programming Languages'],
            isInstalled: false,
          },
        ];
        setExtensions(mock);
        setInstalledList(mock.filter((m) => m.isInstalled));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExtensions(searchQuery);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExtensions(searchQuery);
  };

  const handleInstall = async (ext: ExtensionItem) => {
    setInstallingId(ext.id);
    try {
      if (window.kernelBase?.extensions) {
        await window.kernelBase.extensions.install(ext.id);
        await fetchExtensions(searchQuery);
      } else {
        setTimeout(() => {
          ext.isInstalled = true;
          setInstalledList((prev) => [...prev, ext]);
          setInstallingId(null);
        }, 1000);
      }
    } finally {
      setInstallingId(null);
    }
  };

  const handleUninstall = async (ext: ExtensionItem) => {
    if (window.kernelBase?.extensions) {
      await window.kernelBase.extensions.uninstall(ext.id);
      await fetchExtensions(searchQuery);
    } else {
      ext.isInstalled = false;
      setInstalledList((prev) => prev.filter((i) => i.id !== ext.id));
    }
  };

  const handleInstallVsix = async () => {
    if (window.kernelBase?.extensions) {
      await window.kernelBase.extensions.installVsix();
      await fetchExtensions(searchQuery);
    }
  };

  const displayList = activeTab === 'marketplace' ? extensions : installedList;

  return (
    <div className="h-full flex flex-col bg-[#120a07] text-neutral-300 font-sans text-xs select-none">
      {/* Header toolbar */}
      <div className="h-9 px-3 bg-[#170c08] border-b border-[#29140d] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Boxes className="w-4 h-4 text-[#ff6b35]" />
          <span className="font-semibold text-neutral-200">EXTENSIONS</span>
          <span className="text-[10px] text-neutral-500 font-mono">Open VSX</span>
        </div>
        <button
          onClick={handleInstallVsix}
          className="p-1 hover:bg-[#26130d] text-neutral-400 hover:text-neutral-200 rounded flex items-center space-x-1 transition-colors"
          title="Install from VSIX package..."
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="text-[10px]">VSIX</span>
        </button>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="p-2 border-b border-[#24130d] bg-[#140b07]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Extensions in Open VSX..."
            className="w-full bg-[#1c0f0a] border border-[#30160d] text-neutral-200 text-xs rounded pl-8 pr-8 py-1.5 focus:outline-none focus:border-[#ff6b35]"
          />
          {isLoading && (
            <RefreshCw className="w-3.5 h-3.5 text-[#ff6b35] animate-spin absolute right-2.5 top-2" />
          )}
        </div>
      </form>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#24130d] bg-[#100805] text-[11px]">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'marketplace'
              ? 'border-[#ff6b35] text-neutral-100 bg-[#160b07]'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Marketplace ({extensions.length})
        </button>
        <button
          onClick={() => setActiveTab('installed')}
          className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'installed'
              ? 'border-[#ff6b35] text-neutral-100 bg-[#160b07]'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Installed ({installedList.length})
        </button>
      </div>

      {/* Extension Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1e100a]">
        {displayList.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <Boxes className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs">No extensions found</p>
            <p className="text-[10px] text-neutral-600 mt-1">Try another search query.</p>
          </div>
        ) : (
          (Array.isArray(displayList) ? displayList : []).map((ext) => {
            const isInstalled =
              ext.isInstalled || installedList.some((i) => i.id === ext.id);
            const isTheme = ext.categories?.includes('Themes');

            return (
              <div
                key={ext.id}
                className="p-3 hover:bg-[#180e09] transition-colors space-y-1.5"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-neutral-200 text-xs flex items-center space-x-1.5">
                      <span className="truncate">{ext.displayName}</span>
                      {isTheme && (
                        <Palette className="w-3 h-3 text-pink-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      {ext.publisher} • v{ext.version}
                    </div>
                  </div>

                  {/* Install / Uninstall button */}
                  <div>
                    {isInstalled ? (
                      <button
                        onClick={() => handleUninstall(ext)}
                        className="bg-[#24130d] hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-[#381a10] px-2 py-0.5 rounded text-[10px] transition-colors"
                      >
                        Uninstall
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInstall(ext)}
                        disabled={installingId === ext.id}
                        className="bg-[#ff6b35] hover:bg-[#ff804d] text-black font-semibold px-2.5 py-0.5 rounded text-[10px] flex items-center space-x-1 transition-colors"
                      >
                        {installingId === ext.id ? (
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <Download className="w-2.5 h-2.5 stroke-[2.5]" />
                        )}
                        <span>Install</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {ext.description}
                </div>

                {/* Badges footer */}
                <div className="flex items-center space-x-3 text-[10px] text-neutral-500 pt-0.5">
                  {ext.downloads !== undefined && (
                    <span className="flex items-center space-x-1">
                      <Download className="w-2.5 h-2.5" />
                      <span>{(ext.downloads / 1000).toFixed(0)}k</span>
                    </span>
                  )}
                  {ext.rating !== undefined && (
                    <span className="flex items-center space-x-0.5 text-amber-500">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{ext.rating.toFixed(1)}</span>
                    </span>
                  )}
                  {ext.categories && ext.categories[0] && (
                    <span className="bg-[#1e100a] text-neutral-400 px-1.5 py-0.2 rounded border border-[#2d150c]">
                      {ext.categories[0]}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
