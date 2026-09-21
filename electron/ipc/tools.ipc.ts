import { ipcMain, BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import util from 'node:util';
import { ToolDefinition } from '../../src/types/ide';
import { checkOrRequestPermission } from './permissions.ipc';

const execAsync = util.promisify(exec);

export const REGISTERED_TOOLS: ToolDefinition[] = [
  {
    name: 'readFile',
    description: 'Read the contents of a file in the workspace.',
    category: 'filesystem',
    permission: 'always',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Relative or absolute path to the file.' },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'writeFile',
    description: 'Create or overwrite a file in the workspace.',
    category: 'filesystem',
    permission: 'ask',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Relative or absolute path to the file.' },
        content: { type: 'string', description: 'The entire file content to write.' },
      },
      required: ['filePath', 'content'],
    },
  },
  {
    name: 'editFile',
    description: 'Edit a specific block of text in an existing file.',
    category: 'filesystem',
    permission: 'ask',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'File path to edit.' },
        targetContent: { type: 'string', description: 'Target string to find.' },
        replacementContent: { type: 'string', description: 'Replacement string.' },
      },
      required: ['filePath', 'targetContent', 'replacementContent'],
    },
  },
  {
    name: 'searchFiles',
    description: 'Search for text or regex across workspace files.',
    category: 'search',
    permission: 'always',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term or regex pattern.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'runCommand',
    description: 'Execute a terminal command within the workspace directory.',
    category: 'terminal',
    permission: 'ask',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Shell command to execute.' },
      },
      required: ['command'],
    },
  },
  {
    name: 'runTests',
    description: 'Execute workspace test suite.',
    category: 'diagnostics',
    permission: 'ask',
    parameters: {
      type: 'object',
      properties: {
        testFilter: { type: 'string', description: 'Optional specific test pattern.' },
      },
    },
  },
  {
    name: 'gitStatus',
    description: 'Get current Git working tree status.',
    category: 'git',
    permission: 'always',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'gitDiff',
    description: 'Get current Git diff.',
    category: 'git',
    permission: 'always',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Optional file path for diff.' },
      },
    },
  },
];

export function registerToolsIPC(mainWindow: BrowserWindow) {
  ipcMain.handle('tools:list', async () => {
    return { success: true, tools: REGISTERED_TOOLS };
  });

  ipcMain.handle('tools:execute', async (_, toolName: string, parameters: any, workspacePath: string) => {
    return executeAgentTool(mainWindow, toolName, parameters, workspacePath);
  });
}

export async function executeAgentTool(
  mainWindow: BrowserWindow,
  toolName: string,
  parameters: any,
  workspacePath: string
): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    switch (toolName) {
      case 'readFile': {
        const fullPath = path.isAbsolute(parameters.filePath)
          ? parameters.filePath
          : path.join(workspacePath, parameters.filePath);

        const allowed = await checkOrRequestPermission(mainWindow, 'readFile', {
          toolName: 'readFile',
          description: `Agent wants to read ${path.relative(workspacePath, fullPath)}`,
          filePath: fullPath,
        });
        if (!allowed) return { success: false, error: 'Permission denied by user' };

        const content = await fs.promises.readFile(fullPath, 'utf-8');
        return { success: true, result: { content, path: fullPath } };
      }

      case 'writeFile': {
        const fullPath = path.isAbsolute(parameters.filePath)
          ? parameters.filePath
          : path.join(workspacePath, parameters.filePath);

        let oldContent = '';
        try {
          oldContent = await fs.promises.readFile(fullPath, 'utf-8');
        } catch {
          // New file
        }

        const allowed = await checkOrRequestPermission(mainWindow, 'writeFile', {
          toolName: 'writeFile',
          description: `Agent wants to write to ${path.relative(workspacePath, fullPath)}`,
          filePath: fullPath,
          diff: { oldContent, newContent: parameters.content },
        });
        if (!allowed) return { success: false, error: 'Permission denied by user' };

        await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.promises.writeFile(fullPath, parameters.content, 'utf-8');
        return { success: true, result: { path: fullPath, size: parameters.content.length } };
      }

      case 'editFile': {
        const fullPath = path.isAbsolute(parameters.filePath)
          ? parameters.filePath
          : path.join(workspacePath, parameters.filePath);

        const oldContent = await fs.promises.readFile(fullPath, 'utf-8');
        if (!oldContent.includes(parameters.targetContent)) {
          return { success: false, error: 'Target content not found in file' };
        }
        const newContent = oldContent.replace(parameters.targetContent, parameters.replacementContent);

        const allowed = await checkOrRequestPermission(mainWindow, 'writeFile', {
          toolName: 'editFile',
          description: `Agent wants to modify ${path.relative(workspacePath, fullPath)}`,
          filePath: fullPath,
          diff: { oldContent, newContent },
        });
        if (!allowed) return { success: false, error: 'Permission denied by user' };

        await fs.promises.writeFile(fullPath, newContent, 'utf-8');
        return { success: true, result: { path: fullPath } };
      }

      case 'runCommand': {
        const command = parameters.command;
        const isDangerous =
          command.includes('rm ') ||
          command.includes('sudo') ||
          command.includes('dd ') ||
          command.includes('chmod') ||
          command.includes('mkfs');

        const allowed = await checkOrRequestPermission(mainWindow, 'runCommand', {
          toolName: 'runCommand',
          description: `Agent wants to execute: ${command}`,
          command,
          isDangerous,
        });
        if (!allowed) return { success: false, error: 'Permission denied by user' };

        const res = await execAsync(command, {
          cwd: workspacePath,
          env: { ...process.env, LANG: 'en_US.UTF-8' },
          maxBuffer: 5 * 1024 * 1024,
        });
        return { success: true, result: { stdout: res.stdout, stderr: res.stderr } };
      }

      case 'runTests': {
        const allowed = await checkOrRequestPermission(mainWindow, 'runCommand', {
          toolName: 'runTests',
          description: `Agent wants to run test suite`,
          command: 'npm test',
        });
        if (!allowed) return { success: false, error: 'Permission denied by user' };

        try {
          const res = await execAsync('npm test', { cwd: workspacePath });
          return { success: true, result: { output: res.stdout, passed: true } };
        } catch (err: any) {
          return { success: true, result: { output: err.stdout || err.stderr || err.message, passed: false } };
        }
      }

      case 'gitStatus': {
        const res = await execAsync('git status --porcelain', { cwd: workspacePath });
        return { success: true, result: { status: res.stdout } };
      }

      case 'gitDiff': {
        const fileArg = parameters.filePath ? `"${parameters.filePath}"` : '';
        const res = await execAsync(`git diff ${fileArg}`, { cwd: workspacePath });
        return { success: true, result: { diff: res.stdout } };
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
