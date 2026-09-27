import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useIDE } from '../context/IDEContext';
import { EditorTabs } from './EditorTabs';
import { Sparkles } from 'lucide-react';

export const CodeEditor: React.FC = () => {
  const {
    tabs,
    activeTabId,
    updateTabContent,
    saveActiveFile,
    setIsCommandPaletteOpen,
    setIsQuickOpenOpen,
    setActiveBottomPanel,
    activeBottomPanel,
    settings,
  } = useIDE();
  const editorRef = useRef<any>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom Kernel Base themes
    monaco.editor.defineTheme('kernelbase-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '7a5c50', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7a45', fontStyle: 'bold' },
        { token: 'string', foreground: 'a8d59d' },
        { token: 'number', foreground: 'ffb366' },
        { token: 'type', foreground: 'ffc069' },
        { token: 'function', foreground: 'ffe58f' },
        { token: 'variable', foreground: 'e6f7ff' },
      ],
      colors: {
        'editor.background': '#120a07',
        'editor.foreground': '#e8ded8',
        'editorLineNumber.foreground': '#5c382b',
        'editorLineNumber.activeForeground': '#ff6b35',
        'editor.selectionBackground': '#421d12',
        'editor.inactiveSelectionBackground': '#2b140d',
        'editorCursor.foreground': '#ff6b35',
        'editorIndentGuide.background1': '#26140e',
        'editorIndentGuide.activeBackground1': '#592c1d',
      },
    });

    monaco.editor.defineTheme('kernelbase-cyberpunk', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008b8b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff0055', fontStyle: 'bold' },
        { token: 'string', foreground: '00ff99' },
        { token: 'number', foreground: 'ffe600' },
        { token: 'type', foreground: '00f0ff' },
        { token: 'function', foreground: 'ff00aa' },
        { token: 'variable', foreground: 'ffffff' },
      ],
      colors: {
        'editor.background': '#050b14',
        'editor.foreground': '#d1f4ff',
        'editorLineNumber.foreground': '#103a4d',
        'editorLineNumber.activeForeground': '#00f0ff',
        'editor.selectionBackground': '#0f384d',
        'editorCursor.foreground': '#00f0ff',
      },
    });

    monaco.editor.defineTheme('kernelbase-dracula', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'type', foreground: '8be9fd' },
        { token: 'function', foreground: '50fa7b' },
        { token: 'variable', foreground: 'f8f8f2' },
      ],
      colors: {
        'editor.background': '#1e1e2e',
        'editor.foreground': '#f8f8f2',
        'editorLineNumber.foreground': '#44475a',
        'editorLineNumber.activeForeground': '#bd93f9',
        'editor.selectionBackground': '#44475a',
        'editorCursor.foreground': '#bd93f9',
      },
    });

    monaco.editor.defineTheme('kernelbase-monokai', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'f92672', fontStyle: 'bold' },
        { token: 'string', foreground: 'e6db74' },
        { token: 'number', foreground: 'ae81ff' },
        { token: 'type', foreground: '66d9ef' },
        { token: 'function', foreground: 'a6e22e' },
        { token: 'variable', foreground: 'f8f8f2' },
      ],
      colors: {
        'editor.background': '#272822',
        'editor.foreground': '#f8f8f2',
        'editorLineNumber.foreground': '#49483e',
        'editorLineNumber.activeForeground': '#a6e22e',
        'editor.selectionBackground': '#49483e',
        'editorCursor.foreground': '#a6e22e',
      },
    });

    monaco.editor.defineTheme('kernelbase-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8e8e93', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'd9480f', fontStyle: 'bold' },
        { token: 'string', foreground: '2b8a3e' },
        { token: 'number', foreground: 'c53030' },
        { token: 'type', foreground: '1864ab' },
        { token: 'function', foreground: '5c7cfa' },
        { token: 'variable', foreground: '212529' },
      ],
      colors: {
        'editor.background': '#f8f9fa',
        'editor.foreground': '#212529',
        'editorLineNumber.foreground': '#ced4da',
        'editorLineNumber.activeForeground': '#d9480f',
        'editor.selectionBackground': '#ffe8cc',
        'editorCursor.foreground': '#d9480f',
      },
    });

    const activeTheme = 'kernelbase-' + (settings.theme || 'dark');
    monaco.editor.setTheme(activeTheme);

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveActiveFile();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
      setIsCommandPaletteOpen(true);
    });
  };

  if (!activeTab) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#120a07] text-neutral-500 select-none space-y-6 relative overflow-hidden">
        {/* Subtle background glow circle */}
        <div className="absolute w-96 h-96 bg-[#ff6b35]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative group cursor-pointer">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#ff6b35] to-amber-500 rounded-3xl blur-md opacity-25 group-hover:opacity-60 transition duration-300" />
          <div className="relative w-20 h-20 rounded-2xl bg-[#1c0e09] border border-[#441f14] flex items-center justify-center shadow-2xl">
            <img src="./logo.png" alt="Kernel Base" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>

        <div className="text-center z-10">
          <h3 className="text-base font-bold text-neutral-100 font-mono tracking-wide bg-gradient-to-r from-[#ff6b35] via-amber-300 to-[#ff8c42] bg-clip-text text-transparent">
            Kernel Base IDE
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm">
            Select a file from the Explorer or press shortcut keys below to launch
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 text-[11px] text-neutral-400 font-mono z-10">
          <button
            onClick={() => setIsQuickOpenOpen(true)}
            className="bg-[#1b0e08] hover:bg-[#2c150d] hover:text-[#ff6b35] px-3 py-1.5 rounded-lg border border-[#3a1a0f] hover:border-[#ff6b35]/50 transition-all shadow-sm"
          >
            Ctrl+P Quick Open
          </button>
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="bg-[#1b0e08] hover:bg-[#2c150d] hover:text-[#ff6b35] px-3 py-1.5 rounded-lg border border-[#3a1a0f] hover:border-[#ff6b35]/50 transition-all shadow-sm"
          >
            Ctrl+Shift+P AI Commands
          </button>
          <button
            onClick={() => setActiveBottomPanel(activeBottomPanel === 'terminal' ? 'none' : 'terminal')}
            className="bg-[#1b0e08] hover:bg-[#2c150d] hover:text-[#ff6b35] px-3 py-1.5 rounded-lg border border-[#3a1a0f] hover:border-[#ff6b35]/50 transition-all shadow-sm"
          >
            Ctrl+` Terminal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#120a07]">
      <EditorTabs />
      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language={activeTab.language}
          value={activeTab.content}
          theme={'kernelbase-' + (settings.theme || 'dark')}
          onChange={(val) => updateTabContent(activeTab.id, val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontFamily: settings.fontFamily || "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: settings.fontSize || 13,
            lineHeight: Math.round((settings.fontSize || 13) * 1.5),
            minimap: { enabled: settings.minimap !== false, side: 'right' },
            wordWrap: settings.wordWrap ? 'on' : 'off',
            tabSize: settings.tabSize || 2,
            lineNumbers: settings.lineNumbers ? 'on' : 'off',
            cursorStyle: settings.cursorStyle || 'line',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            automaticLayout: true,
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: settings.bracketPairColorization !== false },
          }}
        />
      </div>
    </div>
  );
};
