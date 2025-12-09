/**
 * Jest test setup for Tridishti extension
 */
declare const mockVSCode: {
    workspace: {
        getConfiguration: jest.Mock<{
            get: jest.Mock<any, [key: string], any>;
        }, [], any>;
        workspaceFolders: {
            uri: {
                fsPath: string;
            };
        }[];
        textDocuments: never[];
        onDidChangeTextDocument: jest.Mock<any, any, any>;
        onDidSaveTextDocument: jest.Mock<any, any, any>;
    };
    window: {
        showInformationMessage: jest.Mock<any, any, any>;
        showWarningMessage: jest.Mock<any, any, any>;
        showErrorMessage: jest.Mock<any, any, any>;
        showInputBox: jest.Mock<any, any, any>;
        showQuickPick: jest.Mock<any, any, any>;
        createWebviewPanel: jest.Mock<{
            webview: {
                html: string;
                onDidReceiveMessage: jest.Mock<any, any, any>;
                postMessage: jest.Mock<any, any, any>;
            };
            onDidDispose: jest.Mock<any, any, any>;
            dispose: jest.Mock<any, any, any>;
        }, [], any>;
    };
    commands: {
        registerCommand: jest.Mock<{
            dispose: jest.Mock<any, any, any>;
        }, [], any>;
    };
    EventEmitter: jest.Mock<{
        event: jest.Mock<{
            dispose: jest.Mock<any, any, any>;
        }, [], any>;
        fire: jest.Mock<any, any, any>;
    }, [], any>;
    Memento: jest.Mock<{
        get: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
    }, [], any>;
};
//# sourceMappingURL=setup.d.ts.map