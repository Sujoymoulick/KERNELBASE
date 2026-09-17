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
import { renderMermaidDiagram } from '../../utils/mermaidRenderer';
import { useTheme } from '../../context/ThemeContext';
import { copyToClipboard } from '../../utils/clipboard';

export interface ArchitectureDiagramProps {
  chart?: string;
  title?: string;
  description?: string;
  allowEdit?: boolean;
  isDark?: boolean;
}

const DEFAULT_SYSTEM_ARCHITECTURE_CHART = `flowchart TD
    subgraph UI ["1. Desktop UI Plane"]
        Editor["Monaco Editor & Terminal"]
        Visualizer["DAG Task Visualizer"]
    end

    subgraph Core ["2. Agent Control Plane"]
        Orchestrator["Topological DAG Orchestrator"]
        Registry["Agent & Tool Registry"]
        StateStore[("SQLite State Store")]
    end

    subgraph Gateway ["3. Model Gateway Plane"]
        Router["LiteLLM Tiered Router"]
        LocalAI["Local Ollama (Free Tier)"]
        CloudAI["OpenRouter / Cloud APIs"]
    end

    subgraph Sandbox ["4. Execution Sandbox"]
        Docker["Docker Container Host"]
        GitWorktree["Git Worktree Isolation"]
    end

    UI -->|IPC / Event Bus| Core
    Core --> Router
    Router --> LocalAI
    Router --> CloudAI
    Core --> Sandbox
    Sandbox -.->|Test Diagnostics| Core`;

