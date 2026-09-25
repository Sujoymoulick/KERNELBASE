# Kernel Base — Linux Desktop Application Architecture

**Platform:** Linux only  
**Desktop Framework:** Electron  
**Frontend:** React + TypeScript  
**Status:** Architecture Specification  
**Updated:** September 2026

---

## 1. Overview

Kernel Base is a Linux-first, AI-native, multi-agent desktop IDE.

The application combines:

- A full developer IDE
- Multi-agent task execution
- Agent teams
- Task DAG orchestration
- Cloud LLM providers
- Custom LLM gateways
- Local open-source models
- Ollama / Hugging Face / llama.cpp integrations
- Linux-native terminal and process execution
- Controlled tool execution
- Sandboxing and permission policies
- SQLite-based local state
- Usage and resource limits
- Verification and review agents
- A dedicated Report Workspace
- Optional company / organization controls

The core product model is:

```text
User
  ↓
Electron Desktop IDE
  ↓
Task Interface
  ↓
Agent Orchestrator
  ↓
Task Graph / DAG
  ↓
Agent Team
  ↓
Model Gateway + Tool Runtime
  ↓
Linux Execution / Sandbox
  ↓
Verification
  ↓
Report Engine
  ↓
Report Workspace
```

Kernel Base should be treated as an **AI execution platform inside a desktop IDE**, rather than simply an IDE with an integrated chatbot.

---

# 2. Architecture Goals

The architecture should provide:

1. **Linux-native execution**
2. **Provider-agnostic AI models**
3. **Pluggable agents**
4. **Controlled tool execution**
5. **Local-model support**
6. **Strong permission boundaries**
7. **Observable agent execution**
8. **Resource and AI usage limits**
9. **Reliable task orchestration**
10. **Structured artifacts and reports**
11. **Local-first project state**
12. **Extensibility for companies and teams**

---

# 3. High-Level Architecture

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
│  │                                                                │  │
│  │ ├── Code Editor                                                │  │
│  │ ├── Project Explorer                                           │  │
│  │ ├── Terminal                                                    │  │
│  │ ├── Agent Workspace                                             │  │
│  │ ├── Task Workspace                                              │  │
│  │ ├── Model Manager                                               │  │
│  │ ├── Report Workspace                                            │  │
│  │ ├── Git Workspace                                               │  │
│  │ └── Settings / Organization                                    │  │
│  │                                                                │  │
│  └──────────────────────────┬─────────────────────────────────────┘  │
│                             │                                        │
│                       Secure IPC                                    │
│                             │                                        │
│  ┌──────────────────────────▼─────────────────────────────────────┐  │
│  │                       PRELOAD                                  │  │
│  │                                                                │  │
│  │ contextBridge                                                  │  │
│  │ Typed IPC API                                                  │  │
│  │ Permission Boundary                                             │  │
│  └──────────────────────────┬─────────────────────────────────────┘  │
│                             │                                        │
│  ┌──────────────────────────▼─────────────────────────────────────┐  │
│  │                     MAIN PROCESS                               │  │
│  │                         Node.js                                │  │
│  │                                                                │  │
│  │ ┌───────────────────────────────────────────────────────────┐  │  │
│  │ │                    KERNEL CORE                             │  │  │
│  │ │                                                           │  │  │
│  │ │ Task Manager                                              │  │  │
│  │ │ Agent Orchestrator                                        │  │  │
│  │ │ Task DAG Engine                                           │  │  │
│  │ │ Model Gateway                                              │  │  │
│  │ │ Tool Runtime                                               │  │  │
│  │ │ Local Model Manager                                        │  │  │
│  │ │ Permission Engine                                          │  │  │
│  │ │ Sandbox Manager                                            │  │  │
│  │ │ Report Engine                                              │  │  │
│  │ │ Event Bus                                                  │  │  │
│  │ └───────────────────────────────────────────────────────────┘  │  │
│  │                                                                │  │
│  └───────────────┬──────────────────────┬─────────────────────────┘  │
│                  │                      │                            │
├──────────────────┼──────────────────────┼────────────────────────────┤
│                  │                      │                            │
│             NODE SERVICES          AI SERVICES                       │
│                  │                      │                            │
│       ┌──────────┼──────────┐           │                            │
│       ▼          ▼          ▼           ▼                            │
│   Filesystem   Git        PTY      Model Gateway                    │
│   Processes   CLI      Terminal          │                           │
│                                      ┌───┼─────────────┐              │
│                                      ▼   ▼             ▼              │
│                                    Cloud Custom      Local            │
│                                    Models Gateway     Models           │
│                                                        │              │
│                                             ┌──────────┼─────────┐    │
│                                             ▼          ▼         ▼    │
│                                           Ollama      HF      llama.cpp│
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                         LINUX RUNTIME                                │
│                                                                      │
│  Filesystem │ Processes │ PTY │ Signals │ Network │ GPU │ Git       │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                       SECURITY LAYER                                 │
│                                                                      │
│  Permission Engine                                                   │
│         ↓                                                            │
│  Human Approval                                                      │
│         ↓                                                            │
│  Sandbox                                                             │
│    ├── bubblewrap                                                    │
│    ├── namespaces                                                    │
│    ├── seccomp                                                       │
│    ├── cgroups                                                       │
│    └── network isolation                                             │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                         DATA LAYER                                   │
│                                                                      │
│                         SQLite                                       │
│                                                                      │
│ Projects │ Tasks │ Agents │ DAG │ Artifacts │ Reports │ Audit       │
│                                                                      │
│                         Secret Store                                 │
│                         API Keys                                     │
│                         Tokens                                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

