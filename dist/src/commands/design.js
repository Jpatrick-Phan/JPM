"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandDesign = commandDesign;
const ui_1 = require("../cli/ui");
const ai_1 = require("../core/ai");
const files_1 = require("../utils/files");
const prompts_1 = require("../templates/prompts");
const errors_1 = require("../core/errors");
const path_1 = __importDefault(require("path"));
const master_1 = require("../utils/master");
async function commandDesign(args) {
    const featureName = args.join(' ');
    const cleanName = featureName.toLowerCase().replace(/\s+/g, '-');
    if (!featureName) {
        ui_1.cli.showError('Missing Argument', 'Please provide a feature name (must match a PRD)');
        return;
    }
    const rootDir = process.cwd();
    const prdPath = path_1.default.join(rootDir, '.jpm/storage/prds/prd-' + cleanName + '.md');
    try {
        const prdContent = await files_1.fileSystem.readFileSafe(prdPath);
        ui_1.cli.showInfo('Step 2: DESIGN', `Generating Architecture for: ${featureName}`);
        ui_1.cli.startSpinner('Architecting solution...');
        // Generate
        const masterRules = await (0, master_1.getMasterRules)(rootDir);
        let prompt = prompts_1.ARCH_PROMPT.replace('{prdContent}', prdContent);
        prompt = prompt.replace('{masterRules}', masterRules);
        const archContent = await ai_1.aiClient.generateContent(prompt);
        ui_1.cli.stopSpinner(true, 'Architecture Designed!');
        // Save
        const archPath = path_1.default.join(rootDir, '.jpm/storage/epics/arch-' + cleanName + '.md');
        await files_1.fileSystem.writeFileSafe(archPath, archContent);
        ui_1.cli.showInfo('Artifact Saved', path_1.default.relative(rootDir, archPath));
        console.log('Use `jpm split <feature-name>` to break this down into tasks.');
    }
    catch (error) {
        ui_1.cli.stopSpinner(false, 'Design failed');
        if (error.code === 'ENOENT' || error.message.includes('Read failed')) {
            throw new errors_1.JPMError(`PRD not found at ${prdPath}. Please run 'jpm plan ${featureName}' first.`);
        }
        throw error;
    }
}
