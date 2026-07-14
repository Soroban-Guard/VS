import * as vscode from 'vscode';

export function showReportPanel(report: any): void {
    const panel = vscode.window.createWebviewPanel(
        'sorobanGuardReport',
        'Soroban Guard Report',
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    );

    if (!report) {
        panel.webview.html = getNoReportHtml();
        return;
    }

    panel.webview.html = getReportHtml(report);
}

function getNoReportHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>No Report</title>
    <style>
        body { font-family: var(--vscode-font-family); padding: 2em; }
        h2 { color: var(--vscode-editor-foreground); }
        p { color: var(--vscode-descriptionForeground); }
    </style>
</head>
<body>
    <h2>No Scan Results</h2>
    <p>Run a scan to see results here.</p>
</body>
</html>`;
}

function getReportHtml(report: any): string {
    const findings = report.findings || [];
    const summary = report.summary || { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 };

    const findingsRows = findings.map((f: any) => `
        <tr>
            <td class="severity-${f.severity}">${f.severity}</td>
            <td>${escapeHtml(f.rule)}</td>
            <td>${escapeHtml(f.message)}</td>
            <td>${escapeHtml(f.file)}:${f.line}</td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Soroban Guard Report</title>
    <style>
        body { font-family: var(--vscode-font-family); padding: 1em; color: var(--vscode-editor-foreground); }
        .summary { display: flex; gap: 1em; margin-bottom: 2em; }
        .stat { padding: 1em; border-radius: 4px; min-width: 80px; text-align: center; }
        .stat-critical { background: #c0392b; color: white; }
        .stat-high { background: #e74c3c; color: white; }
        .stat-medium { background: #f39c12; color: white; }
        .stat-low { background: #3498db; color: white; }
        .stat-info { background: #95a5a6; color: white; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.5em; text-align: left; border-bottom: 1px solid var(--vscode-editor-lineHighlightBackground); }
        th { font-weight: bold; }
        .severity-critical { color: #c0392b; font-weight: bold; }
        .severity-high { color: #e74c3c; font-weight: bold; }
        .severity-medium { color: #f39c12; font-weight: bold; }
        .severity-low { color: #3498db; }
        .severity-info { color: #95a5a6; }
    </style>
</head>
<body>
    <h1>Soroban Guard Report</h1>
    <div class="summary">
        <div class="stat stat-critical">${summary.critical} Critical</div>
        <div class="stat stat-high">${summary.high} High</div>
        <div class="stat stat-medium">${summary.medium} Medium</div>
        <div class="stat stat-low">${summary.low} Low</div>
        <div class="stat stat-info">${summary.info} Info</div>
    </div>
    <table>
        <thead>
            <tr>
                <th>Severity</th>
                <th>Rule</th>
                <th>Message</th>
                <th>Location</th>
            </tr>
        </thead>
        <tbody>
            ${findingsRows}
        </tbody>
    </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
