import * as vscode from 'vscode';

export class SorobanGuardCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix,
    ];
    
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeAction[]> {
        const actions: vscode.CodeAction[] = [];
        
        for (const diagnostic of context.diagnostics) {
            if (diagnostic.source !== 'soroban-guard') continue;
            
            const ruleId = diagnostic.code as string;
            
            // Suggest adding require_auth
            if (ruleId?.startsWith('A-01') || ruleId?.startsWith('A-04')) {
                const action = new vscode.CodeAction(
                    'Add require_auth() check',
                    vscode.CodeActionKind.QuickFix
                );
                action.edit = new vscode.WorkspaceEdit();
                action.edit.insert(
                    document.uri,
                    new vscode.Position(range.start.line, 0),
                    '    require_auth(&admin);\n'
                );
                action.diagnostics = [diagnostic];
                actions.push(action);
            }
            
            // Suggest using checked arithmetic
            if (ruleId?.startsWith('O-01')) {
                const action = new vscode.CodeAction(
                    'Use checked arithmetic',
                    vscode.CodeActionKind.QuickFix
                );
                action.edit = new vscode.WorkspaceEdit();
                
                // Get the line text and suggest replacement
                const line = document.lineAt(range.start.line).text;
                const checkedMatch = line.match(/(\w+)\s*([+\-*\/])\s*(\w+)/);
                if (checkedMatch) {
                    const [_, left, op, right] = checkedMatch;
                    const checkedMethod = op === '+' ? 'checked_add' 
                        : op === '-' ? 'checked_sub' 
                        : op === '*' ? 'checked_mul' 
                        : op === '/' ? 'checked_div' : null;
                    
                    if (checkedMethod) {
                        action.edit.replace(
                            document.uri,
                            new vscode.Range(range.start.line, 0, range.start.line, line.length),
                            line.replace(
                                `${left} ${op} ${right}`,
                                `${left}.${checkedMethod}(${right}).unwrap_or(0)`
                            )
                        );
                    }
                }
                action.diagnostics = [diagnostic];
                actions.push(action);
            }
            
            // Suggest moving state before external call
            if (ruleId === 'R-01') {
                const action = new vscode.CodeAction(
                    'View reentrancy fix suggestion',
                    vscode.CodeActionKind.QuickFix
                );
                action.diagnostics = [diagnostic];
                action.command = {
                    command: 'soroban-guard.showReport',
                    title: 'Show reentrancy details',
                };
                actions.push(action);
            }
        }
        
        return actions;
    }
}
