import React, { useState, useMemo } from 'react';
import { Search, Check, X, Filter, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';
import { TECH_MATRIX } from '../../data/techMatrix';
import { TechItem } from '../../types/docs';

export const TechMatrixTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [studentOnly, setStudentOnly] = useState<boolean>(false);
  const [inspectedTech, setInspectedTech] = useState<TechItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Technologies (27)' },
    { id: 'agent-runtime', label: 'Agent & Runtime' },
    { id: 'llm-gateway', label: 'LLM Gateway & Models' },
    { id: 'local-ai', label: 'Local AI' },
    { id: 'database', label: 'Database & Cache' },
    { id: 'desktop', label: 'Desktop Shell' },
    { id: 'automation', label: 'Automation & CI/CD' },
    { id: 'frontend', label: 'Frontend & UI' },
    { id: 'sandbox', label: 'Sandbox & Virtualization' },
  ];

  const filteredTech = useMemo(() => {
    return TECH_MATRIX.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.license.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recommendedUse.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchesStudent = !studentOnly || item.studentFriendly;

      return matchesSearch && matchesCat && matchesStudent;
    });
  }, [searchQuery, selectedCategory, studentOnly]);

  return (
    <div id="tech-matrix-interactive" className="my-8 rounded-xl border border-slate-200 dark:border-[#1D2430] bg-white dark:bg-[#0D1118] overflow-hidden shadow-xs">
      {/* Controls Bar */}
      <div className="p-4 bg-slate-50 dark:bg-[#0B0D11] border-b border-slate-200 dark:border-[#1D2430] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-[#707987]" />
            <input
              id="tech-search-input"
              type="text"
              placeholder="Search 27 technologies, licenses, or alternatives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1D2430] bg-white dark:bg-[#090C12] text-slate-800 dark:text-[#F5F7FA] placeholder:text-slate-400 dark:placeholder:text-[#707987] focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[36px]"
            />
          </div>

          <label className="inline-flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-[#A7AFBD] cursor-pointer shrink-0">
            <input
              id="student-friendly-toggle"
              type="checkbox"
              checked={studentOnly}
              onChange={(e) => setStudentOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300 dark:border-[#1D2430]"
            />
            <span>Show Student-Friendly ($0) Only</span>
          </label>
        </div>

        {/* Categories pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-100 dark:bg-[#101624] text-slate-600 dark:text-[#A7AFBD] hover:bg-slate-200 dark:hover:bg-[#141C2B] border border-transparent dark:border-[#1D2430]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1D2430] bg-slate-100/70 dark:bg-[#090C12] text-slate-600 dark:text-[#A7AFBD] font-semibold">
              <th className="py-2.5 px-3">Technology</th>
              <th className="py-2.5 px-3">Purpose in IDE</th>
              <th className="py-2.5 px-3">License</th>
              <th className="py-2.5 px-2 text-center">Open Source?</th>
              <th className="py-2.5 px-2 text-center">Free Local?</th>
              <th className="py-2.5 px-2 text-center">Free Cloud Tier?</th>
              <th className="py-2.5 px-3">Recommended Use</th>
              <th className="py-2.5 px-3">Alternative</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#1D2430] font-sans">
            {filteredTech.map((item) => (
              <tr
                key={item.name}
                id={`tech-row-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                className="hover:bg-slate-50 dark:hover:bg-[#141C2B] transition-colors cursor-pointer group"
                onClick={() => setInspectedTech(item)}
              >
                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-[#F5F7FA] flex items-center space-x-1.5">
                  <span>{item.name}</span>
                  {item.studentFriendly && (
                    <span
                      title="Verified $0/mo Student Friendly"
                      className="inline-block h-2 w-2 rounded-full bg-emerald-500"
                    />
                  )}
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-[#A7AFBD] max-w-[220px] truncate" title={item.purpose}>
                  {item.purpose}
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-[#707987]">
                  {item.license}
                </td>
                <td className="py-2.5 px-2 text-center">
                  {item.isOpenSource ? (
                    <span className="inline-flex p-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <span className="inline-flex p-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" title="Proprietary / Dual Licensed">
                      <X className="h-3.5 w-3.5" />
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-2 text-center">
                  {item.freeLocal ? (
                    <span className="inline-flex p-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-[#707987]">—</span>
                  )}
                </td>
                <td className="py-2.5 px-2 text-center">
                  {item.freeCloud ? (
                    <span className="inline-flex p-0.5 rounded bg-blue-50 text-blue-600 dark:bg-[#172033] dark:text-[#70a5ff]" title="Free Cloud Quota">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-[#707987]">—</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-[#A7AFBD] text-[11px] max-w-[200px] truncate" title={item.recommendedUse}>
                  {item.recommendedUse}
                </td>
                <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 dark:text-[#707987] max-w-[140px] truncate" title={item.alternative}>
                  {item.alternative}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer count & info */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0B0D11] border-t border-slate-200 dark:border-[#1D2430] flex items-center justify-between text-[11px] text-slate-500 dark:text-[#707987]">
        <span>
          Showing {filteredTech.length} of {TECH_MATRIX.length} open-source & free technologies
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          Verified for September 2026 Release
        </span>
      </div>

      {/* Modal Inspector when a row is clicked */}
      {inspectedTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-[#1D2430] bg-white dark:bg-[#0D1118] p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F7FA]">
                  {inspectedTech.name}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-[#707987]">
                  License: {inspectedTech.license}
                </p>
              </div>
              <button
                onClick={() => setInspectedTech(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-[#F5F7FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="font-semibold text-slate-700 dark:text-[#F5F7FA] block">
                  Role & Purpose in AI IDE:
                </span>
                <p className="text-slate-600 dark:text-[#A7AFBD] mt-0.5 leading-relaxed">
                  {inspectedTech.purpose}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-[#F5F7FA] block">
                  Recommended Architecture Role:
                </span>
                <p className="text-slate-600 dark:text-[#A7AFBD] mt-0.5">
                  {inspectedTech.recommendedUse}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-[#F5F7FA] block">
                  Primary Alternatives:
                </span>
                <p className="font-mono text-indigo-600 dark:text-[#70a5ff] mt-0.5">
                  {inspectedTech.alternative}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${inspectedTech.isOpenSource ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {inspectedTech.isOpenSource ? 'Open Source' : 'Free To Use'}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-[#172033] dark:text-[#70a5ff] dark:border dark:border-[#233558]">
                  {inspectedTech.freeLocal ? '100% Free Offline' : 'Cloud Based'}
                </span>
                {inspectedTech.studentFriendly && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                    Student Friendly ($0/mo)
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#1D2430] flex justify-end">
              <button
                onClick={() => setInspectedTech(null)}
                className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
