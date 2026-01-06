"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errors_1 = require("../core/errors");
const logger_1 = require("../utils/logger");
// Load env from local AND global (package root)
const localEnvPath = path_1.default.resolve(process.cwd(), '.env');
const globalEnvPath = path_1.default.resolve(__dirname, '../../../.env');
// Prioritize local, fallback to global
if (fs_1.default.existsSync(globalEnvPath)) {
    dotenv_1.default.config({ path: globalEnvPath });
}
if (fs_1.default.existsSync(localEnvPath)) {
    dotenv_1.default.config({ path: localEnvPath, override: true }); // Local overrides global
}
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    JPM_API_KEY: zod_1.z.string().optional(),
    JPM_MAX_RETRIES: zod_1.z.coerce.number().default(3),
    JPM_TIMEOUT: zod_1.z.coerce.number().default(30000), // ms
});
// Validate and export
function loadConfig() {
    try {
        const parsed = envSchema.parse(process.env);
        logger_1.logger.debug('Configuration loaded successfully');
        return parsed;
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const missing = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
            throw new errors_1.ConfigError(`Invalid configuration: ${missing}`);
        }
        throw error;
    }
}
exports.config = loadConfig();
