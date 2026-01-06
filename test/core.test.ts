import { SafeFileSystem } from '../src/utils/files';
import { ResponseCache } from '../src/core/cache';
import { AIClient } from '../src/core/ai';
import path from 'path';
import fs from 'fs/promises';

describe('JPM Core Tests', () => {
    const testDir = path.join(process.cwd(), 'test-data');

    beforeAll(async () => {
        try { await fs.mkdir(testDir); } catch (e) { }
    });

    afterAll(async () => {
        try { await fs.rm(testDir, { recursive: true, force: true }); } catch (e) { }
    });

    describe('SafeFileSystem', () => {
        const sfs = new SafeFileSystem(testDir);

        it('should write and read files safely', async () => {
            await sfs.writeFileSafe('test.txt', 'hello world');
            const content = await sfs.readFileSafe('test.txt');
            expect(content).toBe('hello world');
        });

        it('should reject unsafe paths', async () => {
            await expect(sfs.writeFileSafe('../outside.txt', 'bad')).rejects.toThrow();
        });
    });

    describe('ResponseCache', () => {
        const cache = new ResponseCache(testDir);

        it('should cache and retrieve values', async () => {
            const prompt = 'test prompt';
            const response = 'test response';

            await cache.set(prompt, response);
            const hit = await cache.get(prompt);

            expect(hit).toBe(response);
        });

        it('should return null for miss', async () => {
            const miss = await cache.get('nonexistent');
            expect(miss).toBeNull();
        });
    });

    // Simple mock test for AI structure (not calling real API)
    describe('AI Client Structure', () => {
        const ai = new AIClient();

        it('should be instantiated', () => {
            expect(ai).toBeDefined();
        });
    });
});
