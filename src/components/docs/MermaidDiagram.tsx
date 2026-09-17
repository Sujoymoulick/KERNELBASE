import React, { useEffect, useRef, useState, useId } from 'react';
import { renderMermaidDiagram } from '../../utils/mermaidRenderer';
import { useTheme } from '../../context/ThemeContext';

export interface MermaidDiagramProps {
  chart: string;
  title?: string;
  isDark?: boolean;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  chart,
  title,
  isDark: propIsDark,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const uniqueId = useId().replace(/:/g, '');

  const themeContext = useTheme();

  // Resolve active dark mode flag from props, context, or DOM fallback
  const resolvedIsDark =
    propIsDark !== undefined
      ? propIsDark
      : themeContext?.isDark !== undefined
      ? themeContext.isDark
      : typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false;

  // Track local render theme to trigger immediate updates on theme change
  const [currentTheme, setCurrentTheme] = useState<boolean>(resolvedIsDark);

  useEffect(() => {
    setCurrentTheme(resolvedIsDark);
  }, [resolvedIsDark]);

  // Also listen directly to the synchronous 'app-theme-change' event
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

  // Render diagram whenever chart or currentTheme changes
  useEffect(() => {
    let isMounted = true;
    setIsRendering(true);
    setError(null);

    renderMermaidDiagram(chart, currentTheme, `mermaid-${uniqueId}`)
      .then((renderedSvg) => {
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
          setIsRendering(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Mermaid render error for chart:', err);
          setError(
            typeof err === 'string'
              ? err
              : err?.message || 'Could not render architectural diagram'
          );
          setIsRendering(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [chart, currentTheme, uniqueId]);

  const id = `diagram-${(title || 'graph').toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      id={id}
      className="my-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4 transition-colors"
    >
      {title && (
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            {title}
          </span>
          <span className="text-[10px] bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono">
            {currentTheme ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>
      )}

      {error ? (
        <div className="p-4 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-mono">
          <p className="font-bold mb-1">Diagram Syntax / Render Notice</p>
          <pre className="overflow-x-auto whitespace-pre-wrap text-[11px]">{chart}</pre>
        </div>
      ) : svg ? (
        <div
          key={`mermaid-svg-container-${currentTheme ? 'dark' : 'light'}-${uniqueId}`}
          ref={containerRef}
          className={`overflow-x-auto py-2 flex justify-center transition-opacity duration-150 ${
            isRendering ? 'opacity-60' : 'opacity-100'
          }`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="py-8 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
          <div className="animate-pulse flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <span>Rendering diagram in {currentTheme ? 'Dark' : 'Light'} theme...</span>
          </div>
        </div>
      )}
    </div>
  );
};
