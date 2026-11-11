# Kernel Base: Project Plan (Third-Year Major Project)

Source of truth: https://kernelbasedocs-zeta.vercel.app/ and this repository.

## 1. What the docs promise

The docs describe Kernel Base as a **local-first, AI-native desktop IDE**. It has:

- 14 specialised agents (Planner, Orchestrator, Coder, Debugger, Research, Data Analyst, QA & Test, Reviewer, Security, UI/UX, SEO, Docs, DevOps, Report). An Agent Runtime coordinates them.
- A workflow of **Intent → Planning → Context → Agent Selection → Execution → Validation → Result**.
- An 8-layer architecture: Developer → Desktop shell → Workspace/UI → Agent Orchestration → Context/Memory → Model layer → Tool/Execution layer → Filesystem.
- Desktop builds for macOS, Linux and Windows. The docs list all three as "Coming soon".

## 2. What is built now (v1.0.0)

| Layer (docs) | Implementation |
|---|---|
| Desktop shell | Electron 34 app, `electron/main.ts`, hidden-inset macOS title bar, native menu |
| Workspace / UI | VS Code-style workbench (`src/app/IDELayout.tsx`): activity bar, explorer, Monaco editor + tabs, search, quick open (⌘P), command palette (⌘⇧P), Source Control, Extensions, Problems / Output / Terminal panels |
| Tool / Execution | Compiler and runner (`electron/ipc/run.ipc.ts`) for Python, C, C++, JS, TS, Go, Rust and Java (⌘R). Integrated shell terminal. Git IPC. |
| **Agent Orchestration** | **Agent Studio** (`src/studio/AgentStudio.tsx` + `electron/ipc/studio.ipc.ts`). This is the right side panel (⌘⇧L). It runs N real agents in parallel. |
| Model layer | The user's own **Google Antigravity CLI (`agy`)** or **Gemini CLI** subscription. Kernel Base stores no API keys. |
| Context / Memory | Each agent works with the workspace root as `cwd`. Pipeline mode passes the Planner's output into every other agent's prompt. |
| Filesystem | Starter project at `~/KernelBase/Welcome` on first launch. Recent workspaces in `~/.kernelbase-recents.json`. |

### Agent Studio: how one subscription becomes a multi-agent team

1. On startup, `hydrateShellPath()` loads your login-shell `PATH`. Without this, an app opened from Finder cannot find `agy` or `gemini`.
2. `studio:detect` finds the installed CLIs and their versions. `studio:models` lists the models (`agy models`).
3. On launch, each selected role becomes **one child process**: `agy -p "<role prompt + goal>" --mode <plan|accept-edits|auto>`. The prompt is passed as a single argv entry with no shell, so prompts cannot inject commands.
4. A renderer-side scheduler caps concurrency ("Max parallel", 1–8). It queues the rest.
5. Strategies:
   - **Parallel**: all agents start at once.
   - **Pipeline**: the Planner runs first, and its plan goes to Coder, Reviewer, Tester and the other roles.
6. Output streams live into each agent card. Every card has stop, re-run and copy. Stop-all kills every process, and quitting the app kills them too.
7. Permission levels map to the CLI's own modes. The default is **read-only (plan)**.

All of these processes share the same authenticated CLI session, so a single subscription drives every agent.

## 3. Roadmap to make it stand out at the demo

| Phase | Work | Why it impresses |
|---|---|---|
| P1 (done) | Working IDE, compiler, terminal, Agent Studio, macOS DMG | Live demo on any Mac, offline except for the AI calls |
| P2 | Stream structured events (`agy --output-format stream-json`) to show each agent's tool calls and file edits live | Makes the "thinking" visible |
| P2 | Per-agent **git worktrees**, so parallel Coder agents never conflict. Show a merge view in the Diff viewer | Real parallel engineering, not only parallel chat |
| P3 | Validator agent that runs the project's tests or compiler after the Coder finishes, then sends failures back (loop up to N times) | Fills in the "Validation" step from the docs |
| P3 | Context/Memory: index the workspace (`indexing.ipc.ts`) and attach the top-k relevant files to each prompt | Matches the docs' Context layer |
| P4 | Add the other 6 doc roles (Data Analyst, UI/UX, SEO, DevOps, Report, Orchestrator) as presets | 14/14 agents from the docs |
| P4 | Ollama provider for fully offline agents | "Local-first" claim from the docs |
| P5 | Signed and notarised DMG (Apple Developer ID), Windows build | Smooth install with no Gatekeeper prompt |

## 4. Build and test

```bash
npm install            # or pnpm install
npm run lint           # tsc --noEmit type check
npm run make:mac       # builds, ad-hoc signs, creates out/Kernel-Base-IDE-arm64.dmg
npm run make:linux     # creates out/Kernel-Base-IDE-linux-{x64,arm64}.tar.gz
```

What was checked on the packaged arm64 DMG:

- The DMG checksum passes, the app is ad-hoc signed, and `codesign --verify --deep --strict` passes.
- Launched from the DMG copy through `open` (a Finder-like environment): the workbench loads, `agy 1.5.5` is detected, and the model list loads.
- The runner prints correct output for `hello.py`, `hello.c` (clang) and `hello.js`.
- Agent Studio runs agents in parallel through `agy`. Three concurrent agents on one login each answered in about 40 seconds.
- The Linux x64 and arm64 binaries were checked as valid ELF files. They were not run on a Linux machine.

## 5. Install on a Mac

1. Open `Kernel-Base-IDE-arm64.dmg` and drag **Kernel Base** to **Applications**.
2. The build is not notarised. The first time, right-click the app, choose **Open**, then choose **Open** again. If macOS still blocks it, run: `xattr -cr "/Applications/Kernel Base.app"`.
3. Before using Agent Studio, run `agy` once in Terminal and sign in. You can use `gemini` instead.