const ARCHITECTURE_PRESETS = [
  {
    id: 'system-overview',
    label: 'Complete System Architecture',
    description: 'Full four-plane distributed topology: UI, Daemon, Gateway, and Sandbox.',
    chart: DEFAULT_SYSTEM_ARCHITECTURE_CHART,
  },
  {
    id: 'repair-loop',
    label: 'Autonomous Self-Healing Loop',
    description: 'Closed-loop verification: Task -> Coder -> Sandbox -> QA -> Diagnostic Patch.',
    chart: `sequenceDiagram
    autonumber
    participant Orch as DAG Orchestrator
    participant Coder as Coding Agent
    participant Sandbox as Docker Sandbox
    participant QA as QA Agent
    participant Git as Git Worktree

    Orch->>Coder: Dispatch Task & File Context
    Coder->>Coder: Generate AST Patch & Unit Test
    Coder->>Git: Apply Atomic File Edit
    Orch->>Sandbox: Execute Vitest in Ephemeral Container
    Sandbox-->>QA: Stream TAP / JSON Test Output
    alt Tests Passed (Green)
        QA->>Orch: Verification Verdict: PASSED
        Orch->>Git: Commit Worktree Branch
    else Tests Failed (Red)
        QA->>Orch: Verification Verdict: FAILED (Exit Code 1)
        Orch->>Coder: Inject Diagnostic Envelope (Attempt 2/3)
        Coder->>Git: Apply Targeted Bugfix Patch
        Orch->>Sandbox: Re-run Test Suite in Sandbox
        Sandbox-->>QA: Tests Green (Self-Healed)
        QA->>Orch: Verification Verdict: PASSED
    end`,
  },
  {
    id: 'model-routing',
    label: 'Three-Tier Model Router',
    description: 'Cost-optimizing gateway prioritizing local $0 Ollama execution.',
    chart: `flowchart TD
    Prompt[Agent Prompt & Context] --> Router{LiteLLM Routing Engine}

    Router -->|1. Syntactic Task or Offline| Tier1[Tier 1: Local Ollama / vLLM]
    subgraph Local [100% Free / Offline]
        Tier1 --> QwenLocal["Qwen 2.5 Coder 7B (Free)"]
    end

    Router -->|2. Multi-file Refactor| Tier2[Tier 2: OpenRouter Budget]
    subgraph CloudBudget [Low Cost (< 1 USD / M tokens)]
        Tier2 --> DeepSeek["DeepSeek V3 / Qwen 32B"]
    end

    Router -->|3. Critical Architecture Failure| Tier3[Tier 3: Frontier Fallback]
    subgraph Frontier [Commercial Tier]
        Tier3 --> Claude["Claude 3.5 Sonnet / GPT-4o"]
    end

    QwenLocal --> TokenLedger[Credit Ledger: 0 Burn]
    DeepSeek --> TokenLedger[Credit Ledger: 0.002 USD Burn]
    Claude --> TokenLedger[Credit Ledger: 0.024 USD Burn]`,
  },
];

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  chart: initialChart,
  title = 'System Architecture Diagram',
  description = 'High-level multi-plane architecture of the AI-Native Multi-Agent IDE rendered from Mermaid.js specification.',
  allowEdit = true,
  isDark: propIsDark,
}) => {
  const [activePreset, setActivePreset] = useState<string>('system-overview');
  const [chartSource, setChartSource] = useState<string>(
    initialChart || DEFAULT_SYSTEM_ARCHITECTURE_CHART
  );
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const themeContext = useTheme();

  // Resolve active theme from props, context, or DOM
  const resolvedIsDark =
    propIsDark !== undefined
      ? propIsDark
      : themeContext?.isDark !== undefined
      ? themeContext.isDark
      : typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false;

  const [currentTheme, setCurrentTheme] = useState<boolean>(resolvedIsDark);

  useEffect(() => {
    setCurrentTheme(resolvedIsDark);
  }, [resolvedIsDark]);

  // Synchronously respond to global theme broadcast
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

  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueIdPrefix = useId().replace(/:/g, '');

  // Synchronize if initialChart prop changes
  useEffect(() => {
    if (initialChart) {
      setChartSource(initialChart);
    }
  }, [initialChart]);

  // Render Mermaid diagram whenever chartSource or currentTheme switches
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setRenderError(null);

    renderMermaidDiagram(chartSource, currentTheme, `arch-diagram-${uniqueIdPrefix}`)
      .then((svg) => {
        if (!isCancelled) {
          setRenderedSvg(svg);
          setRenderError(null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Architecture diagram render error:', err);
          setRenderError(
            typeof err === 'string'
              ? err
              : err?.message || 'Syntax error in Mermaid diagram specification.'
          );
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [chartSource, currentTheme, uniqueIdPrefix]);

  const handleCopy = async () => {
    const success = await copyToClipboard(chartSource);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = ARCHITECTURE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setActivePreset(preset.id);
      setChartSource(preset.chart);
    }
  };

  const handleReset = () => {
    const preset = ARCHITECTURE_PRESETS.find((p) => p.id === activePreset);
    setChartSource(preset?.chart || initialChart || DEFAULT_SYSTEM_ARCHITECTURE_CHART);
  };

  return (
    <div
      id="architecture-diagram-component"
      className={`my-8 rounded-xl border border-slate-200 dark:border-[#1D2430] bg-white dark:bg-[#0D1118] overflow-hidden shadow-xs transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col shadow-2xl bg-white dark:bg-[#08090B]' : ''
      }`}
    >
      {/* Header Bar */}
      <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-slate-50 dark:bg-[#0B0D11] border-b border-slate-200 dark:border-[#1D2430] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-[#172033] text-indigo-600 dark:text-[#70a5ff] border border-indigo-200/50 dark:border-[#233558] shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-[#F5F7FA] flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span>{title}</span>
              <span className="text-[10px] font-mono font-medium text-indigo-600 dark:text-[#70a5ff] bg-indigo-50 dark:bg-[#172033] px-2 py-0.2 rounded border border-indigo-200/50 dark:border-[#233558]">
                Mermaid.js Live ({currentTheme ? 'Dark' : 'Light'})
              </span>
            </h3>
            {description && (
              <p className="text-[11px] text-slate-500 dark:text-[#A7AFBD] mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 self-end sm:self-auto shrink-0">
          {allowEdit && (
            <button
              id="arch-edit-source-btn"
              onClick={() => setIsEditorOpen((prev) => !prev)}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors min-h-[34px] ${
                isEditorOpen
                  ? 'bg-indigo-100 dark:bg-[#1d2b4a] text-indigo-700 dark:text-[#70a5ff]'
                  : 'text-slate-600 dark:text-[#A7AFBD] hover:bg-slate-200/70 dark:hover:bg-[#1A2333] dark:hover:text-[#F5F7FA]'
              }`}
              title={isEditorOpen ? 'Hide Mermaid Source Editor' : 'Edit Mermaid Source Code'}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span className="text-[11px] hidden sm:inline">
                {isEditorOpen ? 'Hide Editor' : 'Edit Source'}
              </span>
            </button>
          )}

          <button
            id="arch-copy-mermaid-btn"
            onClick={handleCopy}
            className="p-1.5 rounded-md text-slate-600 dark:text-[#A7AFBD] hover:bg-slate-200/70 dark:hover:bg-[#1A2333] dark:hover:text-[#F5F7FA] transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center"
            title="Copy Mermaid.js source to clipboard"
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            id="arch-reset-btn"
            onClick={handleReset}
            className="p-1.5 rounded-md text-slate-600 dark:text-[#A7AFBD] hover:bg-slate-200/70 dark:hover:bg-[#1A2333] dark:hover:text-[#F5F7FA] transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center"
            title="Reset to default architecture diagram"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            id="arch-fullscreen-btn"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-md text-slate-600 dark:text-[#A7AFBD] hover:bg-slate-200/70 dark:hover:bg-[#1A2333] dark:hover:text-[#F5F7FA] transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Diagram View'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Presets and Zoom Bar */}
      <div className="px-3.5 sm:px-5 py-2 bg-slate-100/60 dark:bg-[#090C12] border-b border-slate-200 dark:border-[#1D2430] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 text-xs overflow-x-auto whitespace-nowrap scrollbar-none pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-[#707987] shrink-0">
            Presets:
          </span>
          {ARCHITECTURE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              onClick={() => handlePresetSelect(preset.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors shrink-0 ${
                activePreset === preset.id
                  ? 'bg-white dark:bg-[#1d2b4a] text-indigo-600 dark:text-[#70a5ff] font-semibold shadow-2xs border border-slate-200 dark:border-[#233558]'
                  : 'text-slate-600 dark:text-[#A7AFBD] hover:text-slate-900 dark:hover:text-[#F5F7FA] hover:bg-white/50 dark:hover:bg-[#141C2B]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
            className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 dark:text-[#A7AFBD] hover:bg-slate-200 dark:hover:bg-[#141C2B] min-h-[28px]"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-[10px] font-mono text-slate-400 dark:text-[#707987] px-1.5">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.1))}
            className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 dark:text-[#A7AFBD] hover:bg-slate-200 dark:hover:bg-[#141C2B] min-h-[28px]"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="px-2 py-0.5 rounded text-[10px] text-slate-400 dark:text-[#707987] hover:bg-slate-200 dark:hover:bg-[#141C2B] min-h-[28px]"
            title="Reset Zoom"
          >
            100%
          </button>
        </div>
      </div>

      {/* Optional Live Source Editor */}
      {isEditorOpen && (
        <div className="p-4 border-b border-slate-200 dark:border-[#1D2430] bg-slate-900 dark:bg-[#0B0D11] text-slate-100 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-indigo-300 dark:text-[#70a5ff] font-semibold flex items-center space-x-1.5">
              <Code2 className="h-3.5 w-3.5" />
              <span>Mermaid Diagram Live Source (Editable)</span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-[#707987]">
              Type or edit below to re-render in real-time
            </span>
          </div>
          <textarea
            id="arch-source-textarea"
            value={chartSource}
            onChange={(e) => setChartSource(e.target.value)}
            rows={10}
            className="w-full font-mono text-xs p-3 rounded bg-slate-950 dark:bg-[#08090B] text-slate-200 dark:text-[#F5F7FA] border border-slate-700 dark:border-[#1D2430] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y leading-relaxed"
            placeholder="Enter valid Mermaid.js graph or sequenceDiagram..."
            spellCheck={false}
          />
        </div>
      )}

      {/* Render Canvas Container with Dedicated Loading Fallback */}
      <div
        ref={containerRef}
        className={`p-3 sm:p-5 md:p-6 bg-slate-50/40 dark:bg-[#080c16] overflow-x-auto touch-pan-x touch-pan-y flex items-center justify-center transition-all ${
          isFullscreen ? 'flex-1' : 'min-h-[280px] sm:min-h-[380px]'
        }`}
      >
        {isLoading ? (
          /* Loading Fallback */
          <div
            id="arch-diagram-loading-fallback"
            className="py-16 flex flex-col items-center justify-center space-y-4 text-slate-400 dark:text-[#707987]"
          >
            <div className="relative flex items-center justify-center">
              <div className="h-10 w-10 rounded-full border-2 border-slate-200 dark:border-[#1D2430]" />
              <Loader2 className="h-6 w-6 text-indigo-600 dark:text-[#70a5ff] animate-spin absolute" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-[#F5F7FA]">
                Rendering Architecture Diagram
              </p>
              <p className="text-[11px] text-slate-500 dark:text-[#A7AFBD]">
                Compiling Mermaid.js vector definitions for {currentTheme ? 'dark mode' : 'light mode'}...
              </p>
            </div>
            {/* Animated Skeleton bars */}
            <div className="w-48 space-y-2 pt-2 opacity-60">
              <div className="h-2 bg-slate-200 dark:bg-[#1D2430] rounded animate-pulse" />
              <div className="h-2 bg-slate-200 dark:bg-[#1D2430] rounded animate-pulse w-3/4 mx-auto" />
            </div>
          </div>
        ) : renderError ? (
          /* Error Fallback */
          <div className="max-w-md p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs space-y-2">
            <div className="flex items-center space-x-2 font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Mermaid Diagram Syntax Error</span>
            </div>
            <p className="font-mono text-[11px] break-all leading-tight">{renderError}</p>
            <div className="pt-2">
              <button
                onClick={handleReset}
                className="px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-medium hover:bg-rose-700 transition-colors"
              >
                Reset to Working Preset
              </button>
            </div>
          </div>
        ) : renderedSvg ? (
          /* Successfully Rendered SVG */
          <div
            key={`arch-svg-${currentTheme ? 'dark' : 'light'}-${uniqueIdPrefix}`}
            id="arch-diagram-svg-container"
            className="transition-transform duration-200 ease-out origin-center flex items-center justify-center w-full [&>svg]:max-w-full [&>svg]:h-auto"
            style={{ transform: `scale(${zoomLevel})` }}
            dangerouslySetInnerHTML={{ __html: renderedSvg }}
          />
        ) : null}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#0B0D11] border-t border-slate-200 dark:border-[#1D2430] flex items-center justify-between text-[11px] text-slate-500 dark:text-[#707987]">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="h-3 w-3 text-indigo-500 dark:text-[#70a5ff]" />
          <span>Multi-Plane Decoupled Client-Daemon Architecture</span>
        </span>
        <span className="font-mono text-[10px]">
          Client (Port 3000) • Daemon IPC (ws/sse) • Docker Engine
        </span>
      </div>
    </div>
  );
};
