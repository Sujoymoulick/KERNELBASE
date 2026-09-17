import React, { useState, useMemo } from 'react';
import { Copy, Check, Terminal, FileCode, WrapText } from 'lucide-react';
import { DocCodeBlock } from '../../types/docs';
import { copyToClipboard } from '../../utils/clipboard';

interface LanguageMeta {
  label: string;
  badgeClass: string;
  dotClass: string;
  isTerminal?: boolean;
}

const LANGUAGE_MAP: Record<string, LanguageMeta> = {
  typescript: {
    label: 'TypeScript',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-400',
  },
  ts: {
    label: 'TypeScript',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-400',
  },
  tsx: {
    label: 'TSX',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-400',
  },
  javascript: {
    label: 'JavaScript',
    badgeClass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    dotClass: 'bg-yellow-400',
  },
  js: {
    label: 'JavaScript',
    badgeClass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    dotClass: 'bg-yellow-400',
  },
  jsx: {
    label: 'JSX',
    badgeClass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    dotClass: 'bg-yellow-400',
  },
  bash: {
    label: 'Bash',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    isTerminal: true,
  },
  sh: {
    label: 'Shell',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    isTerminal: true,
  },
  shell: {
    label: 'Shell',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    isTerminal: true,
  },
  zsh: {
    label: 'Zsh',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    isTerminal: true,
  },
  terminal: {
    label: 'Terminal',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    isTerminal: true,
  },
  cmd: {
    label: 'CLI',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    isTerminal: true,
  },
  json: {
    label: 'JSON',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400',
  },
  yaml: {
    label: 'YAML',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-400',
  },
  yml: {
    label: 'YAML',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-400',
  },
  dockerfile: {
    label: 'Dockerfile',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    dotClass: 'bg-sky-400',
  },
  docker: {
    label: 'Docker',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    dotClass: 'bg-sky-400',
  },
  python: {
    label: 'Python',
    badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    dotClass: 'bg-indigo-400',
  },
  py: {
    label: 'Python',
    badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    dotClass: 'bg-indigo-400',
  },
  rust: {
    label: 'Rust',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    dotClass: 'bg-orange-400',
  },
  rs: {
    label: 'Rust',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    dotClass: 'bg-orange-400',
  },
  go: {
    label: 'Go',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dotClass: 'bg-cyan-400',
  },
  golang: {
    label: 'Go',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dotClass: 'bg-cyan-400',
  },
  sql: {
    label: 'SQL',
    badgeClass: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    dotClass: 'bg-violet-400',
  },
  markdown: {
    label: 'Markdown',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    dotClass: 'bg-slate-400',
  },
  md: {
    label: 'Markdown',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    dotClass: 'bg-slate-400',
  },
  html: {
    label: 'HTML',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    dotClass: 'bg-orange-400',
  },
  css: {
    label: 'CSS',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dotClass: 'bg-cyan-400',
  },
  toml: {
    label: 'TOML',
    badgeClass: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    dotClass: 'bg-teal-400',
  },
  graphql: {
    label: 'GraphQL',
    badgeClass: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    dotClass: 'bg-pink-400',
  },
};

function getLanguageMeta(rawLang?: string): LanguageMeta {
  if (!rawLang) {
    return {
      label: 'Text',
      badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
      dotClass: 'bg-slate-400',
    };
  }
  const key = rawLang.toLowerCase().trim();
  if (LANGUAGE_MAP[key]) {
    return LANGUAGE_MAP[key];
  }
  return {
    label: rawLang.toUpperCase(),
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    dotClass: 'bg-indigo-400',
  };
}

export interface CodeBlockProps extends DocCodeBlock {
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  filename,
  language,
  code,
  highlightLines = [],
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const langMeta = getLanguageMeta(language);

  // Split lines for line numbers and highlighting
  const lines = useMemo(() => code.split('\n'), [code]);
  const hasMultipleLines = lines.length > 1;

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const id = `code-block-${(filename || language || 'snippet').replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  return (
    <div
      id={id}
      className="my-5 rounded-lg border border-slate-200 dark:border-[#1D2430] bg-slate-950 dark:bg-[#0D1118] text-slate-100 overflow-hidden shadow-xs group"
    >
      {/* Top Header Bar with File/Context info on left, and Language Badge + Copy on top-right */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 dark:bg-[#0B0D11] border-b border-slate-800/80 dark:border-[#1D2430] text-xs font-mono">
        {/* Left Side: Window controls + File name or context icon */}
        <div className="flex items-center space-x-2.5 truncate min-w-0 pr-2">
          <div className="flex items-center space-x-1.5 shrink-0" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="flex items-center space-x-1.5 truncate text-slate-300 font-medium">
            {langMeta.isTerminal ? (
              <Terminal className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            ) : (
              <FileCode className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            )}
            <span className="truncate text-[11px] sm:text-xs">
              {filename || (langMeta.isTerminal ? 'Terminal' : `${langMeta.label} Snippet`)}
            </span>
            {hasMultipleLines && (
              <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono ml-1.5">
                ({lines.length} lines)
              </span>
            )}
          </div>
        </div>

        {/* Top-Right Side: Controls, Language Badge, and Copy Button */}
        <div className="flex items-center space-x-2 shrink-0 select-none">
          {/* Word Wrap Toggle for long commands or code lines */}
          <button
            type="button"
            onClick={() => setWrap(!wrap)}
            title={wrap ? 'Disable word wrap (scroll horizontally)' : 'Enable word wrap'}
            className={`hidden sm:inline-flex items-center p-1 rounded transition-colors text-xs ${
              wrap
                ? 'text-indigo-400 bg-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            aria-label="Toggle word wrap"
          >
            <WrapText className="h-3.5 w-3.5" />
          </button>

          {/* Language Badge */}
          <span
            id={`lang-badge-${id}`}
            className={`inline-flex items-center space-x-1.5 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border font-mono ${langMeta.badgeClass}`}
            title={`Syntax Language: ${langMeta.label}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${langMeta.dotClass}`} />
            <span>{langMeta.label}</span>
          </span>

          {/* Custom Copy-to-Clipboard Utility Button */}
          <button
            id={`copy-${id}`}
            onClick={handleCopy}
            type="button"
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-sans font-medium transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 ring-1 ring-emerald-500/30'
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/90 border border-slate-700/60 bg-slate-800/40'
            }`}
            title="Copy code to clipboard"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-emerald-300 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-300 shrink-0" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content with line numbering and highlighting */}
      <div className="p-4 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed max-h-[560px]">
        <pre
          tabIndex={0}
          className={`focus:outline-none selection:bg-indigo-500/30 selection:text-white ${
            wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
          }`}
        >
          {showLineNumbers && hasMultipleLines ? (
            <div className="table w-full border-collapse">
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlighted = highlightLines.includes(lineNum);
                return (
                  <div
                    key={idx}
                    className={`table-row ${
                      isHighlighted ? 'bg-indigo-500/15 -mx-4 px-4 border-l-2 border-indigo-400' : ''
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="table-cell select-none pr-4 text-right text-[11px] text-slate-600 dark:text-slate-600 font-mono w-8"
                    >
                      {lineNum}
                    </span>
                    <span className="table-cell">{line || '\n'}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
};
