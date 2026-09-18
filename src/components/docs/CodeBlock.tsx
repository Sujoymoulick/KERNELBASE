import React, { useState, useMemo } from 'react';
import { Copy, Check, Terminal, FileCode, WrapText } from 'lucide-react';
import { DocCodeBlock } from '../../types/docs';
import { copyToClipboard } from '../../utils/clipboard';

interface LanguageMeta {
  label: string;
  accentColor: string;
  isTerminal?: boolean;
}

const LANGUAGE_MAP: Record<string, LanguageMeta> = {
  typescript: { label: 'TypeScript', accentColor: 'var(--kb-accent-bright)' },
  ts:         { label: 'TypeScript', accentColor: 'var(--kb-accent-bright)' },
  tsx:        { label: 'TSX',        accentColor: 'var(--kb-accent-bright)' },
  javascript: { label: 'JavaScript', accentColor: '#F59E0B' },
  js:         { label: 'JavaScript', accentColor: '#F59E0B' },
  bash:       { label: 'Bash',       accentColor: 'var(--kb-accent-bright)', isTerminal: true },
  sh:         { label: 'Shell',      accentColor: 'var(--kb-accent-bright)', isTerminal: true },
  json:       { label: 'JSON',       accentColor: '#C4B7B0' },
  dockerfile: { label: 'Dockerfile', accentColor: 'var(--kb-accent-bright)' },
};

function getLanguageMeta(rawLang?: string): LanguageMeta {
  if (!rawLang) return { label: 'Text', accentColor: '#8E7D75' };
  const key = rawLang.toLowerCase().trim();
  return LANGUAGE_MAP[key] ?? { label: rawLang.toUpperCase(), accentColor: 'var(--kb-accent-bright)' };
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
      className="my-5 rounded-xl border overflow-hidden shadow-xs group"
      style={{
        borderColor: 'var(--kb-code-border)',
        backgroundColor: 'var(--kb-code-bg)',
        color: 'var(--kb-code-text)',
      }}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between px-3.5 py-2 border-b text-xs font-mono"
        style={{ backgroundColor: 'var(--kb-code-header)', borderColor: 'var(--kb-code-border)' }}
      >
        {/* Left Side: Window controls + File name */}
        <div className="flex items-center space-x-2.5 truncate min-w-0 pr-2">
          <div className="flex items-center space-x-1.5 shrink-0" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full inline-block bg-[#752C12]" />
            <span className="h-2.5 w-2.5 rounded-full inline-block bg-[#A64011]" />
            <span className="h-2.5 w-2.5 rounded-full inline-block bg-[#E86526]" />
          </div>

          <div className="flex items-center space-x-1.5 truncate font-medium text-[#C4B7B0]">
            {langMeta.isTerminal ? (
              <Terminal className="h-3.5 w-3.5 shrink-0 text-[#E86526]" />
            ) : (
              <FileCode className="h-3.5 w-3.5 shrink-0 text-[#E86526]" />
            )}
            <span className="truncate text-[11px] sm:text-xs">
              {filename || (langMeta.isTerminal ? 'Terminal' : `${langMeta.label} Snippet`)}
            </span>
            {hasMultipleLines && (
              <span className="hidden sm:inline-block text-[10px] font-mono ml-1.5 text-[#8E7D75]">
                ({lines.length} lines)
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Controls */}
        <div className="flex items-center space-x-2 shrink-0 select-none">
          {/* Word Wrap Toggle */}
          <button
            type="button"
            onClick={() => setWrap(!wrap)}
            title={wrap ? 'Disable word wrap' : 'Enable word wrap'}
            className="hidden sm:inline-flex items-center p-1 rounded transition-colors text-xs"
            style={{ color: wrap ? 'var(--kb-accent-bright)' : '#8E7D75' }}
            aria-label="Toggle word wrap"
          >
            <WrapText className="h-3.5 w-3.5" />
          </button>

          {/* Language Badge */}
          <span
            className="inline-flex items-center space-x-1.5 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border font-mono"
            style={{
              backgroundColor: '#24100A',
              color: langMeta.accentColor,
              borderColor: '#5A210F',
            }}
            title={`Syntax Language: ${langMeta.label}`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: langMeta.accentColor }} />
            <span>{langMeta.label}</span>
          </span>

          {/* Copy Button */}
          <button
            id={`copy-${id}`}
            onClick={handleCopy}
            type="button"
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-sans font-medium transition-all duration-150 focus:outline-none border"
            style={copied ? {
              backgroundColor: '#A64011',
              color: '#F8F5F2',
              borderColor: '#E86526',
            } : {
              color: '#C4B7B0',
              backgroundColor: '#1A0B07',
              borderColor: '#5A210F',
            }}
            title="Copy code to clipboard"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[11px] font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 shrink-0 text-[#8E7D75]" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="p-4 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed max-h-[560px]">
        <pre
          tabIndex={0}
          className={`focus:outline-none ${wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}`}
        >
          {showLineNumbers && hasMultipleLines ? (
            <div className="table w-full border-collapse">
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlighted = highlightLines.includes(lineNum);
                return (
                  <div
                    key={idx}
                    className="table-row"
                    style={isHighlighted ? {
                      backgroundColor: 'rgba(166,64,17,0.3)',
                      borderLeft: '2px solid #E86526',
                    } : {}}
                  >
                    <span
                      aria-hidden="true"
                      className="table-cell select-none pr-4 text-right text-[11px] font-mono w-8 text-[#8E7D75]"
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
