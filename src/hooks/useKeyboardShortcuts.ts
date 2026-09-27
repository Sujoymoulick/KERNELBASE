import { useEffect } from 'react';
import { useIDE } from '../context/IDEContext';

export function useKeyboardShortcuts() {
  const {
    saveActiveFile,
    setIsCommandPaletteOpen,
    setIsQuickOpenOpen,
    setIsSettingsOpen,
    setActiveSidebar,
    setActiveBottomPanel,
    toggleAgentPanel,
    activeSidebar,
    activeBottomPanel,
    activeTabId,
    closeTab,
  } = useIDE();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Support Ctrl (Linux/Windows) and Cmd (macOS)
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      const activeEl = document.activeElement;
      const isTerminalFocused = !!activeEl?.closest('.xterm');

      const key = e.key.toLowerCase();
      const code = e.code;

      // 1. Ctrl+Shift+P (AI Command Palette)
      if (e.shiftKey && (key === 'p' || code === 'KeyP')) {
        e.preventDefault();
        setIsQuickOpenOpen(false);
        setIsCommandPaletteOpen(true);
        return;
      }

      // 2. Ctrl+P (Quick Open file modal)
      if (!e.shiftKey && (key === 'p' || code === 'KeyP')) {
        e.preventDefault();
        setIsCommandPaletteOpen(false);
        setIsQuickOpenOpen(true);
        return;
      }

      // If typing inside terminal, do not intercept shell terminal control keys (like Ctrl+C, Ctrl+D, Ctrl+L, Ctrl+Z)
      if (isTerminalFocused && !e.shiftKey && (key === 'c' || key === 'v' || key === 'd' || key === 'l' || key === 'z')) {
        return;
      }

      // 3. Ctrl+S (Save Active File)
      if (!e.shiftKey && (key === 's' || code === 'KeyS')) {
        e.preventDefault();
        saveActiveFile();
        return;
      }

      // 4. Ctrl+Shift+E (Toggle Explorer Sidebar)
      if (e.shiftKey && (key === 'e' || code === 'KeyE')) {
        e.preventDefault();
        setActiveSidebar(activeSidebar === 'explorer' ? 'none' : 'explorer');
        return;
      }

      // 5. Ctrl+Shift+A (Toggle Agent Swarm Panel)
      if (e.shiftKey && (key === 'a' || code === 'KeyA')) {
        e.preventDefault();
        toggleAgentPanel();
        return;
      }

      // 6. Ctrl+Shift+G (Toggle Git Source Control)
      if (e.shiftKey && (key === 'g' || code === 'KeyG')) {
        e.preventDefault();
        setActiveSidebar(activeSidebar === 'git' ? 'none' : 'git');
        return;
      }

      // 7. Ctrl+Shift+F (Toggle Global Search)
      if (e.shiftKey && (key === 'f' || code === 'KeyF')) {
        e.preventDefault();
        setActiveSidebar(activeSidebar === 'search' ? 'none' : 'search');
        return;
      }

      // 8. Ctrl+` or Ctrl+J (Toggle Bottom Terminal)
      if (key === '`' || key === '~' || code === 'Backquote' || (!e.shiftKey && (key === 'j' || code === 'KeyJ'))) {
        e.preventDefault();
        setActiveBottomPanel(activeBottomPanel === 'terminal' ? 'none' : 'terminal');
        return;
      }

      // 9. Ctrl+, (Open Settings)
      if (key === ',' || code === 'Comma') {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }

      // 10. Ctrl+B (Toggle Primary Sidebar)
      if (!e.shiftKey && (key === 'b' || code === 'KeyB')) {
        e.preventDefault();
        setActiveSidebar(activeSidebar === 'none' ? 'explorer' : 'none');
        return;
      }

      // 11. Ctrl+W (Close Active Tab)
      if (!e.shiftKey && (key === 'w' || code === 'KeyW')) {
        e.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    saveActiveFile,
    setIsCommandPaletteOpen,
    setIsQuickOpenOpen,
    setIsSettingsOpen,
    setActiveSidebar,
    setActiveBottomPanel,
    toggleAgentPanel,
    activeSidebar,
    activeBottomPanel,
    activeTabId,
    closeTab,
  ]);
}
