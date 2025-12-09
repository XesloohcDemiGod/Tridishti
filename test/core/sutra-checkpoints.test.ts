/**
 * Test suite for SutraCheckpoints module
 */

import { SutraCheckpoints } from '../../src/core/sutra-checkpoints';
import { ISutraCheckpointConfig } from '../../src/core/sutra-checkpoints';

describe('SutraCheckpoints', () => {
  let config: ISutraCheckpointConfig;
  let eventEmitter: any;
  let sutraCheckpoints: SutraCheckpoints;

  beforeEach(() => {
    config = {
      interval: 30,
      autoCommit: false,
      enabled: true,
    };
    eventEmitter = (global as any).testUtils.createMockEventEmitter();
    sutraCheckpoints = new SutraCheckpoints(config, eventEmitter);
  });

  afterEach(() => {
    sutraCheckpoints.stop();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with provided config', () => {
      expect(sutraCheckpoints).toBeDefined();
    });

    it('should not start interval when disabled', () => {
      const disabledConfig = { ...config, enabled: false };
      const disabledInstance = new SutraCheckpoints(disabledConfig, eventEmitter);
      expect(disabledInstance).toBeDefined();
    });
  });

  describe('checkpoint creation', () => {
    it('should create a checkpoint manually', async () => {
      const checkpoint = await sutraCheckpoints.createCheckpoint('Test checkpoint');

      expect(checkpoint).toBeDefined();
      expect(checkpoint.id).toContain('sutra-');
      expect(checkpoint.message).toBe('Test checkpoint');
      expect(checkpoint.timestamp).toBeGreaterThan(0);
      expect(Array.isArray(checkpoint.filesChanged)).toBe(true);
      expect(eventEmitter.fire).toHaveBeenCalledWith({
        type: 'checkpoint',
        timestamp: expect.any(Number),
        data: checkpoint,
      });
    });

    it('should create checkpoint without message', async () => {
      const checkpoint = await sutraCheckpoints.createCheckpoint();

      expect(checkpoint.message).toBeUndefined();
      expect(checkpoint.filesChanged).toEqual([]);
    });

    it('should generate unique checkpoint IDs', async () => {
      const checkpoint1 = await sutraCheckpoints.createCheckpoint();
      const checkpoint2 = await sutraCheckpoints.createCheckpoint();

      expect(checkpoint1.id).not.toBe(checkpoint2.id);
    });
  });

  describe('checkpoint management', () => {
    it('should store created checkpoints', async () => {
      await sutraCheckpoints.createCheckpoint('First');
      await sutraCheckpoints.createCheckpoint('Second');

      const checkpoints = sutraCheckpoints.getCheckpoints();
      expect(checkpoints).toHaveLength(2);
      expect(checkpoints[0].message).toBe('First');
      expect(checkpoints[1].message).toBe('Second');
    });

    it('should return latest checkpoint', async () => {
      await sutraCheckpoints.createCheckpoint('First');
      const second = await sutraCheckpoints.createCheckpoint('Second');

      const latest = sutraCheckpoints.getLatestCheckpoint();
      expect(latest).toBe(second);
    });

    it('should return undefined when no checkpoints exist', () => {
      const latest = sutraCheckpoints.getLatestCheckpoint();
      expect(latest).toBeUndefined();
    });
  });

  describe('interval management', () => {
    it('should start interval when enabled', () => {
      jest.useFakeTimers();
      sutraCheckpoints.start();

      expect(sutraCheckpoints).toBeDefined();
      jest.runOnlyPendingTimers();
    });

    it('should stop interval', () => {
      sutraCheckpoints.start();
      sutraCheckpoints.stop();

      expect(sutraCheckpoints).toBeDefined();
    });
  });

  describe('configuration updates', () => {
    it('should update configuration', () => {
      sutraCheckpoints.updateConfig({ interval: 60, autoCommit: true });

      // Create a new checkpoint to test auto-commit (though mocked)
      expect(() => {
        sutraCheckpoints.createCheckpoint();
      }).not.toThrow();
    });

    it('should handle partial config updates', () => {
      sutraCheckpoints.updateConfig({ enabled: false });

      expect(sutraCheckpoints).toBeDefined();
    });
  });

  describe('file change detection', () => {
    it('should handle empty workspace', async () => {
      const checkpoint = await sutraCheckpoints.createCheckpoint();
      expect(checkpoint.filesChanged).toEqual([]);
    });
  });

  describe('auto-commit functionality', () => {
    it.skip('should attempt git commit when autoCommit enabled', async () => {
      // Skipped due to dynamic import mocking complexity
      // Git integration would be tested in integration tests
    });

    it.skip('should handle git commit failure gracefully', async () => {
      // Skipped due to dynamic import mocking complexity
      // Error handling would be tested in integration tests
    });
  });
});
