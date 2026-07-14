import * as vscode from 'vscode';

export class SorobanGuardCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix,
    ];

    provideCodeActions(
        document: vscode.TextDocument,
        _range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const actions: vscode.CodeAction[] = [];

        for (const diagnostic of context.diagnostics) {
            if (diagnostic.source !== 'soroban-guard') {
                continue;
            }

            const ruleCode = diagnostic.code as string;
            const suggestion = diagnostic.relatedInformation?.[0]?.message;

            if (suggestion) {
                const applyFix = new vscode.CodeAction(
                    `Apply suggestion: ${suggestion.substring(0, 60)}${suggestion.length > 60 ? '...' : ''}`,
                    vscode.CodeActionKind.QuickFix
                );
                applyFix.edit = new vscode.WorkspaceEdit();
                applyFix.edit.replace(
                    document.uri,
                    diagnostic.range,
                    suggestion
                );
                applyFix.diagnostics = [diagnostic];
                applyFix.isPreferred = true;
                actions.push(applyFix);
            }

            const suppressRule = new vscode.CodeAction(
                `Suppress ${ruleCode} for this line`,
                vscode.CodeActionKind.QuickFix
            );
            suppressRule.edit = new vscode.WorkspaceEdit();
            const line = document.lineAt(diagnostic.range.start.line);
            suppressRule.edit.insert(
                document.uri,
                line.range.end,
                ` // @soroban-guard-ignore ${ruleCode}`
            );
            suppressRule.diagnostics = [diagnostic];
            actions.push(suppressRule);

            const showDocs = new vscode.CodeAction(
                `View documentation for ${ruleCode}`,
                vscode.CodeActionKind.QuickFix
            );
            showDocs.command = {
                command: 'vscode.open',
                title: 'Open Documentation',
                arguments: [
                    vscode.Uri.parse(
                        `https://soroban-guard.dev/rules/${ruleCode}`
                    ),
                ],
            };
            showDocs.diagnostics = [diagnostic];
            actions.push(showDocs);
        }

        return actions;
    }
}
