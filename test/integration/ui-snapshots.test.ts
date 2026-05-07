/**
 * Snapshot tests for UI components
 *
 * Tests the HTML output of webview functions to ensure
 * UI components render correctly and maintain consistent structure.
 */

import { IDharmaSankata, IYatra } from '../../src/core/types';
import {
  getAtmaVicharaWebviewContent,
  getDharmaAlertWebviewContent,
  getDrishtiWebviewContent,
  getYatraWebviewContent,
} from '../../src/extension';

describe('UI Component Snapshots', () => {
  describe('Yatra Webview', () => {
    it('should render active yatra with all components', () => {
      const mockYatra: IYatra = {
        id: 'yatra-123',
        sankalpa: 'Build user authentication system',
        startedAt: Date.now() - 3600000, // 1 hour ago
        checkpoints: [
          {
            id: 'cp1',
            timestamp: Date.now() - 1800000,
            message: 'Setting up auth routes',
            filesChanged: ['auth.ts', 'routes.ts'],
            gitCommitHash: 'abc123',
          },
          {
            id: 'cp2',
            timestamp: Date.now() - 900000,
            message: 'Implementing JWT validation',
            filesChanged: ['jwt.ts'],
          },
        ],
        milestones: [
          {
            id: 'm1',
            name: 'Auth routes complete',
            createdAt: Date.now() - 3000000,
            targetDuration: 1800,
            status: 'completed',
            completedAt: Date.now() - 1200000,
          },
          {
            id: 'm2',
            name: 'JWT implementation',
            createdAt: Date.now() - 1800000,
            status: 'active',
          },
        ],
        dharmaAlerts: [
          {
            detected: false,
            timestamp: Date.now() - 2400000,
            reason: 'file_threshold',
            details: {
              filesChanged: 2,
              threshold: 10,
            },
          },
        ],
      };

      const html = getYatraWebviewContent(mockYatra);

      // Basic structure checks
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>Current Yatra</title>');
      expect(html).toContain('Build user authentication system');
      expect(html).toContain('Setting up auth routes');
      expect(html).toContain('Implementing JWT validation');
      expect(html).toContain('Auth routes complete');
      expect(html).toContain('JWT implementation');

      // Interactive elements
      expect(html).toContain('sankalpaInput');
      expect(html).toContain('updateSankalpa()');

      // Ensure no undefined values in HTML
      expect(html).not.toContain('undefined');
      expect(html).not.toContain('null');
    });

    it('should render yatra without sankalpa', () => {
      const mockYatra: IYatra = {
        id: 'yatra-no-sankalpa',
        startedAt: Date.now() - 1800000,
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      const html = getYatraWebviewContent(mockYatra);

      expect(html).toContain('Not set');
      expect(html).toContain('No checkpoints yet');
      expect(html).toContain('No milestones yet');
    });

    it('should handle special characters in sankalpa', () => {
      const mockYatra: IYatra = {
        id: 'yatra-special',
        sankalpa: 'Fix <script> XSS & SQL "injection" issues',
        startedAt: Date.now() - 1800000,
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      };

      const html = getYatraWebviewContent(mockYatra);

      expect(html).toContain('Fix &lt;script&gt; XSS &amp; SQL &quot;injection&quot; issues');
    });
  });

  describe('Drishti Dashboard Webview', () => {
    // Use fixed timestamps for deterministic tests
    const BASE_TIME = 1640000000000; // Fixed timestamp
    const mockMetrics = {
      totalYatras: 5,
      activeYatra: {
        id: 'active-yatra',
        sankalpa: 'Current project',
        startedAt: BASE_TIME - 1800000,
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      },
      totalCheckpoints: 23,
      totalMilestones: 8,
      totalDharmaAlerts: 3,
      totalJnana: 15,
      averageSessionDuration: 75,
      productivityScore: 82,
      recentActivity: [
        {
          type: 'checkpoint' as const,
          timestamp: BASE_TIME - 300000,
          data: { id: 'cp1', timestamp: BASE_TIME, filesChanged: [], message: 'Test checkpoint' },
        },
        {
          type: 'milestone' as const,
          timestamp: BASE_TIME - 600000,
          data: { id: 'kp1', milestoneId: 'm1', timestamp: BASE_TIME, score: 85, duration: 60, filesModified: [] },
        },
      ],
    };

    const mockHealth = {
      status: 'healthy' as const,
      modules: {
        sutraCheckpoints: true,
        karmaPhala: true,
        dharmaSankata: true,
        yatraManager: true,
        jnanaCapture: true,
        smritiRecall: true,
        atmaVichara: true,
      },
      lastEventTime: BASE_TIME - 180000,
    };

    it('should render comprehensive dashboard', () => {
      const html = getDrishtiWebviewContent(mockMetrics, mockHealth);

      expect(html).toContain('Drishti Dashboard');
      expect(html).toContain('System Health: HEALTHY');
      expect(html).toContain('5'); // totalYatras
      expect(html).toContain('23'); // totalCheckpoints
      expect(html).toContain('8'); // totalMilestones
      expect(html).toContain('3'); // totalDharmaAlerts
      expect(html).toContain('15'); // totalJnana
      expect(html).toContain('82'); // productivityScore
      expect(html).toContain('75'); // averageSessionDuration

      // Health indicators
      expect(html).toContain('#4CAF50'); // healthy color
      expect(html).toContain('recent-activity');
    });

    it('should render degraded health status', () => {
      const degradedHealth = { ...mockHealth, status: 'degraded' as const };

      const html = getDrishtiWebviewContent(mockMetrics, degradedHealth);

      expect(html).toContain('System Health: DEGRADED');
      expect(html).toContain('#FF9800'); // degraded color
    });

    it('should render unhealthy status', () => {
      const unhealthyHealth = { ...mockHealth, status: 'unhealthy' as const };

      const html = getDrishtiWebviewContent(mockMetrics, unhealthyHealth);

      expect(html).toContain('System Health: UNHEALTHY');
      expect(html).toContain('#F44336'); // unhealthy color
    });

    it('should handle empty metrics', () => {
      const emptyMetrics = {
        totalYatras: 0,
        totalCheckpoints: 0,
        totalMilestones: 0,
        totalDharmaAlerts: 0,
        totalJnana: 0,
        averageSessionDuration: 0,
        productivityScore: 0,
        recentActivity: [],
      };

      const html = getDrishtiWebviewContent(emptyMetrics, mockHealth);

      expect(html).toContain('0');
      expect(html).toContain('No recent activity');
    });
  });

  describe('Atma Vichara Webview', () => {
    const mockReflection = {
      yatraId: 'yatra-reflection',
      timestamp: Date.now(),
      insights: [
        'Session duration: 45 minutes',
        'Maintained 3 checkpoints, showing consistent workflow',
        'Captured 2 knowledge artifacts',
      ],
      improvements: ['Consider breaking work into smaller chunks'],
      achievements: ['Completed 2 milestones', 'Maintained consistent checkpoint discipline'],
      suggestions: [
        'Consider setting a Sankalpa for your next session',
        'Try capturing knowledge artifacts during your next session',
      ],
      score: 78,
    };

    const mockPrompts = [
      "Welcome to Atma Vichara (self-inquiry). Let's reflect on your coding session.",
      'Your Sankalpa (intention) was: "Build feature"',
      'Did you stay aligned with this intention?',
      'What achievements stand out from this session?',
      'What could be improved in your workflow?',
      'Thank you for taking time to reflect. May your next session be even more aligned.',
    ];

    it('should render complete reflection interface', () => {
      const html = getAtmaVicharaWebviewContent(mockReflection, mockPrompts);

      expect(html).toContain('Atma Vichara');
      expect(html).toContain('78/100');
      expect(html).toContain('Good progress made 📈'); // Score 78 is between 60-80
      expect(html).toContain('Session duration: 45 minutes');
      expect(html).toContain('Completed 2 milestones');
      expect(html).toContain('Consider breaking work into smaller chunks');

      // Check all sections are present
      expect(html).toContain('Guided Reflection Prompts');
      expect(html).toContain('Insights');
      expect(html).toContain('Achievements');
      expect(html).toContain('Improvements');
      expect(html).toContain('Suggestions for Future Sessions');
    });

    it('should render different score messages', () => {
      const lowScoreReflection = { ...mockReflection, score: 35 };

      const html = getAtmaVicharaWebviewContent(lowScoreReflection, mockPrompts);

      expect(html).toContain('35/100');
      expect(html).toContain('Consider reviewing your approach');
    });

    it('should handle empty reflection content', () => {
      const emptyReflection = {
        yatraId: 'empty',
        timestamp: Date.now(),
        insights: [],
        improvements: [],
        achievements: [],
        suggestions: [],
        score: undefined,
      };

      const html = getAtmaVicharaWebviewContent(emptyReflection, []);

      expect(html).toContain('Atma Vichara');
      expect(html).not.toContain('/100'); // No score
    });

    it('should escape HTML in content', () => {
      const unsafeReflection = {
        ...mockReflection,
        insights: ['<script>alert("xss")</script>'],
        achievements: ['<b>Bold achievement</b>'],
      };

      const html = getAtmaVicharaWebviewContent(unsafeReflection, mockPrompts);

      // HTML should be escaped in the output
      expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(html).toContain('&lt;b&gt;Bold achievement&lt;/b&gt;');
    });
  });

  describe('Dharma Alert Webview', () => {
    const mockSankata: IDharmaSankata = {
      detected: true,
      timestamp: Date.now(),
      reason: 'goal_mismatch',
      details: {
        filesChanged: 8,
        threshold: 10,
        currentGoal: 'implement login',
        detectedGoal: 'payment-system',
      },
      suggestion:
        'Your current work seems to diverge from your stated goal: "implement login". Consider realigning or updating your goal.',
    };

    it('should render dharma alert with full details', () => {
      const html = getDharmaAlertWebviewContent(mockSankata);

      expect(html).toContain('Dharma Sankata Detected');
      expect(html).toContain('GOAL MISMATCH'); // Underscore replaced with space
      expect(html).toContain('implement login');
      expect(html).toContain('payment-system');
      expect(html).toContain('8'); // filesChanged
      expect(html).toContain('10'); // threshold
      expect(html).toContain('diverge from your stated goal');
    });

    it('should render file threshold alert', () => {
      const fileThresholdSankata: IDharmaSankata = {
        detected: true,
        timestamp: Date.now(),
        reason: 'file_threshold',
        details: {
          filesChanged: 15,
          threshold: 10,
        },
        suggestion: "You've modified 15 files, which exceeds the threshold of 10.",
      };

      const html = getDharmaAlertWebviewContent(fileThresholdSankata);

      expect(html).toContain('FILE THRESHOLD'); // Underscore replaced with space
      expect(html).toContain('15');
      expect(html).toContain('10');
      expect(html).toContain('exceeds the threshold');
    });

    it('should render time anomaly alert', () => {
      const timeAnomalySankata: IDharmaSankata = {
        detected: true,
        timestamp: Date.now(),
        reason: 'time_anomaly',
        details: {
          filesChanged: 6,
          threshold: 10,
        },
        suggestion:
          'Rapid file changes detected. This might indicate context switching or scope creep.',
      };

      const html = getDharmaAlertWebviewContent(timeAnomalySankata);

      expect(html).toContain('TIME ANOMALY'); // Underscore replaced with space
      expect(html).toContain('Rapid file changes detected');
      expect(html).toContain('context switching');
    });

    it('should handle minimal sankata data', () => {
      const minimalSankata: IDharmaSankata = {
        detected: true,
        timestamp: Date.now(),
        reason: 'file_threshold',
        details: {
          filesChanged: 12,
          threshold: 10,
        },
      };

      const html = getDharmaAlertWebviewContent(minimalSankata);

      expect(html).toContain('Dharma Sankata Detected');
      expect(html).toContain('12');
      expect(html).toContain('10');
    });
  });

  describe('HTML Structure and Accessibility', () => {
    it('should generate valid HTML structure', () => {
      const yatraHtml = getYatraWebviewContent({
        id: 'test',
        startedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      });

      // Basic HTML validation
      expect(yatraHtml).toMatch(/^<!DOCTYPE html>/);
      expect(yatraHtml).toContain('<html>');
      expect(yatraHtml).toContain('<head>');
      expect(yatraHtml).toContain('<body>');
      expect(yatraHtml).toContain('</body>');
      expect(yatraHtml).toContain('</html>');
    });

    it('should include proper meta tags', () => {
      const yatraHtml = getYatraWebviewContent({
        id: 'test',
        startedAt: Date.now(),
        checkpoints: [],
        milestones: [],
        dharmaAlerts: [],
      });

      expect(yatraHtml).toContain('<meta charset="UTF-8">');
      expect(yatraHtml).toContain('<meta name="viewport"');
    });

    it('should use semantic HTML elements', () => {
      const dashboardHtml = getDrishtiWebviewContent(
        {
          totalYatras: 0,
          totalCheckpoints: 0,
          totalMilestones: 0,
          totalDharmaAlerts: 0,
          totalJnana: 0,
          averageSessionDuration: 0,
          productivityScore: 0,
          recentActivity: [],
        },
        {
          status: 'healthy',
          modules: {
            sutraCheckpoints: true,
            karmaPhala: true,
            dharmaSankata: true,
            yatraManager: true,
            jnanaCapture: true,
            smritiRecall: true,
            atmaVichara: true,
          },
          lastEventTime: Date.now(),
        }
      );

      expect(dashboardHtml).toContain('<h1>');
      expect(dashboardHtml).toContain('<h2>');
      expect(dashboardHtml).toContain('<div class="');
    });

    it('should include CSS for proper styling', () => {
      const reflectionHtml = getAtmaVicharaWebviewContent(
        {
          yatraId: 'test',
          timestamp: Date.now(),
          insights: [],
          improvements: [],
          achievements: [],
          suggestions: [],
        },
        []
      );

      expect(reflectionHtml).toContain('<style>');
      expect(reflectionHtml).toContain('font-family');
      expect(reflectionHtml).toContain('background');
      expect(reflectionHtml).toContain('color');
    });
  });

  describe('Dynamic Content Handling', () => {
    it('should handle large data sets gracefully', () => {
      const largeYatra: IYatra = {
        id: 'large-yatra',
        sankalpa: 'Large project',
        startedAt: Date.now() - 3600000,
        checkpoints: Array(50)
          .fill(null)
          .map((_, i) => ({
            id: `cp${i}`,
            timestamp: Date.now() - (50 - i) * 60000,
            message: `Checkpoint ${i}`,
            filesChanged: [`file${i}.ts`],
          })),
        milestones: Array(20)
          .fill(null)
          .map((_, i) => ({
            id: `m${i}`,
            name: `Milestone ${i}`,
            createdAt: Date.now() - (20 - i) * 180000,
            status: i % 2 === 0 ? 'completed' : 'active',
          })),
        dharmaAlerts: Array(10)
          .fill(null)
          .map((_, i) => ({
            detected: i % 2 === 0,
            timestamp: Date.now() - (10 - i) * 300000,
            reason: 'file_threshold',
            details: {
              filesChanged: 5 + i,
              threshold: 10,
            },
          })),
      };

      const html = getYatraWebviewContent(largeYatra);

      // Should contain representative samples
      expect(html).toContain('Checkpoint 0');
      expect(html).toContain('Checkpoint 49');
      expect(html).toContain('Milestone 0');
      expect(html).toContain('Milestone 19');
      expect(html).toContain('Large project');

      // Should not be excessively large (reasonable size check)
      expect(html.length).toBeLessThan(100000); // Should be reasonable size
    });

    it('should handle timestamp formatting', () => {
      const yatraWithTimestamps: IYatra = {
        id: 'timestamp-test',
        startedAt: 1609459200000, // 2021-01-01 00:00:00 UTC
        checkpoints: [
          {
            id: 'cp1',
            timestamp: 1609459260000, // 1 minute later
            message: 'Test checkpoint',
            filesChanged: [],
          },
        ],
        milestones: [],
        dharmaAlerts: [],
      };

      const html = getYatraWebviewContent(yatraWithTimestamps);

      // Should contain the HTML without throwing errors on date formatting
      // The webview doesn't display the yatra ID, but should display checkpoint content
      expect(html).toContain('Test checkpoint');
      expect(html).toContain('Current Yatra'); // Header text
    });
  });
});
