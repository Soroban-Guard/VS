# Soroban Guard for VS Code

Real-time security analysis for Soroban smart contracts, directly in your editor.

## Features

- **Inline Diagnostics** - See security issues highlighted as you write code
- **Quick Fix Actions** - Apply suggested fixes with one click
- **Workspace Scanning** - Analyze entire projects at once
- **Severity Filtering** - Configure minimum severity level
- **Status Bar Integration** - Quick access to scan results
- **Full Report Panel** - Detailed webview report with all findings

## Requirements

- [Soroban Guard CLI](https://github.com/your-org/soroban-guard) installed and available in PATH
- VS Code 1.85.0 or higher

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `sorobanGuard.path` | `soroban-guard` | Path to the CLI binary |
| `sorobanGuard.severity` | `low` | Minimum severity to display |
| `sorobanGuard.runOnSave` | `true` | Run analysis on file save |
| `sorobanGuard.exclude` | `**/test_*,**/fixtures/*` | Glob patterns to exclude |

## Commands

- `Soroban Guard: Scan Current File` - Scan the active Rust file
- `Soroban Guard: Scan Workspace` - Scan all files in workspace
- `Soroban Guard: Clear Results` - Clear all diagnostics
- `Soroban Guard: Show Full Report` - Open detailed report panel

## License

MIT
