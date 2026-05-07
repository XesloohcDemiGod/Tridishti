/**
 * File Watcher Module
 *
 * Provides real-time file change detection during coding sessions.
 * Tracks file modifications, additions, and deletions to support
 * Dharma Sankata (scope drift detection) and Sutra Checkpoints.
 *
 * Features:
 * - Real-time file watching
 * - Change event aggregation
 * - Threshold-based notifications
 * - Git-aware filtering
 */

import * as vscode from 'vscode';

/**
 * File change event
 */
export interface IFileChangeEvent {
  type: 'created' | 'modified' | 'deleted';
  uri: vscode.Uri;
  timestamp: number;
}

/**
 * File watcher configuration
 */
export interface IFileWatcherConfig {
  enabled: boolean;
  excludePatterns: string[];
  debounceMs: number;
  maxTrackedFiles: number;
}

/**
 * File watcher statistics
 */
export interface IFileWatcherStats {
  totalChanges: number;
  createdFiles: number;
  modifiedFiles: number;
  deletedFiles: number;
  trackedFiles: Set<string>;
}

/**
 * Manages file watching during coding sessions
 */
export class FileWatcher {
  private config: IFileWatcherConfig;
  private watcher?: vscode.FileSystemWatcher;
  private changes: IFileChangeEvent[] = [];
  private stats: IFileWatcherStats = {
    totalChanges: 0,
    createdFiles: 0,
    modifiedFiles: 0,
    deletedFiles: 0,
    trackedFiles: new Set<string>(),
  };
  private debounceTimer?: NodeJS.Timeout;
  private changeCallback?: (changes: IFileChangeEvent[]) => void;

  /**
   * Creates a new FileWatcher instance
   * @param config Configuration for file watcher
   */
  constructor(config: IFileWatcherConfig) {
    this.config = config;
  }

  /**
   * Starts watching for file changes
   * @param callback Optional callback for change events
   */
  public start(callback?: (changes: IFileChangeEvent[]) => void): void {
    if (!this.config.enabled) {
      return;
    }

    this.changeCallback = callback;

    // Create file system watcher
    // Watch all files except those matching exclude patterns
    const pattern = '**/*';
    this.watcher = vscode.workspace.createFileSystemWatcher(pattern);

    // Register event handlers
    this.watcher.onDidCreate(uri => this.handleFileChange('created', uri));
    this.watcher.onDidChange(uri => this.handleFileChange('modified', uri));
    this.watcher.onDidDelete(uri => this.handleFileChange('deleted', uri));
  }

  /**
   * Stops watching for file changes
   */
  public stop(): void {
    if (this.watcher) {
      this.watcher.dispose();
      this.watcher = undefined;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }
  }

  /**
   * Gets current file watcher statistics
   * @returns File watcher statistics
   */
  public getStats(): IFileWatcherStats {
    return {
      ...this.stats,
      trackedFiles: new Set(this.stats.trackedFiles),
    };
  }

  /**
   * Gets all recorded file changes
   * @returns Array of file change events
   */
  public getChanges(): IFileChangeEvent[] {
    return [...this.changes];
  }

  /**
   * Gets changes since a specific timestamp
   * @param since Timestamp to filter from
   * @returns Array of file change events since timestamp
   */
  public getChangesSince(since: number): IFileChangeEvent[] {
    return this.changes.filter(change => change.timestamp >= since);
  }

  /**
   * Clears all recorded changes
   */
  public clearChanges(): void {
    this.changes = [];
    this.stats = {
      totalChanges: 0,
      createdFiles: 0,
      modifiedFiles: 0,
      deletedFiles: 0,
      trackedFiles: new Set<string>(),
    };
  }

  /**
   * Updates configuration
   * @param config New configuration
   */
  public updateConfig(config: Partial<IFileWatcherConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart watcher if enabled state changed
    if (config.enabled !== undefined) {
      this.stop();
      if (config.enabled) {
        this.start(this.changeCallback);
      }
    }
  }

  /**
   * Handles a file change event
   * @param type Type of change
   * @param uri URI of changed file
   */
  private handleFileChange(type: 'created' | 'modified' | 'deleted', uri: vscode.Uri): void {
    // Check if file should be excluded
    if (this.shouldExclude(uri)) {
      return;
    }

    const event: IFileChangeEvent = {
      type,
      uri,
      timestamp: Date.now(),
    };

    // Add to changes
    this.changes.push(event);

    // Update statistics
    this.stats.totalChanges++;
    this.stats.trackedFiles.add(uri.fsPath);

    switch (type) {
      case 'created':
        this.stats.createdFiles++;
        break;
      case 'modified':
        this.stats.modifiedFiles++;
        break;
      case 'deleted':
        this.stats.deletedFiles++;
        this.stats.trackedFiles.delete(uri.fsPath);
        break;
    }

    // Enforce max tracked files limit
    if (this.changes.length > this.config.maxTrackedFiles) {
      this.changes.shift();
    }

    // Debounce callback notifications
    if (this.changeCallback) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        if (this.changeCallback) {
          this.changeCallback([event]);
        }
      }, this.config.debounceMs);
    }
  }

  /**
   * Checks if a file should be excluded from tracking
   * @param uri URI to check
   * @returns True if file should be excluded
   */
  private shouldExclude(uri: vscode.Uri): boolean {
    const path = uri.fsPath;

    // Check against exclude patterns
    for (const pattern of this.config.excludePatterns) {
      if (path.includes(pattern)) {
        return true;
      }
    }

    // Exclude common build artifacts and dependencies
    const autoExcludePatterns = [
      'node_modules',
      'out',
      'dist',
      'build',
      '.git',
      '__coverage__',
      '.vscode',
      '.vsix',
    ];

    for (const pattern of autoExcludePatterns) {
      if (path.includes(pattern)) {
        return true;
      }
    }

    return false;
  }
}
