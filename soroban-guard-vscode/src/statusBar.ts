import * as vscode from 'vscode';

export class SorobanGuardStatusBar {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'soroban-guard.showReport';
        this.statusBarItem.tooltip = 'Soroban Guard - Click to show report';
        this.statusBarItem.show();
    }

    update(state: 'idle' | 'ready' | 'scanning' | 'error', findingsCount?: number): void {
        switch (state) {
            case 'idle':
                this.statusBarItem.text = '$(shield) Soroban Guard';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case 'ready':
                this.statusBarItem.text = '$(shield) Soroban Guard';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case 'scanning':
                this.statusBarItem.text = '$(sync~spin) Soroban Guard scanning...';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor(
                    'statusBarItem.warningBackground'
                );
                break;
            case 'error':
                this.statusBarItem.text = '$(shield-x) Soroban Guard error';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor(
                    'statusBarItem.errorBackground'
                );
                break;
        }

        if (findingsCount !== undefined) {
            this.statusBarItem.text += ` (${findingsCount})`;
            if (findingsCount > 0) {
                this.statusBarItem.backgroundColor = new vscode.ThemeColor(
                    'statusBarItem.errorBackground'
                );
            }
        }
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}
