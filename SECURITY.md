# Security Policy & Repository Governance

Kernel Base takes the security of our desktop IDE, multi-agent execution runtime, and developer workflows seriously. This document details our supported versions, vulnerability disclosure policy, desktop runtime security guarantees, and repository branch merge rules.

---

## 🔒 Supported Versions

We actively provide security patches and dependency updates for the following release tracks:

| Version Track | Supported | Severity Target |
| :--- | :---: | :--- |
| `0.1.x` (Latest Pre-release) | :white_check_mark: | Critical & High within 48h |
| `main` (Default Branch) | :white_check_mark: | Active Development |
| `< 0.1.0` | :x: | Deprecated / Unsupported |

---

## 🛡️ Repository Merge Governance & Review Rules

To maintain high code quality, architectural integrity, and security across the codebase, the following merge policy is enforced on all branches (including `main`):

### 1. Mandatory Peer Review Policy
* **General Contributors & Developers**: All pull requests require **at least 1 approved review** from a maintainer or designated code owner prior to merge.
* **Dismiss Stale Approvals**: Approvals are automatically dismissed when new commits are pushed to ensure newly introduced changes undergo re-validation.
* **Required CI Passes**: All automated tests, typechecks, and security scanning workflows must pass green before a merge can proceed.

### 2. Administrator Bypass Policy
* **Admin Authority (`@Sujoymoulick`)**: Repository Administrators possess explicit authorization to bypass peer review requirements and merge directly to `main` when necessary.
* **Applicable Scenarios**:
  - Emergency security patches and zero-day hotfixes.
  - Critical infrastructure or build pipeline fixes.
  - Urgent dependency updates or release tagging.
* **Accountability**: All administrative direct merges must include clear commit messages referencing the reason for emergency bypass.

---

## 💻 Desktop Runtime Security Architecture

Kernel Base implements multiple security defense layers natively on macOS:

1. **Zero-Trust Permission Gatekeeper**:
   - File modification and deletion operations proposed by AI agents require explicit user approval.
   - Destructive command patterns (such as `rm -rf`, `sudo`, `dd`, `mkfs`, or raw curl pipelines) are caught by the danger analyzer before execution.

2. **IPC Context Isolation**:
   - The Electron renderer process operates with `contextIsolation: true` and `nodeIntegration: false`.
   - Communication between the renderer and main process is strictly mediated via typed IPC channels defined in `window.kernelBase`.

3. **macOS Keychain Credentials**:
   - AI provider API keys (Google Gemini, Anthropic Claude, OpenAI, Ollama) are stored in the encrypted macOS native Keychain via the OS `security` subsystem.

4. **Shell Sandbox**:
   - Interactive terminal shells (`xterm.js`) run isolated child processes under the local user permissions with no elevated root privileges.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within Kernel Base, please **do not create a public GitHub issue**.

### Preferred Reporting Method
1. **GitHub Private Vulnerability Report**: Open a private advisory report under the [Security Advisories](https://github.com/Sujoymoulick/KERNELBASE/security/advisories) tab on GitHub.
2. **Direct Security Contact**: Email the security response team at **`sujoymoulick@gmail.com`** with:
   - Vulnerability title and severity assessment.
   - Detailed step-by-step reproduction instructions or proof-of-concept (PoC).
   - Affected files, components, or OS platform details.
   - Potential impact on workspace files, API keys, or system resources.

### Response Timelines
- **Acknowledgment**: Within 24 hours of receiving the report.
- **Triage & Assessment**: Within 48 hours with confirmation of reproduction.
- **Remediation & Patch**: Target turnaround of 3 to 7 business days for high or critical severity issues.

### Safe Harbor
We consider security research conducted in good faith under this policy to be authorized. We will not pursue legal action against researchers who:
- Give us reasonable time to remedy issues before public disclosure.
- Do not exploit vulnerabilities to access or compromise unauthorized user data.
- Avoid disrupting live user environments or executing denial-of-service attacks.

---

## 👥 Code Owners

Review authority and ownership mappings are configured in [`.github/CODEOWNERS`](.github/CODEOWNERS):
- Primary Administrator: `@Sujoymoulick`
