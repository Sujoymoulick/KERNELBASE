import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  RefreshCw,
  Plus,
  Minus,
  Check,
  UploadCloud,
  DownloadCloud,
  FileCode,
  FileText,
  FileDiff as DiffIcon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useIDE } from '../context/IDEContext';
import { GitStatusResult } from '../types/ide';

export const GitPanel: React.FC = () => {
  const { workspace, openFile, openDiff } = useIDE();
  const [status, setStatus] = useState<GitStatusResult | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [commitMessage, setCommitMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStagedExpanded, setIsStagedExpanded] = useState<boolean>(true);
  const [isChangesExpanded, setIsChangesExpanded] = useState<boolean>(true);

  const cwd = workspace?.rootPath || '';

  const refreshGit = async () => {
    if (!cwd) return;
    setIsLoading(true);
    try {
      const res = await api.git.status(cwd);
      setStatus(res);
      const branchRes = await api.git.branches(cwd);
      setCurrentBranch(branchRes.current);
      setBranches(branchRes.all);
    } catch (err) {
      console.error('Failed to query git status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshGit();
  }, [cwd]);

  const handleStageFile = async (file: string) => {
    await api.git.stage([file], cwd);
    await refreshGit();
  };

  const handleUnstageFile = async (file: string) => {
    await api.git.unstage([file], cwd);
    await refreshGit();
  };

  const handleStageAll = async () => {
    if (!status) return;
    const all = [...status.unstaged, ...status.untracked];
    if (all.length > 0) {
      await api.git.stage(all, cwd);
      await refreshGit();
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setIsLoading(true);
    try {
      await api.git.commit(commitMessage.trim(), cwd);
      setCommitMessage('');
      await refreshGit();
    } catch (err) {
      console.error('Failed to commit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePush = async () => {
    setIsLoading(true);
    try {
      await api.git.push(cwd);
      await refreshGit();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePull = async () => {
    setIsLoading(true);
    try {
      await api.git.pull(cwd);
      await refreshGit();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDiff = async (filePath: string) => {
    try {
      const diffOutput = await api.git.diff(cwd);
      openDiff({
        path: filePath,
        filePath,
        oldContent: `// HEAD version of ${filePath}`,
        newContent: await api.fs.readFile(filePath),
        status: 'modified',
      });
    } catch {
      await openFile(filePath);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#120a07] text-neutral-300 font-sans text-xs select-none">
      {/* Header toolbar */}
      <div className="h-9 px-3 bg-[#170c08] border-b border-[#29140d] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-[#ff6b35]" />
          <span className="font-semibold text-neutral-200">SOURCE CONTROL</span>
          <span className="text-[10px] text-neutral-500 font-mono">({currentBranch})</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={refreshGit}
            disabled={isLoading}
            className="p-1 hover:bg-[#26130d] text-neutral-400 hover:text-neutral-200 rounded transition-colors"
            title="Refresh Git (⌘R)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ff6b35]' : ''}`} />
          </button>
          <button
            onClick={handlePull}
            className="p-1 hover:bg-[#26130d] text-neutral-400 hover:text-neutral-200 rounded transition-colors"
            title="Pull Changes"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlePush}
            className="p-1 hover:bg-[#26130d] text-neutral-400 hover:text-neutral-200 rounded transition-colors"
            title="Push Changes"
          >
            <UploadCloud className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Commit Input Box */}
      <div className="p-3 border-b border-[#24130d] bg-[#140b07] space-y-2">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              handleCommit();
            }
          }}
          placeholder="Message (⌘Enter to commit)"
          rows={3}
          className="w-full bg-[#1c0f0a] border border-[#33170e] text-neutral-200 text-xs rounded p-2 focus:outline-none focus:border-[#ff6b35] resize-none font-mono"
        />
        <button
          onClick={handleCommit}
          disabled={!commitMessage.trim() || isLoading}
          className="w-full bg-[#ff6b35] hover:bg-[#ff804d] disabled:opacity-40 text-black font-semibold py-1.5 px-3 rounded flex items-center justify-center space-x-1.5 transition-colors"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Commit</span>
        </button>
      </div>

      {/* Changes list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1f100a]">
        {/* Staged Changes Section */}
        {status && Array.isArray(status.staged) && status.staged.length > 0 && (
          <div>
            <div
              onClick={() => setIsStagedExpanded(!isStagedExpanded)}
              className="px-3 py-1.5 bg-[#170d08] flex items-center justify-between text-neutral-400 hover:text-neutral-200 cursor-pointer font-semibold text-[11px]"
            >
              <div className="flex items-center space-x-1">
                {isStagedExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span>STAGED CHANGES</span>
                <span className="ml-1 text-[10px] bg-[#2d150c] text-[#ff804d] px-1.5 rounded-full">
                  {status.staged.length}
                </span>
              </div>
            </div>

            {isStagedExpanded && (
              <div className="divide-y divide-[#1a0e09]">
                {status.staged.map((file) => (
                  <div
                    key={file}
                    className="px-3 py-1 flex items-center justify-between hover:bg-[#1f100a] group cursor-pointer"
                    onClick={() => handleOpenDiff(file)}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileCode className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="truncate text-xs text-neutral-200">{file}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] font-mono text-green-400 font-bold">M</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnstageFile(file);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#2b140d] text-neutral-400 hover:text-neutral-200 rounded"
                        title="Unstage file"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Changes (Unstaged) Section */}
        {status && ((Array.isArray(status.unstaged) && status.unstaged.length > 0) || (Array.isArray(status.untracked) && status.untracked.length > 0)) && (
          <div>
            <div
              onClick={() => setIsChangesExpanded(!isChangesExpanded)}
              className="px-3 py-1.5 bg-[#170d08] flex items-center justify-between text-neutral-400 hover:text-neutral-200 cursor-pointer font-semibold text-[11px]"
            >
              <div className="flex items-center space-x-1">
                {isChangesExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span>CHANGES</span>
                <span className="ml-1 text-[10px] bg-[#2d150c] text-[#ff804d] px-1.5 rounded-full">
                  {(status.unstaged?.length || 0) + (status.untracked?.length || 0)}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStageAll();
                }}
                className="text-[10px] text-neutral-400 hover:text-neutral-200 hover:bg-[#2b140d] px-1.5 py-0.5 rounded"
                title="Stage All Changes"
              >
                Stage All
              </button>
            </div>

            {isChangesExpanded && (
              <div className="divide-y divide-[#1a0e09]">
                {(Array.isArray(status.unstaged) ? status.unstaged : []).map((file) => (
                  <div
                    key={file}
                    className="px-3 py-1 flex items-center justify-between hover:bg-[#1f100a] group cursor-pointer"
                    onClick={() => handleOpenDiff(file)}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileCode className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span className="truncate text-xs text-neutral-200">{file}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] font-mono text-yellow-400 font-bold">M</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStageFile(file);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#2b140d] text-neutral-400 hover:text-neutral-200 rounded"
                        title="Stage file"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {(Array.isArray(status.untracked) ? status.untracked : []).map((file) => (
                  <div
                    key={file}
                    className="px-3 py-1 flex items-center justify-between hover:bg-[#1f100a] group cursor-pointer"
                    onClick={() => openFile(file)}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="truncate text-xs text-neutral-300">{file}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] font-mono text-green-400 font-bold">U</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStageFile(file);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#2b140d] text-neutral-400 hover:text-neutral-200 rounded"
                        title="Stage file"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {status && status.clean && (
          <div className="p-8 text-center text-neutral-500">
            <Check className="w-8 h-8 text-[#ff6b35]/40 mx-auto mb-2" />
            <p className="text-xs">Working tree is clean.</p>
            <p className="text-[10px] text-neutral-600 mt-1">No uncommitted changes in this repository.</p>
          </div>
        )}
      </div>
    </div>
  );
};
