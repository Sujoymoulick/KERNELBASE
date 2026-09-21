# Kernel Base Architecture & Desktop Design

Kernel Base is a state-of-the-art, AI-native multi-agent development environment built natively for macOS.

## System Topology

```
+-----------------------------------------------------------------------------+
|                                 macOS Host                                  |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| |                           Kernel Base IDE                               | |
| |                                                                         | |
| |  +-------------------------------------------------------------------+  | |
| |  |                     Renderer (React + Monaco)                     |  | |
| |  |                                                                   |  | |
| |  |  +--------------------+  +------------------+  +---------------+  |  | |
| |  |  |  Project Explorer  |  |  Editor / Tabs   |  |  Agent Panel  |  |  | |
| |  |  +--------------------+  +------------------+  +---------------+  |  | |
| |  |  |  Git Control       |  |  Diff Inspector  |  |  xterm.js     |  |  | |
| |  |  +--------------------+  +------------------+  +---------------+  |  | |
| |  +-----------------------------------|-------------------------------+  | |
| |                                      | IPC Bridge (contextBridge)       | |
| |  +-----------------------------------|-------------------------------+  | |
| |  |                     Electron Main Process                         |  | |
| |  |                                                                   |  | |
| |  |  +-----------------+  +-------------------+  +-----------------+  |  | |
| |  |  |  Agent Runtime  |  | Tool Execution Eng|  | Safety & Perms  |  |  | |
| |  |  +-----------------+  +-------------------+  +-----------------+  |  | |
| |  |  |  PTY / Terminal |  | Git Porcelain CLI |  | Keychain Sec    |  |  | |
| |  |  +-----------------+  +-------------------+  +-----------------+  |  | |
| |  +-------------------------------------------------------------------+  | |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

## Core Subsystems

1. **Agent Engine (`electron/ipc/agents.ipc.ts`)**:
   - Orchestrates seven specialized roles: **Orchestrator**, **Planner**, **Coder**, **Tester**, **Reviewer**, **Debugger**, and **Researcher**.
   - DAG task planning and asynchronous step execution.
   - Streamed thought output, tool call dispatch, and multi-agent messaging.

2. **Tool Execution Engine (`electron/ipc/tools.ipc.ts`)**:
   - High-performance, sandboxed tool runner exposing `readFile`, `writeFile`, `editFile`, `runCommand`, `runTests`, `searchFiles`, `gitStatus`, and `gitDiff`.

3. **Security & Permission Broker (`electron/ipc/permissions.ipc.ts`)**:
   - Interactive permission gates for destructive disk operations, external process executions, and network requests.
   - Regex-based danger analyzer detecting `rm -rf`, `sudo`, `mkfs`, fork bombs, and dangerous piping.

4. **Terminal Subsystem (`electron/ipc/terminal.ipc.ts`)**:
   - Node PTY / shell child process manager with stream piping directly into xterm.js terminals.

5. **Monaco Editor Integration (`src/editor/CodeEditor.tsx`)**:
   - Custom `kernelbase-dark` theme with warm ember accents (`#752c12`, `#a64011`).
   - Integrated dirty indicators, keyboard shortcuts (`Cmd+S`, `Cmd+P`, `Cmd+Shift+P`), and syntax highlighting.
