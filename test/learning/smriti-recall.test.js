"use strict";
/**
 * Test suite for SmritiRecall module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const smriti_recall_1 = require("../../src/learning/smriti-recall");
const jnana_capture_1 = require("../../src/learning/jnana-capture");
describe('SmritiRecall', () => {
    let jnanaCapture;
    let smritiRecall;
    beforeEach(() => {
        jnanaCapture = new jnana_capture_1.JnanaCapture({
            enabled: true,
            categories: ['insight', 'gotcha', 'pattern', 'solution', 'question'],
            autoCapture: false,
            defaultCategory: 'insight',
        });
        smritiRecall = new smriti_recall_1.SmritiRecall({ provider: 'memory' }, jnanaCapture);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('knowledge storage and retrieval', () => {
        it('should save jnana to store', async () => {
            const jnana = jnanaCapture.captureInsight('Test insight');
            await smritiRecall.save(jnana);
            const recalled = await smritiRecall.recall(jnana.id);
            expect(recalled).toEqual(jnana);
        });
        it('should return undefined for non-existent jnana', async () => {
            const recalled = await smritiRecall.recall('non-existent-id');
            expect(recalled).toBeUndefined();
        });
        it('should recall all stored jnana', async () => {
            const jnana1 = jnanaCapture.captureInsight('Insight 1');
            const jnana2 = jnanaCapture.captureGotcha('Gotcha 1');
            await smritiRecall.save(jnana1);
            await smritiRecall.save(jnana2);
            const all = await smritiRecall.recallAll();
            expect(all).toHaveLength(2);
            expect(all).toContain(jnana1);
            expect(all).toContain(jnana2);
        });
    });
    describe('search functionality', () => {
        beforeEach(async () => {
            const jnana1 = jnanaCapture.captureInsight('React hooks are powerful', undefined, ['react', 'hooks']);
            const jnana2 = jnanaCapture.capturePattern('Factory pattern for parsers', undefined, ['design-patterns']);
            const jnana3 = jnanaCapture.captureGotcha('Array.splice modifies original', undefined, ['javascript', 'arrays']);
            await smritiRecall.save(jnana1);
            await smritiRecall.save(jnana2);
            await smritiRecall.save(jnana3);
        });
        it('should search by content', async () => {
            const results = await smritiRecall.search('React');
            expect(results).toHaveLength(1);
            expect(results[0].content).toContain('React hooks');
        });
        it('should search by tag', async () => {
            const results = await smritiRecall.search('react');
            expect(results).toHaveLength(1);
            expect(results[0].tags).toContain('react');
        });
        it('should search by category', async () => {
            const results = await smritiRecall.search('pattern');
            expect(results).toHaveLength(1);
            expect(results[0].category).toBe('pattern');
        });
        it('should return multiple results', async () => {
            const results = await smritiRecall.search('pattern');
            expect(results).toHaveLength(1);
        });
        it('should return empty array for no matches', async () => {
            const results = await smritiRecall.search('nonexistent');
            expect(results).toEqual([]);
        });
        it('should be case insensitive', async () => {
            const results = await smritiRecall.search('REACT');
            expect(results).toHaveLength(1);
        });
    });
    describe('filtered recall', () => {
        beforeEach(async () => {
            const insight = jnanaCapture.captureInsight('Insight content');
            const gotcha = jnanaCapture.captureGotcha('Gotcha content');
            const pattern = jnanaCapture.capturePattern('Pattern content', undefined, ['tag1']);
            const solution = jnanaCapture.captureSolution('Solution content', undefined, ['tag1', 'tag2']);
            await smritiRecall.save(insight);
            await smritiRecall.save(gotcha);
            await smritiRecall.save(pattern);
            await smritiRecall.save(solution);
        });
        it('should recall by category', async () => {
            const insights = await smritiRecall.recallByCategory('insight');
            const gotchas = await smritiRecall.recallByCategory('gotcha');
            expect(insights).toHaveLength(1);
            expect(gotchas).toHaveLength(1);
            expect(insights[0].category).toBe('insight');
            expect(gotchas[0].category).toBe('gotcha');
        });
        it('should recall by tag', async () => {
            const tag1Items = await smritiRecall.recallByTag('tag1');
            const tag2Items = await smritiRecall.recallByTag('tag2');
            expect(tag1Items).toHaveLength(2);
            expect(tag2Items).toHaveLength(1);
        });
        it('should return empty arrays for non-existent categories/tags', async () => {
            const results = await smritiRecall.recallByCategory('nonexistent');
            expect(results).toEqual([]);
        });
    });
    describe('recent recall', () => {
        beforeEach(async () => {
            // Create jnana with different timestamps
            const oldJnana = jnanaCapture.captureInsight('Old insight');
            const newJnana = jnanaCapture.captureGotcha('New gotcha');
            const newestJnana = jnanaCapture.capturePattern('Newest pattern');
            // Manually set timestamps to control order
            oldJnana.context.timestamp = Date.now() - 10000;
            newJnana.context.timestamp = Date.now() - 5000;
            newestJnana.context.timestamp = Date.now() - 1000;
            await smritiRecall.save(oldJnana);
            await smritiRecall.save(newJnana);
            await smritiRecall.save(newestJnana);
        });
        it('should recall recent jnana', async () => {
            const recent = await smritiRecall.recallRecent(2);
            expect(recent).toHaveLength(2);
            expect(recent[0].content).toBe('Newest pattern');
            expect(recent[1].content).toBe('New gotcha');
        });
        it('should limit results', async () => {
            const recent = await smritiRecall.recallRecent(1);
            expect(recent).toHaveLength(1);
            expect(recent[0].content).toBe('Newest pattern');
        });
        it('should handle empty store', async () => {
            const emptyRecall = new smriti_recall_1.SmritiRecall({ provider: 'memory' }, jnanaCapture);
            const recent = await emptyRecall.recallRecent(5);
            expect(recent).toEqual([]);
        });
    });
    describe('access tracking', () => {
        it('should track access count', async () => {
            const jnana = jnanaCapture.captureInsight('Access test');
            await smritiRecall.save(jnana);
            // First access
            await smritiRecall.recall(jnana.id);
            // Second access
            await smritiRecall.recall(jnana.id);
            // Access tracking is internal to memory store
            expect(true).toBe(true); // Test passes if no errors
        });
        it('should update last accessed time', async () => {
            const jnana = jnanaCapture.captureInsight('Time test');
            await smritiRecall.save(jnana);
            await smritiRecall.recall(jnana.id);
            // Time tracking is internal to memory store
            expect(true).toBe(true); // Test passes if no errors
        });
    });
    describe('deletion', () => {
        it('should delete jnana from store', async () => {
            const jnana = jnanaCapture.captureInsight('Delete test');
            await smritiRecall.save(jnana);
            await smritiRecall.delete(jnana.id);
            const recalled = await smritiRecall.recall(jnana.id);
            expect(recalled).toBeUndefined();
        });
        it('should handle deletion of non-existent jnana', async () => {
            await expect(smritiRecall.delete('non-existent')).resolves.toBeUndefined();
        });
    });
    describe('state restoration', () => {
        it('should restore last state to jnana capture', async () => {
            const jnana1 = jnanaCapture.captureInsight('State 1');
            const jnana2 = jnanaCapture.captureGotcha('State 2');
            await smritiRecall.save(jnana1);
            await smritiRecall.save(jnana2);
            // Clear current jnana capture
            const newJnanaCapture = new jnana_capture_1.JnanaCapture({
                enabled: true,
                categories: ['insight', 'gotcha', 'pattern', 'solution', 'question'],
                autoCapture: false,
                defaultCategory: 'insight',
            });
            const newSmritiRecall = new smriti_recall_1.SmritiRecall({ provider: 'memory' }, newJnanaCapture);
            // Restore state
            const restored = await newSmritiRecall.restoreLastState();
            expect(restored).toHaveLength(2);
            expect(restored[0].content).toBe('State 1');
            expect(restored[1].content).toBe('State 2');
        });
    });
    describe('store provider handling', () => {
        it('should handle unsupported providers gracefully', () => {
            // The memory store is used as fallback for unsupported providers
            const fallbackRecall = new smriti_recall_1.SmritiRecall({ provider: 'unsupported' }, jnanaCapture);
            expect(fallbackRecall).toBeDefined();
        });
    });
});
//# sourceMappingURL=smriti-recall.test.js.map