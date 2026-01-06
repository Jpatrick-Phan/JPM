"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const files_1 = require("../src/utils/files");
const cache_1 = require("../src/core/cache");
const ai_1 = require("../src/core/ai");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
describe('JPM Core Tests', () => {
    const testDir = path_1.default.join(process.cwd(), 'test-data');
    beforeAll(async () => {
        try {
            await promises_1.default.mkdir(testDir);
        }
        catch (e) { }
    });
    afterAll(async () => {
        try {
            await promises_1.default.rm(testDir, { recursive: true, force: true });
        }
        catch (e) { }
    });
    describe('SafeFileSystem', () => {
        const sfs = new files_1.SafeFileSystem(testDir);
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
        const cache = new cache_1.ResponseCache(testDir);
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
        const ai = new ai_1.AIClient();
        it('should be instantiated', () => {
            expect(ai).toBeDefined();
        });
    });
});