# 4. Electron Architecture

Kernel Base uses Electron as the Linux desktop runtime.

The application is divided into three primary Electron layers:

```text
React Renderer
      ↓
Preload / contextBridge
      ↓
Electron Main / Node.js
```

## 4.1 Renderer Process

The renderer is responsible for the visual IDE experience.

Responsibilities:

- UI
- Workspace navigation
- Editor
- Project explorer
- Terminal interface
- Agent visualization
- Task visualization
- Model management UI
- Report visualization
- Git UI
- Settings
- Architecture explorer

The renderer must not receive unrestricted Node.js access.

It should not directly:

- Spawn arbitrary processes
- Read arbitrary files
- Access API keys
- Execute shell commands
- Control local model runtimes
- Modify system configuration

All privileged operations go through the preload API and Electron IPC.

---

## 4.2 Preload Layer

The preload layer creates the controlled API between the renderer and Electron Main.

Example:

```ts
window.kernelBase.tasks.create()
window.kernelBase.tasks.run()

window.kernelBase.agents.list()
window.kernelBase.agents.stop()

window.kernelBase.models.list()
window.kernelBase.models.install()

window.kernelBase.files.read()
window.kernelBase.files.write()

window.kernelBase.terminal.create()
window.kernelBase.terminal.write()

window.kernelBase.reports.get()
```

The preload layer should use `contextBridge` and expose only explicit, typed APIs.

---

## 4.3 Main Process

The Electron Main process is the application runtime host.

```text
Electron Main
│
├── Window Manager
├── IPC Router
├── Project Manager
├── Process Manager
├── Terminal Manager
├── File Manager
├── Git Manager
├── Agent Runtime
├── Task Orchestrator
├── Model Gateway
├── Tool Runtime
├── Local Model Manager
├── Sandbox Manager
├── Report Engine
├── Database Service
└── Event Bus
```

The Main process is responsible for privileged application operations.

---

# 5. Kernel Core

The Kernel Core contains the application-level runtime logic.

```text
Kernel Core
│
├── Task Manager
├── Agent Orchestrator
├── Task DAG Engine
├── Agent Runtime
├── Model Gateway
├── Tool Runtime
├── Permission Engine
├── Sandbox Manager
├── Local Model Manager
├── Report Engine
└── Event Bus
```

The Kernel Core should remain independent from individual React components.

This allows the same agent/task runtime to support:

- UI execution
- background execution
- CLI integrations
- future extensions
- automation

---

# 6. Agent Architecture

Agents are independent execution units.

Initial agent catalog:

```text
Planner Agent
Research Agent
Coding Agent
Debugger Agent
Testing Agent
Code Review Agent
Security Agent
UI/UX Agent
DevOps Agent
Documentation Agent
Data Agent
Report Agent
```

A typical task may execute:

```text
                    User Task
                        │
                     Planner
                        │
                 Agent Orchestrator
                        │
                  Task Graph / DAG
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
     Research         Coding         Security
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                      Tester
                        │
                     Reviewer
                        │
                      Report
```

Agents should communicate through structured state and artifacts rather than unrestricted conversational context.

---

# 7. Agent Team System

Users should be able to:

- Select one agent
- Select multiple agents
- Select predefined teams
- Create custom teams
- Allow automatic agent selection
- Configure agent permissions
- Configure models per agent
- Configure execution limits

Example:

```text
Authentication Team

Planner
Researcher
Coder
Security
Tester
Reviewer
Report
```

The orchestrator determines dependencies and execution order.

---

# 8. Task Orchestrator

The Task Orchestrator manages the complete lifecycle of an AI task.

```text
User Task
   ↓
Task Understanding
   ↓
Planning
   ↓
Agent Selection
   ↓
Task DAG Generation
   ↓
Model Selection
   ↓
Agent Execution
   ↓
Verification
   ↓
Report Generation
```

Responsibilities:

- Task decomposition
- Agent selection
- Scheduling
- Dependency management
- Parallel execution
- Retries
- Cancellation
- Timeouts
- Failure handling
- Resource limits
- Execution state

---

# 9. Task DAG Engine

The DAG engine represents agent dependencies.

Example:

```text
                 Task
                  │
               Planner
                  │
           ┌──────┼──────┐
           ▼      ▼      ▼
        Research Coding Security
           │      │      │
           └──────┼──────┘
                  ▼
                Tester
                  │
               Reviewer
                  │
                Report
```

The DAG should support:

- Sequential tasks
- Parallel tasks
- Dependencies
- Conditional branches
- Retry nodes
- Failure states
- Cancellation
- Timeouts

---

# 10. Model Gateway

Agents should never need to be tightly coupled to individual providers.

Instead:

```text
Agent
  ↓
Model Gateway
  ↓
Capability Matching
  ↓
Policy / Limits
  ↓
Model Selection
  ↓
Provider Adapter
```

The gateway evaluates:

- Task type
- Agent role
- Context requirements
- Tool calling support
- Vision support
- Privacy requirements
- Cost
- Rate limits
- Availability
- Organization policy
- Local/cloud preference

---

# 11. Provider Architecture

```text
                    Model Gateway
                         │
         ┌───────────────┼────────────────┐
         ▼               ▼                ▼
       Cloud           Custom            Local
      Providers        Gateways          Models
         │               │                │
     Provider APIs   Company APIs      Local Runtime
                                          │
                              ┌───────────┼──────────┐
                              ▼           ▼          ▼
                            Ollama       HF      llama.cpp
```

The system should support:

### Cloud providers

External LLM APIs.

### Custom gateways

Company or self-hosted OpenAI-compatible endpoints.

### Local models

Models running on the user's Linux machine.

---

# 12. Custom LLM Gateway

Users and organizations can configure:

```text
Provider Name
API Base URL
Authentication Method
API Key Reference
Model Name
Context Window
Capabilities
Pricing
Rate Limits
```

A provider should be represented internally as an adapter rather than being hard-coded into agents.

---

# 13. Local Model Manager

Local AI is a first-class component.

```text
Local Model Manager
       │
       ├── Hardware Detection
       ├── Runtime Detection
       ├── Model Discovery
       ├── Compatibility Analysis
       ├── Model Recommendation
       ├── Download
       ├── Installation
       ├── Start / Stop
       └── Health Monitoring
```

Hardware information may include:

```text
CPU
RAM
GPU
VRAM
Storage
Linux architecture
Available acceleration
```

The manager should recommend models based on actual hardware rather than fixed assumptions.

---

# 14. Local Model Runtimes

Initial targets:

```text
Ollama
Hugging Face
llama.cpp
```

Potential future runtimes:

```text
LM Studio
Other OpenAI-compatible local runtimes
```

The model gateway should abstract the runtime from the agents.

---

# 15. Terminal Architecture

The IDE needs a real Linux terminal.

Recommended stack:

```text
Terminal UI
     ↓
xterm.js
     ↓
Electron IPC
     ↓
Terminal Manager
     ↓
node-pty
     ↓
Linux PTY
     ↓
bash / zsh / fish
```

Each terminal session should maintain:

