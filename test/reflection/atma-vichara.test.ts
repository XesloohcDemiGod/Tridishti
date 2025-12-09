/**
 * Test suite for AtmaVichara module
 */

import { AtmaVichara } from '../../src/reflection/atma-vichara';
import { IAtmaVicharaConfig } from '../../src/reflection/atma-vichara';

describe('AtmaVichara', () => {
  let config: IAtmaVicharaConfig;
  let atmaVichara: AtmaVichara;

  beforeEach(() => {
    config = {
      enabled: true,
      autoReflect: false,
      promptTemplates: {
        start: "Welcome to Atma Vichara (self-inquiry). Let's reflect on your coding session.",
        achievements: 'What achievements stand out from this session?',
        improvements: 'What could be improved in your workflow?',
        closing:
          'Thank you for taking time to reflect. May your next session be even more aligned.',
      },
    };
    atmaVichara = new AtmaVichara(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('reflection generation', () => {
    it('should generate reflection from yatra', () => {
      const mockYatra = {
        id: 'yatra-123',
        sankalpa: 'Implement user authentication',
        startedAt: Date.now() - 3600000, // 1 hour ago
        endedAt: Date.now(),
        checkpoints: [
          { id: 'cp1', timestamp: Date.now() - 1800000, filesChanged: ['auth.ts'] },
          { id: 'cp2', timestamp: Date.now() - 900000, filesChanged: ['user.ts', 'session.ts'] },
        ],
        milestones: [
          { id: 'm1', name: 'Auth setup', status: 'completed', createdAt: Date.now() - 3000000 },
          { id: 'm2', name: 'Login flow', status: 'completed', createdAt: Date.now() - 2000000 },
        ],
        dharmaAlerts: [
          { detected: false, timestamp: Date.now() - 1200000, reason: 'file_threshold' },
        ],
      };

      const capturedJnana = [
        { id: 'j1', category: 'insight', content: 'JWT tokens are efficient' },
        { id: 'j2', category: 'gotcha', content: 'Remember to hash passwords' },
      ];

      const reflection = atmaVichara.reflect(mockYatra, capturedJnana);

      expect(reflection).toBeDefined();
      expect(reflection.yatraId).toBe('yatra-123');
      expect(reflection.timestamp).toBeGreaterThan(0);
      expect(Array.isArray(reflection.insights)).toBe(true);
      expect(Array.isArray(reflection.improvements)).toBe(true);
      expect(Array.isArray(reflection.achievements)).toBe(true);
      expect(Array.isArray(reflection.suggestions)).toBe(true);
      expect(reflection.score).toBeGreaterThanOrEqual(0);
      expect(reflection.score).toBeLessThanOrEqual(100);
    });

    it('should handle yatra without sankalpa', () => {
      const mockYatra = {
        id: 'yatra-no-sankalpa',
        startedAt: Date.now() - 1800000,
        endedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      const reflection = atmaVichara.reflect(mockYatra);

      expect(reflection.yatraId).toBe('yatra-no-sankalpa');
      expect(reflection.insights).toContain('Session duration: 30 minutes');
    });

    it('should handle empty yatra', () => {
      const mockYatra = {
        id: 'empty-yatra',
        startedAt: Date.now() - 60000,
        endedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      const reflection = atmaVichara.reflect(mockYatra);

      expect(reflection.insights).toContain('No checkpoints created');
      expect(reflection.improvements).toContain('No checkpoints created');
    });
  });

  describe('reflection prompts', () => {
    it('should generate guided prompts', () => {
      const mockYatra = {
        id: 'yatra-prompts',
        sankalpa: 'Build a dashboard',
        startedAt: Date.now() - 1800000,
        endedAt: Date.now(),
        checkpoints: [{ id: 'cp1', timestamp: Date.now() - 900000, filesChanged: [] }],
        milestones: [
          { id: 'm1', name: 'UI complete', status: 'completed', createdAt: Date.now() - 1200000 },
        ],
        dharmaAlerts: [],
      };

      const prompts = atmaVichara.generatePrompts(mockYatra);

      expect(prompts).toContain(config.promptTemplates.start);
      expect(prompts).toContain('Your Sankalpa (intention) was: "Build a dashboard"');
      expect(prompts).toContain('You created 1 checkpoints during this session.');
      expect(prompts).toContain('You completed 1 out of 1 milestones.');
      expect(prompts).toContain(config.promptTemplates.achievements);
      expect(prompts).toContain(config.promptTemplates.improvements);
      expect(prompts).toContain(config.promptTemplates.closing);
    });

    it('should handle yatra without sankalpa in prompts', () => {
      const mockYatra = {
        id: 'no-sankalpa-prompts',
        startedAt: Date.now() - 1800000,
        endedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      const prompts = atmaVichara.generatePrompts(mockYatra);

      expect(prompts).toContain(config.promptTemplates.start);
      expect(prompts).not.toContain('Your Sankalpa');
    });
  });

  describe('diff analysis', () => {
    it('should analyze focused change pattern', () => {
      const checkpoints = [
        { id: 'cp1', timestamp: 1000, filesChanged: ['user.ts'] },
        { id: 'cp2', timestamp: 2000, filesChanged: ['user.ts', 'auth.ts'] },
        { id: 'cp3', timestamp: 3000, filesChanged: ['user.ts'] },
      ];

      const analysis = atmaVichara.analyzeDiffs(checkpoints);

      expect(analysis.totalFilesChanged).toBe(2); // unique files
      expect(analysis.uniqueFiles).toEqual(['user.ts', 'auth.ts']);
      expect(analysis.changePattern).toBe('focused');
    });

    it('should analyze scattered change pattern', () => {
      const checkpoints = [
        {
          id: 'cp1',
          timestamp: 1000,
          filesChanged: ['file1.ts', 'file2.ts', 'file3.ts', 'file4.ts', 'file5.ts', 'file6.ts'],
        },
      ];

      const analysis = atmaVichara.analyzeDiffs(checkpoints);

      expect(analysis.changePattern).toBe('scattered');
    });

    it('should analyze iterative change pattern', () => {
      const checkpoints = [
        { id: 'cp1', timestamp: 1000, filesChanged: ['main.ts'] },
        { id: 'cp2', timestamp: 2000, filesChanged: ['main.ts'] },
        { id: 'cp3', timestamp: 3000, filesChanged: ['main.ts'] },
        { id: 'cp4', timestamp: 4000, filesChanged: ['main.ts'] },
      ];

      const analysis = atmaVichara.analyzeDiffs(checkpoints);

      expect(analysis.changePattern).toBe('iterative');
    });

    it('should handle empty checkpoints', () => {
      const analysis = atmaVichara.analyzeDiffs([]);

      expect(analysis.totalFilesChanged).toBe(0);
      expect(analysis.uniqueFiles).toEqual([]);
      expect(analysis.changePattern).toBe('focused');
    });
  });

  describe('scoring system', () => {
    it('should calculate high score for good session', () => {
      const mockYatra = {
        id: 'good-session',
        sankalpa: 'Complete feature',
        startedAt: Date.now() - 7200000, // 2 hours
        endedAt: Date.now(),
        checkpoints: Array(10).fill({ id: 'cp', timestamp: Date.now(), filesChanged: [] }),
        milestones: [{ id: 'm1', name: 'Complete', status: 'completed', createdAt: Date.now() }],
        dharmaAlerts: [],
      };

      const reflection = atmaVichara.reflect(mockYatra);

      expect(reflection.score).toBeGreaterThan(70);
    });

    it('should calculate low score for poor session', () => {
      const mockYatra = {
        id: 'poor-session',
        startedAt: Date.now() - 600000, // 10 minutes
        endedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: Array(10).fill({
          detected: true,
          timestamp: Date.now(),
          reason: 'file_threshold',
        }),
      };

      const reflection = atmaVichara.reflect(mockYatra);

      expect(reflection.score).toBeLessThan(30);
    });

    it('should handle edge case scores', () => {
      const mockYatra = {
        id: 'edge-case',
        startedAt: Date.now() - 1000,
        endedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      const reflection = atmaVichara.reflect(mockYatra);

      expect(reflection.score).toBeGreaterThanOrEqual(0);
      expect(reflection.score).toBeLessThanOrEqual(100);
    });
  });

  describe('content generation', () => {
    it('should generate insights from session data', () => {
      const mockYatra = {
        id: 'insights-test',
        sankalpa: 'Learn TypeScript',
        startedAt: Date.now() - 3600000,
        endedAt: Date.now(),
        checkpoints: [{ id: 'cp1', timestamp: Date.now(), filesChanged: ['types.ts'] }],
        milestones: [],
        dharmaAlerts: [],
      };

      const capturedJnana = [
        { id: 'j1', category: 'insight', content: 'TypeScript interfaces are powerful' },
      ];

      const reflection = atmaVichara.reflect(mockYatra, capturedJnana);

      expect(reflection.insights.length).toBeGreaterThan(0);
      expect(reflection.insights.some(i => i.includes('Session duration'))).toBe(true);
      expect(reflection.insights.some(i => i.includes('checkpoints'))).toBe(true);
      expect(reflection.insights.some(i => i.includes('knowledge artifacts'))).toBe(true);
    });

    it('should generate improvement suggestions', () => {
      const mockYatra = {
        id: 'improvements-test',
        startedAt: Date.now() - 1800000,
        endedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [
          { detected: true, timestamp: Date.now(), reason: 'file_threshold' },
          { detected: true, timestamp: Date.now(), reason: 'file_threshold' },
          { detected: true, timestamp: Date.now(), reason: 'file_threshold' },
          { detected: true, timestamp: Date.now(), reason: 'file_threshold' },
        ],
      };

      const reflection = atmaVichara.reflect(mockYatra);

      expect(reflection.improvements.some(i => i.includes('scope drift'))).toBe(true);
    });

    it('should generate achievement highlights', () => {
      const mockYatra = {
        id: 'achievements-test',
        startedAt: Date.now() - 1800000,
        endedAt: Date.now(),
        checkpoints: Array(6).fill({ id: 'cp', timestamp: Date.now(), filesChanged: [] }),
        milestones: [
          { id: 'm1', name: 'Complete task', status: 'completed', createdAt: Date.now() },
        ],
        dharmaAlerts: [],
      };

      const reflection = atmaVichara.reflect(mockYatra);

      expect(
        reflection.achievements.some(a => a.includes('Consistent checkpoint discipline'))
      ).toBe(true);
      expect(reflection.achievements.some(a => a.includes('milestone'))).toBe(true);
    });

    it('should generate future suggestions', () => {
      const mockYatra = {
        id: 'suggestions-test',
        startedAt: Date.now() - 1800000,
        endedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      const reflection = atmaVichara.reflect(mockYatra);

      expect(reflection.suggestions.some(s => s.includes('Sankalpa'))).toBe(true);
    });
  });
});
