/**
 * Core type definitions for Tridishti
 * Maps to the threefold vision: Jnana (knowledge), Karma (action), Bhakti (reflection)
 */

/**
 * Represents a checkpoint in the coding workflow (Sutra - thread)
 */
export interface ISutraCheckpoint {
  id: string;
  timestamp: number;
  message?: string;
  filesChanged: string[];
  gitCommitHash?: string;
}

/**
 * Represents the outcome of an action (Karma Phala - fruits of action)
 */
export interface IKarmaPhala {
  id: string;
  milestoneId: string;
  timestamp: number;
  score: number;
  duration: number;
  filesModified: string[];
  gitTag?: string;
}

/**
 * Represents a milestone in the coding journey
 */
export interface IMilestone {
  id: string;
  name: string;
  createdAt: number;
  targetDuration?: number;
  completedAt?: number;
  status: 'active' | 'completed' | 'abandoned';
}

/**
 * Represents a scope drift detection result (Dharma Sankata - crisis of purpose)
 */
export interface IDharmaSankata {
  detected: boolean;
  timestamp: number;
  reason: 'file_threshold' | 'goal_mismatch' | 'time_anomaly';
  details: {
    filesChanged: number;
    threshold: number;
    currentGoal?: string;
    detectedGoal?: string;
  };
  suggestion?: string;
}

/**
 * Represents a coding session (Yatra - journey)
 */
export interface IYatra {
  id: string;
  sankalpa?: string; // Intention/goal for the session
  startedAt: number;
  endedAt?: number;
  checkpoints: ISutraCheckpoint[];
  milestones: IMilestone[];
  dharmaAlerts: IDharmaSankata[];
}

/**
 * Event emitted by core modules
 */
export interface ICoreEvent {
  type:
    | 'checkpoint'
    | 'milestone'
    | 'milestone_created'
    | 'dharma_alert'
    | 'yatra_start'
    | 'yatra_end';
  timestamp: number;
  data: ISutraCheckpoint | IKarmaPhala | IMilestone | IDharmaSankata | IYatra;
}
