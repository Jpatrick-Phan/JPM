"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandSplit = commandSplit;
const ui_1 = require("../cli/ui");
const ai_1 = require("../core/ai");
const files_1 = require("../utils/files");
const prompts_1 = require("../templates/prompts");
const errors_1 = require("../core/errors");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const master_1 = require("../utils/master");
async function commandSplit(args) {
    const featureName = args.join(' ');
    const cleanName = featureName.toLowerCase().replace(/\s+/g, '-');
    if (!featureName) {
        ui_1.cli.showError('Missing Argument', 'Please provide a feature name (must match an Architecture)');
        return;
    }
    const rootDir = process.cwd();
    const archPath = path_1.default.join(rootDir, '.jpm/storage/epics/arch-' + cleanName + '.md');
    try {
        const archContent = await files_1.fileSystem.readFileSafe(archPath);
        ui_1.cli.showInfo('Step 3: SPLIT', `Decomposing Architecture for: ${featureName}`);
        ui_1.cli.startSpinner('Breaking down tasks...');
        // Generate
        const masterRules = await (0, master_1.getMasterRules)(rootDir);
        let prompt = prompts_1.TASK_PROMPT.replace('{archContent}', archContent);
        prompt = prompt.replace('{masterRules}', masterRules);
        const rawResponse = await ai_1.aiClient.generateContent(prompt);
        // Parse JSON with regex extraction
        let tasks = [];
        const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            ui_1.cli.stopSpinner(false, 'No JSON array found in response');
            console.log('Raw output:', rawResponse);
            return;
        }
        try {
            tasks = JSON.parse(jsonMatch[0]);
        }
        catch (e) {
            ui_1.cli.stopSpinner(false, 'Failed to parse extracted JSON');
            console.log('Extracted:', jsonMatch[0]);
            return;
        }
        ui_1.cli.stopSpinner(true, `Generated ${tasks.length} tasks!`);
        // Save individual tasks
        for (const [index, task] of tasks.entries()) {
            const id = crypto_1.default.randomUUID().split('-')[0];
            const taskFilename = `task-${id}-${cleanName}-step${index + 1}.md`;
            const taskContent = `---
id: ${id}
title: ${task.title}
complexity: ${task.complexity}
files: ${JSON.stringify(task.file_paths)}
status: open
---
# Task: ${task.title}

${task.description}
`;
            await files_1.fileSystem.writeFileSafe(path_1.default.join(rootDir, `.jpm/storage/tasks/${taskFilename}`), taskContent);
            console.log(`- Created ${taskFilename}`);
        }
        console.log('');
        ui_1.cli.showInfo('Success', 'Tasks saved to .jpm/storage/tasks/');
        console.log('Use `jpm run` to execute them.');
    }
    catch (error) {
        ui_1.cli.stopSpinner(false, 'Split failed');
        if (error.code === 'ENOENT' || error.message.includes('Read failed')) {
            throw new errors_1.JPMError(`Architecture not found at ${archPath}. Please run 'jpm design ${featureName}' first.`);
        }
        throw error;
    }
}
