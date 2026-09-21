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
    };
  }
}

// Fallback in-memory state if loaded in browser
const isElectron = typeof window !== 'undefined' && !!window.kernelBase;

export const api = {
  isElectron,

  fs: {
    async readFile(filePath: string): Promise<string> {
      if (window.kernelBase?.fs) return window.kernelBase.fs.readFile(filePath);
      return `// Standalone preview for ${filePath}\nconsole.log("Kernel Base IDE is running!");\n`;
    },
    async writeFile(filePath: string, content: string): Promise<boolean> {
      if (window.kernelBase?.fs) return window.kernelBase.fs.writeFile(filePath, content);
      return true;
    },
    async readDir(dirPath: string, recursive: boolean = true): Promise<FileEntry[]> {
      if (window.kernelBase?.fs) return window.kernelBase.fs.readDir(dirPath, recursive);
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
      if (window.kernelBase?.fs) return window.kernelBase.fs.createDir(dirPath);
      return true;
    },
    async deletePath(targetPath: string): Promise<boolean> {
      if (window.kernelBase?.fs) return window.kernelBase.fs.deletePath(targetPath);
      return true;
    },
    async renamePath(oldPath: string, newPath: string): Promise<boolean> {
      if (window.kernelBase?.fs) return window.kernelBase.fs.renamePath(oldPath, newPath);
      return true;
    },
  },

  agents: {
    async listAgents(): Promise<AgentInfo[]> {
      if (window.kernelBase?.agents) return window.kernelBase.agents.listAgents();
      return [
        { id: '1', role: 'orchestrator', name: 'Orchestrator', avatar: '🧠', description: 'Swarm coordinator & workflow engine', state: 'idle' },
        { id: '2', role: 'planner', name: 'Planner', avatar: '📐', description: 'DAG architecture & decomposition', state: 'idle' },
        { id: '3', role: 'coder', name: 'Coder', avatar: '💻', description: 'Code synthesis & AST refactoring', state: 'idle' },
        { id: '4', role: 'tester', name: 'Tester', avatar: '🧪', description: 'Automated test suites & regressions', state: 'idle' },
        { id: '5', role: 'reviewer', name: 'Reviewer', avatar: '👁️', description: 'Quality, safety & diff validation', state: 'idle' },
        { id: '6', role: 'debugger', name: 'Debugger', avatar: '🩺', description: 'Stack trace & root cause triage', state: 'idle' },
        { id: '7', role: 'researcher', name: 'Researcher', avatar: '🔍', description: 'Local code indexing & doc exploration', state: 'idle' },
      ];
    },
    async submitGoal(goal: string): Promise<ExecutionPlan> {
      if (window.kernelBase?.agents) return window.kernelBase.agents.submitGoal(goal);
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
      if (window.kernelBase?.agents) return window.kernelBase.agents.runStep(stepId);
      return { success: true };
    },
    onPlanUpdate(callback: (plan: ExecutionPlan) => void): () => void {
      if (window.kernelBase?.agents) return window.kernelBase.agents.onPlanUpdate(callback);
      return () => {};
    },
    onAgentThought(callback: (data: { role: string; text: string }) => void): () => void {
      if (window.kernelBase?.agents) return window.kernelBase.agents.onAgentThought(callback);
      return () => {};
    },
  },

  terminal: {
    async create(id: string, cwd?: string): Promise<string> {
      if (window.kernelBase?.terminal) return window.kernelBase.terminal.create(id, cwd);
      return id;
    },
    write(id: string, data: string): void {
      if (window.kernelBase?.terminal) window.kernelBase.terminal.write(id, data);
    },
    resize(id: string, cols: number, rows: number): void {
      if (window.kernelBase?.terminal) window.kernelBase.terminal.resize(id, cols, rows);
    },
    close(id: string): void {
      if (window.kernelBase?.terminal) window.kernelBase.terminal.close(id);
    },
    onData(id: string, callback: (data: string) => void): () => void {
      if (window.kernelBase?.terminal) return window.kernelBase.terminal.onData(id, callback);
      return () => {};
    },
  },

  git: {
    async status(cwd?: string): Promise<GitStatusResult> {
      if (window.kernelBase?.git) return window.kernelBase.git.status(cwd);
      return { branch: 'main', clean: true, staged: [], unstaged: [], untracked: [], ahead: 0, behind: 0 };
    },
    async stage(files: string[], cwd?: string): Promise<boolean> {
      if (window.kernelBase?.git) return window.kernelBase.git.stage(files, cwd);
      return true;
    },
    async unstage(files: string[], cwd?: string): Promise<boolean> {
      if (window.kernelBase?.git) return window.kernelBase.git.unstage(files, cwd);
      return true;
    },
    async commit(message: string, cwd?: string): Promise<boolean> {
      if (window.kernelBase?.git) return window.kernelBase.git.commit(message, cwd);
      return true;
    },
    async branches(cwd?: string): Promise<{ current: string; all: string[] }> {
      if (window.kernelBase?.git) return window.kernelBase.git.branches(cwd);
      return { current: 'main', all: ['main', 'feature/multi-agent', 'develop'] };
    },
    async checkout(branch: string, cwd?: string): Promise<boolean> {
      if (window.kernelBase?.git) return window.kernelBase.git.checkout(branch, cwd);
      return true;
    },
    async diff(cwd?: string): Promise<string> {
      if (window.kernelBase?.git) return window.kernelBase.git.diff(cwd);
      return '';
    },
    async push(cwd?: string): Promise<boolean> {
      if (window.kernelBase?.git) return window.kernelBase.git.push(cwd);
      return true;
    },
    async pull(cwd?: string): Promise<boolean> {
      if (window.kernelBase?.git) return window.kernelBase.git.pull(cwd);
      return true;
    },
  },

  permissions: {
    async respond(id: string, approved: boolean, alwaysAllow?: boolean): Promise<void> {
      if (window.kernelBase?.permissions) return window.kernelBase.permissions.respond(id, approved, alwaysAllow);
    },
    onRequest(callback: (request: PermissionRequest) => void): () => void {
      if (window.kernelBase?.permissions) return window.kernelBase.permissions.onRequest(callback);
      return () => {};
    },
  },

  settings: {
    async get(): Promise<AppSettings> {
      if (window.kernelBase?.settings) return window.kernelBase.settings.get();
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
      if (window.kernelBase?.settings) return window.kernelBase.settings.save(settings);
      return true;
    },
    async getKeychainSecret(service: string, account: string): Promise<string | null> {
      if (window.kernelBase?.settings) return window.kernelBase.settings.getKeychainSecret(service, account);
      return null;
    },
    async setKeychainSecret(service: string, account: string, secret: string): Promise<boolean> {
      if (window.kernelBase?.settings) return window.kernelBase.settings.setKeychainSecret(service, account, secret);
      return true;
    },
  },

  workspace: {
    async get(): Promise<WorkspaceConfig> {
      if (window.kernelBase?.workspace) return window.kernelBase.workspace.get();
      return { rootPath: process.cwd ? process.cwd() : '/workspace', name: 'Kernel Base Workspace', projectType: 'node' };
    },
    async set(newPath: string): Promise<WorkspaceConfig> {
      if (window.kernelBase?.workspace) return window.kernelBase.workspace.set(newPath);
      return { rootPath: newPath, name: 'Project', projectType: 'generic' };
    },
    async getRecent(): Promise<string[]> {
      if (window.kernelBase?.workspace) return window.kernelBase.workspace.getRecent();
      return [];
    },
  },

  indexing: {
    async search(query: string, options?: any): Promise<SearchResultItem[]> {
      if (window.kernelBase?.indexing) return window.kernelBase.indexing.search(query, options);
      return [];
    },
    async quickOpen(query: string): Promise<string[]> {
      if (window.kernelBase?.indexing) return window.kernelBase.indexing.quickOpen(query);
      return [];
    },
  },

  cli: {
    async detect(): Promise<Record<string, { installed: boolean; path?: string; version?: string }>> {
      if (window.kernelBase?.cli) return window.kernelBase.cli.detect();
      return {
        agy: { installed: true, path: '/usr/local/bin/agy', version: '2.0.0' },
        git: { installed: true, path: '/usr/bin/git', version: '2.39.0' },
        node: { installed: true, path: '/usr/local/bin/node', version: 'v20.10.0' },
      };
    },
    async run(cli: string, args: string[], cwd?: string): Promise<{ code: number; stdout: string; stderr: string }> {
      if (window.kernelBase?.cli) return window.kernelBase.cli.run(cli, args, cwd);
      return { code: 0, stdout: 'CLI executed successfully', stderr: '' };
    },
  },
};
