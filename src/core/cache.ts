import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export class ResponseCache {
    private cacheDir: string;

    constructor(rootDir: string = process.cwd()) {
        this.cacheDir = path.join(path.resolve(rootDir), '.jpm/cache');
        this.ensureCacheDir();
    }

    private async ensureCacheDir() {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
        } catch (error) {
            // ignore if exists
        }
    }

    private getCacheKey(prompt: string): string {
        return crypto.createHash('md5').update(prompt).digest('hex');
    }

    async get(prompt: string): Promise<string | null> {
        const key = this.getCacheKey(prompt);
        const cachePath = path.join(this.cacheDir, `${key}.json`);

        try {
            const content = await fs.readFile(cachePath, 'utf-8');
            const data = JSON.parse(content);
            // Optional: Check expiry (not implemented yet)
            logger.debug('Cache hit');
            return data.response;
        } catch (e) {
            return null;
        }
    }

    async set(prompt: string, response: string): Promise<void> {
        const key = this.getCacheKey(prompt);
        const cachePath = path.join(this.cacheDir, `${key}.json`);

        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
            await fs.writeFile(
                cachePath,
                JSON.stringify({
                    timestamp: Date.now(),
                    response,
                }),
                'utf-8'
            );
        } catch (e) {
            logger.warn('Failed to write to cache');
        }
    }
}

export const responseCache = new ResponseCache();
