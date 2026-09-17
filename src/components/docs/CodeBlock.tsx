import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { DocCodeBlock } from '../../types/docs';

export const CodeBlock: React.FC<DocCodeBlock> = ({ filename, language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const id = `code-block-${(filename || language || 'snippet').replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  return (
    <div id={id} className="my-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-2 truncate">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700 inline-block" />
          <span className="font-medium text-slate-300 truncate">{filename || language}</span>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {language}
          </span>
          <button
            id={`copy-${id}`}
            onClick={handleCopy}
            className="flex items-center space-x-1 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            title="Copy code"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-sans">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="text-[11px] font-sans">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-[500px]">
        <pre tabIndex={0} className="focus:outline-none">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
