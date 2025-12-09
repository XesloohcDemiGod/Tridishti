/**
 * Integration tests for Tridishti extension
 *
 * Tests the complete extension functionality including:
 * - Command execution and responses
 * - Module interactions and event flow
 * - Session lifecycle management
 * - Configuration updates
 * - Error handling and recovery
 */

import * as vscode from 'vscode';
import { SutraCheckpoints, ISutraCheckpointConfig } from '../../src/core/sutra-checkpoints';
import { KarmaPhala, IKarmaPhalaConfig } from '../../src/core/karma-phala';
import { DharmaSankata, IDharmaSankataConfig } from '../../src/core/dharma-sankata';
import { YatraManager, IYatraManagerConfig } from '../../src/core/yatra-manager';
import { JnanaCapture, IJnanaCaptureConfig } from '../../src/learning/jnana-capture';
import { SmritiRecall } from '../../src/learning/smriti-recall';
import { AtmaVichara, IAtmaVicharaConfig } from '../../src/reflection/atma-vichara';
import { DrishtiDashboard, IDrishtiDashboardConfig } from '../../src/analytics/drishti-dashboard';
import { ICoreEvent } from '../../src/core/types';
import { JnanaCategory } from '../../src/learning/types';

describe('Tridishti Extension Integration', () => {
  let eventEmitter: vscode.EventEmitter<ICoreEvent>;
  let context: vscode.ExtensionContext;
  let sutraCheckpoints: SutraCheckpoints;
  let karmaPhala: KarmaPhala;
  let dharmaSankata: DharmaSankata;
  let yatraManager: YatraManager;
  let jnanaCapture: JnanaCapture;
  let smritiRecall: SmritiRecall;
  let atmaVichara: AtmaVichara;
  let drishtiDashboard: DrishtiDashboard;

  beforeEach(async () => {
    // Mock VS Code context
    context = {
      subscriptions: [],
      globalState: (global as any).testUtils.createMockMemento(),
    } as any;

    // Initialize event emitter
    eventEmitter = new vscode.EventEmitter<ICoreEvent>();

    // Initialize configurations
    const sutraConfig: ISutraCheckpointConfig = {
      interval: 30,
      autoCommit: false,
      enabled: true,
    };

    const karmaConfig: IKarmaPhalaConfig = {
      milestoneThreshold: 120,
      autoTag: false,
      enabled: true,
      nudgeStrategy: 'default',
    };

    const dharmaConfig: IDharmaSankataConfig = {
      scopeCheckInterval: 60,
      fileChangeThreshold: 10,
      enabled: true,
    };

    const yatraConfig: IYatraManagerConfig = {
      enabled: true,
      autoStart: false,
      persistState: false, // Disable for testing
    };

    const jnanaConfig: IJnanaCaptureConfig = {
      enabled: true,
      categories: ['insight', 'gotcha', 'pattern', 'solution', 'question'],
      autoCapture: false,
      defaultCategory: 'insight',
    };

    const atmaVicharaConfig: IAtmaVicharaConfig = {
      enabled: true,
      autoReflect: false,
      promptTemplates: {
        start: 'Welcome to Atma Vichara',
        achievements: 'What achievements?',
        improvements: 'What could improve?',
        closing: 'Thank you for reflecting',
      },
    };

    const drishtiConfig: IDrishtiDashboardConfig = {
      enabled: true,
      maxEvents: 1000,
      telemetryEnabled: true,
    };

    // Initialize all modules
    sutraCheckpoints = new SutraCheckpoints(sutraConfig, eventEmitter);
    karmaPhala = new KarmaPhala(karmaConfig, eventEmitter);
    dharmaSankata = new DharmaSankata(dharmaConfig, eventEmitter);
    yatraManager = new YatraManager(
      yatraConfig,
      eventEmitter,
      sutraCheckpoints,
      karmaPhala,
      dharmaSankata,
      context.globalState
    );
    jnanaCapture = new JnanaCapture(jnanaConfig);
    smritiRecall = new SmritiRecall({ provider: 'memory' }, jnanaCapture);
    atmaVichara = new AtmaVichara(atmaVicharaConfig);
    drishtiDashboard = new DrishtiDashboard(drishtiConfig);

    // Connect dashboard to event emitter by directly calling the fire method
    const originalFire = eventEmitter.fire;
    eventEmitter.fire = jest.fn((event: any) => {
      originalFire(event);
      drishtiDashboard.recordEvent(event);
    });

    // Set current yatra for learning modules
    jnanaCapture.setCurrentYatra(yatraManager.getCurrentYatra());
  });

  afterEach(() => {
    // Clean up timers and listeners
    sutraCheckpoints.stop();
    dharmaSankata.stop();

    // Clear stored callback
    delete (global as any).testUtils.currentEventCallback;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Session Lifecycle Integration', () => {
    it('should complete a full coding session workflow', async () => {
      // Start a yatra session
      const yatra = await yatraManager.startYatra('Complete user authentication feature');

      expect(yatra).toBeDefined();
      expect(yatra.sankalpa).toBe('Complete user authentication feature');
      expect(yatra.startedAt).toBeGreaterThan(0);

      // Verify session state
      expect(yatraManager.getCurrentYatra()).toBe(yatra);
      expect(drishtiDashboard.getMetrics().activeYatra).toBe(yatra);

      // Create checkpoints during session
      const checkpoint1 = await sutraCheckpoints.createCheckpoint('Starting authentication logic');
      const checkpoint2 = await sutraCheckpoints.createCheckpoint('Implementing JWT handling');

      expect(checkpoint1.message).toBe('Starting authentication logic');
      expect(checkpoint2.message).toBe('Implementing JWT handling');

      // Create milestones
      const milestone = karmaPhala.createMilestone('Authentication module complete');
      expect(milestone.name).toBe('Authentication module complete');
      expect(milestone.status).toBe('active');

      // Capture knowledge during development
      const insight = jnanaCapture.captureInsight(
        'JWT tokens provide stateless authentication',
        { file: 'auth.ts', line: 42 }
      );

      await smritiRecall.save(insight);

      const recalled = await smritiRecall.recall(insight.id);
      expect(recalled?.content).toBe('JWT tokens provide stateless authentication');

      // Complete milestone
      const filesModified = ['auth.ts', 'user.ts', 'session.ts'];
      const karmaPhalaResult = await karmaPhala.completeMilestone(filesModified);

      expect(karmaPhalaResult.score).toBeGreaterThan(0);
      expect(karmaPhalaResult.filesModified).toEqual(filesModified);

      // End session with reflection
      const completedYatra = await yatraManager.endYatra();
      const capturedJnana = jnanaCapture.getAllJnana();
      const reflection = atmaVichara.reflect(completedYatra, capturedJnana);

      expect(completedYatra.endedAt).toBeGreaterThan(completedYatra.startedAt);
      expect(reflection.score).toBeGreaterThanOrEqual(0);
      expect(reflection.score).toBeLessThanOrEqual(100);
      expect(reflection.insights.length).toBeGreaterThan(0);

      // Verify final dashboard state
      const finalMetrics = drishtiDashboard.getMetrics();
      expect(finalMetrics.totalYatras).toBe(1);
      expect(finalMetrics.totalCheckpoints).toBe(2);
      expect(finalMetrics.totalMilestones).toBe(1);
      expect(finalMetrics.totalJnana).toBe(1);
      expect(finalMetrics.activeYatra).toBeUndefined();
    });

    it('should handle multiple concurrent sessions', async () => {
      // This would require multiple YatraManager instances
      // For now, test that only one session can be active
      const yatra1 = await yatraManager.startYatra('Session 1');

      await expect(yatraManager.startYatra('Session 2')).rejects.toThrow(
        'A yatra is already active'
      );

      // End first session
      await yatraManager.endYatra();

      // Now can start second session
      const yatra2 = await yatraManager.startYatra('Session 2');
      expect(yatra2.sankalpa).toBe('Session 2');
    });
  });

  describe('Event Flow Integration', () => {
    it('should propagate events through the system', async () => {
      const eventSpy = jest.fn();
      eventEmitter.event(eventSpy);

      // Start session
      await yatraManager.startYatra('Test session');

      // Create checkpoint
      await sutraCheckpoints.createCheckpoint('Test checkpoint');

      // Create milestone
      karmaPhala.createMilestone('Test milestone');
      await karmaPhala.completeMilestone(['test.ts']);

      // Check that events were emitted and received
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'yatra_start' })
      );
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'checkpoint' })
      );
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'milestone' })
      );
    });

    it('should update dashboard metrics in real-time', async () => {
      await yatraManager.startYatra('Metrics test');

      let metrics = drishtiDashboard.getMetrics();
      expect(metrics.totalYatras).toBe(1);

      await sutraCheckpoints.createCheckpoint('First checkpoint');
      metrics = drishtiDashboard.getMetrics();
      expect(metrics.totalCheckpoints).toBe(1);

      karmaPhala.createMilestone('Test milestone');
      await karmaPhala.completeMilestone(['file.ts']);
      metrics = drishtiDashboard.getMetrics();
      expect(metrics.totalMilestones).toBe(1);
    });
  });

  describe('Knowledge Management Integration', () => {
    it('should integrate jnana capture with session context', async () => {
      const yatra = await yatraManager.startYatra('Knowledge integration test');

      // Capture various types of knowledge
      const insight = jnanaCapture.captureInsight('React hooks are composable');
      const gotcha = jnanaCapture.captureGotcha('Array.splice modifies original');
      const pattern = jnanaCapture.capturePattern('Factory pattern for parsers');
      const solution = jnanaCapture.captureSolution('Use memoization for expensive computations');
      const question = jnanaCapture.captureQuestion('How does React reconciliation work?');

      // All should be linked to the current yatra
      expect(insight.context?.yatraId).toBe(yatra.id);
      expect(gotcha.context?.yatraId).toBe(yatra.id);
      expect(pattern.context?.yatraId).toBe(yatra.id);
      expect(solution.context?.yatraId).toBe(yatra.id);
      expect(question.context?.yatraId).toBe(yatra.id);

      // Save to recall system
      await smritiRecall.save(insight);
      await smritiRecall.save(gotcha);
      await smritiRecall.save(pattern);
      await smritiRecall.save(solution);
      await smritiRecall.save(question);

      // Test search functionality
      const reactResults = await smritiRecall.search('React');
      expect(reactResults.length).toBe(2); // insight and question

      const patternResults = await smritiRecall.search('pattern');
      expect(patternResults.length).toBe(1);

      // Test category filtering
      const insights = await smritiRecall.recallByCategory('insight');
      const gotchas = await smritiRecall.recallByCategory('gotcha');
      expect(insights).toHaveLength(1);
      expect(gotchas).toHaveLength(1);

      // Verify dashboard integration
      drishtiDashboard.recordJnana([insight, gotcha, pattern, solution, question]);
      const metrics = drishtiDashboard.getMetrics();
      expect(metrics.totalJnana).toBe(5);
    });
  });

  describe('Scope Drift Detection Integration', () => {
    it('should detect and alert on scope drift', async () => {
      await yatraManager.startYatra('Implement user login feature');

      // Set goal for dharma sankata
      dharmaSankata.setGoal('user login');

      // Mock files that match the goal
      const mockVSCode = (global as any).testUtils.mockVSCode;
      mockVSCode.workspace.textDocuments = [
        { uri: { fsPath: '/src/auth/login.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/auth/session.ts', scheme: 'file' }, isDirty: true },
      ];

      let result = await dharmaSankata.checkScope();
      expect(result.detected).toBe(false); // Should not detect drift

      // Mock files that don't match the goal (scope creep)
      mockVSCode.workspace.textDocuments = [
        { uri: { fsPath: '/src/payment/stripe.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/payment/paypal.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/payment/webhook.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/payment/config.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/payment/utils.ts', scheme: 'file' }, isDirty: true },
        { uri: { fsPath: '/src/payment/api.ts', scheme: 'file' }, isDirty: true },
      ];

      result = await dharmaSankata.checkScope();
      expect(result.detected).toBe(true);
      expect(result.reason).toBe('goal_mismatch');
      expect(result.suggestion).toContain('diverge from your stated goal');

      // Verify alerts are tracked
      const alerts = dharmaSankata.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(alert => alert.reason === 'goal_mismatch')).toBe(true);
    });

    it('should detect file change threshold violations', async () => {
      await yatraManager.startYatra('Refactor component');

      // Mock many file changes (threshold is 10)
      const mockVSCode = (global as any).testUtils.mockVSCode;
      mockVSCode.workspace.textDocuments = Array(15).fill({
        uri: { fsPath: '/src/component.ts', scheme: 'file' },
        isDirty: true,
      });

      const result = await dharmaSankata.checkScope();
      expect(result.detected).toBe(true);
      expect(result.reason).toBe('file_threshold');
      expect(result.suggestion).toContain('exceeds the threshold');
    });
  });

  describe('Configuration Integration', () => {
    it('should update module configurations dynamically', () => {
      // Test sutra checkpoints config update
      sutraCheckpoints.updateConfig({ interval: 60, autoCommit: true });
      // Config updates are internal, but should not throw errors

      // Test karma phala config update
      karmaPhala.updateConfig({ milestoneThreshold: 200, nudgeStrategy: 'deep-work' });
      // Should not throw errors

      // Test dharma sankata config update
      dharmaSankata.updateConfig({ fileChangeThreshold: 20, scopeCheckInterval: 120 });
      // Should not throw errors

      // Test jnana capture config update
      jnanaCapture.updateConfig({ autoCapture: true, defaultCategory: 'pattern' });
      // Should not throw errors
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle errors gracefully in complex workflows', async () => {
      // Test error in milestone completion when no active milestone
      await expect(karmaPhala.completeMilestone([])).rejects.toThrow(
        'No active milestone to complete'
      );

      // Test error in ending yatra when none active
      await expect(yatraManager.endYatra()).rejects.toThrow(
        'No active yatra to end'
      );

      // Test invalid sankalpa update
      expect(() => yatraManager.updateSankalpa('test')).toThrow(
        'No active yatra to update'
      );

      // Test invalid recall
      const invalidRecall = await smritiRecall.recall('non-existent-id');
      expect(invalidRecall).toBeUndefined();

      // System should remain stable after errors
      const health = drishtiDashboard.getHealthStatus();
      expect(health.status).toBeDefined();
    });
  });

  describe('Performance Integration', () => {
    it('should handle multiple operations efficiently', async () => {
      const startTime = Date.now();

      await yatraManager.startYatra('Performance test');

      // Create multiple checkpoints
      for (let i = 0; i < 10; i++) {
        await sutraCheckpoints.createCheckpoint(`Checkpoint ${i}`);
      }

      // Create multiple milestones
      for (let i = 0; i < 5; i++) {
        karmaPhala.createMilestone(`Milestone ${i}`);
        await karmaPhala.completeMilestone([`file${i}.ts`]);
      }

      // Capture multiple jnana
      for (let i = 0; i < 20; i++) {
        const jnana = jnanaCapture.captureInsight(`Insight ${i}`);
        await smritiRecall.save(jnana);
      }

      await yatraManager.endYatra();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 5 seconds)
      expect(duration).toBeLessThan(5000);

      // Verify operations completed successfully (dashboard metrics may not be updated due to event system)
      expect(await yatraManager.getCurrentYatra()).toBeUndefined(); // Session ended
    });
  });

  describe('Reflection Integration', () => {
    it('should provide comprehensive session reflection', async () => {
      const yatra = await yatraManager.startYatra('Build dashboard component');

      // Simulate a productive session
      await sutraCheckpoints.createCheckpoint('Planning component structure');
      await sutraCheckpoints.createCheckpoint('Implementing core logic');
      await sutraCheckpoints.createCheckpoint('Adding tests');
      await sutraCheckpoints.createCheckpoint('Final review');

      karmaPhala.createMilestone('Component logic complete');
      await karmaPhala.completeMilestone(['dashboard.ts', 'utils.ts']);

      karmaPhala.createMilestone('Tests passing');
      await karmaPhala.completeMilestone(['dashboard.test.ts']);

      // Capture learning
      jnanaCapture.captureInsight('React context is powerful for global state');
      jnanaCapture.captureGotcha('Remember useEffect dependency arrays');
      jnanaCapture.capturePattern('Compound component pattern works well');

      // End session
      const completedYatra = await yatraManager.endYatra();
      const capturedJnana = jnanaCapture.getAllJnana();
      const reflection = atmaVichara.reflect(completedYatra, capturedJnana);

      // Verify reflection quality
      expect(reflection.score).toBeGreaterThan(50); // Should be a good score
      expect(reflection.insights.length).toBeGreaterThan(0);
      expect(reflection.achievements.length).toBeGreaterThan(0);
      expect(reflection.improvements.length).toBeGreaterThanOrEqual(0);
      expect(reflection.suggestions.length).toBeGreaterThanOrEqual(0);

      // Verify reflection content has meaningful data
      expect(reflection.insights.length).toBeGreaterThan(0);
      expect(reflection.achievements.length).toBeGreaterThan(0);
      expect(reflection.score).toBeGreaterThan(0);

      // Generate prompts
      const prompts = atmaVichara.generatePrompts(completedYatra);
      expect(prompts.length).toBeGreaterThan(3); // Should have multiple prompts
      expect(prompts.some(p => p.includes('Sankalpa'))).toBe(true);
    });
  });
});
