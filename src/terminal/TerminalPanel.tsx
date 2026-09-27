import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { useTerminal } from '../context/TerminalContext';
import { useIDE } from '../context/IDEContext';
import { Plus, X, Terminal as TermIcon } from 'lucide-react';

const getTerminalTheme = (themeName: string) => {
  switch (themeName) {
    case 'cyberpunk':
      return { background: '#050b14', foreground: '#d1f4ff', cursor: '#00f0ff', selectionBackground: '#0f384d' };
    case 'dracula':
      return { background: '#1e1e2e', foreground: '#f8f8f2', cursor: '#bd93f9', selectionBackground: '#44475a' };
    case 'monokai':
      return { background: '#272822', foreground: '#f8f8f2', cursor: '#a6e22e', selectionBackground: '#49483e' };
    case 'light':
      return { background: '#ffffff', foreground: '#1a1a1a', cursor: '#d9480f', selectionBackground: '#ffe8cc' };
    default:
      return { background: '#0e0805', foreground: '#e6ded9', cursor: '#ff6b35', selectionBackground: '#421d12' };
  }
};

const TerminalTabInstance: React.FC<{
  sessionId: string;
  isActive: boolean;
}> = ({ sessionId, isActive }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { sendInput, onSessionData } = useTerminal();
  const { settings } = useIDE();

  useEffect(() => {
    if (!containerRef.current) return;

    const termTheme = getTerminalTheme(settings.theme);
    const term = new Terminal({
      theme: {
        ...termTheme,
        black: '#1f130e',
        red: '#ff4d4f',
        green: '#73d13d',
        yellow: '#ffc53d',
        blue: '#4096ff',
        magenta: '#9254de',
        cyan: '#36cfc9',
        white: '#ffffff',
      },
      fontFamily: settings.fontFamily || "'JetBrains Mono', Menlo, Monaco, monospace",
      fontSize: settings.terminalFontSize || 13,
      lineHeight: 1.3,
      cursorBlink: settings.terminalCursorBlink !== false,
      scrollback: settings.terminalScrollback || 5000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);
    termRef.current = term;
    fitAddonRef.current = fitAddon;

    requestAnimationFrame(() => {
      try {
        fitAddon.fit();
      } catch {}
    });

    term.onData((data) => {
      sendInput(sessionId, data);
    });

    term.onResize((size) => {
      if (window.kernelBase?.terminal?.resize) {
        window.kernelBase.terminal.resize(sessionId, size.cols, size.rows);
      }
    });

    const unsub = onSessionData(sessionId, (data) => {
      term.write(data);
    });

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch {}
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      unsub();
      term.dispose();
    };
  }, [sessionId]);

  useEffect(() => {
    if (isActive && fitAddonRef.current) {
      const timer = setTimeout(() => {
        try {
          fitAddonRef.current?.fit();
          termRef.current?.focus();
        } catch {}
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      onClick={() => {
        try {
          termRef.current?.focus();
        } catch {}
      }}
      className={`h-full w-full p-2 bg-[#0e0805] ${isActive ? 'block' : 'hidden'} cursor-text`}
    />
  );
};

export const TerminalPanel: React.FC = () => {
  const { sessions, activeSessionId, setActiveSessionId, createSession, closeSession } = useTerminal();

  return (
    <div className="h-full flex flex-col bg-[#0e0805]">
      {/* Session tabs toolbar */}
      <div className="h-8 bg-[#150c08] border-b border-[#29140d] flex items-center justify-between px-2 select-none">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {sessions.length === 0 ? (
            <span className="text-[11px] text-neutral-500 pl-1">No active terminal sessions</span>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={`flex items-center space-x-2 px-2.5 py-1 text-xs rounded-t cursor-pointer transition-colors group ${
                    isActive
                      ? 'bg-[#0e0805] text-[#ff6b35] border-t border-t-[#ff6b35]'
                      : 'text-neutral-400 hover:bg-[#1c0f0a] hover:text-neutral-200'
                  }`}
                >
                  <TermIcon className="w-3 h-3 text-[#ff6b35]" />
                  <span>{sess.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeSession(sess.id);
                    }}
                    className="opacity-70 hover:opacity-100 hover:bg-[#2e150b] text-neutral-400 hover:text-rose-400 p-0.5 rounded transition-all"
                    title={`Close ${sess.title}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => createSession()}
          className="p-1 hover:bg-[#25120b] text-neutral-400 hover:text-neutral-200 rounded transition-colors"
          title="New Terminal"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Terminal Viewport */}
      <div className="flex-1 w-full relative">
        {sessions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3 text-center select-none">
            <TermIcon className="w-8 h-8 text-neutral-600" />
            <p className="text-xs text-neutral-400">No open terminal instance</p>
            <button
              onClick={() => createSession()}
              className="inline-flex items-center space-x-2 bg-[#ff6b35] hover:bg-[#e85a26] text-neutral-950 font-bold px-3 py-1.5 rounded text-xs transition-colors shadow-sm shadow-[#ff6b35]/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Terminal</span>
            </button>
          </div>
        ) : (
          sessions.map((sess) => (
            <TerminalTabInstance
              key={sess.id}
              sessionId={sess.id}
              isActive={sess.id === activeSessionId}
            />
          ))
        )}
      </div>
    </div>
  );
};
