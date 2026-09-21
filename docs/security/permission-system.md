# Kernel Base Security & Permission System

Kernel Base enforces strict Zero-Trust boundaries for autonomous AI operations on the host machine.

## Permission Tiers

1. **Auto-Approved Read Operations**:
   - Safe queries (`readFile`, `searchFiles`, `gitStatus`, read-only diagnostics) are allowed automatically to maintain high agent velocity.

2. **Gated Destructive / Write Operations**:
   - File writes, code overwrites, dependency additions, and git branch modifications require explicit developer consent or auto-allow session scoping.

3. **High-Risk Shell Commands (Danger Analysis)**:
   - Destructive commands are inspected via AST/Regex matching:
     - `rm -rf /` or recursive deletions
     - `sudo` / `su` privilege escalations
     - `dd`, `mkfs`, partition writes
     - Pipe-to-shell patterns (`curl | bash`, `wget | sh`)
     - Fork bombs and runaway loop constructs
   - High-risk commands trigger an urgent modal with full command preview, affected file paths, danger assessment badges, and Reject/Allow Once/Allow Always controls.

## Keychain Integration

- API keys for OpenAI, Anthropic, Google Gemini, Ollama, and Cloud Code CLI are stored securely in macOS Keychain using the native `security` subsystem.
- No keys are ever written to plaintext configuration files or committed to Git.
