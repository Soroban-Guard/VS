import * as vscode from 'vscode';
import * as path from 'path';
import { execSync } from 'child_process';
import { getConfig } from './config';

interface SorobanGuardFinding {
    file: string;
    line: number;
    column: number;
    severity: string;
    rule: string;
    message: string;
    suggestion: string;
}

interface SorobanGuardReport {
    findings: SorobanGuardFinding[];
    summary: {
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
    };
}

export class SorobanGuardDiagnostics {
    private collection: vscode.DiagnosticCollection;
    public lastReport: SorobanGuardReport | null = null;
    private severityLevels: Record<string, vscode.DiagnosticSeverity> = {
        critical: vscode.DiagnosticSeverity.Error,
        high: vscode.DiagnosticSeverity.Error,
        medium: vscode.DiagnosticSeverity.Warning,
        low: vscode.DiagnosticSeverity.Information,
        info: vscode.DiagnosticSeverity.Hint,
    };

    constructor(collection: vscode.DiagnosticCollection) {
        this.collection = collection;
    }

    async scanFile(document: vscode.TextDocument): Promise<void> {
        const config = getConfig();
        const filePath = document.uri.fsPath;

        const excludePatterns = config.exclude.split(',');
        for (const pattern of excludePatterns) {
            const globPattern = pattern.trim();
            if (this.matchesGlob(filePath, globPattern)) {
                return;
            }
        }

        this.collection.set(document.uri, []);

        try {
            const result = this.runSorobanGuard(filePath, config.path);
            const report: SorobanGuardReport = JSON.parse(result);
            this.lastReport = report;

            const diagnostics = this.convertFindings(report, config.severity);
            this.collection.set(document.uri, diagnostics);
        } catch (err) {
            const error = err as Error;
            if (!error.message.includes('not found') && !error.message.includes('ENOENT')) {
                console.error('Soroban Guard scan error:', error.message);
            }
        }
    }

    async scanWorkspace(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const config = getConfig();
        this.collection.clear();

        for (const folder of workspaceFolders) {
            const uri = vscode.Uri.joinPath(folder.uri, 'src');
            try {
                const result = this.runSorobanGuard(uri.fsPath, config.path);
                const report: SorobanGuardReport = JSON.parse(result);
                this.lastReport = report;

                const findingsByFile = this.groupFindingsByFile(report, config.severity);
                for (const [filePath, diagnostics] of findingsByFile) {
                    const docUri = vscode.Uri.file(filePath);
                    this.collection.set(docUri, diagnostics);
                }
            } catch (err) {
                const error = err as Error;
                if (!error.message.includes('not found') && !error.message.includes('ENOENT')) {
                    console.error('Soroban Guard workspace scan error:', error.message);
                }
            }
        }
    }

    updateConfig(): void {
        if (this.lastReport) {
            const config = getConfig();
            const allDiagnostics = this.convertFindings(this.lastReport, config.severity);
            if (allDiagnostics.length > 0) {
                const byFile = this.groupFindingsByFile(this.lastReport, config.severity);
                this.collection.clear();
                for (const [filePath, diagnostics] of byFile) {
                    this.collection.set(vscode.Uri.file(filePath), diagnostics);
                }
            }
        }
    }

    dispose(): void {
        this.collection.dispose();
    }

    private runSorobanGuard(target: string, binaryPath: string): string {
        const config = getConfig();
        const args = [
            `--severity`, config.severity,
            `--format`, `json`,
            `--output`, `-`,
        ];
        return execSync(`"${binaryPath}" scan ${args.join(' ')} "${target}"`, {
            encoding: 'utf-8',
            timeout: 30000,
        });
    }

    private convertFindings(report: SorobanGuardReport, minSeverity: string): vscode.Diagnostic[] {
        return report.findings
            .filter(f => this.meetsSeverityThreshold(f.severity, minSeverity))
            .map(f => {
                const severity = this.severityLevels[f.severity] || vscode.DiagnosticSeverity.Warning;
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(
                        Math.max(0, f.line - 1), Math.max(0, f.column - 1),
                        Math.max(0, f.line - 1), f.column + 50
                    ),
                    `[${f.rule}] ${f.message}`,
                    severity
                );
                diagnostic.code = f.rule;
                diagnostic.source = 'soroban-guard';
                diagnostic.relatedInformation = [
                    new vscode.DiagnosticRelatedInformation(
                        new vscode.Location(vscode.Uri.file(f.file), new vscode.Range(0, 0, 0, 0)),
                        f.suggestion
                    ),
                ];
                return diagnostic;
            });
    }

    private groupFindingsByFile(report: SorobanGuardReport, minSeverity: string): Map<string, vscode.Diagnostic[]> {
        const grouped = new Map<string, vscode.Diagnostic[]>();
        const diagnostics = this.convertFindings(report, minSeverity);
        for (const diagnostic of diagnostics) {
            const filePath = diagnostic.relatedInformation?.[0]?.location?.uri?.fsPath || '';
            if (!grouped.has(filePath)) {
                grouped.set(filePath, []);
            }
            grouped.get(filePath)!.push(diagnostic);
        }
        return grouped;
    }

    private meetsSeverityThreshold(findingSeverity: string, minSeverity: string): boolean {
        const order = ['info', 'low', 'medium', 'high', 'critical'];
        return order.indexOf(findingSeverity) >= order.indexOf(minSeverity);
    }

    private matchesGlob(filePath: string, pattern: string): boolean {
        if (pattern.startsWith('**/')) {
            const suffix = pattern.slice(3);
            return filePath.includes(suffix);
        }
        if (pattern.endsWith('/*')) {
            const prefix = pattern.slice(0, -2);
            return filePath.startsWith(prefix);
        }
        if (pattern.includes('*')) {
            const parts = pattern.split('*');
            return parts.every(p => filePath.includes(p));
        }
        return filePath.includes(pattern);
    }
}
