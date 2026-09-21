import React, { useState } from 'react';
import { useIDE } from '../context/IDEContext';
import { FileEntry } from '../types/ide';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';

const FileTreeItem: React.FC<{
  entry: FileEntry;
  level: number;
  onOpen: (path: string) => void;
  onDelete: (path: string) => void;
}> = ({ entry, level, onOpen, onDelete }) => {
  const [isOpen, setIsOpen] = useState(true);

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'json':
        return <FileText className="w-3.5 h-3.5 text-yellow-500 shrink-0" />;
      case 'css':
        return <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
    }
  };

  if (entry.isDirectory) {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          className="flex items-center space-x-1 py-1 hover:bg-[#1f100a] text-neutral-300 hover:text-neutral-100 cursor-pointer rounded transition-colors group"
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          )}
          {isOpen ? (
            <FolderOpen className="w-4 h-4 text-[#ff6b35] shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-[#ff6b35] shrink-0" />
          )}
          <span className="text-xs font-medium truncate">{entry.name}</span>
        </div>
        {isOpen && entry.children && (
          <div>
            {entry.children.map((child) => (
              <FileTreeItem
                key={child.path}
                entry={child}
                level={level + 1}
                onOpen={onOpen}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => onOpen(entry.path)}
      style={{ paddingLeft: `${level * 12 + 20}px` }}
      className="flex items-center justify-between py-1 px-2 hover:bg-[#1c0f0a] text-neutral-300 hover:text-neutral-100 cursor-pointer rounded transition-colors group"
    >
      <div className="flex items-center space-x-1.5 truncate">
        {getFileIcon(entry.name)}
        <span className="text-xs truncate">{entry.name}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(entry.path);
        }}
        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-0.5 rounded transition-opacity"
        title="Delete File"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
};

export const ProjectExplorer: React.FC = () => {
  const { files, workspace, openFile, refreshFiles } = useIDE();
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim() || !workspace) return;
    try {
      const fullPath = `${workspace.rootPath}/${newFileName}`;
      await api.fs.writeFile(fullPath, '');
      setNewFileName('');
      setIsCreatingFile(false);
      await refreshFiles();
      await openFile(fullPath);
    } catch (err) {
      console.error('Failed to create file:', err);
    }
  };

  const handleDelete = async (path: string) => {
    if (confirm(`Are you sure you want to delete ${path}?`)) {
      await api.fs.deletePath(path);
      await refreshFiles();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0d0806] select-none text-xs">
      {/* Header with actions */}
      <div className="p-3 border-b border-[#24130d] flex items-center justify-between">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400">Explorer</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsCreatingFile(!isCreatingFile)}
            className="p-1 hover:bg-[#20100a] text-neutral-400 hover:text-neutral-200 rounded transition-colors"
            title="New File"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={refreshFiles}
            className="p-1 hover:bg-[#20100a] text-neutral-400 hover:text-neutral-200 rounded transition-colors"
            title="Refresh Files"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New file inline form */}
      {isCreatingFile && (
        <form onSubmit={handleCreateFile} className="p-2 bg-[#1a0e09] border-b border-[#2d160e]">
          <input
            autoFocus
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="filename.ext"
            className="w-full bg-[#0d0705] border border-[#3d1d13] rounded px-2 py-1 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#ff6b35]"
          />
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto py-2">
        {files.length === 0 ? (
          <div className="p-4 text-center text-neutral-500">No files in workspace</div>
        ) : (
          files.map((entry) => (
            <FileTreeItem
              key={entry.path}
              entry={entry}
              level={0}
              onOpen={openFile}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
