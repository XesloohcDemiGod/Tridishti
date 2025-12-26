/**
 * Smart Nudge System
 *
 * Provides context-aware reminders and notifications during coding sessions.
 * Adapts to user behavior and workflow patterns to provide timely guidance.
 *
 * Features:
 * - Context-aware nudges
 * - Configurable nudge strategies
 * - Smart timing based on activity
 * - Integration with Yatra sessions
 */

import * as vscode from 'vscode';

/**
 * Nudge types
 */
export type NudgeType =
  | 'checkpoint_reminder'
  | 'scope_drift_warning'
  | 'milestone_suggestion'
  | 'reflection_prompt'
  | 'break_reminder'
  | 'sankalpa_reminder';

/**
 * Nudge priority levels
 */
export type NudgePriority = 'low' | 'medium' | 'high';

/**
 * Nudge configuration
 */
export interface INudgeConfig {
  enabled: boolean;
  strategy: 'default' | 'deep-work' | 'exploration' | 'maintenance';
  checkpointIntervalMs: number;
  scopeCheckIntervalMs: number;
  breakReminderMs: number;
  sankalpaReminderMs: number;
  quietHours?: {
    start: number; // Hour in 24h format
    end: number;
  };
}

/**
 * Nudge event
 */
export interface INudgeEvent {
  type: NudgeType;
  priority: NudgePriority;
  message: string;
  action?: {
    label: string;
    command: string;
  };
  timestamp: number;
}

/**
 * Nudge statistics
 */
export interface INudgeStats {
  totalNudges: number;
  nudgesByType: Record<NudgeType, number>;
  dismissedNudges: number;
  actionedNudges: number;
}

/**
 * Manages smart nudges and reminders
 */
export class SmartNudgeSystem {
  private config: INudgeConfig;
  private timers: Map<NudgeType, NodeJS.Timeout> = new Map();
  private lastNudge?: INudgeEvent;
  private stats: INudgeStats = {
    totalNudges: 0,
    nudgesByType: {
      checkpoint_reminder: 0,
      scope_drift_warning: 0,
      milestone_suggestion: 0,
      reflection_prompt: 0,
      break_reminder: 0,
      sankalpa_reminder: 0,
    },
    dismissedNudges: 0,
    actionedNudges: 0,
  };
  private sessionStartTime?: number;

  /**
   * Creates a new SmartNudgeSystem instance
   * @param config Configuration for nudge system
   */
  constructor(config: INudgeConfig) {
    this.config = config;
  }

  /**
   * Starts the nudge system
   * @param sessionStartTime Optional session start time
   */
  public start(sessionStartTime?: number): void {
    if (!this.config.enabled) {
      return;
    }

    this.sessionStartTime = sessionStartTime || Date.now();

    // Set up periodic nudges based on strategy
    this.setupNudgeTimers();
  }

