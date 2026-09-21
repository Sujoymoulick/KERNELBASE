import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { useTerminal } from '../context/TerminalContext';
import { Plus, X, Terminal as TermIcon } from 'lucide-react';

const TerminalTabInstance: React.FC<{
  sessionId: string;
  isActive: boolean;
}> = ({ sessionId, isActive }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { sendInput, onSessionData } = useTerminal();

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#0e0805',
        foreground: '#e6ded9',
        cursor: '#ff6b35',
        selectionBackground: '#421d12',
        black: '#1f130e',
        red: '#ff4d4f',
        green: '#73d13d',
        yellow: '#ffc53d',
        blue: '#4096ff',
        magenta: '#9254de',
        cyan: '#36cfc9',
        white: '#ffffff',
      },
      fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
      fontSize: 12,
      lineHeight: 1.3,
      cursorBlink: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    term.onData((data) => {
      sendInput(sessionId, data);
    });

    const unsub = onSessionData(sessionId, (data) => {
      term.write(data);
    });

    const handleResize = () => {
      fitAddon.fit();
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
      setTimeout(() => fitAddonRef.current?.fit(), 50);
    }
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full p-2 bg-[#0e0805] ${isActive ? 'block' : 'hidden'}`}
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
          {sessions.map((sess) => {
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
                <TermIcon className="w-3 h-3" />
                <span>{sess.title}</span>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeSession(sess.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-neutral-100 p-0.5 rounded"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
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
        {sessions.map((sess) => (
          <TerminalTabInstance
            key={sess.id}
            sessionId={sess.id}
            isActive={sess.id === activeSessionId}
          />
        ))}
      </div>
    </div>
  );
};
