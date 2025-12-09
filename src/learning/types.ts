/**
 * Learning module type definitions
 * Maps to the Jnana (knowledge) pillar
 */

/**
 * Categories for captured knowledge
 */
export type JnanaCategory = 'insight' | 'gotcha' | 'pattern' | 'solution' | 'question';

/**
 * Represents captured knowledge (Jnana)
 */
export interface IJnana {
  id: string;
  category: JnanaCategory;
  content: string;
  context?: {
    file?: string;
    line?: number;
    timestamp: number;
    yatraId?: string;
  };
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Represents a stored memory (Smriti)
 */
export interface ISmriti {
  id: string;
  jnana: IJnana;
  storedAt: number;
  accessedAt?: number;
  accessCount: number;
}

/**
 * Configuration for knowledge store
 */
export interface IKnowledgeStoreConfig {
  provider: 'memory' | 'file' | 'database';
  path?: string;
  maxEntries?: number;
}
