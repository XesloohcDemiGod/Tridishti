// Mock VS Code API
const mockVSCode = {
  workspace: {
    getConfiguration: jest.fn(() => ({
      get: jest.fn((key: string) => {
        const defaults: Record<string, any> = {
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

export = mockVSCode;
