"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextManager = exports.ContextManager = void 0;
// Simple implementation of context optimization logic
const ai_1 = require("./ai");
class ContextManager {
    maxTokens;
    constructor(maxTokens = 30000) {
        this.maxTokens = maxTokens;
    }
    async optimize(files) {
        const processing = files.map(async (file) => {
            const tokens = await ai_1.aiClient.countTokens(file.content);
            return { ...file, tokens };
        });
        const items = await Promise.all(processing);
        // Sort logic could go here (e.g. relevance or recentness)
        // For now, simple greedy fit
        let currentTokens = 0;
        const selected = [];
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
exports.ContextManager = ContextManager;
exports.contextManager = new ContextManager();
