"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseCache = exports.ResponseCache = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
class ResponseCache {
    cacheDir;
    constructor(rootDir = process.cwd()) {
        this.cacheDir = path_1.default.join(path_1.default.resolve(rootDir), '.jpm/cache');
        this.ensureCacheDir();
    }
    async ensureCacheDir() {
        try {
            await promises_1.default.mkdir(this.cacheDir, { recursive: true });
        }
        catch (error) {
            // ignore if exists
        }
    }
    getCacheKey(prompt) {
        return crypto_1.default.createHash('md5').update(prompt).digest('hex');
    }
    async get(prompt) {
        const key = this.getCacheKey(prompt);
        const cachePath = path_1.default.join(this.cacheDir, `${key}.json`);
        try {
            const content = await promises_1.default.readFile(cachePath, 'utf-8');
            const data = JSON.parse(content);
            // Optional: Check expiry (not implemented yet)
            logger_1.logger.debug('Cache hit');
            return data.response;
        }
        catch (e) {
            return null;
        }
    }
    async set(prompt, response) {
        const key = this.getCacheKey(prompt);
        const cachePath = path_1.default.join(this.cacheDir, `${key}.json`);
        try {
            await promises_1.default.mkdir(this.cacheDir, { recursive: true });
            await promises_1.default.writeFile(cachePath, JSON.stringify({
                timestamp: Date.now(),
                response,
            }), 'utf-8');
        }
        catch (e) {
            logger_1.logger.warn('Failed to write to cache');
        }
    }
}
exports.ResponseCache = ResponseCache;
exports.responseCache = new ResponseCache();
