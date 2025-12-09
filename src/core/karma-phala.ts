/**
 * Karma Phala Module
 *
 * Represents the fruits of action - tracking milestones and scoring outcomes.
 * Maps to the Karma (action) pillar - measuring the results of sustained effort.
 *
 * Features:
 * - Milestone tracking with duration thresholds
 * - Scoring system for action outcomes
 * - Git tag integration for milestones
 * - Milestone completion nudges
 */

import * as vscode from 'vscode';
import { ICoreEvent, IKarmaPhala, IMilestone } from './types';

/**
 * Configuration for karma phala milestones
 */
export interface IKarmaPhalaConfig {
  milestoneThreshold: number; // seconds
  autoTag: boolean;
  enabled: boolean;
  nudgeStrategy: 'default' | 'deep-work' | 'exploration' | 'maintenance';
}

/**
 * Manages milestones and action outcomes (Karma Phala)
 */
export class KarmaPhala {
  private config: IKarmaPhalaConfig;
  private milestones: Map<string, IMilestone> = new Map();
  private karmaPhala: IKarmaPhala[] = [];
  private eventEmitter: vscode.EventEmitter<ICoreEvent>;
  private activeMilestone?: IMilestone;
  private milestoneStartTime?: number;

  /**
   * Creates a new KarmaPhala instance
   * @param config Configuration for milestone behavior
   * @param eventEmitter Event emitter for core events
   */
  constructor(config: IKarmaPhalaConfig, eventEmitter: vscode.EventEmitter<ICoreEvent>) {
    this.config = config;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Creates a new milestone
   * @param name Name of the milestone
   * @param targetDuration Optional target duration in seconds
   * @returns The created milestone
   */
  public createMilestone(name: string, targetDuration?: number): IMilestone {
    const milestone: IMilestone = {
      id: this.generateId(),
      name,
      createdAt: Date.now(),
      targetDuration,
      status: 'active',
    };

    this.milestones.set(milestone.id, milestone);
    this.activeMilestone = milestone;
    this.milestoneStartTime = Date.now();

    // Fire event for milestone creation
    this.eventEmitter.fire({
      type: 'milestone_created',
      timestamp: Date.now(),
      data: milestone,
    });

    return milestone;
  }

  /**
   * Completes the current active milestone
   * @param filesModified Array of file paths that were modified
   * @returns The karma phala outcome
   */
  public async completeMilestone(filesModified: string[]): Promise<IKarmaPhala> {
    if (!this.activeMilestone || !this.milestoneStartTime) {
      throw new Error('No active milestone to complete');
    }

    const duration = Math.floor((Date.now() - this.milestoneStartTime) / 1000);
    const score = this.calculateScore(duration, filesModified.length);

    const milestone = this.activeMilestone;
    milestone.status = 'completed';
    milestone.completedAt = Date.now();
    this.milestones.set(milestone.id, milestone);

    const karmaPhala: IKarmaPhala = {
      id: this.generateId(),
      milestoneId: milestone.id,
      timestamp: Date.now(),
      score,
      duration,
      filesModified,
    };

    if (this.config.autoTag) {
      karmaPhala.gitTag = await this.createGitTag(milestone.name, score);
    }

    this.karmaPhala.push(karmaPhala);
    this.activeMilestone = undefined;
    this.milestoneStartTime = undefined;

    this.eventEmitter.fire({
      type: 'milestone',
      timestamp: Date.now(),
      data: karmaPhala,
    });

    return karmaPhala;
  }

  /**
   * Abandons the current active milestone
   */
  public abandonMilestone(): void {
    if (!this.activeMilestone) {
      return;
    }

    const milestone = this.activeMilestone;
    milestone.status = 'abandoned';
    this.milestones.set(milestone.id, milestone);
    this.activeMilestone = undefined;
    this.milestoneStartTime = undefined;
  }

  /**
   * Gets the active milestone
   * @returns Active milestone or undefined
   */
  public getActiveMilestone(): IMilestone | undefined {
    return this.activeMilestone;
  }

  /**
   * Gets all milestones
   * @returns Array of milestones
   */
  public getMilestones(): IMilestone[] {
    return Array.from(this.milestones.values());
  }

  /**
   * Gets all karma phala outcomes
   * @returns Array of karma phala outcomes
   */
  public getKarmaPhala(): IKarmaPhala[] {
    return [...this.karmaPhala];
  }

  /**
   * Checks if a milestone should be created based on duration
   * @param currentDuration Current session duration in seconds
   * @returns True if milestone threshold is reached
   */
  public shouldCreateMilestone(currentDuration: number): boolean {
    return (
      this.config.enabled &&
      currentDuration >= this.config.milestoneThreshold &&
      !this.activeMilestone
    );
  }

  /**
   * Gets a nudge message based on the configured strategy
   * @returns Nudge message string
   */
  public getNudgeMessage(): string {
    const messages: Record<string, string> = {
      default:
        "You've been coding for a while. Consider creating a milestone to track your progress.",
      'deep-work':
        'Deep work session detected. Capture this milestone to preserve your flow state insights.',
      exploration:
        'Exploration phase detected. Mark this milestone to track your learning journey.',
      maintenance:
        'Maintenance work detected. Create a milestone to document the improvements made.',
    };

    return messages[this.config.nudgeStrategy] || messages.default;
  }

  /**
   * Updates the configuration
   * @param config New configuration
   */
  public updateConfig(config: Partial<IKarmaPhalaConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Calculates a score based on duration and file changes
   * @param duration Duration in seconds
   * @param filesCount Number of files modified
   * @returns Score value
   */
  private calculateScore(duration: number, filesCount: number): number {
    const durationScore = Math.min(duration / 60, 100); // Max 100 for duration
    const filesScore = Math.min(filesCount * 10, 100); // Max 100 for files
    return Math.round((durationScore + filesScore) / 2);
  }

  /**
   * Creates a git tag for the milestone
   * @param name Milestone name
   * @param score Milestone score
   * @returns Git tag name or undefined
   */
  private async createGitTag(name: string, score: number): Promise<string | undefined> {
    try {
      const { execSync } = await import('child_process');
      const tagName = `milestone-${name.toLowerCase().replace(/\s+/g, '-')}-${score}`;
      execSync(`git tag -a "${tagName}" -m "Milestone: ${name} (Score: ${score})"`, {
        encoding: 'utf-8',
      });
      return tagName;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Generates a unique ID
   * @returns Unique ID string
   */
  private generateId(): string {
    return `karma-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
