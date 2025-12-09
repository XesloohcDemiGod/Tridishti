/**
 * Drishti Dashboard Module
 *
 * Aggregates events from core modules and exposes telemetry/health endpoints.
 * Prepares data for the extension UI.
 * Maps to the Bhakti (reflection) pillar - vision into coding rhythms.
 *
 * Features:
 * - Event aggregation
 * - Telemetry endpoints
 * - Health monitoring
 * - Dashboard data preparation
 */

import { ICoreEvent, IYatra } from '../core/types';
import { IJnana } from '../learning/types';
import { IReflectionResult } from '../reflection/atma-vichara';

/**
 * Dashboard metrics
 */
export interface IDashboardMetrics {
  totalYatras: number;
  activeYatra?: IYatra;
  totalCheckpoints: number;
  totalMilestones: number;
  totalDharmaAlerts: number;
  totalJnana: number;
  averageSessionDuration: number;
  productivityScore: number;
  recentActivity: ICoreEvent[];
}

/**
 * Telemetry data point
 */
export interface ITelemetryData {
  timestamp: number;
  eventType: string;
  data: unknown;
}

/**
 * Health status
 */
export interface IHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  modules: {
    sutraCheckpoints: boolean;
    karmaPhala: boolean;
    dharmaSankata: boolean;
    yatraManager: boolean;
    jnanaCapture: boolean;
    smritiRecall: boolean;
    atmaVichara: boolean;
  };
  lastEventTime?: number;
}

/**
 * Configuration for drishti dashboard
 */
export interface IDrishtiDashboardConfig {
  enabled: boolean;
  maxEvents: number;
  telemetryEnabled: boolean;
}

/**
 * Manages analytics and dashboard (Drishti)
 */
export class DrishtiDashboard {
  private config: IDrishtiDashboardConfig;
  private events: ICoreEvent[] = [];
  private yatras: IYatra[] = [];
  private activeYatra?: IYatra;
  private jnana: IJnana[] = [];
  private reflections: IReflectionResult[] = [];
  private telemetry: ITelemetryData[] = [];

  /**
   * Creates a new DrishtiDashboard instance
   * @param config Configuration for dashboard
   */
  constructor(config: IDrishtiDashboardConfig) {
    this.config = config;
  }

  /**
   * Records a core event
   * @param event Core event to record
   */
  public recordEvent(event: ICoreEvent): void {
    this.events.push(event);

    // Maintain max events limit
    if (this.events.length > this.config.maxEvents) {
      this.events.shift();
    }

    // Handle specific event types
    switch (event.type) {
      case 'yatra_start':
        this.activeYatra = event.data as IYatra;
        break;
      case 'yatra_end':
        if (this.activeYatra) {
          this.recordYatra({ ...this.activeYatra, endedAt: Date.now() });
          this.activeYatra = undefined;
        }
        break;
    }

    // Record telemetry if enabled
    if (this.config.telemetryEnabled) {
      this.recordTelemetry(event.type, event.data);
    }
  }

  /**
   * Records a completed yatra
   * @param yatra Completed yatra
   */
  public recordYatra(yatra: IYatra): void {
    this.yatras.push(yatra);
  }

  /**
   * Records captured jnana
   * @param jnanaArray Array of captured jnana
   */
  public recordJnana(jnanaArray: IJnana[]): void {
    this.jnana.push(...jnanaArray);
  }

  /**
   * Records a reflection result
   * @param reflection Reflection result
   */
  public recordReflection(reflection: IReflectionResult): void {
    this.reflections.push(reflection);
  }

