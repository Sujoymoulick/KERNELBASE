/**
 * ArchitectureDiagram.tsx
 *
 * When used for the System Architecture page (no `chart` prop), renders the
 * full interactive architecture explorer (InteractiveArchitecture).
 *
 * When used with an explicit `chart` prop (Mermaid source), it renders the
 * legacy Mermaid-based diagram — this preserves backward compatibility for
 * any page that passes a custom Mermaid chart string.
 */
import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Maximize2,
  Minimize2,
  Copy,
  Check,
  RotateCcw,
  Code2,
  Sparkles,
  AlertTriangle,
  Layers,
  Loader2,
} from 'lucide-react';
import { InteractiveArchitecture } from './InteractiveArchitecture';
import { renderMermaidDiagram } from '../../utils/mermaidRenderer';
import { useTheme } from '../../context/ThemeContext';
import { copyToClipboard } from '../../utils/clipboard';

export interface ArchitectureDiagramProps {
  chart?: string;
  title?: string;
  description?: string;
  allowEdit?: boolean;
  isDark?: boolean;
  onNavigate?: (slug: string) => void;
}

// ─────────────────────────────────────────────────────────────
// Legacy Mermaid renderer (only used when `chart` prop is given)
// ─────────────────────────────────────────────────────────────
const MermaidArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  chart: initialChart = '',
  title = 'Mermaid Architecture Diagram',
  description,
  allowEdit = true,
  isDark: propIsDark,
}) => {
  const [chartSource, setChartSource] = useState<string>(initialChart);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const themeContext = useTheme();
  const resolvedIsDark =
    propIsDark !== undefined
      ? propIsDark
      : themeContext?.isDark !== undefined
      ? themeContext.isDark
      : typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false;

  const [currentTheme, setCurrentTheme] = useState<boolean>(resolvedIsDark);
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueIdPrefix = useId().replace(/:/g, '');

  useEffect(() => { setCurrentTheme(resolvedIsDark); }, [resolvedIsDark]);

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isDark: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isDark === 'boolean') {
        setCurrentTheme(customEvent.detail.isDark);
      } else if (typeof document !== 'undefined') {
        setCurrentTheme(document.documentElement.classList.contains('dark'));
      }
    };
    window.addEventListener('app-theme-change', handleThemeChange);
    return () => window.removeEventListener('app-theme-change', handleThemeChange);
  }, []);

  useEffect(() => {
    if (initialChart) setChartSource(initialChart);
  }, [initialChart]);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setRenderError(null);
    renderMermaidDiagram(chartSource, currentTheme, `mermaid-arch-${uniqueIdPrefix}`)
      .then((svg) => {
        if (!isCancelled) { setRenderedSvg(svg); setRenderError(null); setIsLoading(false); }
      })
      .catch((err) => {
        if (!isCancelled) {
          setRenderError(typeof err === 'string' ? err : err?.message || 'Diagram error.');
          setIsLoading(false);
        }
      });
    return () => { isCancelled = true; };
  }, [chartSource, currentTheme, uniqueIdPrefix]);

  const handleCopy = async () => {
    const success = await copyToClipboard(chartSource);
    if (success) { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }
  };

  const handleReset = () => setChartSource(initialChart);

  return (
    <div
      className={`my-8 rounded-xl border border-slate-200 dark:border-[#1D2430] bg-white dark:bg-[#0D1118] overflow-hidden shadow-xs transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col shadow-2xl bg-white dark:bg-[#08090B]' : ''
      }`}
    >
      {/* Header */}
      <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-slate-50 dark:bg-[#0B0D11] border-b border-slate-200 dark:border-[#1D2430] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-[#172033] text-indigo-600 dark:text-[#70a5ff] border border-indigo-200/50 dark:border-[#233558] shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F5F7FA]">
              {title}
            </h3>
            {description && (
              <p className="text-[11px] text-slate-500 dark:text-[#A7AFBD] mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-1.5 self-end sm:self-auto shrink-0">
          {allowEdit && (
            <button
              onClick={() => setIsEditorOpen((prev) => !prev)}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors min-h-[34px] ${
                isEditorOpen
                  ? 'bg-indigo-100 dark:bg-[#1d2b4a] text-indigo-700 dark:text-[#70a5ff]'
                  : 'text-slate-600 dark:text-[#A7AFBD] hover:bg-slate-200/70 dark:hover:bg-[#1A2333] dark:hover:text-[#F5F7FA]'
              }`}
              title={isEditorOpen ? 'Hide Mermaid Source Editor' : 'Edit Mermaid Source Code'}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span className="text-[11px] hidden sm:inline">{isEditorOpen ? 'Hide Editor' : 'Edit Source'}</span>
            </button>
          )}
          <button onClick={handleCopy} className="p-1.5 rounded-md text-slate-600 dark:text-[#A7AFBD] hover:bg-slate-200/70 dark:hover:bg-[#1A2333] dark:hover:text-[#F5F7FA] transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center" title="Copy Mermaid source to clipboard">
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button onClick={handleReset} className="p-1.5 rounded-md text-slate-600 dark:text-[#A7AFBD] hover:bg-slate-200/70 dark:hover:bg-[#1A2333] dark:hover:text-[#F5F7FA] transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center" title="Reset diagram">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setIsFullscreen((prev) => !prev)} className="p-1.5 rounded-md text-slate-600 dark:text-[#A7AFBD] hover:bg-slate-200/70 dark:hover:bg-[#1A2333] dark:hover:text-[#F5F7FA] transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center" title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="px-3.5 sm:px-5 py-2 bg-slate-100/60 dark:bg-[#090C12] border-b border-slate-200 dark:border-[#1D2430] flex items-center justify-end gap-1">
        <button onClick={() => setZoomLevel((z) => Math.max(0.25, z - 0.15))} className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 dark:text-[#A7AFBD] hover:bg-slate-200 dark:hover:bg-[#141C2B] min-h-[28px]" title="Zoom Out">-</button>
        <span className="text-[10px] font-mono text-slate-400 dark:text-[#707987] px-1.5">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={() => setZoomLevel((z) => Math.min(2, z + 0.15))} className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 dark:text-[#A7AFBD] hover:bg-slate-200 dark:hover:bg-[#141C2B] min-h-[28px]" title="Zoom In">+</button>
        <button onClick={() => setZoomLevel(1)} className="px-2 py-0.5 rounded text-[10px] text-slate-400 dark:text-[#707987] hover:bg-slate-200 dark:hover:bg-[#141C2B] min-h-[28px]" title="Reset Zoom">Reset</button>
      </div>

      {/* Editor */}
      {isEditorOpen && (
        <div className="p-4 border-b border-slate-200 dark:border-[#1D2430] bg-slate-900 dark:bg-[#0B0D11] text-slate-100 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-indigo-300 dark:text-[#70a5ff] font-semibold flex items-center space-x-1.5">
              <Code2 className="h-3.5 w-3.5" /><span>Mermaid Diagram Live Source (Editable)</span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-[#707987]">Type to re-render in real-time</span>
          </div>
          <textarea
            value={chartSource}
            onChange={(e) => setChartSource(e.target.value)}
            rows={10}
            className="w-full font-mono text-xs p-3 rounded bg-slate-950 dark:bg-[#08090B] text-slate-200 dark:text-[#F5F7FA] border border-slate-700 dark:border-[#1D2430] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y leading-relaxed"
            placeholder="Enter valid Mermaid.js graph or sequenceDiagram..."
            spellCheck={false}
          />
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className={`p-3 sm:p-5 bg-slate-50/40 dark:bg-[#080c16] overflow-x-auto touch-pan-x touch-pan-y flex items-center justify-center transition-all ${
          isFullscreen ? 'flex-1' : 'min-h-[280px] sm:min-h-[360px]'
        }`}
      >
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-4 text-slate-400 dark:text-[#707987]">
            <div className="relative flex items-center justify-center">
              <div className="h-10 w-10 rounded-full border-2 border-slate-200 dark:border-[#1D2430]" />
              <Loader2 className="h-6 w-6 text-indigo-600 dark:text-[#70a5ff] animate-spin absolute" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-[#F5F7FA]">Loading Diagram</p>
              <p className="text-[11px] text-slate-500 dark:text-[#A7AFBD]">Rendering Mermaid diagram…</p>
            </div>
          </div>
        ) : renderError ? (
          <div className="max-w-md p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs space-y-2">
            <div className="flex items-center space-x-2 font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0" /><span>Diagram Syntax Error</span>
            </div>
            <p className="font-mono text-[11px] break-all leading-tight">{renderError}</p>
            <div className="pt-2">
              <button onClick={handleReset} className="px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-medium hover:bg-rose-700 transition-colors">Reset</button>
            </div>
          </div>
        ) : renderedSvg ? (
          <div
            className="transition-transform duration-200 ease-out origin-center flex items-center justify-center w-full [&>svg]:max-w-full [&>svg]:h-auto"
            style={{ transform: `scale(${zoomLevel})` }}
            dangerouslySetInnerHTML={{ __html: renderedSvg }}
          />
        ) : null}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#0B0D11] border-t border-slate-200 dark:border-[#1D2430] flex items-center justify-between text-[11px] text-slate-500 dark:text-[#707987]">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="h-3 w-3 text-indigo-500 dark:text-[#70a5ff]" />
          <span>Mermaid Diagram</span>
        </span>
        <span className="font-mono text-[10px]">{currentTheme ? 'Dark' : 'Light'} mode</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Primary export – routes to interactive or legacy Mermaid
// ─────────────────────────────────────────────────────────────
export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  chart,
  isDark,
  onNavigate,
  ...rest
}) => {
  // If no chart source is provided, use the new interactive architecture explorer
  if (!chart) {
    return <InteractiveArchitecture isDark={isDark} onNavigate={onNavigate} />;
  }

  // Otherwise fall back to legacy Mermaid renderer (preserves other usages)
  return <MermaidArchitectureDiagram chart={chart} isDark={isDark} onNavigate={onNavigate} {...rest} />;
};
