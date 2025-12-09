"use strict";
/**
 * Test suite for KarmaPhala module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const karma_phala_1 = require("../../src/core/karma-phala");
describe('KarmaPhala', () => {
    let config;
    let eventEmitter;
    let karmaPhala;
    beforeEach(() => {
        config = {
            milestoneThreshold: 120,
            autoTag: false,
            enabled: true,
            nudgeStrategy: 'default',
        };
        eventEmitter = global.testUtils.createMockEventEmitter();
        karmaPhala = new karma_phala_1.KarmaPhala(config, eventEmitter);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('milestone creation', () => {
        it('should create a milestone', () => {
            const milestone = karmaPhala.createMilestone('Test milestone', 60);
            expect(milestone).toBeDefined();
            expect(milestone.id).toContain('karma-');
            expect(milestone.name).toBe('Test milestone');
            expect(milestone.targetDuration).toBe(60);
            expect(milestone.status).toBe('active');
            expect(milestone.createdAt).toBeGreaterThan(0);
        });
        it('should create milestone without target duration', () => {
            const milestone = karmaPhala.createMilestone('Test milestone');
            expect(milestone.targetDuration).toBeUndefined();
        });
        it('should set milestone as active', () => {
            const milestone = karmaPhala.createMilestone('Test');
            const activeMilestone = karmaPhala.getActiveMilestone();
            expect(activeMilestone).toBe(milestone);
        });
    });
    describe('milestone completion', () => {
        it('should complete active milestone', async () => {
            karmaPhala.createMilestone('Test milestone');
            const filesModified = ['file1.ts', 'file2.ts'];
            const karmaPhalaResult = await karmaPhala.completeMilestone(filesModified);
            expect(karmaPhalaResult).toBeDefined();
            expect(karmaPhalaResult.milestoneId).toContain('karma-');
            expect(karmaPhalaResult.score).toBeGreaterThan(0);
            expect(karmaPhalaResult.duration).toBeGreaterThan(0);
            expect(karmaPhalaResult.filesModified).toEqual(filesModified);
            expect(eventEmitter.fire).toHaveBeenCalledWith({
                type: 'milestone',
                timestamp: expect.any(Number),
                data: karmaPhalaResult,
            });
        });
        it('should throw error when no active milestone', async () => {
            await expect(karmaPhala.completeMilestone([])).rejects.toThrow('No active milestone to complete');
        });
        it('should clear active milestone after completion', async () => {
            karmaPhala.createMilestone('Test');
            await karmaPhala.completeMilestone([]);
            expect(karmaPhala.getActiveMilestone()).toBeUndefined();
        });
    });
    describe('milestone management', () => {
        it('should return all milestones', () => {
            const milestone1 = karmaPhala.createMilestone('First');
            const milestone2 = karmaPhala.createMilestone('Second');
            const milestones = karmaPhala.getMilestones();
            expect(milestones).toHaveLength(2);
            expect(milestones).toContain(milestone1);
            expect(milestones).toContain(milestone2);
        });
        it('should return all karma phala outcomes', async () => {
            karmaPhala.createMilestone('First');
            const result1 = await karmaPhala.completeMilestone(['file1.ts']);
            karmaPhala.createMilestone('Second');
            const result2 = await karmaPhala.completeMilestone(['file2.ts']);
            const outcomes = karmaPhala.getKarmaPhala();
            expect(outcomes).toHaveLength(2);
            expect(outcomes).toContain(result1);
            expect(outcomes).toContain(result2);
        });
        it('should abandon active milestone', () => {
            karmaPhala.createMilestone('Test milestone');
            karmaPhala.abandonMilestone();
            expect(karmaPhala.getActiveMilestone()).toBeUndefined();
        });
    });
    describe('milestone threshold detection', () => {
        it('should suggest milestone creation when threshold reached', () => {
            const shouldCreate = karmaPhala.shouldCreateMilestone(150);
            expect(shouldCreate).toBe(true);
        });
        it('should not suggest milestone when below threshold', () => {
            const shouldCreate = karmaPhala.shouldCreateMilestone(50);
            expect(shouldCreate).toBe(false);
        });
        it('should not suggest milestone when disabled', () => {
            karmaPhala.updateConfig({ enabled: false });
            const shouldCreate = karmaPhala.shouldCreateMilestone(200);
            expect(shouldCreate).toBe(false);
        });
        it('should not suggest milestone when one is active', () => {
            karmaPhala.createMilestone('Active');
            const shouldCreate = karmaPhala.shouldCreateMilestone(200);
            expect(shouldCreate).toBe(false);
        });
    });
    describe('nudge messages', () => {
        it('should return default nudge message', () => {
            const message = karmaPhala.getNudgeMessage();
            expect(message).toContain('coding for a while');
        });
        it('should return deep-work nudge message', () => {
            karmaPhala.updateConfig({ nudgeStrategy: 'deep-work' });
            const message = karmaPhala.getNudgeMessage();
            expect(message).toContain('Deep work session');
        });
        it('should return exploration nudge message', () => {
            karmaPhala.updateConfig({ nudgeStrategy: 'exploration' });
            const message = karmaPhala.getNudgeMessage();
            expect(message).toContain('Exploration phase');
        });
        it('should return maintenance nudge message', () => {
            karmaPhala.updateConfig({ nudgeStrategy: 'maintenance' });
            const message = karmaPhala.getNudgeMessage();
            expect(message).toContain('Maintenance work');
        });
    });
    describe('scoring system', () => {
        it('should calculate score based on duration and files', async () => {
            karmaPhala.createMilestone('Test');
            // Simulate 60 seconds and 5 files
            jest.advanceTimersByTime(60000);
            const result = await karmaPhala.completeMilestone(['f1.ts', 'f2.ts', 'f3.ts', 'f4.ts', 'f5.ts']);
            expect(result.score).toBeGreaterThan(0);
            expect(result.score).toBeLessThanOrEqual(100);
        });
        it('should handle zero duration gracefully', async () => {
            karmaPhala.createMilestone('Test');
            const result = await karmaPhala.completeMilestone([]);
            expect(result.score).toBeGreaterThanOrEqual(0);
        });
    });
    describe('auto-tagging', () => {
        let execSyncMock;
        beforeEach(() => {
            execSyncMock = global.testUtils.mockVSCode.execSync;
        });
        it('should create git tag when autoTag enabled', async () => {
            const autoTagConfig = { ...config, autoTag: true };
            const autoTagInstance = new karma_phala_1.KarmaPhala(autoTagConfig, eventEmitter);
            autoTagInstance.createMilestone('Test milestone');
            const result = await autoTagInstance.completeMilestone([]);
            expect(result.gitTag).toBeDefined();
            expect(execSyncMock).toHaveBeenCalledWith(expect.stringContaining('git tag -a'), expect.any(Object));
        });
        it('should handle git tag failure gracefully', async () => {
            execSyncMock.mockImplementation(() => {
                throw new Error('Git tag failed');
            });
            const autoTagConfig = { ...config, autoTag: true };
            const autoTagInstance = new karma_phala_1.KarmaPhala(autoTagConfig, eventEmitter);
            autoTagInstance.createMilestone('Test');
            const result = await autoTagInstance.completeMilestone([]);
            expect(result.gitTag).toBeUndefined();
        });
    });
    describe('configuration updates', () => {
        it('should update configuration', () => {
            karmaPhala.updateConfig({ milestoneThreshold: 200, nudgeStrategy: 'deep-work' });
            expect(karmaPhala).toBeDefined();
        });
    });
});
//# sourceMappingURL=karma-phala.test.js.map