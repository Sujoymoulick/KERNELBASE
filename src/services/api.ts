import {
  AgentInfo,
  ExecutionPlan,
  PermissionRequest,
  FileEntry,
  GitStatusResult,
  AppSettings,
  DiagnosticItem,
  SearchResultItem,
  WorkspaceConfig,
} from '../types/ide';

declare global {
  interface Window {
    kernelBase?: {
      fs: {
        readFile: (path: string) => Promise<string>;
        writeFile: (path: string, content: string) => Promise<boolean>;
        readDir: (path: string, recursive?: boolean) => Promise<FileEntry[]>;
        createDir: (path: string) => Promise<boolean>;
        deletePath: (path: string) => Promise<boolean>;
        renamePath: (oldPath: string, newPath: string) => Promise<boolean>;
        exists: (path: string) => Promise<boolean>;
      };
      agents: {
        listAgents: () => Promise<AgentInfo[]>;
        submitGoal: (goal: string) => Promise<ExecutionPlan>;
        runStep: (stepId: string) => Promise<any>;
        pausePlan: () => Promise<boolean>;
        resumePlan: () => Promise<boolean>;
        stopPlan: () => Promise<boolean>;
        onPlanUpdate: (callback: (plan: ExecutionPlan) => void) => () => void;
        onAgentThought: (callback: (data: { role: string; text: string }) => void) => () => void;
      };
      terminal: {
        create: (id: string, cwd?: string) => Promise<string>;
        write: (id: string, data: string) => void;
        resize: (id: string, cols: number, rows: number) => void;
        close: (id: string) => void;
        onData: (id: string, callback: (data: string) => void) => () => void;
      };
      git: {
        status: (cwd?: string) => Promise<GitStatusResult>;
        stage: (files: string[], cwd?: string) => Promise<boolean>;
        unstage: (files: string[], cwd?: string) => Promise<boolean>;
        commit: (message: string, cwd?: string) => Promise<boolean>;
        branches: (cwd?: string) => Promise<{ current: string; all: string[] }>;
        checkout: (branch: string, cwd?: string) => Promise<boolean>;
        diff: (cwd?: string) => Promise<string>;
        push: (cwd?: string) => Promise<boolean>;
        pull: (cwd?: string) => Promise<boolean>;
      };
      permissions: {
        respond: (id: string, approved: boolean, alwaysAllow?: boolean) => Promise<void>;
        onRequest: (callback: (request: PermissionRequest) => void) => () => void;
      };
      settings: {
        get: () => Promise<AppSettings>;
        save: (settings: Partial<AppSettings>) => Promise<boolean>;
        getKeychainSecret: (service: string, account: string) => Promise<string | null>;
        setKeychainSecret: (service: string, account: string, secret: string) => Promise<boolean>;
      };
      workspace: {
        get: () => Promise<WorkspaceConfig>;
        set: (path: string) => Promise<WorkspaceConfig>;
        getRecent: () => Promise<string[]>;
      };
      indexing: {
        search: (query: string, options?: any) => Promise<SearchResultItem[]>;
        quickOpen: (query: string) => Promise<string[]>;
      };
      cli: {
        detect: () => Promise<Record<string, { installed: boolean; path?: string; version?: string }>>;
        run: (cli: string, args: string[], cwd?: string) => Promise<{ code: number; stdout: string; stderr: string }>;
      };
      run?: {
        detectToolchains: () => Promise<any[]>;
        executeFile: (options: { filePath: string; language?: string; workspacePath: string; args?: string[] }) => Promise<any>;
        stop: () => Promise<any>;
        onData: (callback: (payload: { runId: string; stream: 'stdout' | 'stderr'; data: string }) => void) => () => void;
        onExit: (callback: (payload: { runId: string; result: any }) => void) => () => void;
      };
      extensions?: {
        search: (query: string) => Promise<any[]>;
        listInstalled: () => Promise<any[]>;
        install: (extensionId: string) => Promise<any>;
        installVsix: () => Promise<any>;
        uninstall: (extensionId: string) => Promise<any>;
      };
    };
  }
}

// Fallback in-memory state if loaded in browser
const isElectron = typeof window !== 'undefined' && !!window.kernelBase;

