/**
 * Test suite for JnanaCapture module
 */

import { JnanaCapture } from '../../src/learning/jnana-capture';
import { IJnanaCaptureConfig } from '../../src/learning/jnana-capture';

describe('JnanaCapture', () => {
  let config: IJnanaCaptureConfig;
  let jnanaCapture: JnanaCapture;

  beforeEach(() => {
    config = {
      enabled: true,
      categories: ['insight', 'gotcha', 'pattern', 'solution', 'question'],
      autoCapture: false,
      defaultCategory: 'insight',
    };
    jnanaCapture = new JnanaCapture(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('knowledge capture', () => {
    it('should capture insight', () => {
      const jnana = jnanaCapture.captureInsight(
        'Found a better way to handle async operations',
        { file: 'utils.ts', line: 42 },
        ['async', 'performance']
      );

      expect(jnana).toBeDefined();
      expect(jnana.id).toContain('jnana-');
      expect(jnana.category).toBe('insight');
      expect(jnana.content).toBe('Found a better way to handle async operations');
      expect(jnana.context?.file).toBe('utils.ts');
      expect(jnana.context?.line).toBe(42);
      expect(jnana.tags).toEqual(['async', 'performance']);
      expect(jnana.context?.timestamp).toBeGreaterThan(0);
    });

    it('should capture gotcha', () => {
      const jnana = jnanaCapture.captureGotcha(
        'Array.splice modifies the original array',
        { file: 'array-helpers.ts', line: 15 }
      );

      expect(jnana.category).toBe('gotcha');
      expect(jnana.content).toBe('Array.splice modifies the original array');
    });

    it('should capture pattern', () => {
      const jnana = jnanaCapture.capturePattern(
        'Factory pattern for creating different types of parsers'
      );

      expect(jnana.category).toBe('pattern');
    });

    it('should capture solution', () => {
      const jnana = jnanaCapture.captureSolution(
        'Use memoization to cache expensive computations'
      );

      expect(jnana.category).toBe('solution');
    });

    it('should capture question', () => {
      const jnana = jnanaCapture.captureQuestion(
        'How does the event loop handle microtasks vs macrotasks?'
      );

      expect(jnana.category).toBe('question');
    });

    it('should capture generic knowledge', () => {
      const jnana = jnanaCapture.capture(
        'Custom hook for form validation',
        'pattern',
        { file: 'hooks.ts', line: 10 },
        ['react', 'hooks', 'forms']
      );

      expect(jnana.category).toBe('pattern');
      expect(jnana.tags).toEqual(['react', 'hooks', 'forms']);
    });

    it('should use default category when none specified', () => {
      const jnana = jnanaCapture.capture('Some knowledge');

      expect(jnana.category).toBe('insight');
    });
  });

  describe('knowledge retrieval', () => {
    beforeEach(() => {
      jnanaCapture.captureInsight('Insight 1', undefined, ['tag1']);
      jnanaCapture.captureGotcha('Gotcha 1', undefined, ['tag2']);
      jnanaCapture.capturePattern('Pattern 1', undefined, ['tag1', 'tag2']);
    });

    it('should return all captured jnana', () => {
      const all = jnanaCapture.getAllJnana();

      expect(all).toHaveLength(3);
    });

    it('should filter by category', () => {
      const insights = jnanaCapture.getJnanaByCategory('insight');
      const gotchas = jnanaCapture.getJnanaByCategory('gotcha');

      expect(insights).toHaveLength(1);
      expect(gotchas).toHaveLength(1);
      expect(insights[0].category).toBe('insight');
      expect(gotchas[0].category).toBe('gotcha');
    });

    it('should filter by tag', () => {
      const tag1Items = jnanaCapture.getJnanaByTag('tag1');
      const tag2Items = jnanaCapture.getJnanaByTag('tag2');

      expect(tag1Items).toHaveLength(2); // insight and pattern
      expect(tag2Items).toHaveLength(2); // gotcha and pattern
    });

    it('should return undefined for non-existent ID', () => {
      const result = jnanaCapture.getJnanaById('non-existent');

      expect(result).toBeUndefined();
    });

    it('should return jnana by ID', () => {
      const captured = jnanaCapture.captureInsight('Find me');
      const found = jnanaCapture.getJnanaById(captured.id);

      expect(found).toBe(captured);
    });
  });

  describe('yatra context', () => {
    it('should include yatra ID in context', () => {
      const mockYatra = { id: 'yatra-123' };
      jnanaCapture.setCurrentYatra(mockYatra);

      const jnana = jnanaCapture.captureInsight('Context test');

      expect(jnana.context?.yatraId).toBe('yatra-123');
    });

    it('should handle undefined yatra', () => {
      jnanaCapture.setCurrentYatra(undefined);

      const jnana = jnanaCapture.captureInsight('No context test');

      expect(jnana.context?.yatraId).toBeUndefined();
    });
  });

  describe('data import/export', () => {
    it('should export to JSON', () => {
      jnanaCapture.captureInsight('Export test');

      const json = jnanaCapture.exportToJSON();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].content).toBe('Export test');
    });

    it('should import from JSON', () => {
      const testData = [
        {
          id: 'jnana-import-1',
          category: 'insight' as const,
          content: 'Imported insight',
          context: { timestamp: Date.now() },
        },
      ];

      jnanaCapture.importFromJSON(JSON.stringify(testData));

      const all = jnanaCapture.getAllJnana();
      expect(all).toHaveLength(1);
      expect(all[0].content).toBe('Imported insight');
    });

    it('should throw error on invalid JSON import', () => {
      expect(() => jnanaCapture.importFromJSON('invalid json')).toThrow(
        'Failed to import jnana from JSON'
      );
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      jnanaCapture.updateConfig({
        defaultCategory: 'pattern',
        autoCapture: true,
      });

      expect(jnanaCapture).toBeDefined();
    });
  });

  describe('metadata handling', () => {
    it('should handle custom metadata', () => {
      const jnana = jnanaCapture.capture(
        'Test with metadata',
        'insight',
        undefined,
        undefined,
        { source: 'documentation', priority: 'high' }
      );

      expect(jnana.metadata?.source).toBe('documentation');
      expect(jnana.metadata?.priority).toBe('high');
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const jnana = jnanaCapture.capture('');

      expect(jnana.content).toBe('');
    });

    it('should handle empty tags array', () => {
      const jnana = jnanaCapture.capture('Test', 'insight', undefined, []);

      expect(jnana.tags).toEqual([]);
    });

    it('should handle undefined context', () => {
      const jnana = jnanaCapture.capture('Test', 'insight', undefined, undefined);

      expect(jnana.context).toBeDefined();
      expect(jnana.context?.file).toBeUndefined();
      expect(jnana.context?.line).toBeUndefined();
    });
  });
});

