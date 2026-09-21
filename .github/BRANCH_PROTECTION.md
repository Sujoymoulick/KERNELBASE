# GitHub Branch Protection & Ruleset Setup

This document specifies the exact configuration required on GitHub for enforcing the **1-Review Minimum** with **Admin Merge Bypass**.

---

## 🎯 Desired Policy

1. **All Contributors**: Require **at least 1 approved pull request review** before merging into `main`.
2. **Repository Administrators (`@Sujoymoulick`)**: Can bypass review requirements and merge directly or without review when needed (for hotfixes, deployments, emergency patches).

---

## ⚙️ How to Configure on GitHub

### Option A: GitHub Rulesets (Recommended for Modern Repos)

1. Navigate to **GitHub Repo Settings** ➔ **Rules** ➔ **Rulesets**.
2. Click **New ruleset** ➔ **New branch ruleset**.
3. Name: `Protect Main & Require 1 Review`.
4. **Enforcement status**: `Active`.
5. **Target branches**:
   - Add target ➔ Include default branch (`main`).
6. **Bypass list**:
   - Add **Repository Admin** (or `@Sujoymoulick`) with bypass mode **Always**.
7. **Branch rules**:
   - ✅ Check **Require a pull request before merging**.
   - Set **Required approvals**: `1`.
   - ✅ Check **Dismiss stale pull request approvals when new commits are pushed**.
   - ✅ Check **Require review from Code Owners** (uses `.github/CODEOWNERS`).
8. Click **Create** or **Save changes**.

---

### Option B: Classic Branch Protection Rule

1. Navigate to **GitHub Repo Settings** ➔ **Branches**.
2. Click **Add branch protection rule**.
3. Branch name pattern: `main`.
4. Protect matching branches:
   - ✅ Check **Require a pull request before merging**.
   - Set **Require approvals**: `1`.
   - ✅ Check **Dismiss stale pull request approvals when new commits are pushed**.
   - ✅ Check **Require review from Code Owners**.
   - ❌ **Leave UNCHECKED**: *"Do not allow bypassing the above settings"* (or *"Include administrators"*). Leaving this unchecked allows administrators to merge without review.
5. Click **Save changes**.

---

## 🔒 Automated Verification

- [x] **[`.github/CODEOWNERS`](.github/CODEOWNERS)** specifies `@Sujoymoulick` as code owner.
- [x] **[`SECURITY.md`](../SECURITY.md)** outlines disclosure policy and merge governance rules.
- [x] **[`.github/workflows/security-and-pr-gate.yml`](workflows/security-and-pr-gate.yml)** runs security audits and verifies PR governance.
