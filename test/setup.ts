/**
 * Jest test setup for Tridishti extension
 */

// VS Code API is mocked via moduleNameMapper

// Mock child_process for git operations
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

// Import the vscode mock
import * as vscode from 'vscode';

// Global test utilities
(global as any).testUtils = {
  mockVSCode: vscode,
  createMockEventEmitter: () => ({
    event: jest.fn(callback => {
      // Store the callback for later firing
      (global as any).testUtils.currentEventCallback = callback;
      return { dispose: jest.fn() };
    }),
    fire: jest.fn(event => {
      // Fire the stored callback if it exists
      if ((global as any).testUtils.currentEventCallback) {
        (global as any).testUtils.currentEventCallback(event);
      }
    }),
    dispose: jest.fn(),
  }),
  createMockMemento: () => ({
    get: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
  }),
};