  /**
   * Gets dashboard metrics
   * @param activeYatra Optional active yatra (defaults to internal activeYatra)
   * @returns Dashboard metrics
   */
  public getMetrics(activeYatra?: IYatra): IDashboardMetrics {
    const currentActiveYatra = activeYatra || this.activeYatra;
    const completedYatras = this.yatras.filter((y) => y.endedAt);
    // Count checkpoints from events if no yatras exist
    const eventCheckpoints = this.events.filter(e => e.type === 'checkpoint').length;
    const yatraCheckpoints = this.yatras.reduce(
      (sum, y) => sum + y.checkpoints.length,
      0
    ) + (currentActiveYatra?.checkpoints.length || 0);
    const totalCheckpoints = Math.max(eventCheckpoints, yatraCheckpoints);

    // Count milestones from events if no yatras exist
    const eventMilestones = this.events.filter(e => e.type === 'milestone').length;
    const yatraMilestones = this.yatras.reduce(
      (sum, y) => sum + y.milestones.length,
      0
    ) + (currentActiveYatra?.milestones.length || 0);
    const totalMilestones = Math.max(eventMilestones, yatraMilestones);

    // Count dharma alerts from events if no yatras exist
    const eventDharmaAlerts = this.events.filter(e => e.type === 'dharma_alert').length;
    const yatraDharmaAlerts = this.yatras.reduce(
      (sum, y) => sum + y.dharmaAlerts.length,
      0
    ) + (currentActiveYatra?.dharmaAlerts.length || 0);
    const totalDharmaAlerts = Math.max(eventDharmaAlerts, yatraDharmaAlerts);
    // totalDharmaAlerts is calculated above

    const averageSessionDuration =
      completedYatras.length > 0
        ? completedYatras.reduce((sum, y) => {
            const duration =
              y.endedAt && y.startedAt
                ? (y.endedAt - y.startedAt) / 1000 / 60
                : 0;
            return sum + duration;
          }, 0) / completedYatras.length
        : 0;

    const productivityScore = this.calculateProductivityScore();

    const recentActivity = this.events
      .slice(-10)
      .sort((a, b) => b.timestamp - a.timestamp);

    return {
      totalYatras: this.yatras.length,
      activeYatra: currentActiveYatra,
      totalCheckpoints,
      totalMilestones,
      totalDharmaAlerts,
      totalJnana: this.jnana.length,
      averageSessionDuration: Math.round(averageSessionDuration),
      productivityScore,
      recentActivity,
    };
  }

  /**
   * Gets health status
   * @returns Health status
   */
  public getHealthStatus(): IHealthStatus {
    const lastEventTime =
      this.events.length > 0
        ? this.events[this.events.length - 1].timestamp
        : undefined;

    const timeSinceLastEvent = lastEventTime
      ? Date.now() - lastEventTime
      : 0; // Default to 0 for no events (healthy)

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (timeSinceLastEvent > 3600000) {
      // No events in last hour
      status = 'degraded';
    }
    if (timeSinceLastEvent > 86400000) {
      // No events in last day
      status = 'unhealthy';
    }

    return {
      status,
      modules: {
        sutraCheckpoints: true, // Would check actual module status
        karmaPhala: true,
        dharmaSankata: true,
        yatraManager: true,
        jnanaCapture: true,
        smritiRecall: true,
        atmaVichara: true,
      },
      lastEventTime,
    };
  }

  /**
   * Gets telemetry data
   * @param limit Maximum number of data points
   * @returns Array of telemetry data
   */
  public getTelemetry(limit: number = 100): ITelemetryData[] {
    return this.telemetry.slice(-limit);
  }

  /**
   * Exports dashboard data to JSON
   * @returns JSON string
   */
  public exportToJSON(): string {
    return JSON.stringify(
      {
        events: this.events,
        yatras: this.yatras,
        jnana: this.jnana,
        reflections: this.reflections,
        metrics: this.getMetrics(),
      },
      null,
      2
    );
  }

  /**
   * Calculates productivity score
   * @returns Score value (0-100)
   */
  private calculateProductivityScore(): number {
    if (this.yatras.length === 0) {
      return 0;
    }

    const completedYatras = this.yatras.filter((y) => y.endedAt);
    if (completedYatras.length === 0) {
      return 50;
    }

    let score = 50;

    // Checkpoints per session
    const avgCheckpoints =
      completedYatras.reduce((sum, y) => sum + y.checkpoints.length, 0) /
      completedYatras.length;
    score += Math.min(avgCheckpoints * 5, 20);

    // Milestones per session
    const avgMilestones =
      completedYatras.reduce((sum, y) => sum + y.milestones.length, 0) /
      completedYatras.length;
    score += Math.min(avgMilestones * 10, 20);

    // Dharma alerts reduce score
    const avgAlerts =
      completedYatras.reduce((sum, y) => sum + y.dharmaAlerts.length, 0) /
      completedYatras.length;
    score -= Math.min(avgAlerts * 5, 30);

    // Jnana capture adds to score
    score += Math.min(this.jnana.length / completedYatras.length, 10);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Records telemetry data
   * @param eventType Type of event
   * @param data Event data
   */
  private recordTelemetry(eventType: string, data: unknown): void {
    this.telemetry.push({
      timestamp: Date.now(),
      eventType,
      data,
    });

    // Maintain telemetry limit
    if (this.telemetry.length > this.config.maxEvents) {
      this.telemetry.shift();
    }
  }
}
