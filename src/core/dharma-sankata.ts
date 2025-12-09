/**
 * Dharma Sankata Module
 *
 * Represents crisis of purpose - detecting scope drift and goal misalignment.
 * Maps to the Bhakti (reflection) pillar - maintaining alignment with intention.
 *
 * Features:
 * - File change threshold detection
 * - Goal alignment checking
 * - Time anomaly detection
 * - Scope drift alerts with suggestions
 */

import * as vscode from 'vscode';
import { IDharmaSankata, ICoreEvent } from './types';

/**
 * Configuration for dharma sankata detection
 */
export interface IDharmaSankataConfig {
  scopeCheckInterval: number; // seconds
  fileChangeThreshold: number;
  enabled: boolean;
  currentGoal?: string;
}

/**
 * Manages scope drift detection (Dharma Sankata)
 */
export class DharmaSankata {
  private config: IDharmaSankataConfig;
  private intervalId?: NodeJS.Timeout;
  private alerts: IDharmaSankata[] = [];
  private eventEmitter: vscode.EventEmitter<ICoreEvent>;
  private fileChangeHistory: Map<string, number> = new Map();

  /**
   * Creates a new DharmaSankata instance
   * @param config Configuration for scope drift detection
   * @param eventEmitter Event emitter for core events
   */
  constructor(config: IDharmaSankataConfig, eventEmitter: vscode.EventEmitter<ICoreEvent>) {
    this.config = config;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Starts the scope check interval timer
   */
  public start(): void {
    if (!this.config.enabled || this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.checkScope();
    }, this.config.scopeCheckInterval * 1000);
  }

  /**
   * Stops the scope check interval timer
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Checks for scope drift and creates alerts if detected
   * @returns Dharma sankata detection result
   */
  public async checkScope(): Promise<IDharmaSankata> {
    const filesChanged = await this.getChangedFiles();
    const filesCount = filesChanged.length;

    const sankata: IDharmaSankata = {
      detected: false,
      timestamp: Date.now(),
      reason: 'file_threshold',
      details: {
        filesChanged: filesCount,
        threshold: this.config.fileChangeThreshold,
        currentGoal: this.config.currentGoal,
      },
    };

    // Check file threshold
    if (filesCount > this.config.fileChangeThreshold) {
      sankata.detected = true;
      sankata.reason = 'file_threshold';
      sankata.suggestion = `You've modified ${filesCount} files, which exceeds the threshold of ${this.config.fileChangeThreshold}. Consider breaking this into smaller, focused changes.`;
    }

    // Check for goal mismatch (if goal is set)
    if (this.config.currentGoal && this.detectGoalMismatch(filesChanged)) {
      sankata.detected = true;
      sankata.reason = 'goal_mismatch';
      sankata.details.detectedGoal = this.inferGoalFromFiles(filesChanged);
      sankata.suggestion = `Your current work seems to diverge from your stated goal: "${this.config.currentGoal}". Consider realigning or updating your goal.`;
    }

    // Check for time anomaly (rapid file changes)
    if (this.detectTimeAnomaly(filesChanged)) {
      sankata.detected = true;
      sankata.reason = 'time_anomaly';
      sankata.suggestion = 'Rapid file changes detected. This might indicate context switching or scope creep. Consider taking a moment to refocus.';
    }

    if (sankata.detected) {
      this.alerts.push(sankata);
      this.eventEmitter.fire({
        type: 'dharma_alert',
        timestamp: Date.now(),
        data: sankata,
      });
    }

    return sankata;
  }

  /**
   * Sets the current goal for alignment checking
   * @param goal Goal description
   */
  public setGoal(goal: string): void {
    this.config.currentGoal = goal;
  }

  /**
   * Gets all dharma alerts
   * @returns Array of dharma sankata alerts
   */
  public getAlerts(): IDharmaSankata[] {
    return [...this.alerts];
  }

  /**
   * Gets the latest alert
   * @returns Latest alert or undefined
   */
  public getLatestAlert(): IDharmaSankata | undefined {
    return this.alerts.length > 0 ? this.alerts[this.alerts.length - 1] : undefined;
  }

  /**
   * Updates the configuration
   * @param config New configuration
   */
  public updateConfig(config: Partial<IDharmaSankataConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.enabled && !this.intervalId) {
      this.start();
    } else if (!this.config.enabled && this.intervalId) {
      this.stop();
    }
  }

  /**
   * Gets list of changed files from the workspace
   * @returns Array of file paths
   */
  private async getChangedFiles(): Promise<string[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return [];
    }

    const files: string[] = [];
    const textDocuments = vscode.workspace.textDocuments.filter(
      (doc) => doc.isDirty
    );

    for (const doc of textDocuments) {
      if (doc.uri.scheme === 'file') {
        files.push(doc.uri.fsPath);
      }
    }

    return files;
  }

  /**
   * Detects if current files indicate a goal mismatch
   * @param files Array of file paths
   * @returns True if goal mismatch is detected
   */
  private detectGoalMismatch(files: string[]): boolean {
    if (!this.config.currentGoal) {
      return false;
    }

    // Simple heuristic: check if file paths contain keywords that don't match the goal
    const goalKeywords = this.config.currentGoal.toLowerCase().split(/\s+/);
    const mismatchedFiles = files.filter((file) => {
      const fileName = file.toLowerCase();
      return !goalKeywords.some((keyword) => fileName.includes(keyword));
    });

    // If more than 50% of files don't match goal keywords, consider it a mismatch
    return mismatchedFiles.length > files.length * 0.5;
  }

  /**
   * Infers a goal from file paths
   * @param files Array of file paths
   * @returns Inferred goal string
   */
  private inferGoalFromFiles(files: string[]): string {
    const commonPaths = files.map((f) => {
      const parts = f.split(/[/\\]/);
      return parts[parts.length - 2] || parts[parts.length - 1] || '';
    });

    const pathCounts = new Map<string, number>();
    for (const path of commonPaths) {
      pathCounts.set(path, (pathCounts.get(path) || 0) + 1);
    }

    const sorted = Array.from(pathCounts.entries()).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'unknown';
  }

  /**
   * Detects time anomalies (rapid file changes)
   * @param files Array of file paths
   * @returns True if time anomaly is detected
   */
  private detectTimeAnomaly(files: string[]): boolean {
    const now = Date.now();
    const recentChanges = files.filter((file) => {
      const lastChange = this.fileChangeHistory.get(file);
      return lastChange && now - lastChange < 5000; // Changed within last 5 seconds
    });

    // Update history
    for (const file of files) {
      this.fileChangeHistory.set(file, now);
    }

    // If more than 5 files changed rapidly, it's an anomaly
    return recentChanges.length > 5;
  }
}
