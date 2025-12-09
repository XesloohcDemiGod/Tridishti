declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        mockVSCode: any;
        createMockEventEmitter: () => any;
        createMockMemento: () => any;
      };
    }
  }
}

export {};
