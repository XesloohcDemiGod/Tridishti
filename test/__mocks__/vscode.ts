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
    showInformationMessage: jest.fn().mockResolvedValue(undefined),
    showWarningMessage: jest.fn().mockResolvedValue(undefined),
    showErrorMessage: jest.fn().mockResolvedValue(undefined),
    showInputBox: jest.fn().mockResolvedValue(undefined),
    showQuickPick: jest.fn().mockResolvedValue(undefined),
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
  EventEmitter: jest.fn(() => {
    const listeners: ((event: any) => void)[] = [];
    return {
      event: jest.fn((callback: (event: any) => void) => {
        listeners.push(callback);
        return {
          dispose: jest.fn(() => {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1);
          }),
        };
      }),
      fire: jest.fn((event: any) => {
        listeners.forEach(listener => listener(event));
      }),
    };
  }),
  Memento: jest.fn(() => ({
    get: jest.fn(),
    update: jest.fn(),
  })),
};

export = mockVSCode;
