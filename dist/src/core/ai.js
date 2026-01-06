"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiClient = exports.AIClient = void 0;
const generative_ai_1 = require("@google/generative-ai");
const p_retry_1 = __importDefault(require("p-retry"));
const errors_1 = require("./errors");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class AIClient {
    genAI;
    model;
    requestQueue = [];
    processingQueue = false;
    lastCallTime = 0;
    rateLevel = 1000; // ms minimum between calls (simple rate limit)
    constructor() {
        if (!env_1.config.JPM_API_KEY) {
            logger_1.logger.warn("JPM_API_KEY is not set. AI features will fail.");
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(env_1.config.JPM_API_KEY || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
    /**
     * Generates content with exponential backoff retry
     */
    async generateContent(prompt) {
        return this.scheduleRequest(async () => {
            return (0, p_retry_1.default)(async () => {
                try {
                    logger_1.logger.debug('Calling Gemini API...');
                    const result = await this.model.generateContent(prompt);
                    const response = await result.response;
                    return response.text();
                }
                catch (error) {
                    logger_1.logger.error(`AI Call Failed: ${error.message}`);
                    // Map to APIError for consistent handling
                    throw new errors_1.APIError(error.message, 500); // simplify status
                }
            }, {
                retries: env_1.config.JPM_MAX_RETRIES,
                onFailedAttempt: (error) => {
                    logger_1.logger.warn(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`);
                },
            });
        });
    }
    /**
     * Handles streaming response
     */
    async *streamContent(prompt) {
        // Note: Streaming is harder to seamlessly retry mid-stream, 
        // so we usually retry the initial connection.
        try {
            await this.enforceRateLimit();
            const streamingResp = await this.model.generateContentStream(prompt);
            for await (const chunk of streamingResp.stream) {
                const chunkText = chunk.text();
                yield chunkText;
            }
        }
        catch (error) {
            logger_1.logger.error(`Streaming Error: ${error.message}`);
            throw new errors_1.APIError(error.message);
        }
    }
    /**
     * Counts tokens for context management
     */
    async countTokens(text) {
        try {
            const { totalTokens } = await this.model.countTokens(text);
            return totalTokens;
        }
        catch (error) {
            logger_1.logger.error('Token count failed', error);
            return 0; // Fallback
        }
    }
    /**
     * Simple Rate Limiting Queue Scheduler
     */
    async scheduleRequest(task) {
        await this.enforceRateLimit();
        return task();
    }
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCallTime;
        if (timeSinceLastCall < this.rateLevel) {
            const waitTime = this.rateLevel - timeSinceLastCall;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this.lastCallTime = Date.now();
    }
}
exports.AIClient = AIClient;
exports.aiClient = new AIClient();
