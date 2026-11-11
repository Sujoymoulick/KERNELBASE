/**
 * Monaco is bundled with the app (no CDN) so the editor works offline.
 * Workers are inlined as blobs because the packaged app loads from file://.
 */
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker&inline';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker&inline';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker&inline';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker&inline';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker&inline';

(self as any).MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'json') return new JsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new CssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new HtmlWorker();
    if (label === 'typescript' || label === 'javascript') return new TsWorker();
    return new EditorWorker();
  },
};

loader.config({ monaco });

// Files are opened one at a time without a tsconfig, so semantic errors such as
// unresolved imports would be noise. Keep syntax checking on.
const tsOpts = {
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  module: monaco.languages.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
  allowJs: true,
  allowNonTsExtensions: true,
  esModuleInterop: true,
};
monaco.languages.typescript.typescriptDefaults.setCompilerOptions(tsOpts);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(tsOpts);
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });

monaco.editor.defineTheme('kb-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#1f1f1f',
    'editorGutter.background': '#1f1f1f',
    'editor.lineHighlightBackground': '#2a2a2a80',
    'editorLineNumber.foreground': '#6e7681',
    'editorLineNumber.activeForeground': '#cccccc',
    'editorWidget.background': '#202020',
    'editorWidget.border': '#454545',
    'minimap.background': '#1f1f1f',
    'editorCursor.foreground': '#e3963e',
    'editor.selectionBackground': '#6b3a1a',
    'editor.inactiveSelectionBackground': '#4a2a1480',
    'editor.findMatchBackground': '#8a4a1c',
    'focusBorder': '#cc5500',
    'editorBracketMatch.border': '#daa06d',
  },
});
monaco.editor.defineTheme('kb-light', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#ffffff',
    'editorLineNumber.foreground': '#8b8b8b',
    'editorLineNumber.activeForeground': '#1f1f1f',
    'editor.lineHighlightBackground': '#f3f3f380',
    'editorCursor.foreground': '#cc5500',
    'editor.selectionBackground': '#f6d3b3',
    'editor.inactiveSelectionBackground': '#f9e4d180',
    'focusBorder': '#cc5500',
    'editorBracketMatch.border': '#daa06d',
  },
});

export { monaco };
