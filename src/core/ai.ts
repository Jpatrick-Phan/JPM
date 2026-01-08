import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import pRetry from 'p-retry';
import { APIError, JPMError } from './errors';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class AIClient {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;
    private requestQueue: Array<() => Promise<void>> = [];
    private processingQueue = false;
    private lastCallTime = 0;
    private readonly rateLevel = 1000; // ms minimum between calls (simple rate limit)

    constructor() {
        if (!config.JPM_API_KEY) {
            logger.warn('JPM_API_KEY is not set. AI features will fail.');
        }
        this.genAI = new GoogleGenerativeAI(config.JPM_API_KEY || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    /**
     * Generates content with exponential backoff retry
     */
    async generateContent(prompt: string): Promise<string> {
        return this.scheduleRequest(async () => {
            return pRetry(
                async () => {
                    try {
                        logger.debug('Calling Gemini API...');
                        const result = await this.model.generateContent(prompt);
                        const response = await result.response;
                        return response.text();
                    } catch (error: any) {
                        logger.error(`AI Call Failed: ${error.message}`);
                        // Map to APIError for consistent handling
                        throw new APIError(error.message, 500); // simplify status
                    }
                },
                {
                    retries: config.JPM_MAX_RETRIES,
                    onFailedAttempt: (error) => {
                        logger.warn(
                            `Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`,
                        );
                    },
                },
            );
        });
    }

    /**
     * Handles streaming response
     */
    async *streamContent(prompt: string): AsyncGenerator<string, void, unknown> {
        // Note: Streaming is harder to seamlessly retry mid-stream,
        // so we usually retry the initial connection.
        try {
            await this.enforceRateLimit();
            const streamingResp = await this.model.generateContentStream(prompt);

            for await (const chunk of streamingResp.stream) {
                const chunkText = chunk.text();
                yield chunkText;
            }
        } catch (error: any) {
            logger.error(`Streaming Error: ${error.message}`);
            throw new APIError(error.message);
        }
    }

    /**
     * Counts tokens for context management
     */
    async countTokens(text: string): Promise<number> {
        try {
            const { totalTokens } = await this.model.countTokens(text);
            return totalTokens;
        } catch (error) {
            logger.error('Token count failed', error);
            return 0; // Fallback
        }
    }

    /**
     * Simple Rate Limiting Queue Scheduler
     */
    private async scheduleRequest<T>(task: () => Promise<T>): Promise<T> {
        await this.enforceRateLimit();
        return task();
    }

    private async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCallTime;

        if (timeSinceLastCall < this.rateLevel) {
            const waitTime = this.rateLevel - timeSinceLastCall;
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
        this.lastCallTime = Date.now();
    }
}

export const aiClient = new AIClient();
