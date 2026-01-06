#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ui_1 = require("./cli/ui");
const logger_1 = require("./utils/logger");
const ai_1 = require("./core/ai");
const files_1 = require("./utils/files");
const cache_1 = require("./core/cache");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    try {
        if (!command) {
            ui_1.cli.showInfo('JPM', 'Jatrick Project Manager - TypeScript Edition');
            console.log('Usage: jpm <command> [args]');
            console.log('Commands:');
            console.log('  plan <feature>  Create a PRD');
            console.log('  design <feat>   Create Architecture');
            console.log('  split <feat>    Decompose to Tasks');
            console.log('  ask <prompt>    Chat with AI');
            console.log('  sync            Sync to GitHub');
            console.log('  run             Execute tasks');
            console.log('  clean           Clean cache and backups');
            console.log('  init            Initialize JPM');
            return;
        }
        if (command === 'ask') {
            const prompt = args.slice(1).join(' ');
            if (!prompt) {
                ui_1.cli.showError('Error', 'Please provide a prompt');
                return;
            }
            try {
                const cached = await cache_1.responseCache.get(prompt);
                if (cached) {
                    ui_1.cli.showInfo('Cache Hit', 'Returning cached response');
                    console.log(cached);
                    return;
                }
            }
            catch (e) {
                logger_1.logger.warn('Cache check failed');
            }
            ui_1.cli.startSpinner('Thinking...');
            try {
                const response = await ai_1.aiClient.generateContent(prompt);
                ui_1.cli.stopSpinner(true, 'Done!');
                console.log(response);
                await cache_1.responseCache.set(prompt, response);
            }
            catch (error) {
                ui_1.cli.stopSpinner(false, 'Failed');
                throw error;
            }
        }
        else if (command === 'init') {
            const cwd = process.cwd();
            const confirmed = await ui_1.cli.confirm(`Initialize JPM structure in ${cwd}?`);
            if (confirmed) {
                // Determine absolute paths
                const rootDir = process.cwd();
                // Config
                await files_1.fileSystem.writeFileSafe(path_1.default.join(rootDir, '.jpm/config.json'), JSON.stringify({ version: '1.0' }, null, 2));
                // SafeFileSystem handles dir creation, but we want to ensure .gitignore exists too
                const gitignorePath = path_1.default.join(rootDir, '.gitignore');
                try {
                    // Check if .gitignore exists, if not create, if yes append .jpm
                    let content = '';
                    try {
                        content = await promises_1.default.readFile(gitignorePath, 'utf-8');
                    }
                    catch (e) { }
                    if (!content.includes('.jpm')) {
                        await promises_1.default.appendFile(gitignorePath, '\n.jpm/\n.jpm_backups/\n.jpm_cache/\n');
                        ui_1.cli.showInfo('Gitignore', 'Added JPM folders to .gitignore');
                    }
                }
                catch (e) {
                    logger_1.logger.warn('Failed to update .gitignore');
                }
                // Create storage dirs - strict structure
                await files_1.fileSystem.writeFileSafe(path_1.default.join(rootDir, '.jpm/storage/prds/.keep'), '');
                await files_1.fileSystem.writeFileSafe(path_1.default.join(rootDir, '.jpm/storage/epics/.keep'), '');
                await files_1.fileSystem.writeFileSafe(path_1.default.join(rootDir, '.jpm/storage/tasks/.keep'), '');
                // JPM Master Rule
                const { MASTER_TEMPLATE } = await Promise.resolve().then(() => __importStar(require('./templates/master')));
                await files_1.fileSystem.writeFileSafe(path_1.default.join(rootDir, '.jpm/JPM_MASTER.md'), MASTER_TEMPLATE);
                ui_1.cli.showInfo('Success', 'Initialized .jpm in current directory');
            }
        }
        else if (command === 'plan') {
            const { commandPlan } = await Promise.resolve().then(() => __importStar(require('./commands/plan')));
            await commandPlan(args.slice(1));
        }
        else if (command === 'design') {
            const { commandDesign } = await Promise.resolve().then(() => __importStar(require('./commands/design')));
            await commandDesign(args.slice(1));
        }
        else if (command === 'split') {
            const { commandSplit } = await Promise.resolve().then(() => __importStar(require('./commands/split')));
            await commandSplit(args.slice(1));
        }
        else if (command === 'sync') {
            const { commandSync } = await Promise.resolve().then(() => __importStar(require('./commands/sync')));
            await commandSync();
        }
        else if (command === 'run') {
            const { commandRun } = await Promise.resolve().then(() => __importStar(require('./commands/run')));
            await commandRun();
        }
        else if (command === 'clean') {
            const { commandClean } = await Promise.resolve().then(() => __importStar(require('./commands/clean')));
            await commandClean();
        }
        else if (command === 'config') {
            const { commandConfig } = await Promise.resolve().then(() => __importStar(require('./commands/config')));
            await commandConfig();
        }
        else {
            ui_1.cli.showError('Unknown Command', `Command '${command}' not found.`);
        }
    }
    catch (error) {
        logger_1.logger.error(error.message);
        if (error.suggestion) {
            ui_1.cli.showInfo('Suggestion', error.suggestion);
        }
        process.exit(1);
    }
}
main();
