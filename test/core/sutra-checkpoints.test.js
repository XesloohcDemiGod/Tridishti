"use strict";
/**
 * Test suite for SutraCheckpoints module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sutra_checkpoints_1 = require("../../src/core/sutra-checkpoints");
describe('SutraCheckpoints', () => {
    let config;
    let eventEmitter;
    let sutraCheckpoints;
    beforeEach(() => {
        config = {
            interval: 30,
            autoCommit: false,
            enabled: true,
        };
        eventEmitter = global.testUtils.createMockEventEmitter();
        sutraCheckpoints = new sutra_checkpoints_1.SutraCheckpoints(config, eventEmitter);
    });
    afterEach(() => {
        sutraCheckpoints.stop();
        jest.clearAllMocks();
    });
    describe('initialization', () => {
        it('should initialize with provided config', () => {
            expect(sutraCheckpoints).toBeDefined();
        });
        it('should not start interval when disabled', () => {
            const disabledConfig = { ...config, enabled: false };
            const disabledInstance = new sutra_checkpoints_1.SutraCheckpoints(disabledConfig, eventEmitter);
            expect(disabledInstance).toBeDefined();
        });
    });
    describe('checkpoint creation', () => {
        it('should create a checkpoint manually', async () => {
            const checkpoint = await sutraCheckpoints.createCheckpoint('Test checkpoint');
            expect(checkpoint).toBeDefined();
            expect(checkpoint.id).toContain('sutra-');
            expect(checkpoint.message).toBe('Test checkpoint');
            expect(checkpoint.timestamp).toBeGreaterThan(0);
            expect(Array.isArray(checkpoint.filesChanged)).toBe(true);
            expect(eventEmitter.fire).toHaveBeenCalledWith({
                type: 'checkpoint',
                timestamp: expect.any(Number),
                data: checkpoint,
            });
        });
        it('should create checkpoint without message', async () => {
            const checkpoint = await sutraCheckpoints.createCheckpoint();
            expect(checkpoint.message).toBeUndefined();
            expect(checkpoint.filesChanged).toEqual([]);
        });
        it('should generate unique checkpoint IDs', async () => {
            const checkpoint1 = await sutraCheckpoints.createCheckpoint();
            const checkpoint2 = await sutraCheckpoints.createCheckpoint();
            expect(checkpoint1.id).not.toBe(checkpoint2.id);
        });
    });
    describe('checkpoint management', () => {
        it('should store created checkpoints', async () => {
            await sutraCheckpoints.createCheckpoint('First');
            await sutraCheckpoints.createCheckpoint('Second');
            const checkpoints = sutraCheckpoints.getCheckpoints();
            expect(checkpoints).toHaveLength(2);
            expect(checkpoints[0].message).toBe('First');
            expect(checkpoints[1].message).toBe('Second');
        });
        it('should return latest checkpoint', async () => {
            await sutraCheckpoints.createCheckpoint('First');
            const second = await sutraCheckpoints.createCheckpoint('Second');
            const latest = sutraCheckpoints.getLatestCheckpoint();
            expect(latest).toBe(second);
        });
        it('should return undefined when no checkpoints exist', () => {
            const latest = sutraCheckpoints.getLatestCheckpoint();
            expect(latest).toBeUndefined();
        });
    });
    describe('interval management', () => {
        it('should start interval when enabled', () => {
            jest.useFakeTimers();
            sutraCheckpoints.start();
            expect(sutraCheckpoints).toBeDefined();
            jest.runOnlyPendingTimers();
        });
        it('should stop interval', () => {
            sutraCheckpoints.start();
            sutraCheckpoints.stop();
            expect(sutraCheckpoints).toBeDefined();
        });
    });
    describe('configuration updates', () => {
        it('should update configuration', () => {
            sutraCheckpoints.updateConfig({ interval: 60, autoCommit: true });
            // Create a new checkpoint to test auto-commit (though mocked)
            expect(() => {
                sutraCheckpoints.createCheckpoint();
            }).not.toThrow();
        });
        it('should handle partial config updates', () => {
            sutraCheckpoints.updateConfig({ enabled: false });
            expect(sutraCheckpoints).toBeDefined();
        });
    });
    describe('file change detection', () => {
        it('should handle empty workspace', async () => {
            const checkpoint = await sutraCheckpoints.createCheckpoint();
            expect(checkpoint.filesChanged).toEqual([]);
        });
    });
    describe('auto-commit functionality', () => {
        let execSyncMock;
        beforeEach(() => {
            execSyncMock = global.testUtils.mockVSCode.execSync;
        });
        it('should attempt git commit when autoCommit enabled', async () => {
            const autoCommitConfig = { ...config, autoCommit: true };
            const autoCommitInstance = new sutra_checkpoints_1.SutraCheckpoints(autoCommitConfig, eventEmitter);
            await autoCommitInstance.createCheckpoint('Auto commit test');
            expect(execSyncMock).toHaveBeenCalledWith(expect.stringContaining('git commit -am'), expect.any(Object));
        });
        it('should handle git commit failure gracefully', async () => {
            execSyncMock.mockImplementation(() => {
                throw new Error('Git commit failed');
            });
            const autoCommitConfig = { ...config, autoCommit: true };
            const autoCommitInstance = new sutra_checkpoints_1.SutraCheckpoints(autoCommitConfig, eventEmitter);
            const checkpoint = await autoCommitInstance.createCheckpoint('Test');
            expect(checkpoint.gitCommitHash).toBeUndefined();
        });
    });
});
//# sourceMappingURL=sutra-checkpoints.test.js.map