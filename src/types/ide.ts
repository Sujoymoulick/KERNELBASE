export type AgentRole =
  | 'orchestrator'
  | 'planner'
  | 'coder'
  | 'tester'
  | 'reviewer'
  | 'debugger'
  | 'researcher';

export type AgentState =
  | 'idle'
  | 'planning'
  | 'executing'
  | 'running'
  | 'waiting_permission'
  | 'reviewing'
  | 'debugging'
  | 'done'
  | 'success'
  | 'failed'
  | 'paused'
  | 'error';

export interface AgentToolCall {
  id: string;
  tool: string;
  params: Record<string, any>;
  result?: any;
  status: 'pending' | 'running' | 'success' | 'failed';
  timestamp: number;
}

export interface AgentInfo {
  id: string;
  role: AgentRole;
  name: string;
  avatar?: string;
  description?: string;
  state?: AgentState;
  status?: 'idle' | 'running' | 'success' | 'failed' | 'paused';
  currentAction?: string;
  currentTask?: string;
  progress?: number;
  tokensUsed?: number;
  reasoningSummary?: string;
  errors?: string[];
  toolCalls?: AgentToolCall[];
  filesChanged?: string[];
  terminalCommands?: string[];
  output?: string;
  startedAt?: number;
}

export interface TaskPlanStep {
  id: string;
  title: string;
  description: string;
  assignedRole?: AgentRole;
  role?: AgentRole;
  agentRole?: AgentRole;
  status: 'pending' | 'in_progress' | 'running' | 'completed' | 'failed' | 'blocked' | 'skipped';
  dependsOn?: string[];
  toolCalls?: AgentToolCall[] | ToolInvocation[];
  output?: string;
  error?: string;
}

export type PlanStep = TaskPlanStep;

export interface ToolInvocation {
  id: string;
  toolName: string;
  args: Record<string, any>;
  result?: any;
  error?: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'permission_required';
  startedAt?: number;
  completedAt?: number;
}

export interface FileDiff {
  path: string;
  filePath?: string;
  oldContent: string;
  newContent: string;
  status: 'pending' | 'modified' | 'created' | 'deleted';
  accepted?: boolean;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  mode: 'ask' | 'plan' | 'build' | 'review' | 'debug';
  status: 'planning' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  agents: AgentRole[];
  plan: TaskPlanStep[];
  files: string[];
  commands: string[];
  diffs: FileDiff[];
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ActivityEvent {
  id?: string;
  type: string;
  taskId?: string;
  task?: AgentTask;
  agentRole?: AgentRole;
  agentName?: string;
  action?: string;
  details?: any;
  data?: any;
  timestamp?: number;
}

export interface ExecutionPlan {
  id: string;
  goal: string;
  steps: TaskPlanStep[];
  status: 'planning' | 'ready' | 'running' | 'paused' | 'completed' | 'failed';
  createdAt: number;
}

export interface PermissionRequest {
  id: string;
  toolName: string;
  description: string;
  agentRole?: AgentRole;
  command?: string;
  filePath?: string;
  diff?: FileDiff;
  dangerLevel?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'approved' | 'rejected';
  details?: Record<string, any>;
  createdAt: number;
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  updatedAt?: number;
  children?: FileEntry[];
}

export interface EditorTab {
  id: string;
  path: string;
  name: string;
  content: string;
  language: string;
  isDirty: boolean;
  savedContent: string;
}

export interface GitStatusResult {
  branch: string;
  clean: boolean;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  ahead: number;
  behind: number;
}

export interface TerminalSession {
  id: string;
  title: string;
  cwd: string;
}

export interface DiagnosticItem {
  id: string;
  filePath: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source?: string;
}

export interface SearchResultItem {
  filePath: string;
  line: number;
  text: string;
  preview: string;
}

export interface WorkspaceConfig {
  rootPath: string;
  name: string;
  projectType: 'node' | 'rust' | 'python' | 'go' | 'generic';
  gitRoot?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | string;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  autoSave: boolean;
  defaultModel: string;
  apiKeyOpenAI?: string;
  apiKeyAnthropic?: string;
  apiKeyGemini?: string;
  ollamaUrl?: string;
  autoApproveSafeTools: boolean;
}

export interface WorkspaceSettings {
  theme: 'dark' | 'light' | string;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  formatOnSave: boolean;
  defaultShell: string;
  terminalFontSize: number;
  autoSave: 'off' | 'afterDelay' | 'onFocusChange' | 'onWindowChange' | boolean;
  agentAutoApproveRead: boolean;
  agentAutoApproveSafeCommands: boolean;
  activeModelId: string;
  models: Array<{
    id: string;
    name: string;
    provider: 'google' | 'anthropic' | 'openai' | 'ollama' | 'local';
    modelId: string;
    isActive: boolean;
    baseUrl?: string;
  }>;
}

export interface CLIAdapterInfo {
  id: string;
  name: string;
  executable: string;
  isInstalled: boolean;
  status: 'ready' | 'missing' | 'error';
  description: string;
  version?: string;
  path?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: 'filesystem' | 'terminal' | 'git' | 'indexing' | 'diagnostics' | 'web' | 'search';
  permission: 'always' | 'ask' | 'never';
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ProjectInfo {
  name: string;
  language: string;
  path?: string;
  framework?: string;
  packageManager?: string;
  runtime?: string;
  testFramework?: string;
  isGit: boolean;
  scripts?: Record<string, string>;
  dependenciesCount?: number;
}

// Compiler & Runner Types
export interface ToolchainInfo {
  language: string;
  compiler: string;
  isAvailable: boolean;
  version?: string;
  path?: string;
}

export interface RunExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  command: string;
  durationMs: number;
  diagnostics?: DiagnosticItem[];
}

// VS Code Extension Types
export interface ExtensionItem {
  id: string;
  namespace: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  publisher: string;
  iconUrl?: string;
  downloads?: number;
  rating?: number;
  categories?: string[];
  isInstalled?: boolean;
  isEnabled?: boolean;
  installPath?: string;
}