```text
Session ID
Shell
Working Directory
Environment
PTY
Process ID
Output Stream
Exit Code
```

Agent terminal access should go through the Tool Runtime and permission layer.

---

# 16. Linux Runtime

Kernel Base can directly leverage Linux primitives.

```text
Linux Runtime
│
├── Filesystem
├── Processes
├── PTY
├── Signals
├── Environment
├── Network
├── Git
├── GPU
└── Resource Controls
```

This enables:

- Native shell execution
- Process management
- File watching
- Git operations
- Local model management
- GPU detection
- Resource monitoring

---

# 17. Tool Runtime

Agents interact with the system through a controlled tool layer.

```text
Agent
 ↓
Tool Registry
 ↓
Permission Engine
 ↓
Tool Executor
 ↓
Sandbox
 ↓
Linux
```

Tools may include:

```text
Filesystem
Terminal
Git
Browser
Web
HTTP/API
Database
Package Manager
Code Execution
MCP
```

Each tool should declare:

```text
Tool ID
Capabilities
Input Schema
Output Schema
Filesystem Access
Network Access
Approval Requirement
Risk Level
```

---

# 18. MCP Architecture

MCP should be treated as another tool integration layer.

```text
Agent
  ↓
Tool Runtime
  ↓
MCP Registry
  ↓
MCP Server
  ↓
External Tool / Service
```

MCP servers should inherit the same permission and approval model as native tools.

---

# 19. Security Architecture

Security is especially important because agents can execute code and commands.

The security path should be:

```text
Agent
  ↓
Tool Request
  ↓
Permission Policy
  ↓
Approval Check
  ↓
Sandbox
  ↓
Linux Resource Controls
  ↓
Execution
  ↓
Audit Event
```

---

# 20. Electron Security Boundary

Electron should use a hardened renderer configuration.

Conceptually:

```text
nodeIntegration: false
contextIsolation: true
sandbox: true
```

The application should:

- Use `contextBridge`
- Validate IPC inputs
- Use typed IPC contracts
- Avoid exposing raw Node APIs
- Avoid exposing arbitrary `child_process`
- Keep credentials outside the renderer
- Restrict privileged operations
- Validate filesystem paths
- Apply allowlists for sensitive actions

---

# 21. Linux Sandbox

Electron's renderer security is not sufficient for arbitrary agent execution.

Use Linux-native isolation for agent tools.

Possible architecture:

```text
Agent
 ↓
Tool Runtime
 ↓
Policy Engine
 ↓
Sandbox Manager
 ↓
bubblewrap
 ↓
Linux namespaces
 ↓
seccomp
 ↓
cgroups
 ↓
Process
```

For stronger isolation:

```text
Agent
 ↓
Rootless Podman
 ↓
Container
 ↓
Linux
```

Possible execution modes:

```text
Standard
Restricted host process

Sandbox
bubblewrap + Linux isolation

Container
Rootless Podman
```

The exact mode should be selected according to task risk and project policy.

---

# 22. Human Approval System

High-risk actions should require explicit user approval.

Examples:

```text
Delete files
Install packages
Run network commands
Modify databases
Push Git changes
Deploy applications
Access external services
Modify system configuration
```

Example:

```text
┌───────────────────────────────────────┐
│           APPROVAL REQUIRED           │
│                                       │
│ Coding Agent wants to execute:        │
│                                       │
│ npm install example-package           │
│                                       │
│ Network access: Yes                   │
│ Files affected: package.json         │
│                                       │
│ [ Allow Once ] [ Allow Task ] [ Deny ]│
└───────────────────────────────────────┘
```

Policies can distinguish:

```text
Safe
→ Automatic

Medium Risk
→ Approval

High Risk
→ Explicit approval
```

---

# 23. Resource & AI Limits

Kernel Base should support limits at multiple levels.

```text
Organization
    ↓
Workspace
    ↓
Project
    ↓
Task
    ↓
Agent
    ↓
Model / Tool
```

Limits may include:

```text
Token usage
API requests
API cost
Agent runtime
Task runtime
Concurrent agents
Tool calls
CPU
RAM
VRAM
Storage
Network
```

These controls help prevent runaway tasks and uncontrolled resource consumption.

---

# 24. Event Bus

The application should use a central event system.

