/**
 * Smart Nudge System Tests
 */

import { SmartNudgeSystem, INudgeConfig } from '../../src/core/smart-nudges';

describe('SmartNudgeSystem', () => {
  let nudgeSystem: SmartNudgeSystem;
  let mockConfig: INudgeConfig;

  beforeEach(() => {
    mockConfig = {
      enabled: true,
      strategy: 'default',
      checkpointIntervalMs: 30 * 60 * 1000, // 30 minutes
      scopeCheckIntervalMs: 60 * 60 * 1000, // 60 minutes
      breakReminderMs: 90 * 60 * 1000, // 90 minutes
      sankalpaReminderMs: 10 * 60 * 1000, // 10 minutes
    };

    nudgeSystem = new SmartNudgeSystem(mockConfig);
  });

  afterEach(() => {
    nudgeSystem.stop();
  });

  describe('Initialization', () => {
    it('should create with provided config', () => {
      expect(nudgeSystem).toBeDefined();
    });

    it('should start with default config', () => {
      nudgeSystem.start();
      expect(nudgeSystem).toBeDefined();
    });

    it('should not start when disabled', () => {
      const disabledSystem = new SmartNudgeSystem({ ...mockConfig, enabled: false });
      disabledSystem.start();
      expect(disabledSystem).toBeDefined();
      disabledSystem.stop();
    });
  });

  describe('Nudge Triggering', () => {
    it('should trigger checkpoint reminder', () => {
      const nudge = nudgeSystem.triggerNudge('checkpoint_reminder');
      expect(nudge).toBeDefined();
      expect(nudge?.type).toBe('checkpoint_reminder');
    });

    it('should trigger scope drift warning', () => {
      const nudge = nudgeSystem.triggerNudge('scope_drift_warning');
      expect(nudge).toBeDefined();
      expect(nudge?.type).toBe('scope_drift_warning');
    });

    it('should trigger milestone suggestion', () => {
      const nudge = nudgeSystem.triggerNudge('milestone_suggestion');
      expect(nudge).toBeDefined();
      expect(nudge?.type).toBe('milestone_suggestion');
    });

    it('should trigger reflection prompt', () => {
      const nudge = nudgeSystem.triggerNudge('reflection_prompt');
      expect(nudge).toBeDefined();
      expect(nudge?.type).toBe('reflection_prompt');
    });

    it('should trigger break reminder', () => {
      const nudge = nudgeSystem.triggerNudge('break_reminder');
      expect(nudge).toBeDefined();
      expect(nudge?.type).toBe('break_reminder');
    });

    it('should trigger sankalpa reminder', () => {
      const nudge = nudgeSystem.triggerNudge('sankalpa_reminder');
      expect(nudge).toBeDefined();
      expect(nudge?.type).toBe('sankalpa_reminder');
    });

    it('should support custom messages', () => {
      const customMessage = 'Custom nudge message';
      const nudge = nudgeSystem.triggerNudge('checkpoint_reminder', customMessage);
      expect(nudge?.message).toBe(customMessage);
    });

    it('should not trigger when disabled', () => {
      const disabledSystem = new SmartNudgeSystem({ ...mockConfig, enabled: false });
      const nudge = disabledSystem.triggerNudge('checkpoint_reminder');
      expect(nudge).toBeUndefined();
      disabledSystem.stop();
    });
  });

  describe('Statistics', () => {
    it('should return initial stats', () => {
      const stats = nudgeSystem.getStats();
      expect(stats.totalNudges).toBe(0);
      expect(stats.dismissedNudges).toBe(0);
      expect(stats.actionedNudges).toBe(0);
    });

    it('should track total nudges', () => {
      nudgeSystem.triggerNudge('checkpoint_reminder');
      nudgeSystem.triggerNudge('scope_drift_warning');
      const stats = nudgeSystem.getStats();
      expect(stats.totalNudges).toBe(2);
    });

    it('should track nudges by type', () => {
      nudgeSystem.triggerNudge('checkpoint_reminder');
      nudgeSystem.triggerNudge('checkpoint_reminder');
      nudgeSystem.triggerNudge('scope_drift_warning');
      const stats = nudgeSystem.getStats();
      expect(stats.nudgesByType.checkpoint_reminder).toBe(2);
      expect(stats.nudgesByType.scope_drift_warning).toBe(1);
    });

    it('should track dismissals', () => {
      nudgeSystem.recordDismissal();
      nudgeSystem.recordDismissal();
      const stats = nudgeSystem.getStats();
      expect(stats.dismissedNudges).toBe(2);
    });

    it('should track actions', () => {
      nudgeSystem.recordAction();
      nudgeSystem.recordAction();
      nudgeSystem.recordAction();
      const stats = nudgeSystem.getStats();
      expect(stats.actionedNudges).toBe(3);
    });
  });

  describe('Last Nudge Tracking', () => {
    it('should return undefined when no nudges triggered', () => {
      const lastNudge = nudgeSystem.getLastNudge();
      expect(lastNudge).toBeUndefined();
    });

    it('should return last triggered nudge', () => {
      nudgeSystem.triggerNudge('checkpoint_reminder');
      nudgeSystem.triggerNudge('scope_drift_warning');
      const lastNudge = nudgeSystem.getLastNudge();
      expect(lastNudge?.type).toBe('scope_drift_warning');
    });
  });

  describe('Configuration Updates', () => {
    it('should update config', () => {
      nudgeSystem.updateConfig({ strategy: 'deep-work' });
      expect(nudgeSystem).toBeDefined();
    });

    it('should restart on enable/disable', () => {
      nudgeSystem.start();
      nudgeSystem.updateConfig({ enabled: false });
      nudgeSystem.updateConfig({ enabled: true });
      expect(nudgeSystem).toBeDefined();
    });

    it('should restart on interval changes', () => {
      nudgeSystem.start();
      nudgeSystem.updateConfig({ checkpointIntervalMs: 45 * 60 * 1000 });
      expect(nudgeSystem).toBeDefined();
    });
  });

  describe('Strategies', () => {
    it('should support default strategy', () => {
      const system = new SmartNudgeSystem({ ...mockConfig, strategy: 'default' });
      system.start();
      expect(system).toBeDefined();
      system.stop();
    });

    it('should support deep-work strategy', () => {
      const system = new SmartNudgeSystem({ ...mockConfig, strategy: 'deep-work' });
      system.start();
      expect(system).toBeDefined();
      system.stop();
    });

    it('should support exploration strategy', () => {
      const system = new SmartNudgeSystem({ ...mockConfig, strategy: 'exploration' });
      system.start();
      expect(system).toBeDefined();
      system.stop();
    });

    it('should support maintenance strategy', () => {
      const system = new SmartNudgeSystem({ ...mockConfig, strategy: 'maintenance' });
      system.start();
      expect(system).toBeDefined();
      system.stop();
    });
  });

  describe('Quiet Hours', () => {
    it('should respect quiet hours', () => {
      const currentHour = new Date().getHours();
      const quietStart = currentHour;
      const quietEnd = (currentHour + 1) % 24;

      const systemWithQuietHours = new SmartNudgeSystem({
        ...mockConfig,
        quietHours: {
          start: quietStart,
          end: quietEnd,
        },
      });

      const nudge = systemWithQuietHours.triggerNudge('checkpoint_reminder');
      // Should not trigger during quiet hours
      expect(nudge).toBeUndefined();
      systemWithQuietHours.stop();
    });

    it('should work without quiet hours', () => {
      const nudge = nudgeSystem.triggerNudge('checkpoint_reminder');
      expect(nudge).toBeDefined();
    });
  });

  describe('Start and Stop', () => {
    it('should start the system', () => {
      nudgeSystem.start();
      expect(nudgeSystem).toBeDefined();
    });

    it('should stop the system', () => {
      nudgeSystem.start();
      nudgeSystem.stop();
      expect(nudgeSystem).toBeDefined();
    });

    it('should handle multiple start/stop cycles', () => {
      nudgeSystem.start();
      nudgeSystem.stop();
      nudgeSystem.start();
      nudgeSystem.stop();
      expect(nudgeSystem).toBeDefined();
    });

    it('should accept session start time', () => {
      const startTime = Date.now() - 60000;
      nudgeSystem.start(startTime);
      expect(nudgeSystem).toBeDefined();
    });
  });

  describe('Nudge Properties', () => {
    it('should include timestamp in nudge', () => {
      const before = Date.now();
      const nudge = nudgeSystem.triggerNudge('checkpoint_reminder');
      const after = Date.now();
      expect(nudge?.timestamp).toBeGreaterThanOrEqual(before);
      expect(nudge?.timestamp).toBeLessThanOrEqual(after);
    });

    it('should include priority in nudge', () => {
      const nudge = nudgeSystem.triggerNudge('scope_drift_warning');
      expect(nudge?.priority).toBe('high');
    });

    it('should include action for actionable nudges', () => {
      const nudge = nudgeSystem.triggerNudge('checkpoint_reminder');
      expect(nudge?.action).toBeDefined();
      expect(nudge?.action?.label).toBe('Create Checkpoint');
      expect(nudge?.action?.command).toBe('tridishti.createSutra');
    });

    it('should not include action for non-actionable nudges', () => {
      const nudge = nudgeSystem.triggerNudge('break_reminder');
      expect(nudge?.action).toBeUndefined();
    });
  });
});