  /**
   * Stops the nudge system
   */
  public stop(): void {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  /**
   * Triggers a nudge immediately
   * @param type Type of nudge
   * @param customMessage Optional custom message
   * @returns The nudge event
   */
  public triggerNudge(type: NudgeType, customMessage?: string): INudgeEvent | undefined {
    if (!this.config.enabled) {
      return undefined;
    }

    // Check if in quiet hours
    if (this.isQuietHours()) {
      return undefined;
    }

    const nudge = this.createNudge(type, customMessage);
    this.lastNudge = nudge;
    this.stats.totalNudges++;
    this.stats.nudgesByType[type]++;

    // Show nudge to user
    this.showNudge(nudge);

    return nudge;
  }

  /**
   * Records a nudge dismissal
   */
  public recordDismissal(): void {
    this.stats.dismissedNudges++;
  }

  /**
   * Records a nudge action
   */
  public recordAction(): void {
    this.stats.actionedNudges++;
  }

  /**
   * Gets nudge statistics
   * @returns Nudge statistics
   */
  public getStats(): INudgeStats {
    return { ...this.stats, nudgesByType: { ...this.stats.nudgesByType } };
  }

  /**
   * Gets the last nudge
   * @returns Last nudge event or undefined
   */
  public getLastNudge(): INudgeEvent | undefined {
    return this.lastNudge;
  }

  /**
   * Updates configuration
   * @param config New configuration
   */
  public updateConfig(config: Partial<INudgeConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart if enabled state changed
    if (config.enabled !== undefined) {
      this.stop();
      if (config.enabled) {
        this.start(this.sessionStartTime);
      }
    }

    // Update timers if intervals changed
    if (
      config.checkpointIntervalMs ||
      config.scopeCheckIntervalMs ||
      config.breakReminderMs ||
      config.sankalpaReminderMs
    ) {
      this.stop();
      this.start(this.sessionStartTime);
    }
  }

  /**
   * Sets up periodic nudge timers based on strategy
   */
  private setupNudgeTimers(): void {
    // Clear existing timers
    this.stop();

    const strategy = this.config.strategy;

    // Checkpoint reminders
    if (strategy === 'default' || strategy === 'maintenance') {
      const timer = setInterval(() => {
        this.triggerNudge('checkpoint_reminder');
      }, this.config.checkpointIntervalMs);
      this.timers.set('checkpoint_reminder', timer as unknown as NodeJS.Timeout);
    }

    // Scope check reminders
    if (strategy === 'default' || strategy === 'deep-work') {
      const timer = setInterval(() => {
        this.triggerNudge('scope_drift_warning');
      }, this.config.scopeCheckIntervalMs);
      this.timers.set('scope_drift_warning', timer as unknown as NodeJS.Timeout);
    }

    // Break reminders (all strategies except deep-work)
    if (strategy !== 'deep-work') {
      const timer = setInterval(() => {
        this.triggerNudge('break_reminder');
      }, this.config.breakReminderMs);
      this.timers.set('break_reminder', timer as unknown as NodeJS.Timeout);
    }

    // Sankalpa reminders
    const sankalpaTimer = setInterval(() => {
      this.triggerNudge('sankalpa_reminder');
    }, this.config.sankalpaReminderMs);
    this.timers.set('sankalpa_reminder', sankalpaTimer as unknown as NodeJS.Timeout);
  }

  /**
   * Creates a nudge event
   * @param type Type of nudge
   * @param customMessage Optional custom message
   * @returns Nudge event
   */
  private createNudge(type: NudgeType, customMessage?: string): INudgeEvent {
    const messages: Record<NudgeType, string> = {
      checkpoint_reminder: 'Time for a Sutra checkpoint! Save your progress.',
      scope_drift_warning: 'Check your Dharma alignment. Are you still on track with your Sankalpa?',
      milestone_suggestion: 'Consider creating a Karma Phala milestone for your achievement!',
      reflection_prompt: 'Take a moment for Atma Vichara. Reflect on your progress.',
      break_reminder: 'Time for a mindful break. Step away and refresh.',
      sankalpa_reminder: 'Remember your Sankalpa (intention) for this session.',
    };

    const priorities: Record<NudgeType, NudgePriority> = {
      checkpoint_reminder: 'low',
      scope_drift_warning: 'high',
      milestone_suggestion: 'medium',
      reflection_prompt: 'medium',
      break_reminder: 'low',
      sankalpa_reminder: 'medium',
    };

    const actions: Record<NudgeType, { label: string; command: string } | undefined> = {
      checkpoint_reminder: { label: 'Create Checkpoint', command: 'tridishti.createSutra' },
      scope_drift_warning: { label: 'Check Dharma', command: 'tridishti.checkDharma' },
      milestone_suggestion: { label: 'Create Milestone', command: 'tridishti.createKarmaPhala' },
      reflection_prompt: { label: 'Reflect', command: 'tridishti.atmaVichara' },
      break_reminder: undefined,
      sankalpa_reminder: { label: 'View Yatra', command: 'tridishti.showYatra' },
    };

    return {
      type,
      priority: priorities[type],
      message: customMessage || messages[type],
      action: actions[type],
      timestamp: Date.now(),
    };
  }

  /**
   * Shows a nudge to the user
   * @param nudge Nudge event to show
   */
  private showNudge(nudge: INudgeEvent): void {
    const message = `🕉️ ${nudge.message}`;

    if (nudge.action) {
      // Show notification with action button
      switch (nudge.priority) {
        case 'high':
          vscode.window
            .showWarningMessage(message, nudge.action.label, 'Dismiss')
            .then(selection => {
              if (selection === nudge.action!.label) {
                this.recordAction();
                vscode.commands.executeCommand(nudge.action!.command);
              } else if (selection === 'Dismiss') {
                this.recordDismissal();
              }
            });
          break;
        case 'medium':
        case 'low':
          vscode.window
            .showInformationMessage(message, nudge.action.label, 'Dismiss')
            .then(selection => {
              if (selection === nudge.action!.label) {
                this.recordAction();
                vscode.commands.executeCommand(nudge.action!.command);
              } else if (selection === 'Dismiss') {
                this.recordDismissal();
              }
            });
          break;
      }
    } else {
      // Simple notification without action
      vscode.window.showInformationMessage(message);
      this.recordDismissal();
    }
  }

  /**
   * Checks if current time is in quiet hours
   * @returns True if in quiet hours
   */
  private isQuietHours(): boolean {
    if (!this.config.quietHours) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const { start, end } = this.config.quietHours;

    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      // Handle overnight quiet hours (e.g., 22:00 to 08:00)
      return currentHour >= start || currentHour < end;
    }
  }
}
