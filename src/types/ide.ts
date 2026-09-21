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
  | 'waiting_permission'
  | 'reviewing'
  | 'debugging'
  | 'done'
  | 'error';

export interface AgentInfo {
  id: string;
  role: AgentRole;
  name: string;
  avatar: string;
  description: string;
  state: AgentState;
  currentTask?: string;
  progress?: number;
  tokensUsed?: number;
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  assignedRole: AgentRole;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
  dependsOn?: string[];
  toolCalls?: ToolInvocation[];
  output?: string;
  error?: string;
}

export interface ExecutionPlan {
  id: string;
  goal: string;
  steps: PlanStep[];
  status: 'planning' | 'ready' | 'running' | 'paused' | 'completed' | 'failed';
  createdAt: number;
}

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
  oldContent: string;
  newContent: string;
  status: 'modified' | 'created' | 'deleted';
  accepted?: boolean;
}

export interface PermissionRequest {
  id: string;
  agentRole: AgentRole;
  toolName: string;
  description: string;
  command?: string;
  filePath?: string;
  diff?: FileDiff;
  dangerLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected';
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
  theme: 'dark' | 'light';
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
