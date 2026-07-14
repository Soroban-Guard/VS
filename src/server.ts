import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';

export class SorobanGuardServer {
    private process: ChildProcess | null = null;

    async start(): Promise<void> {
        const config = vscode.workspace.getConfiguration('sorobanGuard');
        const binaryPath = config.get<string>('path', 'soroban-guard');

        if (!binaryPath) {
            vscode.window.showErrorMessage('Soroban Guard: No binary path configured');
            return;
        }

        try {
            const proc = spawn(binaryPath, ['server', '--stdio'], {
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            this.process = proc;

            proc.stdout?.on('data', (data: Buffer) => {
                this.handleServerMessage(data.toString());
            });

            proc.stderr?.on('data', (data: Buffer) => {
                console.error('Soroban Guard server error:', data.toString());
            });

            proc.on('close', (code: number | null) => {
                console.log(`Soroban Guard server exited with code ${code}`);
                this.process = null;
            });

            console.log('Soroban Guard language server started');
        } catch (err) {
            vscode.window.showErrorMessage(
                `Failed to start Soroban Guard server: ${(err as Error).message}`
            );
        }
    }

    stop(): void {
        if (this.process) {
            this.process.kill();
            this.process = null;
            console.log('Soroban Guard language server stopped');
        }
    }

    private handleServerMessage(message: string): void {
        try {
            const parsed = JSON.parse(message);
            if (parsed.method === 'publishDiagnostics') {
                const params = parsed.params;
                if (params?.uri && params?.diagnostics) {
                    const diagnosticCollection =
                        vscode.languages.createDiagnosticCollection('soroban-guard-ls');
                    diagnosticCollection.set(
                        vscode.Uri.parse(params.uri),
                        params.diagnostics
                    );
                }
            }
        } catch {
            console.error('Failed to parse server message:', message);
        }
    }
}
