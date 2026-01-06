// Simple implementation of context optimization logic
import { aiClient } from './ai';

export interface ContextItem {
    path: string;
    content: string;
    tokens: number;
}

export class ContextManager {
    private maxTokens: number;

    constructor(maxTokens: number = 30000) {
        this.maxTokens = maxTokens;
    }

    async optimize(files: { path: string; content: string }[]): Promise<ContextItem[]> {
        const processing = files.map(async (file) => {
            const tokens = await aiClient.countTokens(file.content);
            return { ...file, tokens };
        });

        const items = await Promise.all(processing);

        // Sort logic could go here (e.g. relevance or recentness)
        // For now, simple greedy fit

        let currentTokens = 0;
        const selected: ContextItem[] = [];

        for (const item of items) {
            if (currentTokens + item.tokens > this.maxTokens) {
                break; // Truncate cleanly for now, could be smarter (summarize)
            }
            selected.push(item);
            currentTokens += item.tokens;
        }

        return selected;
    }
}

export const contextManager = new ContextManager();
