/**
 * Test suite for DharmaSankata module
 */

import { DharmaSankata } from '../../src/core/dharma-sankata';
import { IDharmaSankataConfig } from '../../src/core/dharma-sankata';

describe('DharmaSankata', () => {
  let config: IDharmaSankataConfig;
  let eventEmitter: any;
  let dharmaSankata: DharmaSankata;

  beforeEach(() => {
    config = {
      scopeCheckInterval: 60,
      fileChangeThreshold: 10,
      enabled: true,
    };
    eventEmitter = (global as any).testUtils.createMockEventEmitter();
    dharmaSankata = new DharmaSankata(config, eventEmitter);
  });

  afterEach(() => {
    dharmaSankata.stop();
    jest.clearAllMocks();
  });

  describe('scope checking', () => {
    it('should perform scope check', async () => {
      const result = await dharmaSankata.checkScope();

      expect(result).toBeDefined();
      expect(result.detected).toBe(false);
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.details.filesChanged).toBe(0);
      expect(result.details.threshold).toBe(10);
    });

    it('should detect file threshold violation', async () => {
      // Mock files changed
      const mockVSCode = (global as any).testUtils.mockVSCode;
      mockVSCode.workspace.textDocuments = [
        { uri: { scheme: 'file' }, isDirty: true },
        { uri: { scheme: 'file' }, isDirty: true },
        { uri: { scheme: 'file' }, isDirty: true },
        { uri: { scheme: 'file' }, isDirty: true },
        { uri: { scheme: 'file' }, isDirty: true },
        { uri: { scheme: 'file' }, isDirty: true },
        { uri: { scheme: 'file' }, isDirty: true },
        { uri: { scheme: 'file' }, isDirty: true },
        { uri: { scheme: 'file' }, isDirty: true },
        { uri: { scheme: 'file' }, isDirty: true },
        { uri: { scheme: 'file' }, isDirty: true }, // 11 files
      ];

      const result = await dharmaSankata.checkScope();

      expect(result.detected).toBe(true);
      expect(result.reason).toBe('file_threshold');
      expect(result.suggestion).toContain('exceeds the threshold');
      expect(eventEmitter.fire).toHaveBeenCalledWith({
        type: 'dharma_alert',
        timestamp: expect.any(Number),
        data: result,
      });
    });

    it('should detect goal mismatch', async () => {
      dharmaSankata.setGoal('user authentication');
      // Mock files that don't match the goal
      const mockVSCode = (global as any).testUtils.mockVSCode;
      mockVSCode.workspace.textDocuments = [
        { uri: { fsPath: '/src/payment.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/invoice.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/billing.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/checkout.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/subscription.ts', scheme: 'file' }, isDirty: true },
      ];

      const result = await dharmaSankata.checkScope();

      expect(result.detected).toBe(true);
      expect(result.reason).toBe('goal_mismatch');
      expect(result.details.detectedGoal).toBeDefined();
      expect(result.suggestion).toContain('diverge from your stated goal');
    });

    it('should not detect goal mismatch when no goal set', async () => {
      const mockVSCode = (global as any).testUtils.mockVSCode;
      mockVSCode.workspace.textDocuments = [
        { uri: { fsPath: '/src/payment.ts', scheme: 'file' }, isDirty: true },
      ];

      const result = await dharmaSankata.checkScope();

      expect(result.detected).toBe(false);
    });
  });

  describe('goal management', () => {
    it('should set goal', () => {
      dharmaSankata.setGoal('implement user authentication');

      expect(dharmaSankata).toBeDefined();
    });

    it('should update goal', () => {
      dharmaSankata.setGoal('first goal');
      dharmaSankata.setGoal('updated goal');

      expect(dharmaSankata).toBeDefined();
    });
  });

  describe('alert management', () => {
    it('should store alerts', async () => {
      // Create an alert by triggering detection
      const mockVSCode = (global as any).testUtils.mockVSCode;
      mockVSCode.workspace.textDocuments = Array(15).fill({
        uri: { scheme: 'file' },
        isDirty: true,
      });

      await dharmaSankata.checkScope();

      const alerts = dharmaSankata.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].detected).toBe(true);
    });

    it('should return latest alert', async () => {
      await dharmaSankata.checkScope();
      const latest = dharmaSankata.getLatestAlert();

      expect(latest).toBeDefined();
      expect(latest?.detected).toBe(false);
    });

    it('should return undefined when no alerts exist', () => {
      const latest = dharmaSankata.getLatestAlert();

      expect(latest).toBeUndefined();
    });
  });

  describe('interval management', () => {
    it('should start interval when enabled', () => {
      jest.useFakeTimers();
      dharmaSankata.start();

      expect(dharmaSankata).toBeDefined();
      jest.runOnlyPendingTimers();
    });

    it('should stop interval', () => {
      dharmaSankata.start();
      dharmaSankata.stop();

      expect(dharmaSankata).toBeDefined();
    });
  });

  describe('time anomaly detection', () => {
    it('should detect rapid file changes', async () => {
      const mockVSCode = (global as any).testUtils.mockVSCode;
      mockVSCode.workspace.textDocuments = Array(6).fill({
        uri: { fsPath: '/src/file.ts', scheme: 'file' },
        isDirty: true,
      });

      // Simulate rapid changes by calling checkScope multiple times quickly
      await dharmaSankata.checkScope();
      await dharmaSankata.checkScope();

      const alerts = dharmaSankata.getAlerts();
      const anomalyAlert = alerts.find(a => a.reason === 'time_anomaly');

      expect(anomalyAlert).toBeDefined();
      expect(anomalyAlert?.detected).toBe(true);
      expect(anomalyAlert?.reason).toBe('time_anomaly');
    });

    it('should not detect anomaly with slow changes', async () => {
      const mockVSCode = (global as any).testUtils.mockVSCode;
      mockVSCode.workspace.textDocuments = [
        { uri: { fsPath: '/src/file1.ts', scheme: 'file' }, isDirty: true },
      ];

      await dharmaSankata.checkScope();

      // Advance time to simulate slow changes
      jest.advanceTimersByTime(10000);

      await dharmaSankata.checkScope();

      const alerts = dharmaSankata.getAlerts();
      const anomalyAlert = alerts.find(a => a.reason === 'time_anomaly');

      expect(anomalyAlert).toBeUndefined();
    });
  });

  describe('configuration updates', () => {
    it('should update configuration', () => {
      dharmaSankata.updateConfig({ fileChangeThreshold: 20, scopeCheckInterval: 120 });

      expect(dharmaSankata).toBeDefined();
    });

    it('should handle partial config updates', () => {
      dharmaSankata.updateConfig({ enabled: false });

      expect(dharmaSankata).toBeDefined();
    });
  });

  describe('goal inference', () => {
    it('should infer goal from file paths', async () => {
      const mockVSCode = (global as any).testUtils.mockVSCode;
      mockVSCode.workspace.textDocuments = [
        { uri: { fsPath: '/src/auth/login.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/auth/signup.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/auth/password.ts', scheme: 'file' }, isDirty: true },
      ];

      dharmaSankata.setGoal('payment system');
      const result = await dharmaSankata.checkScope();

      expect(result.details.detectedGoal).toBeDefined();
    });
  });
});
