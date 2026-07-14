import * as assert from 'assert';
import * as vscode from 'vscode';

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
});