```text
                    Event Bus
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
      UI            Orchestrator      Reports
       │               │                │
       ▼               ▼                ▼
   Terminal           Agents          Analytics
```

Example events:

```text
task.created
task.started
task.completed
task.failed

agent.started
agent.completed
agent.failed

tool.started
tool.completed
tool.failed

model.requested
model.completed

approval.required
approval.granted
approval.denied

artifact.created
test.completed
report.generated
```

The renderer should subscribe through IPC rather than directly accessing internal services.

---

# 25. SQLite Data Architecture

SQLite should be the primary local application database.

```text
Renderer
   ↓
IPC
   ↓
Database Service
   ↓
SQLite
```

Suggested tables:

```text
projects
workspaces
tasks
task_nodes
agents
agent_runs
agent_messages
artifacts
models
providers
tool_calls
executions
approvals
reports
usage_events
audit_events
settings
```

Use database migrations from the beginning.

---

# 26. Secrets Management

Do not store API keys directly in SQLite.

Use the Linux credential system.

```text
Model Gateway
      ↓
Credential Manager
      ↓
Linux Secret Service / Keyring
```

SQLite stores only a credential reference.

Example:

```text
provider_id
provider_name
endpoint
credential_reference
```

The actual secret remains in the OS credential store.

---

# 27. Project Storage

A project can optionally contain Kernel Base metadata.

Example:

```text
project/
│
├── src/
├── package.json
├── ...
│
└── .kernelbase/
    ├── agents/
    ├── tasks/
    ├── artifacts/
    └── reports/
```

Global application data can be stored separately:

```text
~/.config/kernel-base/
├── config/
├── policies/
└── settings/

~/.local/share/kernel-base/
├── database/
├── artifacts/
├── reports/
├── models/
└── logs/

~/.cache/kernel-base/
├── models/
├── downloads/
└── temporary/
```

Exact filesystem locations should follow Linux/XDG conventions in the implementation.

---

# 28. Agent Worker Architecture

Do not put every agent inside one monolithic execution context.

Use worker processes where appropriate.

```text
Electron Main
      │
      ├── Agent Worker
      ├── Research Worker
      ├── Coding Worker
      ├── Testing Worker
      └── Review Worker
```

Benefits:

- Fault isolation
- Restartability
- Better resource management
- Cleaner cancellation
- Independent execution
- Better observability

Workers communicate with the orchestrator using structured messages/events.

---

# 29. Report Engine

Every completed task should produce structured results.

```text
Planner Report
      │
Research Report
      │
Coding Report
      │
Testing Report
      │
Security Report
      │
Review Report
      │
      ▼
Report Engine
      │
      ▼
Final Report
```

---

# 30. Report Workspace

The Report Workspace is a dedicated product area.

Suggested sections:

```text
Summary
Agent Reports
Files
Changes
Tests
Security
Artifacts
Execution Logs
Models Used
Usage
Cost
Remaining Issues
Next Steps
```

Example:

```text
┌────────────────────────────────────────────┐
│ TASK COMPLETE                              │
├────────────────────────────────────────────┤
│ Summary                                    │
│                                            │
│ Agent Results                              │
│                                            │
│ Files Changed                              │
│                                            │
│ Tests                                      │
│                                            │
│ Security                                   │
│                                            │
│ Artifacts                                  │
│                                            │
│ Execution Logs                             │
│                                            │
│ Models Used                                │
│                                            │
│ Usage / Cost                               │
│                                            │
│ Remaining Issues                           │
└────────────────────────────────────────────┘
```

Reports should be stored as structured data and renderable into human-readable formats.

---

# 31. Company / Organization Architecture

Kernel Base can support company environments.

```text
Organization
│
├── Members
├── Teams
├── Projects
├── Agent Registry
├── Model Policies
├── Provider Policies
├── Tool Policies
├── Usage Limits
├── Security Policies
└── Audit Logs
```

Organization policies can control:

```text
Allowed models
Allowed providers
Allowed tools
Agent concurrency
AI budget
Network access
Local-only projects
Approval requirements
Data policies
```

The desktop application can operate in:

```text
Personal Mode
Organization Mode
```

---

# 32. Audit Logging

Important actions should produce audit events.

Audit records can include:

