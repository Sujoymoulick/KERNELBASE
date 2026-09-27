import React, { useState, useEffect, useRef } from 'react';
import { useIDE } from '../context/IDEContext';
import { FileEntry } from '../types/ide';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  RefreshCw,
  Trash2,
  Copy,
  FolderInput,
  Check,
  ChevronsUp,
  Edit3,
  Link,
} from 'lucide-react';
import { api } from '../services/api';

interface ContextMenuState {
  x: number;
  y: number;
  entry: FileEntry;
}

const FileTreeItem: React.FC<{
  entry: FileEntry;
  level: number;
  activePath: string | null;
  forceCollapse: boolean;
  onOpen: (path: string) => void;
  onDelete: (path: string) => void;
  onCopyPath: (path: string, relative?: boolean) => void;
  onContextMenu: (e: React.MouseEvent, entry: FileEntry) => void;
}> = ({ entry, level, activePath, forceCollapse, onOpen, onDelete, onCopyPath, onContextMenu }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (forceCollapse) {
      setIsOpen(false);
    }
  }, [forceCollapse]);

  const isSelected = activePath === entry.path;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyPath(entry.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

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
      case 'md':
        return <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
    }
  };

  if (entry.isDirectory) {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          onContextMenu={(e) => onContextMenu(e, entry)}
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
                activePath={activePath}
                forceCollapse={forceCollapse}
                onOpen={onOpen}
                onDelete={onDelete}
                onCopyPath={onCopyPath}
                onContextMenu={onContextMenu}
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
      onContextMenu={(e) => onContextMenu(e, entry)}
      style={{ paddingLeft: `${level * 12 + 20}px` }}
      className={`flex items-center justify-between py-1 px-2 cursor-pointer rounded transition-all group ${
        isSelected
          ? 'bg-[#28130a] text-[#ff6b35] font-semibold border-l-2 border-[#ff6b35]'
          : 'text-neutral-300 hover:text-neutral-100 hover:bg-[#1c0f0a]'
      }`}
    >
      <div className="flex items-center space-x-1.5 truncate">
        {getFileIcon(entry.name)}
        <span className="text-xs truncate">{entry.name}</span>
      </div>
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="text-neutral-500 hover:text-neutral-200 p-0.5 rounded transition-colors"
          title="Copy Path"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.path);
          }}
          className="text-neutral-500 hover:text-red-400 p-0.5 rounded transition-colors"
          title="Delete File"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const ProjectExplorer: React.FC = () => {
  const { files, workspace, setWorkspace, tabs, activeTabId, openFile, refreshFiles } = useIDE();
  const [newItemName, setNewItemName] = useState('');
  const [createMode, setCreateMode] = useState<'file' | 'folder' | null>(null);
  const [forceCollapse, setForceCollapse] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activePath = activeTab ? activeTab.path : null;

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleSelectFolder = async () => {
    try {
      const res = await api.workspace.selectFolder();
      if (res.success && res.folderPath) {
        await setWorkspace({
          rootPath: res.folderPath,
          name: res.folderPath.split(/[/\\]/).filter(Boolean).pop() || 'Workspace',
          projectType: 'node',
        });
      }
    } catch (err) {
      console.error('Failed to select folder:', err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !workspace) return;
    try {
      const fullPath = `${workspace.rootPath}/${newItemName}`;
      if (createMode === 'folder') {
        await api.fs.createDir(fullPath);
      } else {
        await api.fs.writeFile(fullPath, '');
        await openFile(fullPath);
      }
      setNewItemName('');
      setCreateMode(null);
      await refreshFiles();
    } catch (err) {
      console.error('Failed to create item:', err);
    }
  };

  const handleDelete = async (path: string) => {
    if (confirm(`Are you sure you want to delete ${path}?`)) {
      await api.fs.deletePath(path);
      await refreshFiles();
    }
  };

  const handleCopyPath = (path: string, relative: boolean = false) => {
    let target = path;
    if (relative && workspace) {
      target = path.replace(workspace.rootPath, '').replace(/^[/\\]/, '');
    }
    navigator.clipboard.writeText(target).catch(() => {});
  };

  const handleCollapseAll = () => {
    setForceCollapse(true);
    setTimeout(() => setForceCollapse(false), 100);
  };

  const handleContextMenu = (e: React.MouseEvent, entry: FileEntry) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      entry,
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0d0806] select-none text-xs relative">
      {/* VS Code Style Header with actions */}
      <div className="p-3 border-b border-[#24130d] flex items-center justify-between">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400 truncate">
          Explorer ({workspace?.name || 'Workspace'})
        </span>
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => setCreateMode(createMode === 'file' ? null : 'file')}
            className={`p-1 rounded transition-colors ${
              createMode === 'file'
                ? 'bg-[#28130a] text-[#ff6b35]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#20100a]'
            }`}
            title="New File (VS Code Style)"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCreateMode(createMode === 'folder' ? null : 'folder')}
            className={`p-1 rounded transition-colors ${
              createMode === 'folder'
                ? 'bg-[#28130a] text-[#ff6b35]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#20100a]'
            }`}
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={refreshFiles}
            className="p-1 hover:bg-[#20100a] text-neutral-400 hover:text-neutral-200 rounded transition-colors"
            title="Refresh Explorer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCollapseAll}
            className="p-1 hover:bg-[#20100a] text-neutral-400 hover:text-neutral-200 rounded transition-colors"
            title="Collapse All Folders"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleSelectFolder}
            className="p-1 hover:bg-[#20100a] text-neutral-400 hover:text-[#ff6b35] rounded transition-colors"
            title="Open Folder / Select Workspace"
          >
            <FolderInput className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New file / New folder inline form */}
      {createMode && (
        <form onSubmit={handleCreateItem} className="p-2 bg-[#1a0e09] border-b border-[#2d160e]">
          <div className="text-[10px] text-neutral-400 font-medium mb-1">
            {createMode === 'file' ? 'New File Name' : 'New Folder Name'}
          </div>
          <input
            autoFocus
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={createMode === 'file' ? 'filename.ext' : 'folder-name'}
            className="w-full bg-[#0d0705] border border-[#3d1d13] rounded px-2 py-1 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#ff6b35]"
          />
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto py-2">
        {files.length === 0 ? (
          <div className="p-6 text-center space-y-4 flex flex-col items-center justify-center h-48 select-none">
            <div className="w-10 h-10 rounded-xl bg-[#1a0e09] border border-[#381a10] flex items-center justify-center text-[#ff6b35]">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-300">NO FOLDER OPENED</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Select a folder to view files</p>
            </div>
            <button
              onClick={handleSelectFolder}
              className="inline-flex items-center space-x-2 bg-[#ff6b35] hover:bg-[#e85a26] text-neutral-950 font-bold px-3 py-1.5 rounded-md text-xs transition-colors shadow-sm shadow-[#ff6b35]/20"
            >
              <FolderInput className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Open Folder...</span>
            </button>
          </div>
        ) : (
          files.map((entry) => (
            <FileTreeItem
              key={entry.path}
              entry={entry}
              level={0}
              activePath={activePath}
              forceCollapse={forceCollapse}
              onOpen={openFile}
              onDelete={handleDelete}
              onCopyPath={handleCopyPath}
              onContextMenu={handleContextMenu}
            />
          ))
        )}
      </div>

      {/* VS Code Style Floating Right-Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-48 bg-[#180e09] border border-[#381a10] rounded-lg shadow-xl shadow-black/60 py-1 text-xs text-neutral-200 select-none animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {!contextMenu.entry.isDirectory && (
            <button
              onClick={() => {
                openFile(contextMenu.entry.path);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#28130a] hover:text-[#ff6b35] flex items-center space-x-2"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Open File</span>
            </button>
          )}

          {contextMenu.entry.isDirectory && (
            <>
              <button
                onClick={() => {
                  setCreateMode('file');
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#28130a] hover:text-[#ff6b35] flex items-center space-x-2"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>New File</span>
              </button>
              <button
                onClick={() => {
                  setCreateMode('folder');
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#28130a] hover:text-[#ff6b35] flex items-center space-x-2"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New Folder</span>
              </button>
            </>
          )}

          <div className="my-1 border-t border-[#29140c]" />

          <button
            onClick={() => {
              handleCopyPath(contextMenu.entry.path, false);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#28130a] hover:text-[#ff6b35] flex items-center space-x-2"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Path</span>
          </button>

          <button
            onClick={() => {
              handleCopyPath(contextMenu.entry.path, true);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#28130a] hover:text-[#ff6b35] flex items-center space-x-2"
          >
            <Link className="w-3.5 h-3.5" />
            <span>Copy Relative Path</span>
          </button>

          <div className="my-1 border-t border-[#29140c]" />

          <button
            onClick={() => {
              handleDelete(contextMenu.entry.path);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-rose-950/40 text-rose-400 flex items-center space-x-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};


