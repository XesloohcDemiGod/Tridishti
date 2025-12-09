/**
 * Yatra Manager Module
 *
 * Orchestrates coding sessions (Yatra - journey), manages lifecycle,
 * persists state, and emits events for other modules.
 * Maps to the Karma (action) pillar - organizing the coding journey.
 *
 * Features:
 * - Session lifecycle management (start/stop)
 * - Sankalpa (intention) reminders
 * - State persistence
 * - Event coordination
 */

import * as vscode from 'vscode';
import { IYatra, ICoreEvent, ISutraCheckpoint, IDharmaSankata } from './types';
import { SutraCheckpoints } from './sutra-checkpoints';
import { KarmaPhala } from './karma-phala';
import { DharmaSankata } from './dharma-sankata';

/**
 * Configuration for yatra manager
 */
export interface IYatraManagerConfig {
  enabled: boolean;
  autoStart: boolean;
  persistState: boolean;
  sankalpaReminderInterval?: number; // seconds
}

/**
 * Manages coding sessions (Yatra) and coordinates core modules
 */
export class YatraManager {
  private config: IYatraManagerConfig;
  private currentYatra?: IYatra;
  private eventEmitter: vscode.EventEmitter<ICoreEvent>;
  private sutraCheckpoints: SutraCheckpoints;
  private karmaPhala: KarmaPhala;
  private dharmaSankata: DharmaSankata;
  private sankalpaReminderId?: NodeJS.Timeout;
  private stateStorage: vscode.Memento;

  /**
   * Creates a new YatraManager instance
   * @param config Configuration for yatra management
   * @param eventEmitter Event emitter for core events
   * @param sutraCheckpoints Sutra checkpoints module
   * @param karmaPhala Karma phala module
   * @param dharmaSankata Dharma sankata module
   * @param stateStorage VS Code memento for state persistence
   */
  constructor(
    config: IYatraManagerConfig,
    eventEmitter: vscode.EventEmitter<ICoreEvent>,
    sutraCheckpoints: SutraCheckpoints,
    karmaPhala: KarmaPhala,
    dharmaSankata: DharmaSankata,
    stateStorage: vscode.Memento
  ) {
    this.config = config;
    this.eventEmitter = eventEmitter;
    this.sutraCheckpoints = sutraCheckpoints;
    this.karmaPhala = karmaPhala;
    this.dharmaSankata = dharmaSankata;
    this.stateStorage = stateStorage;

    // Subscribe to module events
    eventEmitter.event((event) => {
      this.handleCoreEvent(event);
    });
  }

  /**
   * Starts a new yatra (coding session)
   * @param sankalpa Optional intention/goal for the session
   * @returns The created yatra
   */
  public async startYatra(sankalpa?: string): Promise<IYatra> {
    if (this.currentYatra) {
      throw new Error('A yatra is already active');
    }

    const yatra: IYatra = {
      id: this.generateId(),
      sankalpa,
      startedAt: Date.now(),
      checkpoints: [],
      milestones: [],
      dharmaAlerts: [],
    };

    this.currentYatra = yatra;

    // Start core modules
    this.sutraCheckpoints.start();
    this.dharmaSankata.start();

    // Set goal in dharma sankata if sankalpa is provided
    if (sankalpa) {
      this.dharmaSankata.setGoal(sankalpa);
    }

    // Start sankalpa reminders if configured
    if (sankalpa && this.config.sankalpaReminderInterval) {
      this.startSankalpaReminders(sankalpa);
    }

    // Persist state if enabled
    if (this.config.persistState) {
      await this.persistState();
    }

    this.eventEmitter.fire({
      type: 'yatra_start',
      timestamp: Date.now(),
      data: yatra,
    });

    return yatra;
  }

