import * as vscode from 'vscode';
import { execSync } from 'child_process';
import { getConfig } from './config';

export class SorobanGuardClient {
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Soroban Guard');
    }

    log(message: string): void {
        this.outputChannel.appendLine(`[${new Date().toISOString()}] ${message}`);
    }

    logError(message: string, error?: Error): void {
        this.outputChannel.appendLine(`[ERROR] ${message}`);
        if (error) {
            this.outputChannel.appendLine(error.stack || error.message);
        }
        this.outputChannel.show(true);
    }

    async checkBinary(): Promise<boolean> {
        const config = getConfig();
        try {
            execSync(`"${config.path}" --version`, { encoding: 'utf-8', timeout: 5000 });
            this.log(`Found soroban-guard at: ${config.path}`);
            return true;
        } catch {
            this.logError(`soroban-guard binary not found at: ${config.path}. Please install it or update the path in settings.`);
            return false;
        }
    }

    show(): void {
        this.outputChannel.show();
    }

    dispose(): void {
        this.outputChannel.dispose();
    }
}
