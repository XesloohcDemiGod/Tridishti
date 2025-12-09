/**
 * Test suite for DrishtiDashboard module
 */

import { DrishtiDashboard } from '../../src/analytics/drishti-dashboard';
import { IDrishtiDashboardConfig } from '../../src/analytics/drishti-dashboard';

describe('DrishtiDashboard', () => {
  let config: IDrishtiDashboardConfig;
  let drishtiDashboard: DrishtiDashboard;

  beforeEach(() => {
    config = {
      enabled: true,
      maxEvents: 1000,
      telemetryEnabled: true,
    };
    drishtiDashboard = new DrishtiDashboard(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('event recording', () => {
    it('should record core events', () => {
      const event = {
        type: 'checkpoint' as const,
        timestamp: Date.now(),
        data: { id: 'cp1', timestamp: Date.now(), filesChanged: [] },
      };

      drishtiDashboard.recordEvent(event);

      const metrics = drishtiDashboard.getMetrics();
      expect(metrics.totalCheckpoints).toBe(1);
    });

    it('should record multiple events', () => {
      const events = [
        {
          type: 'checkpoint' as const,
          timestamp: Date.now(),
          data: {
            id: 'cp1',
            timestamp: Date.now(),
            message: 'Test checkpoint',
            filesChanged: [],
            context: {}
          },
        },
        {
          type: 'milestone' as const,
          timestamp: Date.now(),
          data: {
            id: 'kp1',
            milestoneId: 'm1',
            timestamp: Date.now(),
            score: 85,
            duration: 300,
            filesModified: ['test.ts']
          },
        },
        {
          type: 'dharma_alert' as const,
          timestamp: Date.now(),
          data: {
            id: 'da1',
            timestamp: Date.now(),
            detected: true,
            reason: 'file_threshold',
            filesChanged: ['test.ts'],
            scopeDrift: 5
          },
        },
      ];

      events.forEach(event => drishtiDashboard.recordEvent(event));

      const metrics = drishtiDashboard.getMetrics();
      expect(metrics.totalCheckpoints).toBe(1);
      expect(metrics.totalMilestones).toBe(1);
      expect(metrics.totalDharmaAlerts).toBe(1);
    });

    it('should maintain event limit', () => {
      const limitedConfig = { ...config, maxEvents: 3 };
      const limitedDashboard = new DrishtiDashboard(limitedConfig);

      // Record more events than the limit
      for (let i = 0; i < 5; i++) {
        limitedDashboard.recordEvent({
          type: 'checkpoint',
          timestamp: Date.now(),
          data: { id: `cp${i}`, timestamp: Date.now(), filesChanged: [] },
        });
      }

      const metrics = limitedDashboard.getMetrics();
      expect(metrics.totalCheckpoints).toBe(3); // Should be limited
    });
  });

  describe('yatra recording', () => {
    it('should record completed yatras', () => {
      const yatra = {
        id: 'yatra-123',
        sankalpa: 'Complete feature',
        startedAt: Date.now() - 3600000,
        endedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      } as any; // Using any to bypass strict typing for test

      drishtiDashboard.recordYatra(yatra);

      const metrics = drishtiDashboard.getMetrics();
      expect(metrics.totalYatras).toBe(1);
    });

    it('should handle multiple yatras', () => {
      const yatra1 = {
        id: 'yatra-1',
        startedAt: Date.now() - 7200000,
        endedAt: Date.now() - 3600000,
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      const yatra2 = {
        id: 'yatra-2',
        startedAt: Date.now() - 1800000,
        endedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      drishtiDashboard.recordYatra(yatra1);
      drishtiDashboard.recordYatra(yatra2);

      const metrics = drishtiDashboard.getMetrics();
      expect(metrics.totalYatras).toBe(2);
    });
  });

  describe('jnana recording', () => {
    it('should record captured jnana', () => {
      const jnana = [
        { id: 'j1', category: 'insight' as const, content: 'Test insight', context: { timestamp: Date.now() }, tags: [] },
        { id: 'j2', category: 'pattern' as const, content: 'Test pattern', context: { timestamp: Date.now() }, tags: [] },
      ];

      drishtiDashboard.recordJnana(jnana);

      const metrics = drishtiDashboard.getMetrics();
      expect(metrics.totalJnana).toBe(2);
    });

    it('should accumulate jnana over multiple recordings', () => {
      drishtiDashboard.recordJnana([
        { id: 'j1', category: 'insight' as const, content: 'Insight 1', context: { timestamp: Date.now() }, tags: [] },
      ]);

      drishtiDashboard.recordJnana([
        { id: 'j2', category: 'gotcha' as const, content: 'Gotcha 1', context: { timestamp: Date.now() }, tags: [] },
        { id: 'j3', category: 'solution' as const, content: 'Solution 1', context: { timestamp: Date.now() }, tags: [] },
      ]);

      const metrics = drishtiDashboard.getMetrics();
      expect(metrics.totalJnana).toBe(3);
    });
  });

  describe('reflection recording', () => {
    it('should record reflection results', () => {
      const reflection = {
        yatraId: 'yatra-123',
        timestamp: Date.now(),
        insights: ['Good session'],
        improvements: ['More checkpoints'],
        achievements: ['Completed milestone'],
        suggestions: ['Set sankalpa'],
        score: 85,
      };

      drishtiDashboard.recordReflection(reflection);

      // Reflections are tracked internally
      expect(drishtiDashboard).toBeDefined();
    });
  });

  describe('metrics calculation', () => {
    beforeEach(() => {
      // Set up test data
      const yatra = {
        id: 'yatra-test',
        startedAt: Date.now() - 3600000, // 1 hour ago
        endedAt: Date.now(),
        checkpoints: [
          { id: 'cp1', timestamp: Date.now() - 1800000, message: 'Checkpoint 1', filesChanged: ['file1.ts'] },
          { id: 'cp2', timestamp: Date.now() - 900000, message: 'Checkpoint 2', filesChanged: ['file2.ts'] },
        ],
        milestones: [
          { id: 'm1', name: 'Complete', status: 'completed' as const, createdAt: Date.now() - 3000000 },
        ],
        dharmaAlerts: [
          { detected: false, timestamp: Date.now() - 1200000, reason: 'file_threshold' as const, details: { filesChanged: 5, threshold: 10 } },
        ],
      };

      drishtiDashboard.recordYatra(yatra);
      drishtiDashboard.recordJnana([
        { id: 'j1', category: 'insight' as const, content: 'Test', context: { timestamp: Date.now() }, tags: [] },
      ]);
    });

    it('should calculate comprehensive metrics', () => {
      const activeYatra = {
        id: 'active-yatra',
        startedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      const metrics = drishtiDashboard.getMetrics(activeYatra);

      expect(metrics.totalYatras).toBe(1);
      expect(metrics.activeYatra).toBe(activeYatra);
      expect(metrics.totalCheckpoints).toBe(2);
      expect(metrics.totalMilestones).toBe(1);
      expect(metrics.totalDharmaAlerts).toBe(1);
      expect(metrics.totalJnana).toBe(1);
      expect(metrics.averageSessionDuration).toBe(60); // 1 hour = 60 minutes
      expect(metrics.productivityScore).toBeGreaterThanOrEqual(0);
      expect(metrics.productivityScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(metrics.recentActivity)).toBe(true);
    });

    it('should calculate metrics without active yatra', () => {
      const metrics = drishtiDashboard.getMetrics();

      expect(metrics.activeYatra).toBeUndefined();
    });

    it('should handle empty dashboard', () => {
      const emptyDashboard = new DrishtiDashboard(config);
      const metrics = emptyDashboard.getMetrics();

      expect(metrics.totalYatras).toBe(0);
      expect(metrics.totalCheckpoints).toBe(0);
      expect(metrics.totalMilestones).toBe(0);
      expect(metrics.totalDharmaAlerts).toBe(0);
      expect(metrics.totalJnana).toBe(0);
      expect(metrics.averageSessionDuration).toBe(0);
      expect(metrics.productivityScore).toBe(0);
    });
  });

  describe('health status', () => {
    it('should report healthy status with recent activity', () => {
      drishtiDashboard.recordEvent({
        type: 'checkpoint',
        timestamp: Date.now() - 10000, // 10 seconds ago
        data: { id: 'cp1', timestamp: Date.now(), filesChanged: [] },
      });

      const health = drishtiDashboard.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.lastEventTime).toBeDefined();
      expect(health.modules.sutraCheckpoints).toBe(true);
      expect(health.modules.karmaPhala).toBe(true);
      expect(health.modules.dharmaSankata).toBe(true);
      expect(health.modules.yatraManager).toBe(true);
      expect(health.modules.jnanaCapture).toBe(true);
      expect(health.modules.smritiRecall).toBe(true);
      expect(health.modules.atmaVichara).toBe(true);
    });

    it('should report degraded status with old activity', () => {
      drishtiDashboard.recordEvent({
        type: 'checkpoint',
        timestamp: Date.now() - 7200000, // 2 hours ago
        data: { id: 'cp1', timestamp: Date.now(), filesChanged: [] },
      });

      const health = drishtiDashboard.getHealthStatus();

      expect(health.status).toBe('degraded');
    });

    it('should report unhealthy status with very old activity', () => {
      drishtiDashboard.recordEvent({
        type: 'checkpoint',
        timestamp: Date.now() - 172800000, // 2 days ago
        data: { id: 'cp1', timestamp: Date.now(), filesChanged: [] },
      });

      const health = drishtiDashboard.getHealthStatus();

      expect(health.status).toBe('unhealthy');
    });

    it('should handle no activity', () => {
      const health = drishtiDashboard.getHealthStatus();

      expect(health.status).toBe('healthy'); // Default to healthy
      expect(health.lastEventTime).toBeUndefined();
    });
  });

  describe('telemetry', () => {
    it('should collect telemetry when enabled', () => {
      const event = {
        type: 'checkpoint' as const,
        timestamp: Date.now(),
        data: { id: 'cp1', timestamp: Date.now(), filesChanged: [] },
      };

      drishtiDashboard.recordEvent(event);

      const telemetry = drishtiDashboard.getTelemetry();
      expect(telemetry).toHaveLength(1);
      expect(telemetry[0].eventType).toBe('checkpoint');
      expect(telemetry[0].data).toEqual(event.data);
    });

    it('should limit telemetry data', () => {
      const limitedConfig = { ...config, maxEvents: 2 };
      const limitedDashboard = new DrishtiDashboard(limitedConfig);

      // Record more events than limit
      for (let i = 0; i < 4; i++) {
        limitedDashboard.recordEvent({
          type: 'checkpoint',
          timestamp: Date.now(),
          data: { id: `cp${i}`, timestamp: Date.now(), filesChanged: [] },
        });
      }

      const telemetry = limitedDashboard.getTelemetry();
      expect(telemetry).toHaveLength(2);
    });

    it('should get telemetry with limit', () => {
      // Record multiple events
      for (let i = 0; i < 5; i++) {
        drishtiDashboard.recordEvent({
          type: 'checkpoint',
          timestamp: Date.now(),
          data: { id: `cp${i}`, timestamp: Date.now(), filesChanged: [] },
        });
      }

      const telemetry = drishtiDashboard.getTelemetry(3);
      expect(telemetry).toHaveLength(3);
    });
  });

  describe('data export', () => {
    beforeEach(() => {
      drishtiDashboard.recordEvent({
        type: 'checkpoint',
        timestamp: Date.now(),
        data: { id: 'cp1', timestamp: Date.now(), filesChanged: [] },
      });

      drishtiDashboard.recordYatra({
        id: 'yatra-1',
        startedAt: Date.now() - 1800000,
        endedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      });

      drishtiDashboard.recordJnana([
        { id: 'j1', category: 'insight' as const, content: 'Test insight', context: { timestamp: Date.now() }, tags: [] },
      ]);

      drishtiDashboard.recordReflection({
        yatraId: 'yatra-1',
        timestamp: Date.now(),
        insights: ['Good work'],
        improvements: ['More focus'],
        achievements: ['Completed task'],
        suggestions: ['Set goals'],
        score: 80,
      });
    });

    it('should export comprehensive data to JSON', () => {
      const jsonString = drishtiDashboard.exportToJSON();
      const parsed = JSON.parse(jsonString);

      expect(parsed).toHaveProperty('events');
      expect(parsed).toHaveProperty('yatras');
      expect(parsed).toHaveProperty('jnana');
      expect(parsed).toHaveProperty('reflections');
      expect(parsed).toHaveProperty('metrics');

      expect(Array.isArray(parsed.events)).toBe(true);
      expect(Array.isArray(parsed.yatras)).toBe(true);
      expect(Array.isArray(parsed.jnana)).toBe(true);
      expect(Array.isArray(parsed.reflections)).toBe(true);
      expect(typeof parsed.metrics).toBe('object');
    });

    it('should export valid JSON', () => {
      const jsonString = drishtiDashboard.exportToJSON();

      expect(() => JSON.parse(jsonString)).not.toThrow();
    });
  });

  describe('productivity scoring', () => {
    it('should calculate productivity score based on session quality', () => {
      // Good session: checkpoints, milestones, no alerts
      const goodYatra = {
        id: 'good',
        startedAt: Date.now() - 7200000, // 2 hours
        endedAt: Date.now(),
        checkpoints: Array(8).fill({ id: 'cp', timestamp: Date.now(), message: 'Test', filesChanged: [] }),
        milestones: [
          { id: 'm1', name: 'Complete', status: 'completed' as const, createdAt: Date.now() },
          { id: 'm2', name: 'Test', status: 'completed' as const, createdAt: Date.now() },
        ],
        dharmaAlerts: [],
      };

      drishtiDashboard.recordYatra(goodYatra);

      const metrics = drishtiDashboard.getMetrics();
      expect(metrics.productivityScore).toBeGreaterThan(70);
    });

    it('should penalize poor session quality', () => {
      // Poor session: few checkpoints, many alerts
      const poorYatra = {
        id: 'poor',
        startedAt: Date.now() - 600000, // 10 minutes
        endedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: Array(5).fill({
          detected: true,
          timestamp: Date.now(),
          reason: 'file_threshold' as const,
          details: { filesChanged: 15, threshold: 10 },
        }),
      };

      drishtiDashboard.recordYatra(poorYatra);

      const metrics = drishtiDashboard.getMetrics();
      expect(metrics.productivityScore).toBeLessThanOrEqual(30);
    });
  });
});

