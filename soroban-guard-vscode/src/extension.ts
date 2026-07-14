import * as vscode from 'vscode';
import { SorobanGuardDiagnostics } from './diagnostics';
import { SorobanGuardStatusBar } from './statusBar';
import { SorobanGuardCodeActionProvider } from './codeActions';
import { showReportPanel } from './reportPanel';

let diagnosticsProvider: SorobanGuardDiagnostics;
let statusBar: SorobanGuardStatusBar;

export function activate(context: vscode.ExtensionContext) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('soroban-guard');

    diagnosticsProvider = new SorobanGuardDiagnostics(diagnosticCollection);
    statusBar = new SorobanGuardStatusBar();

    context.subscriptions.push(
        vscode.commands.registerCommand('soroban-guard.scanFile', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                diagnosticsProvider.scanFile(editor.document);
            }
        }),

        vscode.commands.registerCommand('soroban-guard.scanWorkspace', () => {
            diagnosticsProvider.scanWorkspace();
        }),

        vscode.commands.registerCommand('soroban-guard.clearResults', () => {
            diagnosticCollection.clear();
            statusBar.update('idle');
        }),

        vscode.commands.registerCommand('soroban-guard.showReport', () => {
            showReportPanel(diagnosticsProvider.lastReport);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((doc) => {
            if (doc.languageId === 'rust' &&
                vscode.workspace.getConfiguration('sorobanGuard').get('runOnSave')) {
                diagnosticsProvider.scanFile(doc);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('sorobanGuard')) {
                diagnosticsProvider.updateConfig();
            }
        })
    );

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            { language: 'rust' },
            new SorobanGuardCodeActionProvider(),
            { providedCodeActionKinds: SorobanGuardCodeActionProvider.providedCodeActionKinds }
        )
    );

    statusBar.update('idle');
    console.log('Soroban Guard activated');
}

export function deactivate() {
    diagnosticsProvider?.dispose();
    statusBar?.dispose();
}
