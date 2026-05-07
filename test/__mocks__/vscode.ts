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
    createFileSystemWatcher: jest.fn(() => ({
      onDidCreate: jest.fn(),
      onDidChange: jest.fn(),
      onDidDelete: jest.fn(),
      dispose: jest.fn(),
    })),
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
    createStatusBarItem: jest.fn(() => ({
      text: '',
      tooltip: '',
      command: '',
      backgroundColor: undefined,
      show: jest.fn(),
      hide: jest.fn(),
      dispose: jest.fn(),
    })),
  },
  commands: {
    registerCommand: jest.fn(() => ({ dispose: jest.fn() })),
    executeCommand: jest.fn().mockResolvedValue(undefined),
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
  Uri: {
    file: jest.fn((path: string) => ({ fsPath: path, scheme: 'file' })),
    parse: jest.fn((path: string) => ({ fsPath: path, scheme: 'file' })),
  },
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3,
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2,
  },
  ThemeColor: jest.fn((id: string) => ({ id })),
  MarkdownString: jest.fn((value: string) => ({ value })),
};

export = mockVSCode;
