# Soroban Guard for VS Code

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/Soroban-Guard/VS)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/vscode-%5E1.85.0-007ACC.svg)](https://code.visualstudio.com/)

Real-time security analysis for [Soroban](https://soroban.stellar.org/) smart contracts, directly in your editor. Identifies vulnerabilities as you write code and provides one-click fixes for common security issues.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Detailed Feature Guide](#detailed-feature-guide)
  - [Inline Diagnostics](#inline-diagnostics)
  - [Quick-Fix Code Actions](#quick-fix-code-actions)
  - [Security Report Panel](#security-report-panel)
  - [Status Bar Integration](#status-bar-integration)
  - [Workspace Scanning](#workspace-scanning)
  - [Auto-Scan on Save](#auto-scan-on-save)
- [Code Actions Reference](#code-actions-reference)
- [Configuration Reference](#configuration-reference)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Release Notes](#release-notes)
- [License](#license)

---

## Features

| Feature | Description |
|---------|-------------|
| 🔴 **Inline Diagnostics** | Vulnerabilities highlighted in your code with severity-colored underlines |
| ⚡ **Quick-Fix Code Actions** | One-click fixes for common issues like missing auth and unchecked arithmetic |
| 📊 **Rich Report Panel** | Dedicated webview with score, grade, and categorized findings |
| 📁 **Workspace Scanning** | Analyze every Rust file in your project in a single command |
| 🔔 **Status Bar Integration** | Security score and scan state visible at a glance |
| 💾 **Auto-Scan on Save** | Results stay up-to-date without manual intervention |
| 🎯 **Severity Filtering** | Focus on critical/high issues or see everything down to info-level |
| 🚫 **Exclusion Patterns** | Skip test files and fixtures with glob patterns |

---

## Prerequisites

Before using this extension, ensure you have the following installed:

1. **Soroban Guard CLI** — The analysis engine that powers the extension.
   - Install from the [Soroban Guard CLI repository](https://github.com/Soroban-Guard/Soroban-Guard-Core)
   - Ensure the binary is available in your `PATH` or configure the path in settings
   - Verify with: `soroban-guard --version`

2. **VS Code** version `^1.85.0` or higher.

3. **rust-analyzer** extension (`rust-lang.rust-analyzer`) — recommended for Rust language support.

---

## Installation

### From VSIX

```bash
# Build the extension
npm install
npm run compile

# Package the extension (requires vsce)
vsce package

# Install the generated .vsix file
code --install-extension soroban-guard-0.1.0.vsix
```

---

## Quick Start

1. **Open a Soroban contract** — Open any Rust file `.rs` containing a Soroban contract.
2. **Diagnostics appear automatically** — Issues are underlined with severity-colored squiggles.
3. **Hover for details** — Hover over a diagnostic to see the rule ID, message, and suggestion.
4. **Apply a quick fix** — Click the lightbulb icon or press `Ctrl+.` to see available fixes.
5. **View the full report** — Click the shield icon in the status bar to open the detailed report panel.
6. **Scan the whole workspace** — Run `Soroban Guard: Scan Workspace` from the command palette (`Ctrl+Shift+P`).

---

## Detailed Feature Guide

### Inline Diagnostics

When you open or save a Rust file, the extension automatically invokes the Soroban Guard CLI and maps each finding to a VS Code diagnostic. Each diagnostic includes:

- **Severity coloring** — Critical/high findings are red (Error), medium are yellow (Warning), low are blue (Information), and info are gray (Hint).
- **Rule identifier** — Each finding includes its rule ID (e.g., `A-01`, `O-01`, `R-01`) so you can look up documentation.
- **Suggestion text** — When available, a remediation suggestion is attached as related information.

```
┌─────────────────────────────────────────────────────────┐
│ [A-01] Function transfer is missing require_auth check   │
├─────────────────────────────────────────────────────────┤
│ Suggestion: Add require_auth(&admin) before the          │
│ state-changing logic                                     │
└─────────────────────────────────────────────────────────┘
```

### Quick-Fix Code Actions

When a diagnostic is present, the lightbulb icon appears in the editor gutter. Clicking it (or pressing `Ctrl+.`) shows available code actions:

- **Add `require_auth()` check** — For missing authorization findings (A-01, A-04)
- **Use checked arithmetic** — For overflow-vulnerable arithmetic (O-01)
- **View reentrancy fix suggestion** — Opens the full report for reentrancy details (R-01)

Each action applies the fix directly to your source code via VS Code's workspace edit API.

### Security Report Panel

Run `Soroban Guard: Show Full Report` or click the status bar icon to open a dedicated webview panel showing:

- **Security Score** — A large color-coded circle (0–100) reflecting overall contract security
- **Grade** — Letter grade derived from the score
- **Finding Count** — Total number of issues detected
- **Findings Table** — All findings with columns for:
  - Severity badge (color-coded)
  - Rule ID
  - Description message
  - File and line location
  - Suggestion text

The panel opens in the second editor column for side-by-side viewing with your code.

### Status Bar Integration

The status bar displays a shield icon that reflects the current state:

| State | Icon | Meaning |
|-------|------|---------|
| Idle | `$(shield) Soroban Guard` | Extension loaded, awaiting scan |
| Scanning | `$(loading~spin) Soroban Guard...` | Scan in progress |
| Scanning Workspace | `$(loading~spin) Soroban Guard: Scanning workspace...` | Full workspace scan in progress |
| Error | `$(alert) Soroban Guard Error` | CLI failed or not found |
| Complete | `$(pass) Soroban Guard Complete` | Scan finished successfully |
| Score | `$(shield) Score: 85/100` | Last scan score (green if >=70, yellow otherwise) |

Click the status bar item at any time to open the full report panel.

### Workspace Scanning

Run `Soroban Guard: Scan Workspace` to scan every `.rs` file in your open workspace folders. The scanner:

1. Discovers all Rust files using VS Code's `workspace.findFiles`
2. Scans each file individually via the CLI
3. Aggregates results across the entire workspace
4. Updates diagnostics for all open files

The status bar shows progress during the scan and the final score when complete.

### Auto-Scan on Save

By default, the extension scans the active file every time it is saved. This behavior can be toggled with the `sorobanGuard.runOnSave` setting. When enabled:

- Only Rust files are scanned (other languages are ignored)
- The scan runs asynchronously and does not block the editor
- Results update automatically in the Problems panel

---

## Code Actions Reference

| Rule ID | Vulnerability | Available Fix |
|---------|--------------|---------------|
| `A-01` | Missing `require_auth` | Inserts `require_auth(&admin);` before the function body |
| `A-04` | Missing authorization | Inserts `require_auth(&admin);` before the function body |
| `O-01` | Unchecked arithmetic | Replaces `a + b` with `a.checked_add(b).unwrap_or(0)` (also handles `-`, `*`, `/`) |
| `R-01` | Reentrancy risk | Opens the report panel with reentrancy details and remediation guidance |

---

## Configuration Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `sorobanGuard.path` | `string` | `soroban-guard` | Path to the Soroban Guard CLI binary. Use an absolute path if the binary is not in your `PATH`. |
| `sorobanGuard.severity` | `enum` | `low` | Minimum severity level to display. Findings below this threshold are ignored. Order: `info` < `low` < `medium` < `high` < `critical`. |
| `sorobanGuard.runOnSave` | `boolean` | `true` | Automatically scan the active Rust file when saved. Disable for manual-only scanning. |
| `sorobanGuard.exclude` | `string` | `**/test_*,**/fixtures/*` | Comma-separated glob patterns of files to skip during scanning. Supports `**/` prefix patterns. |

### Severity Levels

| Level | Diagnostic Severity | Example |
|-------|-------------------|---------|
| `critical` | Error (red) | Unvalidated contract upgrade |
| `high` | Error (red) | Missing authorization on transfers |
| `medium` | Warning (yellow) | Unchecked arithmetic |
| `low` | Information (blue) | Missing events |
| `info` | Hint (gray) | Style or naming suggestions |

---

## Keyboard Shortcuts

| Shortcut | Command |
|----------|---------|
| `Ctrl+Shift+S` (Windows/Linux) | Soroban Guard: Scan Current File |
| `Cmd+Shift+S` (macOS) | Soroban Guard: Scan Current File |
| `Ctrl+Shift+P` → type command | Any Soroban Guard command |

Customize these in VS Code's Keyboard Shortcuts editor (`Ctrl+K Ctrl+S`).

---

## Architecture

The extension follows VS Code's extension architecture with the following components:

```
┌─────────────────────────────────────────────────┐
│                 extension.ts                     │
│         Activation & command registration        │
├──────────┬──────────┬──────────┬────────────────┤
│diagnostics│ code     │ statusBar│  reportPanel   │
│ .ts       │Actions.ts│ .ts     │   .ts           │
│ CLI       │ Quick    │ Status  │  Webview        │
│ invoker   │ fixes    │ bar UI  │  report HTML    │
├──────────┴──────────┴──────────┴────────────────┤
│              client.ts / server.ts               │
│         Output channel & LSP integration         │
└─────────────────────────────────────────────────┘
```

- **`diagnostics.ts`** — Spawns the Soroban Guard CLI as a child process, parses JSON output, and maps findings to VS Code `Diagnostic` objects.
- **`codeActions.ts`** — Registers a `CodeActionProvider` for Rust files, providing context-aware quick fixes based on rule IDs.
- **`statusBar.ts`** — Manages the status bar item with state transitions and score display.
- **`reportPanel.ts`** — Creates a webview panel with a styled HTML report including score circle, grade, and findings table.
- **`config.ts`** — Typed configuration accessor for extension settings.

---

## Troubleshooting

### "soroban-guard binary not found"

1. Verify the CLI is installed: `soroban-guard --version`
2. Check the `sorobanGuard.path` setting in VS Code settings
3. Provide the full absolute path to the binary if it is not in your `PATH`

### No diagnostics appear

1. Ensure the file has the Rust language mode (`rust`)
2. Check that `sorobanGuard.severity` is not set too high for the issues you expect to see
3. Verify `sorobanGuard.runOnSave` is enabled (or run the scan command manually)
4. Open the Output panel (`Ctrl+Shift+U`) and select "Soroban Guard" to see logs

### Extension not activating

1. Make sure your VS Code is version `^1.85.0` or higher
2. Open a Rust file to trigger the `onLanguage:rust` activation event
3. Check the Extension Host logs in the Output panel

---

## Contributing

Contributions are welcome! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Soroban-Guard/VS.git
cd VS

# Install dependencies
npm install

# Compile in watch mode
npm run watch

# Run tests
npm run test

# Build for production
npm run compile
```

---

## Release Notes

### 0.1.0 (Initial Release)

- **Inline Diagnostics** — Real-time vulnerability detection with severity-colored underlines
- **Quick-Fix Code Actions** — One-click fixes for missing auth, unchecked arithmetic, and reentrancy
- **Rich Report Panel** — Webview with security score, grade, and detailed findings table
- **Workspace Scanning** — Batch analysis of all Rust files in the workspace
- **Status Bar Integration** — Score display and scan state indicators
- **Auto-Scan on Save** — Automatic analysis on file save with configuration toggle
- **Severity Filtering** — Configurable minimum severity threshold
- **Exclusion Patterns** — Glob-based file exclusion for tests and fixtures
- **Context Menu Integration** — Right-click scan option for Rust files
- **Keyboard Shortcut** — `Ctrl+Shift+S` / `Cmd+Shift+S` for quick scanning

---

## License

[MIT](LICENSE) © Soroban Guard
