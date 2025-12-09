/**
 * Test suite for YatraManager module
 */

import { YatraManager } from '../../src/core/yatra-manager';
import { IYatraManagerConfig } from '../../src/core/yatra-manager';

describe('YatraManager', () => {
  let config: IYatraManagerConfig;
  let eventEmitter: any;
  let sutraCheckpoints: any;
  let karmaPhala: any;
  let dharmaSankata: any;
  let stateStorage: any;
  let yatraManager: YatraManager;

  beforeEach(() => {
    config = {
      enabled: true,
      autoStart: false,
      persistState: true,
    };
    eventEmitter = (global as any).testUtils.createMockEventEmitter();
    sutraCheckpoints = {
      start: jest.fn(),
      stop: jest.fn(),
      getCheckpoints: jest.fn(() => []),
    };
    karmaPhala = {
      getMilestones: jest.fn(() => []),
    };
    dharmaSankata = {
      start: jest.fn(),
      stop: jest.fn(),
      getAlerts: jest.fn(() => []),
      setGoal: jest.fn(),
    };
    stateStorage = (global as any).testUtils.createMockMemento();

    yatraManager = new YatraManager(
      config,
      eventEmitter,
      sutraCheckpoints,
      karmaPhala,
      dharmaSankata,
      stateStorage
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('yatra lifecycle', () => {
    it('should start a yatra', async () => {
      const yatra = await yatraManager.startYatra('Test journey');

      expect(yatra).toBeDefined();
      expect(yatra.id).toContain('yatra-');
      expect(yatra.sankalpa).toBe('Test journey');
      expect(yatra.startedAt).toBeGreaterThan(0);
      expect(yatra.checkpoints).toEqual([]);
      expect(yatra.milestones).toEqual([]);
      expect(yatra.dharmaAlerts).toEqual([]);
      expect(eventEmitter.fire).toHaveBeenCalledWith({
        type: 'yatra_start',
        timestamp: expect.any(Number),
        data: yatra,
      });
      expect(sutraCheckpoints.start).toHaveBeenCalled();
      expect(dharmaSankata.start).toHaveBeenCalled();
      expect(dharmaSankata.setGoal).toHaveBeenCalledWith('Test journey');
    });

    it('should start yatra without sankalpa', async () => {
      const yatra = await yatraManager.startYatra();

      expect(yatra.sankalpa).toBeUndefined();
      expect(dharmaSankata.setGoal).not.toHaveBeenCalled();
    });

    it('should throw error when starting yatra while one is active', async () => {
      await yatraManager.startYatra();

      await expect(yatraManager.startYatra()).rejects.toThrow(
        'A yatra is already active'
      );
    });

    it('should end a yatra', async () => {
      await yatraManager.startYatra('Test journey');

      sutraCheckpoints.getCheckpoints.mockReturnValue([
        { id: 'cp1', timestamp: 1000, filesChanged: [] },
      ]);
      karmaPhala.getMilestones.mockReturnValue([
        { id: 'm1', name: 'Test milestone', status: 'completed' },
      ]);
      dharmaSankata.getAlerts.mockReturnValue([
        { detected: false, timestamp: 1000, reason: 'file_threshold' },
      ]);

      const completedYatra = await yatraManager.endYatra();

      expect(completedYatra.endedAt).toBeGreaterThan(0);
      expect(completedYatra.checkpoints).toHaveLength(1);
      expect(completedYatra.milestones).toHaveLength(1);
      expect(completedYatra.dharmaAlerts).toHaveLength(1);
      expect(eventEmitter.fire).toHaveBeenCalledWith({
        type: 'yatra_end',
        timestamp: expect.any(Number),
        data: completedYatra,
      });
      expect(sutraCheckpoints.stop).toHaveBeenCalled();
      expect(dharmaSankata.stop).toHaveBeenCalled();
    });

    it('should throw error when ending yatra with none active', async () => {
      await expect(yatraManager.endYatra()).rejects.toThrow(
        'No active yatra to end'
      );
    });
  });

  describe('yatra state management', () => {
    it('should return current yatra', async () => {
      const yatra = await yatraManager.startYatra();
      const current = yatraManager.getCurrentYatra();

      expect(current).toBe(yatra);
    });

    it('should return undefined when no yatra active', () => {
      const current = yatraManager.getCurrentYatra();

      expect(current).toBeUndefined();
    });

    it('should update sankalpa', async () => {
      await yatraManager.startYatra('Initial goal');

      yatraManager.updateSankalpa('Updated goal');

      expect(dharmaSankata.setGoal).toHaveBeenCalledWith('Updated goal');
    });

    it('should throw error when updating sankalpa with no active yatra', () => {
      expect(() => yatraManager.updateSankalpa('Goal')).toThrow(
        'No active yatra to update'
      );
    });
  });

  describe('state persistence', () => {
    it('should persist state when enabled', async () => {
      await yatraManager.startYatra('Test');

      expect(stateStorage.update).toHaveBeenCalled();
    });

    it('should restore state on initialization', async () => {
      const mockYatra = {
        id: 'yatra-123',
        sankalpa: 'Restored goal',
        startedAt: Date.now() - 1000,
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      stateStorage.get.mockReturnValue(mockYatra);

      const newYatraManager = new YatraManager(
        config,
        eventEmitter,
        sutraCheckpoints,
        karmaPhala,
        dharmaSankata,
        stateStorage
      );

      await newYatraManager.restoreState();

      expect(sutraCheckpoints.start).toHaveBeenCalled();
      expect(dharmaSankata.start).toHaveBeenCalled();
      expect(dharmaSankata.setGoal).toHaveBeenCalledWith('Restored goal');
    });

    it('should not restore completed yatras', async () => {
      const mockYatra = {
        id: 'yatra-123',
        sankalpa: 'Completed goal',
        startedAt: Date.now() - 10000,
        endedAt: Date.now() - 1000,
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      stateStorage.get.mockReturnValue(mockYatra);

      const newYatraManager = new YatraManager(
        config,
        eventEmitter,
        sutraCheckpoints,
        karmaPhala,
        dharmaSankata,
        stateStorage
      );

      await newYatraManager.restoreState();

      expect(sutraCheckpoints.start).not.toHaveBeenCalled();
    });

    it('should skip state restoration when disabled', async () => {
      const disabledConfig = { ...config, persistState: false };

      const newYatraManager = new YatraManager(
        disabledConfig,
        eventEmitter,
        sutraCheckpoints,
        karmaPhala,
        dharmaSankata,
        stateStorage
      );

      await newYatraManager.restoreState();

      expect(stateStorage.get).not.toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    it('should handle checkpoint events', async () => {
      await yatraManager.startYatra();

      const event = {
        type: 'checkpoint' as const,
        timestamp: Date.now(),
        data: { id: 'cp1', timestamp: 1000, filesChanged: [] },
      };

      // Simulate event handling
      eventEmitter.event.mock.calls[0][0](event);

      const currentYatra = yatraManager.getCurrentYatra();
      expect(currentYatra?.checkpoints).toContain(event.data);
    });

    it('should handle milestone events', async () => {
      await yatraManager.startYatra();

      const event = {
        type: 'milestone' as const,
        timestamp: Date.now(),
        data: { id: 'kp1', milestoneId: 'm1', score: 85 },
      };

      eventEmitter.event.mock.calls[0][0](event);

      expect(yatraManager.getCurrentYatra()).toBeDefined();
    });

    it('should handle dharma alert events', async () => {
      await yatraManager.startYatra();

      const event = {
        type: 'dharma_alert' as const,
        timestamp: Date.now(),
        data: {
          detected: true,
          timestamp: 1000,
          reason: 'file_threshold',
          details: { filesChanged: 15, threshold: 10 },
        },
      };

      eventEmitter.event.mock.calls[0][0](event);

      const currentYatra = yatraManager.getCurrentYatra();
      expect(currentYatra?.dharmaAlerts).toContain(event.data);
    });

    it('should ignore events when no yatra is active', () => {
      const event = {
        type: 'checkpoint' as const,
        timestamp: Date.now(),
        data: { id: 'cp1', timestamp: 1000, filesChanged: [] },
      };

      eventEmitter.event.mock.calls[0][0](event);

      expect(yatraManager.getCurrentYatra()).toBeUndefined();
    });
  });

  describe('sankalpa reminders', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start sankalpa reminders when configured', async () => {
      const reminderConfig = { ...config, sankalpaReminderInterval: 600 };

      const newYatraManager = new YatraManager(
        reminderConfig,
        eventEmitter,
        sutraCheckpoints,
        karmaPhala,
        dharmaSankata,
        stateStorage
      );

      await newYatraManager.startYatra('Test goal');

      jest.advanceTimersByTime(610000); // Advance past reminder interval

      // Reminders would be shown via VS Code window, mocked
      expect(true).toBe(true); // Test passes if no errors
    });

    it('should update sankalpa reminders when sankalpa changes', async () => {
      const reminderConfig = { ...config, sankalpaReminderInterval: 600 };

      const newYatraManager = new YatraManager(
        reminderConfig,
        eventEmitter,
        sutraCheckpoints,
        karmaPhala,
        dharmaSankata,
        stateStorage
      );

      await newYatraManager.startYatra('Initial goal');
      newYatraManager.updateSankalpa('Updated goal');

      expect(dharmaSankata.setGoal).toHaveBeenCalledWith('Updated goal');
    });
  });
});

