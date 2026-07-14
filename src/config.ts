import * as vscode from 'vscode';

export interface SorobanGuardConfig {
    path: string;
    severity: string;
    runOnSave: boolean;
    exclude: string;
}

export function getConfig(): SorobanGuardConfig {
    const config = vscode.workspace.getConfiguration('sorobanGuard');
    return {
        path: config.get<string>('path', 'soroban-guard'),
        severity: config.get<string>('severity', 'low'),
        runOnSave: config.get<boolean>('runOnSave', true),
        exclude: config.get<string>('exclude', '**/test_*,**/fixtures/*'),
    };
}
