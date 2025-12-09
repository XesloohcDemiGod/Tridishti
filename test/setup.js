"use strict";
/**
 * Jest test setup for Tridishti extension
 */
// Mock VS Code API
const mockVSCode = {
    workspace: {
        getConfiguration: jest.fn(() => ({
            get: jest.fn((key) => {
                const defaults = {
                    'tridishti.enabled': true,
                    'tridishti.checkpointInterval': 30,
                    'tridishti.milestoneThreshold': 120,
                    'tridishti.scopeCheckInterval': 60,
                    'tridishti.fileChangeThreshold': 10,
                    'tridishti.nudgeStrategy': 'default',
                    'tridishti.autoCommit': false,
                    'tridishti.autoTag': false,
                    'tridishti.learningCategories': ['insight', 'gotcha', 'pattern', 'solution', 'question'],
                };
                return defaults[key];
            }),
        })),
        workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
        textDocuments: [],
        onDidChangeTextDocument: jest.fn(),
        onDidSaveTextDocument: jest.fn(),
    },
    window: {
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showInputBox: jest.fn(),
        showQuickPick: jest.fn(),
        createWebviewPanel: jest.fn(() => ({
            webview: {
                html: '',
                onDidReceiveMessage: jest.fn(),
                postMessage: jest.fn(),
            },
            onDidDispose: jest.fn(),
            dispose: jest.fn(),
        })),
    },
    commands: {
        registerCommand: jest.fn(() => ({ dispose: jest.fn() })),
    },
    EventEmitter: jest.fn(() => ({
        event: jest.fn(() => ({ dispose: jest.fn() })),
        fire: jest.fn(),
    })),
    Memento: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
    })),
};
// Mock the vscode module
jest.mock('vscode', () => mockVSCode);
// Mock child_process for git operations
jest.mock('child_process', () => ({
    execSync: jest.fn(),
}));
// Global test utilities
global.testUtils = {
    mockVSCode,
    createMockEventEmitter: () => ({
        event: jest.fn(() => ({ dispose: jest.fn() })),
        fire: jest.fn(),
    }),
    createMockMemento: () => ({
        get: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
    }),
};
//# sourceMappingURL=setup.js.map