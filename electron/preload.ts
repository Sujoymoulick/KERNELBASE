import { contextBridge, ipcRenderer } from 'electron';

export const KERNEL_BASE_API = {
  // Filesystem
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
    createFile: (filePath: string, content?: string) => ipcRenderer.invoke('fs:createFile', filePath, content),
    createDirectory: (dirPath: string) => ipcRenderer.invoke('fs:createDirectory', dirPath),
    deletePath: (targetPath: string) => ipcRenderer.invoke('fs:deletePath', targetPath),
    renamePath: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs:renamePath', oldPath, newPath),
    listDirectory: (dirPath: string, depth?: number) => ipcRenderer.invoke('fs:listDirectory', dirPath, depth),
    stat: (targetPath: string) => ipcRenderer.invoke('fs:stat', targetPath),
    revealInFinder: (targetPath: string) => ipcRenderer.invoke('fs:revealInFinder', targetPath),
  },

  // Terminal
  terminal: {
    create: (options?: { id?: string; cwd?: string; shell?: string }) => ipcRenderer.invoke('terminal:create', options),
    write: (id: string, data: string) => ipcRenderer.invoke('terminal:write', id, data),
    resize: (id: string, cols: number, rows: number) => ipcRenderer.invoke('terminal:resize', id, cols, rows),
    kill: (id: string) => ipcRenderer.invoke('terminal:kill', id),
    onData: (callback: (payload: { id: string; data: string }) => void) => {
      const listener = (_: any, payload: { id: string; data: string }) => callback(payload);
      ipcRenderer.on('terminal:data', listener);
      return () => ipcRenderer.removeListener('terminal:data', listener);
    },
    onExit: (callback: (payload: { id: string; code: number }) => void) => {
      const listener = (_: any, payload: { id: string; code: number }) => callback(payload);
      ipcRenderer.on('terminal:exit', listener);
      return () => ipcRenderer.removeListener('terminal:exit', listener);
    },
  },

  // Git
  git: {
    status: (workspacePath: string) => ipcRenderer.invoke('git:status', workspacePath),
    branches: (workspacePath: string) => ipcRenderer.invoke('git:branches', workspacePath),
    stage: (workspacePath: string, filePath: string) => ipcRenderer.invoke('git:stage', workspacePath, filePath),
    unstage: (workspacePath: string, filePath: string) => ipcRenderer.invoke('git:unstage', workspacePath, filePath),
    stageAll: (workspacePath: string) => ipcRenderer.invoke('git:stageAll', workspacePath),
    unstageAll: (workspacePath: string) => ipcRenderer.invoke('git:unstageAll', workspacePath),
    commit: (workspacePath: string, message: string) => ipcRenderer.invoke('git:commit', workspacePath, message),
    push: (workspacePath: string) => ipcRenderer.invoke('git:push', workspacePath),
    pull: (workspacePath: string) => ipcRenderer.invoke('git:pull', workspacePath),
    fetch: (workspacePath: string) => ipcRenderer.invoke('git:fetch', workspacePath),
    diff: (workspacePath: string, filePath?: string) => ipcRenderer.invoke('git:diff', workspacePath, filePath),
    log: (workspacePath: string, limit?: number) => ipcRenderer.invoke('git:log', workspacePath, limit),
    checkout: (workspacePath: string, branchName: string) => ipcRenderer.invoke('git:checkout', workspacePath, branchName),
    createBranch: (workspacePath: string, branchName: string) => ipcRenderer.invoke('git:createBranch', workspacePath, branchName),
  },

  // Agents & Orchestration
  agents: {
    startTask: (task: { title: string; description: string; mode: string; workspacePath: string; modelConfig?: any }) =>
      ipcRenderer.invoke('agents:startTask', task),
    cancelTask: (taskId: string) => ipcRenderer.invoke('agents:cancelTask', taskId),
    pauseTask: (taskId: string) => ipcRenderer.invoke('agents:pauseTask', taskId),
    resumeTask: (taskId: string) => ipcRenderer.invoke('agents:resumeTask', taskId),
    retryTask: (taskId: string) => ipcRenderer.invoke('agents:retryTask', taskId),
    sendMessage: (taskId: string, message: string) => ipcRenderer.invoke('agents:sendMessage', taskId, message),
    onEvent: (callback: (event: any) => void) => {
      const listener = (_: any, event: any) => callback(event);
      ipcRenderer.on('agents:event', listener);
      return () => ipcRenderer.removeListener('agents:event', listener);
    },
  },

  // Permissions & Safe Execution
  permissions: {
    respond: (requestId: string, allowed: boolean, alwaysAllow?: boolean) =>
      ipcRenderer.invoke('permissions:respond', requestId, allowed, alwaysAllow),
    getSettings: () => ipcRenderer.invoke('permissions:getSettings'),
    updateSetting: (key: string, value: any) => ipcRenderer.invoke('permissions:updateSetting', key, value),
    onRequest: (callback: (request: any) => void) => {
      const listener = (_: any, req: any) => callback(req);
      ipcRenderer.on('permissions:request', listener);
      return () => ipcRenderer.removeListener('permissions:request', listener);
    },
  },

  // Tools
  tools: {
    list: () => ipcRenderer.invoke('tools:list'),
    execute: (toolName: string, parameters: any, workspacePath: string) =>
      ipcRenderer.invoke('tools:execute', toolName, parameters, workspacePath),
  },

  // CLI Adapters
  cli: {
    detect: () => ipcRenderer.invoke('cli:detect'),
    run: (cliId: string, args: string[], cwd: string) => ipcRenderer.invoke('cli:run', cliId, args, cwd),
    onData: (callback: (payload: { id: string; data: string; stream: 'stdout' | 'stderr' }) => void) => {
      const listener = (_: any, payload: any) => callback(payload);
      ipcRenderer.on('cli:data', listener);
      return () => ipcRenderer.removeListener('cli:data', listener);
    },
  },

  // Workspace
  workspace: {
    selectFolder: () => ipcRenderer.invoke('workspace:selectFolder'),
    openFolder: (dirPath: string) => ipcRenderer.invoke('workspace:openFolder', dirPath),
    getRecent: () => ipcRenderer.invoke('workspace:getRecent'),
    detectProject: (dirPath: string) => ipcRenderer.invoke('workspace:detectProject', dirPath),
    saveState: (workspacePath: string, state: any) => ipcRenderer.invoke('workspace:saveState', workspacePath, state),
    loadState: (workspacePath: string) => ipcRenderer.invoke('workspace:loadState', workspacePath),
  },

  // Search & Indexing
  indexing: {
    search: (workspacePath: string, query: string, options?: { caseSensitive?: boolean; wholeWord?: boolean; maxResults?: number }) =>
      ipcRenderer.invoke('indexing:search', workspacePath, query, options),
    quickOpen: (workspacePath: string, query: string) => ipcRenderer.invoke('indexing:quickOpen', workspacePath, query),
    index: (workspacePath: string) => ipcRenderer.invoke('indexing:index', workspacePath),
  },

  // Settings & Keychain
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (settings: any) => ipcRenderer.invoke('settings:save', settings),
    getSecret: (key: string) => ipcRenderer.invoke('settings:getSecret', key),
    setSecret: (key: string, value: string) => ipcRenderer.invoke('settings:setSecret', key, value),
    deleteSecret: (key: string) => ipcRenderer.invoke('settings:deleteSecret', key),
  },

  // System & Dialogs
  system: {
    getPlatformInfo: () => ipcRenderer.invoke('system:getPlatformInfo'),
    getVersion: () => ipcRenderer.invoke('system:getVersion'),
    showDialog: (options: any) => ipcRenderer.invoke('system:showDialog', options),
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  }
};

contextBridge.exposeInMainWorld('kernelBase', KERNEL_BASE_API);
