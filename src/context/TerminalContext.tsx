import React, { createContext, useContext, useState, useEffect } from 'react';
import { TerminalSession } from '../types/ide';
import { api } from '../services/api';

interface TerminalContextType {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  createSession: (cwd?: string) => Promise<string>;
  closeSession: (id: string) => void;
  setActiveSessionId: (id: string) => void;
  sendInput: (id: string, input: string) => void;
  onSessionData: (id: string, callback: (data: string) => void) => () => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize default terminal session
    createSession();
  }, []);

  const createSession = async (cwd?: string): Promise<string> => {
    const id = 'term-' + Math.random().toString(36).substring(2, 7);
    
    setSessions((prev) => {
      const session: TerminalSession = {
        id,
        title: `Terminal ${prev.length + 1}`,
        cwd: cwd || (typeof process !== 'undefined' && typeof process.cwd === 'function' ? process.cwd() : '/workspace'),
      };
      return [...prev, session];
    });
    setActiveSessionId(id);

    try {
      await api.terminal.create(id, cwd);
    } catch (err) {
      console.error('Failed to invoke api.terminal.create:', err);
    }
    return id;
  };

  const closeSession = (id: string) => {
    api.terminal.close(id);
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      const renumbered = filtered.map((s, idx) => ({
        ...s,
        title: `Terminal ${idx + 1}`,
      }));
      if (activeSessionId === id) {
        setActiveSessionId(renumbered.length > 0 ? renumbered[renumbered.length - 1].id : null);
      }
      return renumbered;
    });
  };

  const sendInput = (id: string, input: string) => {
    api.terminal.write(id, input);
  };

  const onSessionData = (id: string, callback: (data: string) => void) => {
    return api.terminal.onData(id, callback);
  };

  return (
    <TerminalContext.Provider
      value={{
        sessions,
        activeSessionId,
        createSession,
        closeSession,
        setActiveSessionId,
        sendInput,
        onSessionData,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) throw new Error('useTerminal must be used within a TerminalProvider');
  return context;
};
