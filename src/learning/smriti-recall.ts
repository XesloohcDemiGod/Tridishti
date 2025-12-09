/**
 * Smriti Recall Module
 *
 * Provides indexed retrieval APIs for knowledge artifacts.
 * Maps to the Jnana (knowledge) pillar - memory and context recovery.
 *
 * Features:
 * - Indexed knowledge retrieval
 * - Context recovery
 * - Pluggable storage backends
 * - Auto-save and restore
 */

import { IJnana, ISmriti, IKnowledgeStoreConfig } from './types';
import { JnanaCapture } from './jnana-capture';

/**
 * Interface for knowledge store providers
 */
export interface IKnowledgeStore {
  save(jnana: IJnana): Promise<void>;
  load(id: string): Promise<IJnana | undefined>;
  search(query: string): Promise<IJnana[]>;
  getAll(): Promise<IJnana[]>;
  delete(id: string): Promise<void>;
}

/**
 * Memory-based knowledge store implementation
 */
class MemoryKnowledgeStore implements IKnowledgeStore {
  private storage: Map<string, ISmriti> = new Map();

  /**
   * Saves jnana to memory store
   * @param jnana Knowledge to save
   */
  public async save(jnana: IJnana): Promise<void> {
    const smriti: ISmriti = {
      id: jnana.id,
      jnana,
      storedAt: Date.now(),
      accessCount: 0,
    };
    this.storage.set(jnana.id, smriti);
  }

  /**
   * Loads jnana from memory store
   * @param id Jnana ID
   * @returns Jnana or undefined
   */
  public async load(id: string): Promise<IJnana | undefined> {
    const smriti = this.storage.get(id);
    if (smriti) {
      smriti.accessedAt = Date.now();
      smriti.accessCount++;
      return smriti.jnana;
    }
    return undefined;
  }

  /**
   * Searches for jnana matching query
   * @param query Search query
   * @returns Array of matching jnana
   */
  public async search(query: string): Promise<IJnana[]> {
    const lowerQuery = query.toLowerCase();
    const results: IJnana[] = [];

    for (const smriti of this.storage.values()) {
      const jnana = smriti.jnana;
      if (
        jnana.content.toLowerCase().includes(lowerQuery) ||
        jnana.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        jnana.category.toLowerCase().includes(lowerQuery)
      ) {
        smriti.accessedAt = Date.now();
        smriti.accessCount++;
        results.push(jnana);
      }
    }

    return results;
  }

  /**
   * Gets all stored jnana
   * @returns Array of all jnana
   */
  public async getAll(): Promise<IJnana[]> {
    return Array.from(this.storage.values()).map((smriti) => smriti.jnana);
  }

  /**
   * Deletes jnana from store
   * @param id Jnana ID
   */
  public async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }
}

/**
 * Manages knowledge recall and retrieval (Smriti)
 */
export class SmritiRecall {
  private store: IKnowledgeStore;
  private config: IKnowledgeStoreConfig;
  private jnanaCapture: JnanaCapture;

  /**
   * Creates a new SmritiRecall instance
   * @param config Configuration for knowledge store
   * @param jnanaCapture Jnana capture module for auto-save
   */
  constructor(config: IKnowledgeStoreConfig, jnanaCapture: JnanaCapture) {
    this.config = config;
    this.jnanaCapture = jnanaCapture;
    this.store = this.createStore(config);
  }

  /**
   * Recalls jnana by ID
   * @param id Jnana ID
   * @returns Jnana or undefined
   */
  public async recall(id: string): Promise<IJnana | undefined> {
    return await this.store.load(id);
  }

  /**
   * Searches for jnana matching query
   * @param query Search query
   * @returns Array of matching jnana
   */
  public async search(query: string): Promise<IJnana[]> {
    return await this.store.search(query);
  }

  /**
   * Recalls all stored jnana
   * @returns Array of all jnana
   */
  public async recallAll(): Promise<IJnana[]> {
    return await this.store.getAll();
  }

  /**
   * Recalls jnana by category
   * @param category Category to filter by
   * @returns Array of jnana in the category
   */
  public async recallByCategory(category: string): Promise<IJnana[]> {
    const all = await this.recallAll();
    return all.filter((jnana) => jnana.category === category);
  }

  /**
   * Recalls jnana by tag
   * @param tag Tag to filter by
   * @returns Array of jnana with the tag
   */
  public async recallByTag(tag: string): Promise<IJnana[]> {
    const all = await this.recallAll();
    return all.filter((jnana) => jnana.tags?.includes(tag));
  }

  /**
   * Recalls recent jnana
   * @param limit Maximum number of results
   * @returns Array of recent jnana
   */
  public async recallRecent(limit: number = 10): Promise<IJnana[]> {
    const all = await this.recallAll();
    return all
      .sort((a, b) => (b.context?.timestamp || 0) - (a.context?.timestamp || 0))
      .slice(0, limit);
  }

  /**
   * Saves jnana to store (auto-save from capture)
   * @param jnana Knowledge to save
   */
  public async save(jnana: IJnana): Promise<void> {
    await this.store.save(jnana);
  }

  /**
   * Deletes jnana from store
   * @param id Jnana ID
   */
  public async delete(id: string): Promise<void> {
    await this.store.delete(id);
  }

  /**
   * Restores last state from store
   * @returns Array of restored jnana
   */
  public async restoreLastState(): Promise<IJnana[]> {
    const all = await this.recallAll();
    // Restore to jnana capture
    for (const jnana of all) {
      this.jnanaCapture.importFromJSON(JSON.stringify([jnana]));
    }
    return all;
  }

  /**
   * Creates a knowledge store based on configuration
   * @param config Store configuration
   * @returns Knowledge store instance
   */
  private createStore(config: IKnowledgeStoreConfig): IKnowledgeStore {
    switch (config.provider) {
      case 'memory':
        return new MemoryKnowledgeStore();
      case 'file':
        // File-based store would be implemented here
        return new MemoryKnowledgeStore(); // Fallback for now
      case 'database':
        // Database store would be implemented here
        return new MemoryKnowledgeStore(); // Fallback for now
      default:
        return new MemoryKnowledgeStore();
    }
  }
}
