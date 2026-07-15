import * as assert from 'assert';
import * as vscode from 'vscode';
import { SorobanGuardDiagnostics } from '../../diagnostics';
import { SorobanGuardStatusBar } from '../../statusBar';

suite('Soroban Guard Extension Test Suite', () => {
    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('your-publisher.soroban-guard'));
    });
    
    test('Should register all commands', async () => {
        const commands = await vscode.commands.getCommands(true);
        const guardCommands = commands.filter(c => c.startsWith('soroban-guard'));
        assert.ok(guardCommands.includes('soroban-guard.scanFile'));
        assert.ok(guardCommands.includes('soroban-guard.scanWorkspace'));
        assert.ok(guardCommands.includes('soroban-guard.clearResults'));
        assert.ok(guardCommands.includes('soroban-guard.showReport'));
    });

    test('Config should have default maxConcurrency of 4', () => {
        const config = vscode.workspace.getConfiguration('sorobanGuard');
        const maxConcurrency = config.get<number>('maxConcurrency');
        assert.strictEqual(maxConcurrency, 4);
    });

    test('scanFile should return null for non-Rust documents', async () => {
        const collection = vscode.languages.createDiagnosticCollection('soroban-guard-test');
        const diagnostics = new SorobanGuardDiagnostics(collection);
        const doc = await vscode.workspace.openTextDocument({ content: 'hello', language: 'plaintext' });
        const result = await diagnostics.scanFile(doc);
        assert.strictEqual(result, null);
        collection.dispose();
    });

    test('workspaceAverageScore should start at 0', () => {
        const collection = vscode.languages.createDiagnosticCollection('soroban-guard-test');
        const diagnostics = new SorobanGuardDiagnostics(collection);
        assert.strictEqual(diagnostics.workspaceAverageScore, 0);
        collection.dispose();
    });

    test('progressCallback should be invokable', () => {
        const collection = vscode.languages.createDiagnosticCollection('soroban-guard-test');
        const diagnostics = new SorobanGuardDiagnostics(collection);
        const calls: { completed: number; total: number }[] = [];
        diagnostics.progressCallback = (completed, total) => {
            calls.push({ completed, total });
        };
        diagnostics.progressCallback?.(3, 10);
        assert.strictEqual(calls.length, 1);
        assert.strictEqual(calls[0].completed, 3);
        assert.strictEqual(calls[0].total, 10);
        collection.dispose();
    });

    test('SorobanGuardStatusBar should display progress', () => {
        const statusBar = new SorobanGuardStatusBar();
        statusBar.updateProgress(5, 42);
        statusBar.updateProgress(42, 42);
        statusBar.dispose();
    });
});
