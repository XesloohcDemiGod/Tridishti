/**
 * Atma Vichara Module
 *
 * Provides post-run reflection, diff analysis, and heuristics for improvement prompts.
 * Maps to the Bhakti (reflection) pillar - self-inquiry and guided reflection.
 *
 * Features:
 * - Post-session reflection
 * - Diff analysis
 * - Improvement heuristics
 * - Guided prompts
 */

import { IYatra, ISutraCheckpoint } from '../core/types';
import { IJnana } from '../learning/types';

/**
 * Reflection result from atma vichara
 */
export interface IReflectionResult {
  yatraId: string;
  timestamp: number;
  insights: string[];
  improvements: string[];
  achievements: string[];
  suggestions: string[];
  score?: number;
}

/**
 * Configuration for atma vichara
 */
export interface IAtmaVicharaConfig {
  enabled: boolean;
  autoReflect: boolean;
  promptTemplates: {
    start: string;
    achievements: string;
    improvements: string;
    closing: string;
  };
}

/**
 * Manages self-inquiry and reflection (Atma Vichara)
 */
export class AtmaVichara {
  private config: IAtmaVicharaConfig;

  /**
   * Creates a new AtmaVichara instance
   * @param config Configuration for reflection
   */
  constructor(config: IAtmaVicharaConfig) {
    this.config = config;
  }

  /**
   * Performs reflection on a completed yatra
   * @param yatra Completed yatra to reflect on
   * @param capturedJnana Optional captured knowledge from the session
   * @returns Reflection result
   */
  public reflect(yatra: IYatra, capturedJnana?: IJnana[]): IReflectionResult {
    const insights = this.generateInsights(yatra, capturedJnana);
    const improvements = this.generateImprovements(yatra);
    const achievements = this.generateAchievements(yatra);
    const suggestions = this.generateSuggestions(yatra, capturedJnana);
    const score = this.calculateScore(yatra);

    return {
      yatraId: yatra.id,
      timestamp: Date.now(),
      insights,
      improvements,
      achievements,
      suggestions,
      score,
    };
  }

  /**
   * Generates guided reflection prompts
   * @param yatra Yatra to reflect on
   * @returns Array of prompt strings
   */
  public generatePrompts(yatra: IYatra): string[] {
    const prompts: string[] = [];

    prompts.push(this.config.promptTemplates.start);

    if (yatra.sankalpa) {
      prompts.push(`Your Sankalpa (intention) was: "${yatra.sankalpa}"`);
      prompts.push('Did you stay aligned with this intention?');
    }

    if (yatra.checkpoints.length > 0) {
      prompts.push(
        `You created ${yatra.checkpoints.length} checkpoints during this session.`
      );
    }

    if (yatra.milestones.length > 0) {
      const completed = yatra.milestones.filter((m) => m.status === 'completed');
      prompts.push(
        `You completed ${completed.length} out of ${yatra.milestones.length} milestones.`
      );
    }

    if (yatra.dharmaAlerts.length > 0) {
      prompts.push(
        `You received ${yatra.dharmaAlerts.length} scope drift alerts. Consider reviewing your workflow.`
      );
    }

    prompts.push(this.config.promptTemplates.achievements);
    prompts.push(this.config.promptTemplates.improvements);
    prompts.push(this.config.promptTemplates.closing);

    return prompts;
  }

  /**
   * Analyzes diffs from checkpoints
   * @param checkpoints Array of checkpoints
   * @returns Diff analysis summary
   */
  public analyzeDiffs(checkpoints: ISutraCheckpoint[]): {
    totalFilesChanged: number;
    uniqueFiles: string[];
    changePattern: 'focused' | 'scattered' | 'iterative';
  } {
    const uniqueFiles = new Set<string>();
    for (const checkpoint of checkpoints) {
      for (const file of checkpoint.filesChanged) {
        uniqueFiles.add(file);
      }
    }

    const totalFilesChanged = uniqueFiles.size;
    const avgFilesPerCheckpoint =
      checkpoints.length > 0
        ? checkpoints.reduce((sum, cp) => sum + cp.filesChanged.length, 0) /
          checkpoints.length
        : 0;

    let changePattern: 'focused' | 'scattered' | 'iterative' = 'focused';
    if (avgFilesPerCheckpoint > 10) {
      changePattern = 'scattered';
    } else if (checkpoints.length > 3 && totalFilesChanged < checkpoints.length * 2) {
      changePattern = 'iterative';
    }

    return {
      totalFilesChanged,
      uniqueFiles: Array.from(uniqueFiles),
      changePattern,
    };
  }

