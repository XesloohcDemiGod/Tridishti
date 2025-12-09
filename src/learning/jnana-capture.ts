/**
 * Jnana Capture Module
 *
 * Captures and stores knowledge artifacts (insights, patterns, solutions).
 * Maps to the Jnana (knowledge) pillar - ingesting and normalizing knowledge.
 *
 * Features:
 * - Knowledge artifact ingestion
 * - Metadata normalization
 * - Category-based organization
 * - Context preservation
 */

import { IJnana, JnanaCategory } from './types';
import { IYatra } from '../core/types';

/**
 * Configuration for jnana capture
 */
export interface IJnanaCaptureConfig {
  enabled: boolean;
  categories: JnanaCategory[];
  autoCapture: boolean;
  defaultCategory: JnanaCategory;
}

/**
 * Manages knowledge capture (Jnana)
 */
export class JnanaCapture {
  private config: IJnanaCaptureConfig;
  private capturedJnana: Map<string, IJnana> = new Map();
  private currentYatra?: IYatra;

  /**
   * Creates a new JnanaCapture instance
   * @param config Configuration for knowledge capture
   */
  constructor(config: IJnanaCaptureConfig) {
    this.config = config;
  }

  /**
   * Captures a knowledge artifact
   * @param content Knowledge content
   * @param category Category of knowledge
   * @param context Optional context information
   * @param tags Optional tags for organization
   * @returns The captured jnana
   */
  public capture(
    content: string,
    category?: JnanaCategory,
    context?: {
      file?: string;
      line?: number;
    },
    tags?: string[]
  ): IJnana {
    const jnana: IJnana = {
      id: this.generateId(),
      category: category || this.config.defaultCategory,
      content,
      context: {
        ...context,
        timestamp: Date.now(),
        yatraId: this.currentYatra?.id,
      },
      tags,
    };

    this.capturedJnana.set(jnana.id, jnana);
    return jnana;
  }

  /**
   * Captures an insight
   * @param content Insight content
   * @param context Optional context
   * @param tags Optional tags
   * @returns The captured jnana
   */
  public captureInsight(
    content: string,
    context?: { file?: string; line?: number },
    tags?: string[]
  ): IJnana {
    return this.capture(content, 'insight', context, tags);
  }

  /**
   * Captures a gotcha (something learned the hard way)
   * @param content Gotcha content
   * @param context Optional context
   * @param tags Optional tags
   * @returns The captured jnana
   */
  public captureGotcha(
    content: string,
    context?: { file?: string; line?: number },
    tags?: string[]
  ): IJnana {
    return this.capture(content, 'gotcha', context, tags);
  }

  /**
   * Captures a pattern
   * @param content Pattern description
   * @param context Optional context
   * @param tags Optional tags
   * @returns The captured jnana
   */
  public capturePattern(
    content: string,
    context?: { file?: string; line?: number },
    tags?: string[]
  ): IJnana {
    return this.capture(content, 'pattern', context, tags);
  }

  /**
   * Captures a solution
   * @param content Solution description
   * @param context Optional context
   * @param tags Optional tags
   * @returns The captured jnana
   */
  public captureSolution(
    content: string,
    context?: { file?: string; line?: number },
    tags?: string[]
  ): IJnana {
    return this.capture(content, 'solution', context, tags);
  }

  /**
   * Captures a question
   * @param content Question content
   * @param context Optional context
   * @param tags Optional tags
   * @returns The captured jnana
   */
  public captureQuestion(
    content: string,
    context?: { file?: string; line?: number },
    tags?: string[]
  ): IJnana {
    return this.capture(content, 'question', context, tags);
  }

  /**
   * Gets all captured jnana
   * @returns Array of captured jnana
   */
  public getAllJnana(): IJnana[] {
    return Array.from(this.capturedJnana.values());
  }

  /**
   * Gets jnana by category
   * @param category Category to filter by
   * @returns Array of jnana in the category
   */
  public getJnanaByCategory(category: JnanaCategory): IJnana[] {
    return Array.from(this.capturedJnana.values()).filter(
      (jnana) => jnana.category === category
    );
  }

  /**
   * Gets jnana by tag
   * @param tag Tag to filter by
   * @returns Array of jnana with the tag
   */
  public getJnanaByTag(tag: string): IJnana[] {
    return Array.from(this.capturedJnana.values()).filter(
      (jnana) => jnana.tags?.includes(tag)
    );
  }

  /**
   * Gets jnana by ID
   * @param id Jnana ID
   * @returns Jnana or undefined
   */
  public getJnanaById(id: string): IJnana | undefined {
    return this.capturedJnana.get(id);
  }

  /**
   * Sets the current yatra for context
   * @param yatra Current yatra
   */
  public setCurrentYatra(yatra: IYatra | undefined): void {
    this.currentYatra = yatra;
  }

  /**
   * Updates the configuration
   * @param config New configuration
   */
  public updateConfig(config: Partial<IJnanaCaptureConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Exports captured jnana to JSON
   * @returns JSON string
   */
  public exportToJSON(): string {
    return JSON.stringify(Array.from(this.capturedJnana.values()), null, 2);
  }

  /**
   * Imports jnana from JSON
   * @param json JSON string
   */
  public importFromJSON(json: string): void {
    try {
      const jnanaArray = JSON.parse(json) as IJnana[];
      for (const jnana of jnanaArray) {
        this.capturedJnana.set(jnana.id, jnana);
      }
    } catch (error) {
      throw new Error('Failed to import jnana from JSON');
    }
  }

  /**
   * Generates a unique ID for jnana
   * @returns Unique ID string
   */
  private generateId(): string {
    return `jnana-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
