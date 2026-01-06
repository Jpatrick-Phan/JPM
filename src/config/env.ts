import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { ConfigError } from '../core/errors';
import { logger } from '../utils/logger';

// Load env from local AND global (package root)
const localEnvPath = path.resolve(process.cwd(), '.env');
const globalEnvPath = path.resolve(__dirname, '../../../.env');

// Prioritize local, fallback to global
if (fs.existsSync(globalEnvPath)) {
    dotenv.config({ path: globalEnvPath });
}
if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath, override: true }); // Local overrides global
}

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    JPM_API_KEY: z.string().optional(),
    JPM_MAX_RETRIES: z.coerce.number().default(3),
    JPM_TIMEOUT: z.coerce.number().default(30000), // ms
});

// Validate and export
function loadConfig() {
    try {
        const parsed = envSchema.parse(process.env);
        logger.debug('Configuration loaded successfully');
        return parsed;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missing = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
            throw new ConfigError(`Invalid configuration: ${missing}`);
        }
        throw error;
    }
}

export const config = loadConfig();