```text
User
Agent
Task
Model
Provider
Tool
Action
Timestamp
Result
Approval decision
Resource consumption
```

Audit data should be append-oriented and protected from casual modification.

---

# 33. GPU and Hardware Detection

Linux local AI requires hardware awareness.

```text
Kernel Base
     ↓
Hardware Detector
     │
 ┌───┼────────────┐
 ▼   ▼            ▼
CPU RAM        GPU / VRAM
                │
        ┌───────┼───────┐
        ▼               ▼
      NVIDIA            AMD
        │               │
    CUDA/related      ROCm/related
        │               │
        └───────┬───────┘
                ▼
          Local Runtime
                │
                ▼
            Local Model
```

The system should detect available hardware and use that information for model compatibility and resource planning.

---

# 34. Packaging

The Linux desktop application should support:

```text
Kernel Base
│
├── Flatpak
├── AppImage
├── .deb
└── .rpm
```

Packaging should be separate from the application core.

The CI/CD system should build artifacts independently for supported Linux distributions and architectures.

---

# 35. Suggested Repository Structure

```text
kernel-base/
│
├── apps/
│   └── desktop/
│       ├── electron/
│       │   ├── main/
│       │   ├── preload/
│       │   └── ipc/
│       │
│       └── renderer/
│           ├── components/
│           ├── pages/
│           ├── workspaces/
│           ├── stores/
│           └── styles/
│
├── packages/
│   ├── agents/
│   ├── orchestration/
│   ├── model-gateway/
│   ├── providers/
│   ├── tools/
│   ├── mcp/
│   ├── sandbox/
│   ├── database/
│   ├── reports/
│   ├── local-models/
│   ├── terminal/
│   ├── git/
│   ├── security/
│   └── shared/
│
├── infrastructure/
│   ├── linux/
│   └── packaging/
│
├── docs/
│
└── tests/
```

---

# 36. Recommended Technology Stack

| Layer | Technology |
|---|---|
| Desktop | Electron |
| Frontend | React |
| Language | TypeScript |
| Editor | Monaco Editor |
| Terminal UI | xterm.js |
| PTY | node-pty |
| Runtime | Node.js |
| Agent Runtime | TypeScript / Node.js workers |
| Orchestration | Custom DAG engine |
| Database | SQLite |
| DB Layer | SQL library / ORM selected by project |
| Secrets | Linux Secret Service / keyring |
| Local AI | Ollama |
| Open Models | Hugging Face |
| Native Local Runtime | llama.cpp |
| Tool Protocol | MCP |
| Git | Git CLI / compatible library |
| Sandbox | bubblewrap |
| Isolation | Linux namespaces + seccomp + cgroups |
| Containers | Rootless Podman, optional |
| Packaging | Flatpak / AppImage / `.deb` / `.rpm` |
| IPC | Electron IPC + typed contracts |

Technology choices that are not finalized should be explicitly marked as **Proposed** rather than treated as implemented.

---

# 37. End-to-End Task Example

Consider:

> Build authentication for my application.

The lifecycle is:

```text
1. User submits task
        ↓
2. Task Manager creates task
        ↓
3. Planner analyzes requirements
        ↓
4. Orchestrator creates DAG
        ↓
5. Agents are selected
        ↓
6. Model Gateway selects models
        ↓
7. Research Agent researches existing architecture
        ↓
8. Coding Agent modifies project
        ↓
9. Security Agent reviews authentication
        ↓
10. Testing Agent runs tests
        ↓
11. Reviewer evaluates implementation
        ↓
12. Artifacts and results are stored
        ↓
13. Report Engine aggregates results
        ↓
14. Report Workspace displays final report
```

---

# 38. Example Agent State

A structured agent state could look like:

```json
{
  "taskId": "task_123",
  "agentId": "coding-agent",
  "status": "running",
  "model": {
    "provider": "local",
    "model": "selected-by-gateway"
  },
  "inputs": [],
  "artifacts": [],
  "decisions": [],
  "issues": [],
  "toolCalls": [],
  "outputs": []
}
```

The actual schema should be versioned as the platform evolves.

---

# 39. Example Tool Permission

```json
{
  "tool": "terminal.execute",
  "filesystem": "workspace",
  "network": "restricted",
  "processes": "sandboxed",
  "approval": "required"
}
```