export const api = {
  isElectron,

  fs: {
    async readFile(filePath: string): Promise<string> {
      try {
        if (typeof window.kernelBase?.fs?.readFile === 'function') {
          const res: any = await window.kernelBase.fs.readFile(filePath);
          if (typeof res === 'string') return res;
          if (res && typeof res.content === 'string') return res.content;
        }
      } catch (e) {
        console.warn('Failed to read file from kernelBase:', e);
      }
      return `// Standalone preview for ${filePath}\nconsole.log("Kernel Base IDE is running!");\n`;
    },
    async writeFile(filePath: string, content: string): Promise<boolean> {
      try {
        if (typeof window.kernelBase?.fs?.writeFile === 'function') {
          const res: any = await window.kernelBase.fs.writeFile(filePath, content);
          return typeof res === 'boolean' ? res : !!res?.success;
        }
      } catch (e) {
        console.warn('Failed to write file via kernelBase:', e);
      }
      return true;
    },
    async readDir(dirPath: string, recursive: boolean = true): Promise<FileEntry[]> {
      try {
        if (typeof window.kernelBase?.fs?.readDir === 'function') {
          const res: any = await window.kernelBase.fs.readDir(dirPath, recursive);
          if (Array.isArray(res)) return res;
          if (res && Array.isArray(res.nodes)) return res.nodes;
        }
        if (typeof (window.kernelBase?.fs as any)?.listDirectory === 'function') {
          const res: any = await (window.kernelBase?.fs as any).listDirectory(dirPath, recursive ? 10 : 1);
          if (Array.isArray(res)) return res;
          if (res && Array.isArray(res.nodes)) return res.nodes;
        }
      } catch (e) {
        console.warn('Failed to read directory via kernelBase:', e);
      }
      return [
        {
          name: 'src',
          path: '/workspace/src',
          isDirectory: true,
          children: [
            { name: 'App.tsx', path: '/workspace/src/App.tsx', isDirectory: false },
            { name: 'main.tsx', path: '/workspace/src/main.tsx', isDirectory: false },
            { name: 'index.css', path: '/workspace/src/index.css', isDirectory: false },
          ],
        },
        { name: 'package.json', path: '/workspace/package.json', isDirectory: false },
        { name: 'README.md', path: '/workspace/README.md', isDirectory: false },
      ];
    },
    async createDir(dirPath: string): Promise<boolean> {
      try {
        if (typeof window.kernelBase?.fs?.createDir === 'function') {
          const res: any = await window.kernelBase.fs.createDir(dirPath);
          return typeof res === 'boolean' ? res : !!res?.success;
        }
        if (typeof (window.kernelBase?.fs as any)?.createDirectory === 'function') {
          const res: any = await (window.kernelBase?.fs as any).createDirectory(dirPath);
          return typeof res === 'boolean' ? res : !!res?.success;
        }
      } catch (e) {
        console.warn('Failed to create directory via kernelBase:', e);
      }
      return true;
    },
    async deletePath(targetPath: string): Promise<boolean> {
      try {
        if (typeof window.kernelBase?.fs?.deletePath === 'function') {
          const res: any = await window.kernelBase.fs.deletePath(targetPath);
          return typeof res === 'boolean' ? res : !!res?.success;
        }
      } catch (e) {
        console.warn('Failed to delete path via kernelBase:', e);
      }
      return true;
    },
    async renamePath(oldPath: string, newPath: string): Promise<boolean> {
      try {
        if (typeof window.kernelBase?.fs?.renamePath === 'function') {
          const res: any = await window.kernelBase.fs.renamePath(oldPath, newPath);
          return typeof res === 'boolean' ? res : !!res?.success;
        }
      } catch (e) {
        console.warn('Failed to rename path via kernelBase:', e);
      }
      return true;
    },
  },

  agents: {
    async listAgents(): Promise<AgentInfo[]> {
      if (typeof window.kernelBase?.agents?.listAgents === 'function') {
        return window.kernelBase.agents.listAgents();
      }
      return [
        { id: '1', role: 'orchestrator', name: 'Orchestrator', avatar: 'OR', description: 'Swarm coordinator & workflow engine', state: 'idle' },
        { id: '2', role: 'planner', name: 'Planner', avatar: 'PL', description: 'DAG architecture & decomposition', state: 'idle' },
        { id: '3', role: 'coder', name: 'Coder', avatar: 'CO', description: 'Code synthesis & AST refactoring', state: 'idle' },
        { id: '4', role: 'tester', name: 'Tester', avatar: 'TE', description: 'Automated test suites & regressions', state: 'idle' },
        { id: '5', role: 'reviewer', name: 'Reviewer', avatar: 'RE', description: 'Quality, safety & diff validation', state: 'idle' },
        { id: '6', role: 'debugger', name: 'Debugger', avatar: 'DB', description: 'Stack trace & root cause triage', state: 'idle' },
        { id: '7', role: 'researcher', name: 'Researcher', avatar: 'RS', description: 'Local code indexing & doc exploration', state: 'idle' },
      ];
    },
    async submitGoal(goal: string): Promise<ExecutionPlan> {
      if (typeof window.kernelBase?.agents?.submitGoal === 'function') {
        return window.kernelBase.agents.submitGoal(goal);
      }
      return {
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
      };
    },
    async runStep(stepId: string): Promise<any> {
      if (typeof window.kernelBase?.agents?.runStep === 'function') {
        return window.kernelBase.agents.runStep(stepId);
      }
      return { success: true };
    },
    onPlanUpdate(callback: (plan: ExecutionPlan) => void): () => void {
      if (typeof window.kernelBase?.agents?.onPlanUpdate === 'function') {
        return window.kernelBase.agents.onPlanUpdate(callback);
      }
      return () => {};
    },
    onAgentThought(callback: (data: { role: string; text: string }) => void): () => void {
      if (typeof window.kernelBase?.agents?.onAgentThought === 'function') {
        return window.kernelBase.agents.onAgentThought(callback);
      }
      return () => {};
    },
  },

  terminal: {
    async create(id: string, cwd?: string): Promise<string> {
      if (typeof window.kernelBase?.terminal?.create === 'function') {
        return window.kernelBase.terminal.create(id, cwd);
      }
      return id;
    },
    write(id: string, data: string): void {
      if (typeof window.kernelBase?.terminal?.write === 'function') {
        window.kernelBase.terminal.write(id, data);
      }
    },
    resize(id: string, cols: number, rows: number): void {
      if (typeof window.kernelBase?.terminal?.resize === 'function') {
        window.kernelBase.terminal.resize(id, cols, rows);
      }
    },
    close(id: string): void {
      if (typeof window.kernelBase?.terminal?.close === 'function') {
        window.kernelBase.terminal.close(id);
      } else if (typeof (window.kernelBase?.terminal as any)?.kill === 'function') {
        (window.kernelBase?.terminal as any).kill(id);
      }
    },
    onData(id: string, callback: (data: string) => void): () => void {
      if (typeof window.kernelBase?.terminal?.onData === 'function') {
        return window.kernelBase.terminal.onData(id, callback);
      }
      return () => {};
    },
  },

  git: {
    async status(cwd?: string): Promise<GitStatusResult> {
      try {
        if (typeof window.kernelBase?.git?.status === 'function') {
          const res: any = await window.kernelBase.git.status(cwd);
          if (res && res.gitState) {
            const state = res.gitState;
            return {
              branch: state.currentBranch || 'main',
              clean: (state.stagedFiles?.length || 0) === 0 && (state.unstagedFiles?.length || 0) === 0,
              staged: (state.stagedFiles || []).map((f: any) => typeof f === 'string' ? f : f.path),
              unstaged: (state.unstagedFiles || []).filter((f: any) => f.status !== '?').map((f: any) => typeof f === 'string' ? f : f.path),
              untracked: (state.unstagedFiles || []).filter((f: any) => f.status === '?').map((f: any) => typeof f === 'string' ? f : f.path),
              ahead: state.ahead || 0,
              behind: state.behind || 0,
            };
          }
          if (res && Array.isArray(res.staged)) return res;
        }
      } catch (e) {
        console.warn('Failed to query git status:', e);
      }
      return { branch: 'main', clean: true, staged: [], unstaged: [], untracked: [], ahead: 0, behind: 0 };
    },
    async stage(files: string[], cwd?: string): Promise<boolean> {
      if (typeof window.kernelBase?.git?.stage === 'function') return window.kernelBase.git.stage(files, cwd);
      return true;
    },
    async unstage(files: string[], cwd?: string): Promise<boolean> {
      if (typeof window.kernelBase?.git?.unstage === 'function') return window.kernelBase.git.unstage(files, cwd);
      return true;
    },
    async commit(message: string, cwd?: string): Promise<boolean> {
      if (typeof window.kernelBase?.git?.commit === 'function') return window.kernelBase.git.commit(message, cwd);
      return true;
    },
    async branches(cwd?: string): Promise<{ current: string; all: string[] }> {
      try {
        if (typeof window.kernelBase?.git?.branches === 'function') {
          const res: any = await window.kernelBase.git.branches(cwd);
          if (res && res.current && Array.isArray(res.all)) return res;
          if (res && Array.isArray(res.branches)) {
            const cur = res.branches.find((b: any) => b.current)?.name || 'main';
            const all = res.branches.map((b: any) => typeof b === 'string' ? b : b.name);
            return { current: cur, all };
          }
          if (res && res.gitState && Array.isArray(res.gitState.branches)) {
            const all = res.gitState.branches.map((b: any) => typeof b === 'string' ? b : b.name);
            return { current: res.gitState.currentBranch || 'main', all };
          }
        }
      } catch (e) {
        console.warn('Failed to query git branches:', e);
      }
      return { current: 'main', all: ['main', 'feature/multi-agent', 'develop'] };
    },
    async checkout(branch: string, cwd?: string): Promise<boolean> {
      if (typeof window.kernelBase?.git?.checkout === 'function') return window.kernelBase.git.checkout(branch, cwd);
      return true;
    },
    async diff(cwd?: string): Promise<string> {
      if (typeof window.kernelBase?.git?.diff === 'function') return window.kernelBase.git.diff(cwd);
      return '';
    },
    async push(cwd?: string): Promise<boolean> {
      if (typeof window.kernelBase?.git?.push === 'function') return window.kernelBase.git.push(cwd);
      return true;
    },
    async pull(cwd?: string): Promise<boolean> {
      if (typeof window.kernelBase?.git?.pull === 'function') return window.kernelBase.git.pull(cwd);
      return true;
    },
  },

  permissions: {
    async respond(id: string, approved: boolean, alwaysAllow?: boolean): Promise<void> {
      if (typeof window.kernelBase?.permissions?.respond === 'function') {
        return window.kernelBase.permissions.respond(id, approved, alwaysAllow);
      }
    },
    onRequest(callback: (request: PermissionRequest) => void): () => void {
      if (typeof window.kernelBase?.permissions?.onRequest === 'function') {
        return window.kernelBase.permissions.onRequest(callback);
      }
      return () => {};
    },
  },

  settings: {
    async get(): Promise<AppSettings> {
      if (typeof window.kernelBase?.settings?.get === 'function') return window.kernelBase.settings.get();
      return {
        theme: 'dark',
        fontSize: 13,
        tabSize: 2,
        wordWrap: true,
        autoSave: true,
        defaultModel: 'claude-3-7-sonnet',
        autoApproveSafeTools: true,
      };
    },
    async save(settings: Partial<AppSettings>): Promise<boolean> {
      if (typeof window.kernelBase?.settings?.save === 'function') return window.kernelBase.settings.save(settings);
      return true;
    },
    async getKeychainSecret(service: string, account: string): Promise<string | null> {
      if (typeof window.kernelBase?.settings?.getKeychainSecret === 'function') {
        return window.kernelBase.settings.getKeychainSecret(service, account);
      }
      return null;
    },
    async setKeychainSecret(service: string, account: string, secret: string): Promise<boolean> {
      if (typeof window.kernelBase?.settings?.setKeychainSecret === 'function') {
        return window.kernelBase.settings.setKeychainSecret(service, account, secret);
      }
      return true;
    },
  },

  workspace: {
    async get(): Promise<WorkspaceConfig> {
      try {
        if (typeof window.kernelBase?.workspace?.get === 'function') {
          return await window.kernelBase.workspace.get();
        }
      } catch (e) {
        console.warn('Workspace get fallback:', e);
      }
      return {
        rootPath: typeof process !== 'undefined' && process.cwd ? process.cwd() : '/workspace',
        name: 'Kernel Base Workspace',
        projectType: 'node',
      };
    },
    async set(newPath: string): Promise<WorkspaceConfig> {
      try {
        if (typeof window.kernelBase?.workspace?.set === 'function') {
          return await window.kernelBase.workspace.set(newPath);
        }
      } catch (e) {
        console.warn('Workspace set fallback:', e);
      }
      return { rootPath: newPath, name: 'Project', projectType: 'generic' };
    },
    async getRecent(): Promise<string[]> {
      if (typeof window.kernelBase?.workspace?.getRecent === 'function') {
        return window.kernelBase.workspace.getRecent();
      }
      return [];
    },
  },

  indexing: {
    async search(query: string, options?: any): Promise<SearchResultItem[]> {
      if (typeof window.kernelBase?.indexing?.search === 'function') {
        return window.kernelBase.indexing.search(query, options);
      }
      return [];
    },
    async quickOpen(query: string): Promise<string[]> {
      if (typeof window.kernelBase?.indexing?.quickOpen === 'function') {
        return window.kernelBase.indexing.quickOpen(query);
      }
      return [];
    },
  },

  cli: {
    async detect(): Promise<Record<string, { installed: boolean; path?: string; version?: string }>> {
      if (typeof window.kernelBase?.cli?.detect === 'function') {
        return window.kernelBase.cli.detect();
      }
      return {
        agy: { installed: true, path: '/usr/local/bin/agy', version: '2.0.0' },
        git: { installed: true, path: '/usr/bin/git', version: '2.39.0' },
        node: { installed: true, path: '/usr/local/bin/node', version: 'v20.10.0' },
      };
    },
    async run(cli: string, args: string[], cwd?: string): Promise<{ code: number; stdout: string; stderr: string }> {
      if (typeof window.kernelBase?.cli?.run === 'function') {
        return window.kernelBase.cli.run(cli, args, cwd);
      }
      return { code: 0, stdout: 'CLI executed successfully', stderr: '' };
    },
  },
};
