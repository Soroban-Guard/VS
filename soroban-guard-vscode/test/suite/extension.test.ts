import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Soroban Guard Extension Test Suite', () => {
    vscode.window.showInformationMessage('Starting Soroban Guard tests');

    test('Extension should be present', () => {
        const ext = vscode.extensions.getExtension('your-publisher.soroban-guard');
        assert.ok(ext, 'Extension should be available');
    });

    test('Extension should activate on rust language', async () => {
        const ext = vscode.extensions.getExtension('your-publisher.soroban-guard');
        if (ext) {
            await ext.activate();
            assert.ok(ext.isActive, 'Extension should activate');
        }
    });

    test('Commands should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('soroban-guard.scanFile'), 'scanFile command should be registered');
        assert.ok(commands.includes('soroban-guard.scanWorkspace'), 'scanWorkspace command should be registered');
        assert.ok(commands.includes('soroban-guard.clearResults'), 'clearResults command should be registered');
        assert.ok(commands.includes('soroban-guard.showReport'), 'showReport command should be registered');
    });

    test('Configuration should have defaults', () => {
        const config = vscode.workspace.getConfiguration('sorobanGuard');
        assert.strictEqual(config.get('severity'), 'low');
        assert.strictEqual(config.get('runOnSave'), true);
        assert.strictEqual(config.get('path'), 'soroban-guard');
    });
});