Tool permissions should be evaluated before execution.

---

# 40. Architecture Principles

## Provider Agnostic

Agents should not depend directly on a specific LLM vendor.

## Agent Modular

Agents should be independently replaceable and configurable.

## Tool Controlled

Agents interact with the machine through explicit tools.

## Security First

High-risk operations pass through policy and approval systems.

## Local AI First-Class

Local open-source models are part of the primary architecture rather than an afterthought.

## Observable

Tasks, agents, tools, models, artifacts and reports should be observable.

## Extensible

New agents, providers, tools and runtimes should be pluggable.

## Human Controlled

Users remain in control of sensitive actions.

## Linux Native

The product should take advantage of Linux process, filesystem, PTY, GPU and sandbox capabilities rather than hiding them behind a generic abstraction.

---

# 41. Architecture Views for Documentation

The Kernel Base documentation should expose interactive architecture views.

Recommended views:

```text
Overview
Agent Flow
Execution
Model Flow
Data Flow
Security
```

## Overview

Shows the complete system.

## Agent Flow

Shows:

```text
User
 ↓
Planner
 ↓
Agent Team
 ↓
Verification
 ↓
Report
```

## Execution

Shows live/simulated task execution.

## Model Flow

Shows:

```text
Agent
 ↓
Model Gateway
 ↓
Cloud / Custom / Local
```

## Data Flow

Shows:

```text
Task
 ↓
State
 ↓
Agents
 ↓
Artifacts
 ↓
Verification
 ↓
Report
```

## Security

Shows:

```text
Agent
 ↓
Permission
 ↓
Approval
 ↓
Sandbox
 ↓
Execution
 ↓
Audit
```

---

# 42. Final Architecture

The complete Linux Electron architecture can be summarized as:

```text
                         KERNEL BASE
                              │
                    ┌─────────▼─────────┐
                    │   ELECTRON APP    │
                    └─────────┬─────────┘
                              │
             ┌────────────────┴────────────────┐
             │                                 │
             ▼                                 ▼
      RENDERER PROCESS                   MAIN PROCESS
      React + TypeScript                 Node.js
             │                                 │
             │                          ┌──────┼────────────┐
             │                          │      │            │
             │                          ▼      ▼            ▼
             │                       Tasks   Agents       Tools
             │                          │      │            │
             │                          └──┬───┘            │
             │                             ▼                │
             │                       Task DAG               │
             │                             │                │
             │                             ▼                ▼
             │                       Model Gateway      Sandbox
             │                             │                │
             │                    ┌────────┼────────┐       │
             │                    ▼        ▼        ▼       ▼
             │                  Cloud   Custom    Local   Linux
             │                                     │
             │                                  Ollama
             │                                  HF
             │                               llama.cpp
             │
             └────────────── IPC ───────────────────────────┘
                                    │
                              Linux Runtime
                                    │
                ┌───────────────────┼──────────────────┐
                ▼                   ▼                  ▼
            Filesystem             PTY             Processes
                │                   │                  │
                └───────────────────┼──────────────────┘
                                    ▼
                                  SQLite
                                    │
                              Report Engine
                                    │
                              Report Workspace
```

---

# 43. Core Mental Model

The final product architecture should be understood as:

```text
Electron
  ↓
Desktop Experience

React
  ↓
User Interface

Node.js
  ↓
Kernel Runtime

Agent Orchestrator
  ↓
Task Execution

Model Gateway
  ↓
Cloud / Custom / Local Intelligence

Tool Runtime
  ↓
Controlled Actions

Linux
  ↓
Processes / Files / PTY / GPU

Sandbox
  ↓
Isolation

SQLite
  ↓
Persistent State

Report Engine
  ↓
Final Results
```

The central principle is:

> **React provides the experience, Electron provides the desktop runtime, Node.js provides the Kernel Base runtime, agents provide autonomous task execution, the Model Gateway provides provider-independent intelligence, the Tool Runtime provides controlled actions, Linux provides native execution primitives, and the Report Workspace turns the entire execution into an inspectable result.**

This architecture is intended to serve as the technical foundation for the Linux-only Kernel Base desktop application and should be treated as a living architecture document. As implementation decisions become finalized, update the relevant sections and explicitly distinguish implemented, in-development, planned, and proposed components.