  /**
   * Ends the current yatra
   * @returns The completed yatra
   */
  public async endYatra(): Promise<IYatra> {
    if (!this.currentYatra) {
      throw new Error('No active yatra to end');
    }

    const yatra = this.currentYatra;
    yatra.endedAt = Date.now();

    // Stop core modules
    this.sutraCheckpoints.stop();
    this.dharmaSankata.stop();
    this.stopSankalpaReminders();

    // Collect final state
    yatra.checkpoints = this.sutraCheckpoints.getCheckpoints();
    yatra.milestones = this.karmaPhala.getMilestones();
    yatra.dharmaAlerts = this.dharmaSankata.getAlerts();

    // Persist state if enabled
    if (this.config.persistState) {
      await this.persistState();
    }

    this.eventEmitter.fire({
      type: 'yatra_end',
      timestamp: Date.now(),
      data: yatra,
    });

    this.currentYatra = undefined;

    return yatra;
  }

  /**
   * Gets the current active yatra
   * @returns Current yatra or undefined
   */
  public getCurrentYatra(): IYatra | undefined {
    return this.currentYatra;
  }

  /**
   * Updates the sankalpa (intention) for the current yatra
   * @param sankalpa New intention/goal
   */
  public updateSankalpa(sankalpa: string): void {
    if (!this.currentYatra) {
      throw new Error('No active yatra to update');
    }

    this.currentYatra.sankalpa = sankalpa;
    this.dharmaSankata.setGoal(sankalpa);

    if (this.config.sankalpaReminderInterval) {
      this.stopSankalpaReminders();
      this.startSankalpaReminders(sankalpa);
    }
  }

  /**
   * Restores yatra state from storage
   */
  public async restoreState(): Promise<void> {
    if (!this.config.persistState) {
      return;
    }

    const savedYatra = this.stateStorage.get<IYatra>('currentYatra');
    if (savedYatra && !savedYatra.endedAt) {
      // Restore active yatra
      this.currentYatra = savedYatra;
      this.sutraCheckpoints.start();
      this.dharmaSankata.start();

      if (savedYatra.sankalpa) {
        this.dharmaSankata.setGoal(savedYatra.sankalpa);
        if (this.config.sankalpaReminderInterval) {
          this.startSankalpaReminders(savedYatra.sankalpa);
        }
      }
    }
  }

  /**
   * Handles core events from other modules
   * @param event Core event
   */
  private handleCoreEvent(event: ICoreEvent): void {
    if (!this.currentYatra) {
      return;
    }

    switch (event.type) {
      case 'checkpoint':
        this.currentYatra.checkpoints.push(event.data as ISutraCheckpoint);
        break;
      case 'milestone':
        // Milestones are already tracked in karma phala
        break;
      case 'dharma_alert':
        this.currentYatra.dharmaAlerts.push(event.data as IDharmaSankata);
        break;
    }

    // Persist state if enabled
    if (this.config.persistState) {
      this.persistState();
    }
  }

  /**
   * Starts sankalpa reminder interval
   * @param sankalpa Intention to remind about
   */
  private startSankalpaReminders(sankalpa: string): void {
    if (!this.config.sankalpaReminderInterval) {
      return;
    }

    this.sankalpaReminderId = setInterval(() => {
      vscode.window.showInformationMessage(
        `Sankalpa reminder: ${sankalpa}`,
        'Update Sankalpa',
        'Dismiss'
      ).then((selection) => {
        if (selection === 'Update Sankalpa' && this.currentYatra) {
          vscode.window.showInputBox({
            prompt: 'Update your Sankalpa (intention)',
            value: sankalpa,
          }).then((newSankalpa) => {
            if (newSankalpa) {
              this.updateSankalpa(newSankalpa);
            }
          });
        }
      });
    }, this.config.sankalpaReminderInterval * 1000);
  }

  /**
   * Stops sankalpa reminder interval
   */
  private stopSankalpaReminders(): void {
    if (this.sankalpaReminderId) {
      clearInterval(this.sankalpaReminderId);
      this.sankalpaReminderId = undefined;
    }
  }

  /**
   * Persists current state to storage
   */
  private async persistState(): Promise<void> {
    if (this.currentYatra) {
      await this.stateStorage.update('currentYatra', this.currentYatra);
    }
  }

  /**
   * Generates a unique ID for yatras
   * @returns Unique ID string
   */
  private generateId(): string {
    return `yatra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
