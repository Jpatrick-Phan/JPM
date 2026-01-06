"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandPlan = commandPlan;
const ui_1 = require("../cli/ui");
const ai_1 = require("../core/ai");
const files_1 = require("../utils/files");
const prompts_1 = require("../templates/prompts");
const path_1 = __importDefault(require("path"));
const master_1 = require("../utils/master");
async function commandPlan(args) {
    const featureName = args.join(' ');
    if (!featureName) {
        ui_1.cli.showError('Missing Argument', 'Please provide a feature name (e.g., "jpm plan User Auth")');
        return;
    }
    ui_1.cli.showInfo('Step 1: PLAN', `Generating PRD for: ${featureName}`);
    // 1. Generate Content
    ui_1.cli.startSpinner('Consulting with AI Product Manager...');
    try {
        const rootDir = process.cwd();
        // Assuming getMasterRules is available in scope
        const masterRules = await (0, master_1.getMasterRules)(rootDir);
        let prompt = prompts_1.PRD_PROMPT.replace('{userInput}', featureName);
        prompt = prompt.replace('{masterRules}', masterRules);
        const prdContent = await ai_1.aiClient.generateContent(prompt);
        ui_1.cli.stopSpinner(true, 'PRD Generated!');
        // 2. Save File
        const filename = `prd-${featureName.toLowerCase().replace(/\s+/g, '-')}.md`;
        const filePath = path_1.default.join(rootDir, '.jpm/storage/prds', filename);
        await files_1.fileSystem.writeFileSafe(filePath, prdContent);
        console.log(''); // newline
        ui_1.cli.showInfo('Artifact Saved', path_1.default.relative(rootDir, filePath));
        console.log('Use `jpm design <feature-name>` to proceed to Architecture.');
    }
    catch (error) {
        ui_1.cli.stopSpinner(false, 'Planning failed');
        throw error;
    }
}
