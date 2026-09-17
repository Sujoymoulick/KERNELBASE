import { DocPage } from '../../types/docs';

export const autonomyPages: DocPage[] = [
  {
    slug: 'autonomy/autonomous-execution',
    title: 'Autonomous Execution',
    description: 'The end-to-end autonomous loop: planning, execution, test verification, failure diagnosis, and repair.',
    section: 'Autonomy',
    category: 'Autonomous Engine',
    order: 1,
    checkedDate: 'September 2026',
    tags: ['autonomy', 'execution', 'loop'],
    content: {
      lead: 'Autonomous execution in the AI-Native IDE is an algorithmic feedback loop that couples code generation with concrete compiler and runtime feedback.',
      sections: [
        {
          id: 'autonomous-lifecycle',
          title: 'Complete Autonomous Execution Cycle',
          mermaid: `graph TD
    Goal([User Goal]) --> Plan[1. Decompose into DAG]
    Plan --> Sched[2. Schedule Ready Tasks]
    Sched --> Exec[3. Coding Agent Implements]
    Exec --> Test[4. QA Executes Tests in Sandbox]
    Test --> Verdict{Tests Pass?}
    Verdict -- Yes --> Review[5. Reviewer & Security Audit]
    Review -- Approved --> Merge([Ready for Human Merge])
    Verdict -- No --> Diag[6. Failure Diagnosis Agent]
    Diag --> Repair[7. Automatic Repair Patch]
    Repair --> Retest{Retry Limit Exceeded?}
    Retest -- Under Limit --> Test
    Retest -- Over Limit --> Escalate([Escalate to Human])`,
          diagramTitle: 'Autonomous Execution & Repair Loop',
        },
      ],
      relatedPages: [
        { title: 'Autonomous Test Loop', slug: 'autonomy/test-loop' },
        { title: 'Automatic Repair', slug: 'autonomy/repair-loop' },
      ],
    },
  },
  {
    slug: 'autonomy/task-planning',
    title: 'Task Planning',
    description: 'Dynamic graph generation, acyclic validation, and dependency resolution techniques.',
    section: 'Autonomy',
    category: 'Autonomous Engine',
    order: 2,
    checkedDate: 'September 2026',
    tags: ['planning', 'dag', 'topological'],
    content: {
      lead: 'Planning generates dependency-ordered task graphs validated using Kahn\'s topological sort algorithm to eliminate circular dependencies.',
      sections: [
        {
          id: 'topological-validation',
          title: 'Acyclic Verification Algorithm',
          codeBlocks: [
            {
              filename: 'src/core/dag/validator.ts',
              language: 'typescript',
              code: `export function validateDAG(tasks: TaskNode[]): { isValid: boolean; cycle?: string[] } {
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>();

  for (const t of tasks) {
    inDegree.set(t.id, t.dependencies.length);
    graph.set(t.id, []);
  }

  for (const t of tasks) {
    for (const dep of t.dependencies) {
      graph.get(dep)?.push(t.id);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  let visitedCount = 0;
  while (queue.length > 0) {
    const curr = queue.shift()!;
    visitedCount++;
    for (const neighbor of graph.get(curr) || []) {
      const newDeg = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  return { isValid: visitedCount === tasks.length };
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Parallel Execution', slug: 'autonomy/parallel-execution' },
      ],
    },
  },
  {
    slug: 'autonomy/parallel-execution',
    title: 'Parallel Execution',
    description: 'Concurrent task execution across independent branches of the DAG without race conditions.',
    section: 'Autonomy',
    category: 'Autonomous Engine',
    order: 3,
    checkedDate: 'September 2026',
    tags: ['concurrency', 'parallel', 'threads'],
    content: {
      lead: 'Tasks sharing no overlapping file dependencies execute in parallel across separate sandbox threads, cutting wall-clock runtimes by up to 65%.',
      sections: [
        {
          id: 'file-lock-manager',
          title: 'File-Level Lock Reservation',
          body: 'Before two agents execute simultaneously, the Orchestrator checks their declared file targets. If Agent A touches `src/auth.ts` and Agent B touches `src/db.ts`, they run concurrently. If both touch `package.json`, they are serialized.',
        },
      ],
      relatedPages: [
        { title: 'Dependency Resolution', slug: 'autonomy/dependency-resolution' },
      ],
    },
  },
  {
    slug: 'autonomy/dependency-resolution',
    title: 'Dependency Resolution',
    description: 'Dynamic graph mutations: how new tasks, unexpected compile errors, and sub-plans are injected at runtime.',
    section: 'Autonomy',
    category: 'Autonomous Engine',
    order: 4,
    checkedDate: 'September 2026',
    tags: ['dependencies', 'dynamic-graph', 'mutations'],
    content: {
      lead: 'The task graph is not static. If an agent discovers a missing package or undeclared database migration, the graph dynamically injects prerequisite nodes.',
      sections: [
        {
          id: 'runtime-graph-injection',
          title: 'Prerequisite Node Injection Pattern',
          codeBlocks: [
            {
              filename: 'src/core/dag/mutation.ts',
              language: 'typescript',
              code: `export function injectPrerequisite(
  currentTask: TaskNode,
  newNode: TaskNode,
  graph: TaskGraph
) {
  // Insert new node before current task
  newNode.dependencies = [...currentTask.dependencies];
  currentTask.dependencies = [newNode.id];
  graph.addNode(newNode);
  graph.emit('graph:mutated', { added: newNode.id, delayed: currentTask.id });
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Task Planning', slug: 'autonomy/task-planning' },
      ],
    },
  },
  {
    slug: 'autonomy/test-loop',
    title: 'Autonomous Test Loop',
    description: 'Continuous compilation, unit test execution, and coverage analysis inside isolated Docker sandboxes.',
    section: 'Autonomy',
    category: 'Test & Repair Loop',
    order: 5,
    checkedDate: 'September 2026',
    tags: ['test-loop', 'testing', 'sandbox', 'vitest'],
    content: {
      lead: 'The Test Loop treats automated tests as the source of truth, running test runners inside the sandbox and parsing machine-readable tap/json output.',
      sections: [
        {
          id: 'test-runner-integration',
          title: 'Supported Test Frameworks',
          table: {
            headers: ['Language / Stack', 'Test Runner', 'Reporters Supported', 'Exit Code Contract'],
            rows: [
              ['TypeScript / Node', 'Vitest / Jest', 'JSON reporter, TAP', '0 = Pass, 1 = Fail, >128 = Fatal Crash'],
              ['Python', 'pytest', 'junitxml, json-report', '0 = Pass, 1 = Tests failed, 2 = Interrupted'],
              ['Rust', 'cargo test', 'cargo --message-format=json', '0 = Pass, 101 = Panic'],
              ['Go', 'go test', 'go test -json', '0 = Pass, non-zero = Fail'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Failure Diagnosis', slug: 'autonomy/failure-diagnosis' },
        { title: 'Automatic Repair', slug: 'autonomy/repair-loop' },
      ],
    },
  },
  {
    slug: 'autonomy/failure-diagnosis',
    title: 'Failure Diagnosis',
    description: 'Algorithmic root-cause analysis converting noisy stack traces into precise repair instructions.',
    section: 'Autonomy',
    category: 'Test & Repair Loop',
    order: 6,
    checkedDate: 'September 2026',
    tags: ['diagnosis', 'stack-trace', 'debugging', 'ast'],
    content: {
      lead: 'Failure Diagnosis strips irrelevant library stack frames, pinpoints the offending line of code, and isolates the delta between expected and actual output.',
      sections: [
        {
          id: 'diagnostic-payload',
          title: 'Diagnostic Envelope Format',
          codeBlocks: [
            {
              filename: 'types/diagnostic.ts',
              language: 'typescript',
              code: `{
  "errorType": "AssertionError",
  "offendingFile": "src/auth/jwt.ts",
  "offendingLine": 42,
  "expected": "'RS256'",
  "actual": "'HS256'",
  "stackTraceSummary": "jwt.verify failed: algorithm mismatch at line 42",
  "hypothesizedCause": "Default algorithm parameter fell back to HMAC instead of RSA public key validation",
  "suggestedPatchLocation": "src/auth/jwt.ts:40-45"
}`,
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Automatic Repair', slug: 'autonomy/repair-loop' },
      ],
    },
  },
  {
    slug: 'autonomy/repair-loop',
    title: 'Automatic Repair',
    description: 'Surgical code patching, automated regression testing, and verification loop.',
    section: 'Autonomy',
    category: 'Test & Repair Loop',
    order: 7,
    checkedDate: 'September 2026',
    tags: ['repair', 'self-healing', 'diff'],
    content: {
      lead: 'The Repair Loop feeds the diagnostic envelope back into the Coding Agent, generating a surgical patch that is immediately retested in the sandbox.',
      sections: [
        {
          id: 'repair-safety',
          title: 'Preventing Compounding Regressions',
          body: 'If a repair patch fixes test A but breaks previously passing test B, the patch is rejected and the agent is notified of the regression.',
        },
      ],
      relatedPages: [
        { title: 'Retesting & Retry Limits', slug: 'autonomy/retry-limits' },
      ],
    },
  },
  {
    slug: 'autonomy/retry-limits',
    title: 'Retesting & Retry Limits',
    description: 'Preventing infinite retry loops and runaway credit spend with exponential backoff and hard ceilings.',
    section: 'Autonomy',
    category: 'Test & Repair Loop',
    order: 8,
    checkedDate: 'September 2026',
    tags: ['retries', 'limits', 'safety'],
    content: {
      lead: 'To prevent agents from getting trapped in infinite debugging loops, the runtime enforces hard retry limits (default: 3 attempts) and circuit breakers.',
      sections: [
        {
          id: 'circuit-breaker-policy',
          title: 'Circuit Breaker Matrix',
          table: {
            headers: ['Trigger Condition', 'Limit Policy', 'System Action'],
            rows: [
              ['Task Failures', 'Max 3 consecutive failed repair attempts', 'Pause run, escalate diagnostic report to user'],
              ['Identical Diffs', 'Agent outputs same patch twice in a row', 'Halt immediately, flag semantic loop'],
              ['Token Burn', 'Task consumes >150% of estimated budget', 'Pause task, prompt user for budget extension'],
              ['Timeout', 'Subprocess execution exceeds 120s', 'Send SIGTERM/SIGKILL, mark task TIMED_OUT'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Human-in-the-Loop', slug: 'autonomy/human-in-the-loop' },
      ],
    },
  },
  {
    slug: 'autonomy/human-in-the-loop',
    title: 'Human-in-the-Loop',
    description: 'Interactive governance: diff inspection, mid-flight intervention, and steerable prompts.',
    section: 'Autonomy',
    category: 'Governance',
    order: 9,
    checkedDate: 'September 2026',
    tags: ['hitl', 'governance', 'steerable'],
    content: {
      lead: 'The human developer is always in command. The IDE allows users to inject prompt guidance mid-run, edit files concurrently, or abort tasks.',
      sections: [
        {
          id: 'steerable-agents',
          title: 'Mid-Run Steering Controls',
          cards: [
            {
              title: 'Pause & Inspect',
              description: 'Freeze the sandbox container to inspect the filesystem state, run manual terminal checks, or tweak configs.',
              badge: 'Control',
            },
            {
              title: 'Inject Guidance',
              description: 'Send a high-priority message directly to the active agent: "Use argon2 instead of bcrypt due to modern compliance."',
              badge: 'Steer',
            },
          ],
        },
      ],
      relatedPages: [
        { title: 'Human Approval Gates', slug: 'autonomy/human-approval' },
      ],
    },
  },
  {
    slug: 'autonomy/human-approval',
    title: 'Human Approval Gates',
    description: 'Configurable checkpoints for destructive actions, schema migrations, and external API requests.',
    section: 'Autonomy',
    category: 'Governance',
    order: 10,
    checkedDate: 'September 2026',
    tags: ['approval', 'gates', 'policy'],
    content: {
      lead: 'Critical operations trigger an interactive confirmation dialog with unified diffs, estimated costs, and safety warnings.',
      sections: [
        {
          id: 'gated-actions',
          title: 'Default Gated Operations',
          table: {
            headers: ['Operation', 'Triggering Action', 'Risk Level', 'Default Gate'],
            rows: [
              ['Database Drop', 'DROP TABLE, TRUNCATE, DELETE without WHERE', 'Critical', 'Requires explicit user confirmation'],
              ['External Network', 'Outbound HTTP outside localhost/registry', 'High', 'Requires domain approval'],
              ['Package Install', 'Adding dependencies to package.json', 'Medium', 'Allowed in sandbox, flagged in final review'],
              ['Git Push', 'Pushing commits to remote origin', 'Critical', 'Forbidden by default; requires manual click'],
            ],
          },
        },
      ],
      relatedPages: [
        { title: 'Autonomous Safety Bounds', slug: 'autonomy/autonomous-safety' },
      ],
    },
  },
  {
    slug: 'autonomy/autonomous-safety',
    title: 'Autonomous Safety Bounds',
    description: 'Formal containment boundaries preventing hallucinations from destabilizing developer machines.',
    section: 'Autonomy',
    category: 'Governance',
    order: 11,
    checkedDate: 'September 2026',
    tags: ['safety', 'bounds', 'containment'],
    content: {
      lead: 'By enforcing structural limits at the filesystem, network, and process layers, the IDE guarantees zero unintended side effects on the host OS.',
      sections: [
        {
          id: 'safety-manifesto',
          title: 'The Safety Boundary Guarantee',
          callout: {
            type: 'warning',
            title: 'Containment Guarantee',
            text: 'An agent cannot read files outside the designated project folder, cannot execute commands on the host shell without Docker, and cannot make billable API calls beyond the assigned credit quota.',
          },
        },
      ],
      relatedPages: [
        { title: 'Security Model', slug: 'architecture/security-model' },
      ],
    },
  },
];
