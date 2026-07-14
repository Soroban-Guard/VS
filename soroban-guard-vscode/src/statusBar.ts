import * as vscode from 'vscode';

export class SorobanGuardStatusBar {
    private item: vscode.StatusBarItem;
    
    constructor() {
        this.item = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.item.command = 'soroban-guard.showReport';
        this.item.tooltip = 'Click to view full Soroban Guard report';
        this.item.show();
    }
    
    public update(status: string): void {
        switch (status) {
            case 'idle':
                this.item.text = '$(shield) Soroban Guard';
                this.item.backgroundColor = undefined;
                break;
            case 'scanning':
                this.item.text = '$(loading~spin) Soroban Guard...';
                this.item.backgroundColor = undefined;
                break;
            case 'scanning workspace':
                this.item.text = '$(loading~spin) Soroban Guard: Scanning workspace...';
                this.item.backgroundColor = undefined;
                break;
            case 'error':
                this.item.text = '$(alert) Soroban Guard Error';
                this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
                break;
            case 'complete':
                this.item.text = '$(pass) Soroban Guard Complete';
                this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
                break;
            default:
                if (status.startsWith('score:')) {
                    const score = status.split(':')[1].trim();
                    this.item.text = `$(shield) Score: ${score}/100`;
                    this.item.backgroundColor = parseInt(score) >= 70 
                        ? new vscode.ThemeColor('statusBarItem.prominentBackground')
                        : new vscode.ThemeColor('statusBarItem.warningBackground');
                }
                break;
        }
    }
    
    public dispose(): void {
        this.item.dispose();
    }
}
