import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

interface GuardFinding {
    rule_id: string;
    severity: string;
    message: string;
    location: {
        file: string;
        line: number;
        column: number;
    };
    suggestion: string;
}

interface GuardReport {
    contract: string;
    file: string;
    score: number;
    grade: string;
    findings: GuardFinding[];
}

interface GuardResults {
    reports: GuardReport[];
}

export class SorobanGuardDiagnostics {
    private collection: vscode.DiagnosticCollection;
    private config: SorobanGuardConfig;
    public lastReport: GuardResults | null = null;
    public progressCallback?: (completed: number, total: number) => void;
    public workspaceAverageScore: number = 0;
    
    constructor(collection: vscode.DiagnosticCollection) {
        this.collection = collection;
        this.config = this.loadConfig();
    }
    
    private loadConfig(): SorobanGuardConfig {
        const config = vscode.workspace.getConfiguration('sorobanGuard');
        return {
            cliPath: config.get<string>('path', 'soroban-guard'),
            minSeverity: config.get<string>('severity', 'low'),
            exclude: config.get<string>('exclude', ''),
            maxConcurrency: config.get<number>('maxConcurrency', 4),
        };
    }
    
    public updateConfig(): void {
        this.config = this.loadConfig();
    }
    
    public async scanFile(document: vscode.TextDocument): Promise<GuardResults | null> {
        if (document.languageId !== 'rust') return null;
        
        const filePath = document.uri.fsPath;
        if (!this.shouldScan(filePath)) return null;
        
        try {
            const results = await this.runGuard(filePath);
            this.lastReport = results;
            this.updateDiagnostics(document.uri, results);
            
            const score = results.reports?.[0]?.score ?? -1;
            if (score >= 0) {
                this.reportStatus(`score: ${score}`);
            }
            return results;
        } catch (error) {
            this.reportStatus('error');
            console.error('Soroban Guard scan failed:', error);
            return null;
        }
    }
    
    public async scanWorkspace(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;
        
        this.reportStatus('scanning workspace');
        
        const allFiles: vscode.Uri[] = [];
        for (const folder of workspaceFolders) {
            const pattern = new vscode.RelativePattern(folder, '**/*.rs');
            const files = await vscode.workspace.findFiles(pattern);
            allFiles.push(...files);
        }
        
        if (allFiles.length === 0) {
            this.reportStatus('complete');
            return;
        }
        
        const total = allFiles.length;
        let completed = 0;
        const scores: number[] = [];
        const concurrency = this.config.maxConcurrency;
        const queue = [...allFiles];
        let index = 0;
        
        await new Promise<void>((resolve) => {
            let active = 0;
            
            const next = () => {
                while (active < concurrency && index < queue.length) {
                    const file = queue[index++];
                    active++;
                    
                    (async () => {
                        try {
                            const doc = await vscode.workspace.openTextDocument(file);
                            const results = await this.scanFile(doc);
                            if (results?.reports?.[0]?.score != null) {
                                scores.push(results.reports[0].score);
                            }
                        } catch {
                            // Per-file errors are handled in scanFile and must not abort the scan
                        } finally {
                            active--;
                            completed++;
                            this.progressCallback?.(completed, total);
                            this.reportStatus(`scanning ${completed}/${total}`);
                            
                            if (completed === total) {
                                resolve();
                            } else {
                                next();
                            }
                        }
                    })();
                }
            };
            
            next();
        });
        
        if (scores.length > 0) {
            this.workspaceAverageScore = Math.round(
                scores.reduce((a, b) => a + b, 0) / scores.length * 100
            ) / 100;
        }
        
        this.reportStatus('complete');
    }
    
    private async runGuard(filePath: string): Promise<GuardResults> {
        return new Promise((resolve, reject) => {
            const args = [
                filePath,
                '--format', 'json',
                '--min-severity', this.config.minSeverity,
            ];
            
            if (this.config.exclude) {
                args.push('--exclude', this.config.exclude);
            }
            
            const proc = cp.spawn(this.config.cliPath, args, {
                cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
            });
            
            let stdout = '';
            let stderr = '';
            
            proc.stdout.on('data', (data) => { stdout += data; });
            proc.stderr.on('data', (data) => { stderr += data; });
            
            proc.on('close', (code) => {
                if (code === 0 || code === 1) {
                    try {
                        const results = JSON.parse(stdout);
                        resolve(results);
                    } catch (e) {
                        reject(new Error(`Failed to parse output: ${stdout.slice(0, 200)}`));
                    }
                } else {
                    reject(new Error(`Guard CLI failed: ${stderr}`));
                }
            });
            
            proc.on('error', (err) => {
                reject(new Error(`Failed to start Guard CLI: ${err.message}`));
            });
        });
    }
    
    private updateDiagnostics(uri: vscode.Uri, results: GuardResults): void {
        const diagnostics: vscode.Diagnostic[] = [];
        
        for (const report of results.reports || []) {
            for (const finding of report.findings || []) {
                const severity = this.severityToVsCode(finding.severity);
                
                // Use line from finding or default to first line
                const line = Math.max(0, (finding.location?.line || 1) - 1);
                const range = new vscode.Range(line, 0, line, 1000);
                
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `[${finding.rule_id}] ${finding.message}`,
                    severity
                );
                
                diagnostic.code = finding.rule_id;
                diagnostic.source = 'soroban-guard';
                
                if (finding.suggestion) {
                    diagnostic.relatedInformation = [
                        new vscode.DiagnosticRelatedInformation(
                            new vscode.Location(uri, range),
                            `Suggestion: ${finding.suggestion}`
                        )
                    ];
                }
                
                diagnostics.push(diagnostic);
            }
        }
        
        this.collection.set(uri, diagnostics);
    }
    
    private severityToVsCode(severity: string): vscode.DiagnosticSeverity {
        switch (severity.toLowerCase()) {
            case 'critical':
            case 'high':
                return vscode.DiagnosticSeverity.Error;
            case 'medium':
                return vscode.DiagnosticSeverity.Warning;
            case 'low':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Hint;
        }
    }
    
    private shouldScan(filePath: string): boolean {
        if (!this.config.exclude) return true;
        
        const patterns = this.config.exclude.split(',');
        const relativePath = path.relative(
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
            filePath
        );
        
        return !patterns.some(pattern => {
            const glob = pattern.trim();
            if (glob.startsWith('**/')) {
                return relativePath.includes(glob.slice(3));
            }
            return false;
        });
    }
    
    private reportStatus(status: string): void {
        vscode.commands.executeCommand('setContext', 'sorobanGuard.status', status);
    }
    
    public dispose(): void {
        this.collection.dispose();
    }
}

interface SorobanGuardConfig {
    cliPath: string;
    minSeverity: string;
    exclude: string;
    maxConcurrency: number;
}
