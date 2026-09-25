# Kernel Base Architecture & Desktop Design

Kernel Base is a state-of-the-art, Linux-first AI-native multi-agent development environment built natively with Electron, React, and Node.js.

> [!NOTE]
> For the complete, authoritative specification, see the [Linux Desktop Application Architecture Specification](file:///D:/Games/Kernelbase/KERNELBASE_som/docs/architecture/linux-electron-architecture.md).

## System Topology

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         KERNEL BASE                                  │
│                    Linux AI-Native IDE                              │
├──────────────────────────────────────────────────────────────────────┤
│                         ELECTRON APP                                │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                     RENDERER PROCESS                           │  │
│  │                                                                │  │
│  │ React + TypeScript                                             │  │
│  │ ├── Code Editor (Monaco)                                       │  │
│  │ ├── Project Explorer                                           │  │
│  │ ├── Terminal (xterm.js)                                        │  │
│  │ ├── Agent & Task Workspace                                     │  │
│  │ ├── Model Manager & Report Workspace                           │  │
│  │ └── Git Workspace                                              │  │
│  └──────────────────────────┬─────────────────────────────────────┘  │
│                             │ Secure Typed IPC                       │
│  ┌──────────────────────────▼─────────────────────────────────────┐  │
│  │               PRELOAD API (contextBridge)                       │  │
│  └──────────────────────────┬─────────────────────────────────────┘  │
│                             │                                        │
│  ┌──────────────────────────▼─────────────────────────────────────┐  │
│  │                     MAIN PROCESS (Node.js)                     │  │
│  │                                                                │  │
│  │  Kernel Core: Task Manager | Agent Orchestrator | Task DAG     │  │
│  │  Model Gateway | Tool Runtime | Sandbox Manager | Report Engine│  │
│  └───────────────┬──────────────────────┬─────────────────────────┘  │
│                  │                      │                            │
│             Node Services          AI Services (Model Gateway)       │
│             Filesystem / PTY           Cloud | Custom | Local (Ollama)│
├──────────────────────────────────────────────────────────────────────┤
│                         LINUX RUNTIME & SANDBOX                      │
│             bubblewrap | namespaces | seccomp | cgroups              │
├──────────────────────────────────────────────────────────────────────┤
│                         DATA LAYER (SQLite)                          │
└──────────────────────────────────────────────────────────────────────┘
```

## Core Subsystems

1. **Agent Engine & Swarm Orchestrator (`packages/agents`, `electron/ipc/agents.ipc.ts`)**:
   - 12 Specialized Agent Roles: Planner, Research, Coding, Debugger, Testing, Code Review, Security, UI/UX, DevOps, Documentation, Data, and Report Agents.
   - Task DAG Engine for parallel execution, dependency routing, and failure recovery.

2. **Tool Execution & Sandbox Layer (`packages/tools`, `packages/sandbox`)**:
   - Controlled tool runtime exposing filesystem, terminal, git, package manager, and MCP servers.
   - Linux-native process isolation using `bubblewrap`, namespaces, seccomp, and cgroups.

3. **Model Gateway (`packages/model-gateway`)**:
   - Provider-agnostic gateway supporting Cloud LLMs, Custom OpenAI-compatible endpoints, and Local Models (Ollama, Hugging Face, `llama.cpp`).

4. **Security & Human Approval System (`packages/security`)**:
   - Multi-tier permission policy engine enforcing human-in-the-loop approval for high-risk actions.

5. **Report Engine & Workspace (`packages/reports`)**:
   - Aggregates structured execution logs, diffs, test results, and security audits into dedicated Report Workspaces.

6. **SQLite Local State (`packages/database`)**:
   - Persistent local database managing projects, task DAGs, agent runs, artifacts, usage metrics, and audit logs.