  /**
   * Generates insights from yatra and captured knowledge
   * @param yatra Completed yatra
   * @param capturedJnana Optional captured knowledge
   * @returns Array of insight strings
   */
  private generateInsights(yatra: IYatra, capturedJnana?: IJnana[]): string[] {
    const insights: string[] = [];

    const duration = yatra.endedAt && yatra.startedAt
      ? Math.floor((yatra.endedAt - yatra.startedAt) / 1000 / 60)
      : 0;

    if (duration > 0) {
      insights.push(`Session duration: ${duration} minutes`);
    }

    if (yatra.checkpoints.length > 0) {
      insights.push(
        `Maintained ${yatra.checkpoints.length} checkpoints, showing consistent workflow`
      );
    }

    if (capturedJnana && capturedJnana.length > 0) {
      insights.push(`Captured ${capturedJnana.length} knowledge artifacts`);
    }

    const diffAnalysis = this.analyzeDiffs(yatra.checkpoints);
    insights.push(
      `Change pattern: ${diffAnalysis.changePattern} (${diffAnalysis.totalFilesChanged} unique files)`
    );

    return insights;
  }

  /**
   * Generates improvement suggestions
   * @param yatra Completed yatra
   * @returns Array of improvement strings
   */
  private generateImprovements(yatra: IYatra): string[] {
    const improvements: string[] = [];

    if (yatra.dharmaAlerts.length > 3) {
      improvements.push(
        'High number of scope drift alerts. Consider setting clearer goals or breaking work into smaller chunks.'
      );
    }

    if (yatra.checkpoints.length === 0) {
      improvements.push(
        'No checkpoints created. Consider using checkpoints to track your progress.'
      );
    }

    const diffAnalysis = this.analyzeDiffs(yatra.checkpoints);
    if (diffAnalysis.changePattern === 'scattered') {
      improvements.push(
        'Scattered change pattern detected. Consider focusing on one area at a time.'
      );
    }

    return improvements;
  }

  /**
   * Generates achievement highlights
   * @param yatra Completed yatra
   * @returns Array of achievement strings
   */
  private generateAchievements(yatra: IYatra): string[] {
    const achievements: string[] = [];

    const completedMilestones = yatra.milestones.filter(
      (m) => m.status === 'completed'
    );
    if (completedMilestones.length > 0) {
      achievements.push(
        `Completed ${completedMilestones.length} milestone(s)`
      );
    }

    if (yatra.checkpoints.length >= 5) {
      achievements.push('Maintained consistent checkpoint discipline');
    }

    if (yatra.dharmaAlerts.length === 0) {
      achievements.push('No scope drift detected - excellent focus!');
    }

    return achievements;
  }

  /**
   * Generates suggestions for future sessions
   * @param yatra Completed yatra
   * @param capturedJnana Optional captured knowledge
   * @returns Array of suggestion strings
   */
  private generateSuggestions(
    yatra: IYatra,
    capturedJnana?: IJnana[]
  ): string[] {
    const suggestions: string[] = [];

    if (!yatra.sankalpa) {
      suggestions.push('Consider setting a Sankalpa (intention) for your next session');
    }

    if (capturedJnana && capturedJnana.length === 0) {
      suggestions.push(
        'Try capturing knowledge artifacts (insights, patterns, solutions) during your next session'
      );
    }

    const diffAnalysis = this.analyzeDiffs(yatra.checkpoints);
    if (diffAnalysis.changePattern === 'iterative') {
      suggestions.push(
        'Your iterative change pattern is good. Continue refining your approach.'
      );
    }

    return suggestions;
  }

  /**
   * Calculates a score for the yatra
   * @param yatra Completed yatra
   * @returns Score value (0-100)
   */
  private calculateScore(yatra: IYatra): number {
    let score = 50; // Base score

    // Checkpoints contribute to score
    score += Math.min(yatra.checkpoints.length * 5, 20);

    // Completed milestones contribute
    const completedMilestones = yatra.milestones.filter(
      (m) => m.status === 'completed'
    );
    score += Math.min(completedMilestones.length * 10, 20);

    // Dharma alerts reduce score
    score -= Math.min(yatra.dharmaAlerts.length * 5, 20);

    // Sankalpa presence adds to score
    if (yatra.sankalpa) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }
}
