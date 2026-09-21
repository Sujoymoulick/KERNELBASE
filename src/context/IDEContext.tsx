import React, { createContext, useContext, useState, useEffect } from 'react';
import { EditorTab, FileEntry, WorkspaceConfig, AppSettings, DiagnosticItem, FileDiff } from '../types/ide';
import { api } from '../services/api';

export type ActiveSidebarView = 'explorer' | 'agents' | 'git' | 'search' | 'cli' | 'none';
export type ActiveBottomPanel = 'terminal' | 'problems' | 'diff' | 'timeline' | 'none';

interface IDEContextType {
  workspace: WorkspaceConfig | null;
  files: FileEntry[];
  tabs: EditorTab[];
  activeTabId: string | null;
  activeSidebar: ActiveSidebarView;
  activeBottomPanel: ActiveBottomPanel;
  settings: AppSettings;
  diagnostics: DiagnosticItem[];
  activeDiff: FileDiff | null;
  isCommandPaletteOpen: boolean;
  isQuickOpenOpen: boolean;
  isSettingsOpen: boolean;
  setWorkspace: (ws: WorkspaceConfig) => void;
  setActiveSidebar: (view: ActiveSidebarView) => void;
  setActiveBottomPanel: (panel: ActiveBottomPanel) => void;
  openFile: (filePath: string) => Promise<void>;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTabId: (tabId: string) => void;
  updateTabContent: (tabId: string, newContent: string) => void;
  saveActiveFile: () => Promise<boolean>;
  saveTab: (tabId: string) => Promise<boolean>;
  refreshFiles: () => Promise<void>;
  setSettings: (settings: AppSettings) => void;
  openDiff: (diff: FileDiff) => void;
  closeDiff: () => void;
  acceptDiff: (diff: FileDiff) => Promise<void>;
  rejectDiff: (diff: FileDiff) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsQuickOpenOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

const IDEContext = createContext<IDEContextType | undefined>(undefined);

function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'md':
      return 'markdown';
    case 'rs':
      return 'rust';
    case 'py':
      return 'python';
    case 'go':
      return 'go';
    case 'sh':
      return 'shell';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'sql':
      return 'sql';
    default:
      return 'plaintext';
  }
}

export const IDEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspace, setWorkspaceState] = useState<WorkspaceConfig | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<ActiveSidebarView>('explorer');
  const [activeBottomPanel, setActiveBottomPanel] = useState<ActiveBottomPanel>('terminal');
  const [activeDiff, setActiveDiff] = useState<FileDiff | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickOpenOpen, setIsQuickOpenOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>({
    theme: 'dark',
    fontSize: 13,
    tabSize: 2,
    wordWrap: true,
    autoSave: true,
    defaultModel: 'claude-3-7-sonnet',
    autoApproveSafeTools: true,
  });

  useEffect(() => {
    async function init() {
      try {
        const ws = await api.workspace.get();
        setWorkspaceState(ws);
        const fileList = await api.fs.readDir(ws.rootPath, true);
        setFiles(fileList);
        const initialSettings = await api.settings.get();
        setSettingsState(initialSettings);
      } catch (err) {
        console.error('Failed to initialize IDE workspace:', err);
      }
    }
    init();
  }, []);

  const refreshFiles = async () => {
    if (!workspace) return;
    try {
      const fileList = await api.fs.readDir(workspace.rootPath, true);
      setFiles(fileList);
    } catch (err) {
      console.error('Failed to refresh files:', err);
    }
  };

  const openFile = async (filePath: string) => {
    const existing = tabs.find((t) => t.path === filePath);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    try {
      const content = await api.fs.readFile(filePath);
      const name = filePath.split('/').pop() || filePath;
      const language = detectLanguage(filePath);
      const newTab: EditorTab = {
        id: 'tab-' + Math.random().toString(36).substring(2, 9),
        path: filePath,
        name,
        content,
        savedContent: content,
        language,
        isDirty: false,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    } catch (err) {
      console.error('Failed to open file:', filePath, err);
    }
  };

  const closeTab = (tabId: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(next.length > 0 ? next[next.length - 1].id : null);
      }
      return next;
    });
  };

  const closeAllTabs = () => {
    setTabs([]);
    setActiveTabId(null);
  };

  const updateTabContent = (tabId: string, newContent: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? { ...t, content: newContent, isDirty: newContent !== t.savedContent }
          : t
      )
    );
  };

  const saveTab = async (tabId: string): Promise<boolean> => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return false;
    try {
      await api.fs.writeFile(tab.path, tab.content);
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, savedContent: t.content, isDirty: false } : t
        )
      );
      return true;
    } catch (err) {
      console.error('Failed to save file:', tab.path, err);
      return false;
    }
  };

  const saveActiveFile = async (): Promise<boolean> => {
    if (!activeTabId) return false;
    return saveTab(activeTabId);
  };

  const openDiff = (diff: FileDiff) => {
    setActiveDiff(diff);
    setActiveBottomPanel('diff');
  };

  const closeDiff = () => {
    setActiveDiff(null);
  };

  const acceptDiff = async (diff: FileDiff) => {
    try {
      await api.fs.writeFile(diff.path, diff.newContent);
      const openTab = tabs.find((t) => t.path === diff.path);
      if (openTab) {
        updateTabContent(openTab.id, diff.newContent);
      }
      setActiveDiff(null);
      await refreshFiles();
    } catch (err) {
      console.error('Failed to accept diff:', err);
    }
  };

  const rejectDiff = (diff: FileDiff) => {
    setActiveDiff(null);
  };

  const setSettings = (newSettings: AppSettings) => {
    setSettingsState(newSettings);
    api.settings.save(newSettings);
  };

  const setWorkspace = async (ws: WorkspaceConfig) => {
    setWorkspaceState(ws);
    await api.workspace.set(ws.rootPath);
    await refreshFiles();
  };

  return (
    <IDEContext.Provider
      value={{
        workspace,
        files,
        tabs,
        activeTabId,
        activeSidebar,
        activeBottomPanel,
        settings,
        diagnostics,
        activeDiff,
        isCommandPaletteOpen,
        isQuickOpenOpen,
        isSettingsOpen,
        setWorkspace,
        setActiveSidebar,
        setActiveBottomPanel,
        openFile,
        closeTab,
        closeAllTabs,
        setActiveTabId,
        updateTabContent,
        saveActiveFile,
        saveTab,
        refreshFiles,
        setSettings,
        openDiff,
        closeDiff,
        acceptDiff,
        rejectDiff,
        setIsCommandPaletteOpen,
        setIsQuickOpenOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
    </IDEContext.Provider>
  );
};

export const useIDE = () => {
  const context = useContext(IDEContext);
  if (!context) throw new Error('useIDE must be used within an IDEProvider');
  return context;
};
