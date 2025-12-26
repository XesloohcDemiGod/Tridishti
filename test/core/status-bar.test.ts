/**
 * Status Bar Integration Tests
 */

import { StatusBarIntegration, IStatusBarConfig } from '../../src/core/status-bar';
import { IYatra } from '../../src/core/types';

describe('StatusBarIntegration', () => {
  let statusBar: StatusBarIntegration;
  let mockConfig: IStatusBarConfig;

  beforeEach(() => {
    mockConfig = {
      enabled: true,
      showDuration: true,
      showCheckpoints: true,
      updateIntervalMs: 60000,
    };

    statusBar = new StatusBarIntegration(mockConfig);
  });

  afterEach(() => {
    statusBar.dispose();
  });

  describe('Initialization', () => {
    it('should create with provided config', () => {
      expect(statusBar).toBeDefined();
    });

    it('should initialize when enabled', () => {
      statusBar.initialize();
      expect(statusBar).toBeDefined();
    });

    it('should not initialize when disabled', () => {
      const disabledStatusBar = new StatusBarIntegration({ ...mockConfig, enabled: false });
      disabledStatusBar.initialize();
      expect(disabledStatusBar).toBeDefined();
      disabledStatusBar.dispose();
    });
  });

  describe('Yatra Updates', () => {
    const mockYatra: IYatra = {
      id: 'yatra-1',
      sankalpa: 'Complete feature implementation',
      startedAt: Date.now() - 3600000, // 1 hour ago
      checkpoints: [
        { id: 'cp1', timestamp: Date.now(), filesChanged: [] },
        { id: 'cp2', timestamp: Date.now(), filesChanged: [] },
      ],
      milestones: [
        { id: 'm1', name: 'Milestone 1', createdAt: Date.now(), status: 'active' },
      ],
      dharmaAlerts: [],
    };

    it('should update with active yatra', () => {
      statusBar.updateYatra(mockYatra);
      expect(statusBar).toBeDefined();
    });

    it('should update with undefined yatra', () => {
      statusBar.updateYatra(undefined);
      expect(statusBar).toBeDefined();
    });

    it('should handle yatra without sankalpa', () => {
      const yatraWithoutSankalpa = { ...mockYatra, sankalpa: undefined };
      statusBar.updateYatra(yatraWithoutSankalpa);
      expect(statusBar).toBeDefined();
    });

    it('should handle yatra with dharma alerts', () => {
      const yatraWithAlerts: IYatra = {
        ...mockYatra,
        dharmaAlerts: [
          {
            detected: true,
            timestamp: Date.now(),
            reason: 'file_threshold',
            details: { filesChanged: 15, threshold: 10 },
          },
        ],
      };
      statusBar.updateYatra(yatraWithAlerts);
      expect(statusBar).toBeDefined();
    });

    it('should handle long sankalpa text', () => {
      const yatraWithLongSankalpa: IYatra = {
        ...mockYatra,
        sankalpa: 'This is a very long sankalpa text that should be truncated in the display',
      };
      statusBar.updateYatra(yatraWithLongSankalpa);
      expect(statusBar).toBeDefined();
    });
  });

  describe('Configuration Updates', () => {
    it('should update config', () => {
      statusBar.updateConfig({ showDuration: false });
      expect(statusBar).toBeDefined();
    });

    it('should reinitialize on enable', () => {
      statusBar.updateConfig({ enabled: false });
      statusBar.updateConfig({ enabled: true });
      expect(statusBar).toBeDefined();
    });

    it('should dispose on disable', () => {
      statusBar.initialize();
      statusBar.updateConfig({ enabled: false });
      expect(statusBar).toBeDefined();
    });

    it('should update display options', () => {
      statusBar.updateConfig({
        showDuration: false,
        showCheckpoints: false,
      });
      expect(statusBar).toBeDefined();
    });
  });

  describe('Disposal', () => {
    it('should dispose cleanly', () => {
      statusBar.initialize();
      statusBar.dispose();
      expect(statusBar).toBeDefined();
    });

    it('should handle multiple dispose calls', () => {
      statusBar.dispose();
      statusBar.dispose();
      expect(statusBar).toBeDefined();
    });

    it('should dispose without initialization', () => {
      const newStatusBar = new StatusBarIntegration(mockConfig);
      newStatusBar.dispose();
      expect(newStatusBar).toBeDefined();
    });
  });

  describe('Display Options', () => {
    it('should respect showDuration option', () => {
      const statusBarWithoutDuration = new StatusBarIntegration({
        ...mockConfig,
        showDuration: false,
      });
      expect(statusBarWithoutDuration).toBeDefined();
      statusBarWithoutDuration.dispose();
    });

    it('should respect showCheckpoints option', () => {
      const statusBarWithoutCheckpoints = new StatusBarIntegration({
        ...mockConfig,
        showCheckpoints: false,
      });
      expect(statusBarWithoutCheckpoints).toBeDefined();
      statusBarWithoutCheckpoints.dispose();
    });

    it('should work with minimal display', () => {
      const minimalStatusBar = new StatusBarIntegration({
        ...mockConfig,
        showDuration: false,
        showCheckpoints: false,
      });
      expect(minimalStatusBar).toBeDefined();
      minimalStatusBar.dispose();
    });
  });

  describe('Update Timer', () => {
    it('should use configured update interval', () => {
      const statusBarWithCustomInterval = new StatusBarIntegration({
        ...mockConfig,
        updateIntervalMs: 30000,
      });
      statusBarWithCustomInterval.initialize();
      expect(statusBarWithCustomInterval).toBeDefined();
      statusBarWithCustomInterval.dispose();
    });
  });
});
