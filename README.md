# Soroban Guard for VS Code

Real-time security analysis for Soroban smart contracts, directly in your editor.

## Features

- **🔴 Inline diagnostics** — See vulnerabilities highlighted as you type
- **⚡ Quick-fix code actions** — Auto-fix common issues with one click
- **📊 Rich report panel** — Full security report in a dedicated view
- **📁 Workspace scanning** — Analyze all contracts in your project
- **🔔 Status bar integration** — Score visible at a glance
- **💾 Auto-scan on save** — Always up-to-date results

## Requirements

- [Soroban Guard CLI](https://github.com/your-org/soroban-guard) installed and in your PATH
- Rust extension for VS Code (`rust-lang.rust-analyzer`)

## Quick Start

1. Install the extension
2. Open a Rust file containing Soroban contract code
3. Diagnostics appear automatically
4. Right-click to see quick-fix suggestions
5. Click the shield icon in the status bar for the full report

## Commands

| Command | Description |
|---------|-------------|
| `Soroban Guard: Scan Current File` | Run analysis on active file |
| `Soroban Guard: Scan Workspace` | Run analysis on all Rust files |
| `Soroban Guard: Clear Results` | Clear all diagnostics |
| `Soroban Guard: Show Full Report` | Open detailed report panel |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `sorobanGuard.path` | `soroban-guard` | Path to CLI binary |
| `sorobanGuard.severity` | `low` | Minimum severity |
| `sorobanGuard.runOnSave` | `true` | Auto-scan on save |
| `sorobanGuard.exclude` | `**/test_*,**/fixtures/*` | Exclusion patterns |

## Keyboard shortcuts

| Shortcut | Command |
|----------|---------|
| `Ctrl+Shift+S` / `Cmd+Shift+S` | Scan current file |

## Release Notes

### 0.1.0

- Initial release
- Inline diagnostics for Soroban contracts
- Quick-fix code actions
- Webview report panel

## License

MIT
