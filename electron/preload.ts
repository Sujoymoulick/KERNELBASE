import { contextBridge, ipcRenderer, webUtils } from 'electron';

export const KERNEL_BASE_API = {
  // Filesystem
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
    createFile: (filePath: string, content?: string) => ipcRenderer.invoke('fs:createFile', filePath, content),
    createDirectory: (dirPath: string) => ipcRenderer.invoke('fs:createDirectory', dirPath),
    createDir: (dirPath: string) => ipcRenderer.invoke('fs:createDirectory', dirPath),
    deletePath: (targetPath: string) => ipcRenderer.invoke('fs:deletePath', targetPath),
    renamePath: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs:renamePath', oldPath, newPath),
    listDirectory: (dirPath: string, depth?: number) => ipcRenderer.invoke('fs:listDirectory', dirPath, depth),
    readDir: (dirPath: string, recursive?: boolean) => ipcRenderer.invoke('fs:listDirectory', dirPath, recursive ? 10 : 1),
    stat: (targetPath: string) => ipcRenderer.invoke('fs:stat', targetPath),
    exists: async (targetPath: string) => {
      try {
        const res = await ipcRenderer.invoke('fs:stat', targetPath);
        return !!res && !res.error;
      } catch {
        return false;
      }
    },
    revealInFinder: (targetPath: string) => ipcRenderer.invoke('fs:revealInFinder', targetPath),
    trash: (targetPath: string) => ipcRenderer.invoke('fs:trash', targetPath),
  },

  // Terminal
  terminal: {
    create: (optionsOrId?: any, maybeCwd?: string) => {
      const opts = typeof optionsOrId === 'string'
        ? { id: optionsOrId, cwd: maybeCwd }
        : optionsOrId;
      return ipcRenderer.invoke('terminal:create', opts);
    },
    write: (id: string, data: string) => ipcRenderer.invoke('terminal:write', id, data),
    resize: (id: string, cols: number, rows: number) => ipcRenderer.invoke('terminal:resize', id, cols, rows),
    kill: (id: string) => ipcRenderer.invoke('terminal:kill', id),
    close: (id: string) => ipcRenderer.invoke('terminal:kill', id),
    onData: (callbackOrId: any, maybeCallback?: any) => {
      const targetId = typeof callbackOrId === 'string' ? callbackOrId : null;
      const callback = typeof callbackOrId === 'function' ? callbackOrId : maybeCallback;
      const listener = (_: any, payload: { id: string; data: string }) => {
        if (!targetId || payload.id === targetId) {
          callback(targetId ? payload.data : payload);
        }
      };
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
    listAgents: () => Promise.resolve([]),
    submitGoal: async (goal: string) => ({
      id: 'plan-' + Date.now(),
      goal,
      status: 'ready',
      createdAt: Date.now(),
      steps: [
        { id: 'step-1', title: 'Analyze Project Architecture', description: 'Inspect workspace topology & dependencies', assignedRole: 'researcher', status: 'pending' },
        { id: 'step-2', title: 'Synthesize Implementation', description: 'Implement feature according to spec', assignedRole: 'coder', status: 'pending', dependsOn: ['step-1'] },
        { id: 'step-3', title: 'Verify with Test Suite', description: 'Run project tests and assert correctness', assignedRole: 'tester', status: 'pending', dependsOn: ['step-2'] },
        { id: 'step-4', title: 'Code Review & Security Audit', description: 'Inspect diff and check best practices', assignedRole: 'reviewer', status: 'pending', dependsOn: ['step-3'] },
      ],
    }),
    runStep: async () => ({ success: true }),
    pausePlan: async () => true,
    resumePlan: async () => true,
    stopPlan: async () => true,
    onPlanUpdate: () => () => {},
    onAgentThought: () => () => {},
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

  // Agent Studio — parallel agents on the user's own AI CLI subscription
  studio: {
    detect: () => ipcRenderer.invoke('studio:detect'),
    models: (provider: string) => ipcRenderer.invoke('studio:models', provider),
    spawn: (req: { id: string; provider: string; prompt: string; cwd: string; model?: string; mode?: string }) =>
      ipcRenderer.invoke('studio:spawn', req),
    stop: (id: string) => ipcRenderer.invoke('studio:stop', id),
    stopAll: () => ipcRenderer.invoke('studio:stopAll'),
    onData: (callback: (payload: { id: string; stream: 'stdout' | 'stderr'; data: string }) => void) => {
      const listener = (_: any, payload: any) => callback(payload);
      ipcRenderer.on('studio:data', listener);
      return () => ipcRenderer.removeListener('studio:data', listener);
    },
    onExit: (callback: (payload: { id: string; code: number; durationMs: number; error?: string }) => void) => {
      const listener = (_: any, payload: any) => callback(payload);
      ipcRenderer.on('studio:exit', listener);
      return () => ipcRenderer.removeListener('studio:exit', listener);
    },
  },

  // Native menu bar actions
  menu: {
    onAction: (callback: (id: string) => void) => {
      const listener = (_: any, id: string) => callback(id);
      ipcRenderer.on('menu:action', listener);
      return () => ipcRenderer.removeListener('menu:action', listener);
    },
  },

  // Project run/build detection and native dialogs
  project: {
    detect: (dir: string) => ipcRenderer.invoke('project:detect', dir),
    commandForFile: (filePath: string, ws?: string) => ipcRenderer.invoke('project:commandForFile', filePath, ws),
  },
  dialog: {
    openFile: (defaultPath?: string) => ipcRenderer.invoke('dialog:openFile', defaultPath),
    saveFile: (defaultPath?: string) => ipcRenderer.invoke('dialog:saveFile', defaultPath),
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
    openPath: (p: string) => ipcRenderer.invoke('shell:openPath', p),
  },

  // Kernel voice agent (speech via bundled kb-listen helper, turns via agy)
  kernel: {
    listenStart: () => ipcRenderer.invoke('kernel:listenStart'),
    listenStop: () => ipcRenderer.invoke('kernel:listenStop'),
    ask: (req: { text: string; cwd?: string; kind?: 'quick' | 'build'; history?: string; mode?: 'accept-edits' | 'auto' }) => ipcRenderer.invoke('kernel:ask', req),
    warm: (req: { cwd?: string; mode?: 'accept-edits' | 'auto' }) => ipcRenderer.invoke('kernel:warm', req),
    classify: (text: string) => ipcRenderer.invoke('kernel:classify', text),
    cancel: () => ipcRenderer.invoke('kernel:cancel'),
    stop: () => ipcRenderer.invoke('kernel:stop'),
    onListen: (cb: (e: { type: string; text?: string; message?: string }) => void) => {
      const l = (_: any, e: any) => cb(e);
      ipcRenderer.on('kernel:listen', l);
      return () => ipcRenderer.removeListener('kernel:listen', l);
    },
    onFile: (cb: (e: { file: string; exists: boolean }) => void) => {
      const l = (_: any, e: any) => cb(e);
      ipcRenderer.on('kernel:file', l);
      return () => ipcRenderer.removeListener('kernel:file', l);
    },
    onActivity: (cb: (e: { text: string }) => void) => {
      const l = (_: any, e: any) => cb(e);
      ipcRenderer.on('kernel:activity', l);
      return () => ipcRenderer.removeListener('kernel:activity', l);
    },
  },

  // Resources rack (project documents for agents)
  resources: {
    list: (ws: string) => ipcRenderer.invoke('resources:list', ws),
    pick: () => ipcRenderer.invoke('resources:pick'),
    import: (ws: string, files: string[]) => ipcRenderer.invoke('resources:import', ws, files),
    readMd: (ws: string, id: string) => ipcRenderer.invoke('resources:readMd', ws, id),
    saveMarkdown: (ws: string, name: string, md: string) => ipcRenderer.invoke('resources:saveMarkdown', ws, name, md),
    setAgentsRead: (ws: string, id: string, on: boolean) => ipcRenderer.invoke('resources:setAgentsRead', ws, id, on),
    remove: (ws: string, id: string) => ipcRenderer.invoke('resources:remove', ws, id),
    summarize: (ws: string, id: string, provider: string, model?: string) =>
      ipcRenderer.invoke('resources:summarize', ws, id, provider, model),
    cancel: (id: string) => ipcRenderer.invoke('resources:cancel', id),
    agentContext: (ws: string) => ipcRenderer.invoke('resources:agentContext', ws),
    pathForFile: (file: File) => webUtils.getPathForFile(file),
    onProgress: (callback: (p: { id: string; chars: number }) => void) => {
      const listener = (_: any, p: any) => callback(p);
      ipcRenderer.on('resources:progress', listener);
      return () => ipcRenderer.removeListener('resources:progress', listener);
    },
    onChanged: (callback: (p: { ws: string }) => void) => {
      const listener = (_: any, p: any) => callback(p);
      ipcRenderer.on('resources:changed', listener);
      return () => ipcRenderer.removeListener('resources:changed', listener);
    },
  },

  // Workspace
  workspace: {
    get: () => ipcRenderer.invoke('workspace:get'),
    set: (newPath: string) => ipcRenderer.invoke('workspace:set', newPath),
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
    getKeychainSecret: (service: string, account: string) => ipcRenderer.invoke('settings:getSecret', `${service}:${account}`),
    setKeychainSecret: (service: string, account: string, value: string) => ipcRenderer.invoke('settings:setSecret', `${service}:${account}`, value),
  },

  // Compiler & Runner
  run: {
    detectToolchains: () => ipcRenderer.invoke('run:detectToolchains'),
    executeFile: (options: { filePath: string; language?: string; workspacePath: string; args?: string[] }) =>
      ipcRenderer.invoke('run:executeFile', options),
    stop: () => ipcRenderer.invoke('run:stop'),
    onData: (callback: (payload: { runId: string; stream: 'stdout' | 'stderr'; data: string }) => void) => {
      const listener = (_: any, payload: any) => callback(payload);
      ipcRenderer.on('run:data', listener);
      return () => ipcRenderer.removeListener('run:data', listener);
    },
    onExit: (callback: (payload: { runId: string; result: any }) => void) => {
      const listener = (_: any, payload: any) => callback(payload);
      ipcRenderer.on('run:exit', listener);
      return () => ipcRenderer.removeListener('run:exit', listener);
    },
  },

  // Extensions & Marketplace
  extensions: {
    search: (query: string) => ipcRenderer.invoke('extensions:search', query),
    listInstalled: () => ipcRenderer.invoke('extensions:listInstalled'),
    install: (extensionId: string) => ipcRenderer.invoke('extensions:install', extensionId),
    installVsix: () => ipcRenderer.invoke('extensions:installVsix'),
    uninstall: (extensionId: string) => ipcRenderer.invoke('extensions:uninstall', extensionId),
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
