/**
 * Status Bar Integration
 *
 * Displays current yatra status and quick actions in VS Code status bar.
 * Provides at-a-glance information about the coding session.
 *
 * Features:
 * - Current yatra status display
 * - Session duration tracking
 * - Checkpoint count
 * - Quick actions on click
 */

import * as vscode from 'vscode';
import { IYatra } from './types';

/**
 * Status bar item configuration
 */
export interface IStatusBarConfig {
  enabled: boolean;
  showDuration: boolean;
  showCheckpoints: boolean;
  updateIntervalMs: number;
}

/**
 * Manages status bar integration
 */
export class StatusBarIntegration {
  private config: IStatusBarConfig;
  private statusBarItem?: vscode.StatusBarItem;
  private updateTimer?: ReturnType<typeof setInterval>;
  private currentYatra?: IYatra;

  /**
   * Creates a new StatusBarIntegration instance
   * @param config Configuration for status bar
   */
  constructor(config: IStatusBarConfig) {
    this.config = config;
  }

  /**
   * Initializes the status bar item
   */
  public initialize(): void {
    if (!this.config.enabled) {
      return;
    }

    // Create status bar item
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );

    // Set initial state
    this.updateStatusBar();

    // Show the status bar item
    this.statusBarItem.show();

    // Set up periodic updates
    this.startUpdateTimer();
  }

  /**
   * Updates current yatra
   * @param yatra Current yatra
   */
  public updateYatra(yatra?: IYatra): void {
    this.currentYatra = yatra;
    this.updateStatusBar();
  }

  /**
   * Updates configuration
   * @param config New configuration
   */
  public updateConfig(config: Partial<IStatusBarConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.enabled !== undefined) {
      if (config.enabled) {
        this.initialize();
      } else {
        this.dispose();
      }
    } else {
      this.updateStatusBar();
    }
  }

  /**
   * Disposes the status bar item
   */
  public dispose(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }

    if (this.statusBarItem) {
      this.statusBarItem.dispose();
      this.statusBarItem = undefined;
    }
  }

  /**
   * Updates the status bar display
   */
  private updateStatusBar(): void {
    if (!this.statusBarItem) {
      return;
    }

    if (!this.currentYatra) {
      // No active yatra
      this.statusBarItem.text = '$(circle-slash) No Yatra';
      this.statusBarItem.tooltip = 'Click to start a new Yatra session';
      this.statusBarItem.command = 'tridishti.startYatra';
      this.statusBarItem.backgroundColor = undefined;
      return;
    }

    // Build status text
    const parts: string[] = ['$(symbol-misc) Yatra'];

    // Add sankalpa if available
    if (this.currentYatra.sankalpa) {
      parts.push(`: ${this.currentYatra.sankalpa.substring(0, 20)}${this.currentYatra.sankalpa.length > 20 ? '...' : ''}`);
    }

    // Add duration if enabled
    if (this.config.showDuration) {
      const duration = this.formatDuration(Date.now() - this.currentYatra.startedAt);
      parts.push(`$(clock) ${duration}`);
    }

    // Add checkpoint count if enabled
    if (this.config.showCheckpoints) {
      parts.push(`$(bookmark) ${this.currentYatra.checkpoints.length}`);
    }

    this.statusBarItem.text = parts.join(' ');

    // Build tooltip
    const tooltipLines: string[] = [
      `**Active Yatra**`,
      `Sankalpa: ${this.currentYatra.sankalpa || 'Not set'}`,
      `Duration: ${this.formatDuration(Date.now() - this.currentYatra.startedAt)}`,
      `Checkpoints: ${this.currentYatra.checkpoints.length}`,
      `Milestones: ${this.currentYatra.milestones.length}`,
    ];

    if (this.currentYatra.dharmaAlerts.length > 0) {
      tooltipLines.push(`⚠️ Dharma Alerts: ${this.currentYatra.dharmaAlerts.length}`);
    }

    tooltipLines.push('', 'Click to view details');

    this.statusBarItem.tooltip = new vscode.MarkdownString(tooltipLines.join('\n\n'));
    this.statusBarItem.command = 'tridishti.showYatra';

    // Set background color based on dharma alerts
    if (this.currentYatra.dharmaAlerts.length > 0) {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor(
        'statusBarItem.warningBackground'
      );
    } else {
      this.statusBarItem.backgroundColor = undefined;
    }
  }

  /**
   * Formats duration in minutes and hours
   * @param ms Duration in milliseconds
   * @returns Formatted duration string
   */
  private formatDuration(ms: number): string {
    const totalMinutes = Math.floor(ms / 60000);

    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  /**
   * Starts periodic status bar updates
   */
  private startUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(() => {
      this.updateStatusBar();
    }, this.config.updateIntervalMs);
  }
}
