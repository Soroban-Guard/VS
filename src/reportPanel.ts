import * as vscode from 'vscode';
import * as path from 'path';

interface Finding {
    severity: string;
    rule_id: string;
    message: string;
    location: {
        file: string;
        line: number;
    };
    suggestion: string;
}

interface Report {
    score: number;
    grade: string;
    findings: Finding[];
}

interface Results {
    reports: Report[];
}

export function showReportPanel(results: Results | null): void {
    const panel = vscode.window.createWebviewPanel(
        'sorobanGuardReport',
        'Soroban Guard Report',
        vscode.ViewColumn.Two,
        { enableScripts: true }
    );
    
    panel.webview.html = generateHtml(results);

    panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'openFile') {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }

            const filePath = message.file as string;
            const line = (message.line as number) || 1;
            const root = workspaceFolders[0].uri.fsPath;
            const fullPath = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
            const fileUri = vscode.Uri.file(fullPath);

            try {
                const document = await vscode.workspace.openTextDocument(fileUri);
                const editor = await vscode.window.showTextDocument(document, { preview: false });

                const zeroLine = Math.max(0, line - 1);
                const range = new vscode.Range(zeroLine, 0, zeroLine, 0);
                editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
                editor.selection = new vscode.Selection(zeroLine, 0, zeroLine, 0);
            } catch {
                vscode.window.showErrorMessage(`Could not open file: ${filePath}`);
            }
        }
    });
}

function generateHtml(results: Results | null): string {
    if (!results) {
        return `<!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
            <h2>☰ Soroban Guard</h2>
            <p>No results yet. Run a scan to see the report.</p>
        </body>
        </html>`;
    }
    
    const report = results.reports?.[0];
    const score = report?.score ?? 'N/A';
    const grade = report?.grade ?? '?';
    const findings = report?.findings ?? [];
    
    const severityColors: Record<string, string> = {
        critical: '#dc3545',
        high: '#fd7e14',
        medium: '#ffc107',
        low: '#17a2b8',
        info: '#6c757d',
    };
    
    const findingRows = findings.map((f: Finding) => {
        const hasLocation = f.location?.file && f.location?.line;
        const clickAttrs = hasLocation
            ? `data-file="${f.location!.file}" data-line="${f.location!.line}" class="clickable"`
            : '';
        return `
        <tr ${clickAttrs}>
            <td><span class="badge" style="background: ${severityColors[f.severity] || '#6c757d'}">${f.severity}</span></td>
            <td><code>${f.rule_id}</code></td>
            <td>${f.message}</td>
            <td>${hasLocation ? `${f.location!.file}:${f.location!.line}` : '-'}</td>
            <td>${f.suggestion || '-'}</td>
        </tr>`;
    }).join('');
    
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 16px; }
            .score-circle {
                width: 80px; height: 80px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 24px; font-weight: bold; color: white;
                background: ${score >= 90 ? '#28a745' : score >= 70 ? '#ffc107' : score >= 50 ? '#fd7e14' : '#dc3545'};
                margin: 16px auto;
            }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #dee2e6; }
            th { background: #f8f9fa; font-weight: 600; }
            .badge { padding: 2px 8px; border-radius: 12px; color: white; font-size: 11px; font-weight: 600; }
            code { font-family: 'Cascadia Code', monospace; font-size: 12px; }
            tr.clickable { cursor: pointer; }
            tr.clickable:hover { background: #e8e8e8; }
            tr.clickable td:last-child { font-size: 11px; color: #666; }
        </style>
    </head>
    <body>
        <h2>☰ Soroban Guard Report</h2>
        
        <div class="score-circle">${score}</div>
        <p style="text-align: center; color: #666;">Grade: ${grade} | ${findings.length} findings</p>
        
        <h3>Findings</h3>
        <table>
            <thead>
                <tr><th>Severity</th><th>Rule</th><th>Message</th><th>Location</th><th>Suggestion</th></tr>
            </thead>
            <tbody>
                ${findingRows || '<tr><td colspan="5" style="text-align: center;">No findings</td></tr>'}
        </tbody>
            </table>
        <script>
            (function() {
                const vscode = acquireVsCodeApi();
                document.querySelectorAll('tr.clickable').forEach(function(row) {
                    row.addEventListener('click', function() {
                        const file = row.getAttribute('data-file');
                        const line = parseInt(row.getAttribute('data-line'), 10);
                        if (file) {
                            vscode.postMessage({ command: 'openFile', file: file, line: line });
                        }
                    });
                });
            })();
        </script>
        </body>
        </html>`;
}
