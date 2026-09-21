import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useIDE } from '../context/IDEContext';
import { EditorTabs } from './EditorTabs';
import { Sparkles } from 'lucide-react';

export const CodeEditor: React.FC = () => {
  const { tabs, activeTabId, updateTabContent, saveActiveFile, setIsCommandPaletteOpen } = useIDE();
  const editorRef = useRef<any>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom Kernel Base ember theme
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

    monaco.editor.setTheme('kernelbase-dark');

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
      <div className="h-full flex flex-col items-center justify-center bg-[#120a07] text-neutral-500 select-none space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#1c0e09] border border-[#3d1d13] flex items-center justify-center shadow-inner">
          <Sparkles className="w-8 h-8 text-[#ff6b35]" />
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold text-neutral-300">Kernel Base IDE</h3>
          <p className="text-xs text-neutral-500 mt-1">Select a file from Explorer or press ⌘P to open</p>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-neutral-500 font-mono">
          <span className="bg-[#1c0e09] px-2 py-1 rounded border border-[#2b140d]">⌘P Quick Open</span>
          <span className="bg-[#1c0e09] px-2 py-1 rounded border border-[#2b140d]">⌘⇧P Palette</span>
          <span className="bg-[#1c0e09] px-2 py-1 rounded border border-[#2b140d]">⌘J Terminal</span>
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
          theme="kernelbase-dark"
          onChange={(val) => updateTabContent(activeTab.id, val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, monospace",
            fontSize: 13,
            lineHeight: 20,
            minimap: { enabled: true, side: 'right' },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            automaticLayout: true,
            tabSize: 2,
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
};
