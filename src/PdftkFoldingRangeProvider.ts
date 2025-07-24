import * as vscode from 'vscode';

export class PdftkFoldingRangeProvider implements vscode.FoldingRangeProvider {
    provideFoldingRanges(
        document: vscode.TextDocument,
        context: vscode.FoldingContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FoldingRange[]> {
        const foldingRanges: vscode.FoldingRange[] = [];
        const regEx = /^((BookmarkBegin)|((BookmarkPageNumber):.*))$/g;
        
        let stack: { line: number, char: string }[] = [];
        
        for (let line = 0; line < document.lineCount; line++) {
            const text = document.lineAt(line).text;
            let match: RegExpExecArray | null;
            
            while (match = regEx.exec(text)) {
                const char = match[2] ? match[2] : match[4];
                console.log('[' + text + '] -> ' + char);
                
                if (char === 'BookmarkBegin') {
                    stack.push({ line, char });
                } else if (char === 'BookmarkPageNumber') {
                    const start = stack.pop();
                    if (start) {
                        foldingRanges.push(new vscode.FoldingRange(
                            start.line,
                            line,
                            this.getFoldingRangeKind(start.char)
                        ));
                    }
                }
            }
        }
        
        return foldingRanges;
    }
    
    private getFoldingRangeKind(char: string): vscode.FoldingRangeKind | undefined {
        switch (char.toLowerCase()) {
            case 'BookmarkBegin': return vscode.FoldingRangeKind.Region;
            case '{': return vscode.FoldingRangeKind.Imports;
            default: return undefined;
        }
    }
}