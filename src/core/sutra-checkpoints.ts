/**
 * Sutra Checkpoints Module
 *
 * Represents periodic reflection threads (Sutra) in the coding workflow.
 * Maps to the Karma (action) pillar - tracking work milestones and checkpoints.
 */

import * as vscode from 'vscode';
import { ISutraCheckpoint, ICoreEvent } from './types';

/**
 * Configuration for sutra checkpoints
 */
export interface ISutraCheckpointConfig {
  interval: number; // seconds
  autoCommit: boolean;
  enabled: boolean;
}

/**
 * Manages periodic checkpoints in the coding workflow
 */
export class SutraCheckpoints {
  private config: ISutraCheckpointConfig;
  private intervalId?: NodeJS.Timeout;
  private checkpoints: ISutraCheckpoint[] = [];
  private eventEmitter: vscode.EventEmitter<ICoreEvent>;

  /**
   * Creates a new SutraCheckpoints instance
   */
  constructor(config: ISutraCheckpointConfig, eventEmitter: vscode.EventEmitter<ICoreEvent>) {
    this.config = config;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Starts the checkpoint interval timer
   */
  public start(): void {
    if (!this.config.enabled || this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.createCheckpoint();
    }, this.config.interval * 1000);
  }

  /**
   * Stops the checkpoint interval timer
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Creates a new checkpoint manually
   */
  public async createCheckpoint(message?: string): Promise<ISutraCheckpoint> {
    const filesChanged = await this.getChangedFiles();
    const checkpoint: ISutraCheckpoint = {
      id: this.generateId(),
      timestamp: Date.now(),
      message,
      filesChanged,
    };

    if (this.config.autoCommit) {
      checkpoint.gitCommitHash = await this.createGitCommit(message || 'Sutra checkpoint');
    }

    this.checkpoints.push(checkpoint);

    this.eventEmitter.fire({
      type: 'checkpoint',
      timestamp: Date.now(),
      data: checkpoint,
    });

    return checkpoint;
  }

  /**
   * Gets all checkpoints
   */
  public getCheckpoints(): ISutraCheckpoint[] {
    return [...this.checkpoints];
  }

  /**
   * Gets the latest checkpoint
   */
  public getLatestCheckpoint(): ISutraCheckpoint | undefined {
    return this.checkpoints.length > 0
      ? this.checkpoints[this.checkpoints.length - 1]
      : undefined;
  }

  /**
   * Updates the configuration
   */
  public updateConfig(config: Partial<ISutraCheckpointConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.enabled && !this.intervalId) {
      this.start();
    } else if (!this.config.enabled && this.intervalId) {
      this.stop();
    }
  }

  /**
   * Gets list of changed files from the workspace
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
   * Creates a git commit if auto-commit is enabled
   */
  private async createGitCommit(message: string): Promise<string | undefined> {
    try {
      const { execSync } = await import('child_process');
      const result = execSync(`git commit -am "${message}"`, { encoding: 'utf-8' });
      const match = result.match(/\[([a-f0-9]+)\]/);
      return match ? match[1] : undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Generates a unique ID for checkpoints
   */
  private generateId(): string {
    return `sutra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
