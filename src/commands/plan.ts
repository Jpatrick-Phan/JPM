import { cli } from '../cli/ui';
import { aiClient } from '../core/ai';
import { fileSystem } from '../utils/files';
import { PRD_PROMPT } from '../templates/prompts';
import { logger } from '../utils/logger';
import path from 'path';
import { getMasterRules } from '../utils/master';

export async function commandPlan(args: string[]) {
    const featureName = args.join(' ');

    if (!featureName) {
        cli.showError('Missing Argument', 'Please provide a feature name (e.g., "jpm plan User Auth")');
        return;
    }

    cli.showInfo('Step 1: PLAN', `Generating PRD for: ${featureName}`);

    // 1. Generate Content
    cli.startSpinner('Consulting with AI Product Manager...');
    try {
        const rootDir = process.cwd();
        // Assuming getMasterRules is available in scope
        const masterRules = await getMasterRules(rootDir);

        let prompt = PRD_PROMPT.replace('{userInput}', featureName);
        prompt = prompt.replace('{masterRules}', masterRules);

        const prdContent = await aiClient.generateContent(prompt);

        cli.stopSpinner(true, 'PRD Generated!');

        // 2. Save File
        const filename = `prd-${featureName.toLowerCase().replace(/\s+/g, '-')}.md`;
        const filePath = path.join(rootDir, '.jpm/storage/prds', filename);

        await fileSystem.writeFileSafe(filePath, prdContent);

        console.log(''); // newline
        cli.showInfo('Artifact Saved', path.relative(rootDir, filePath));
        console.log('Use `jpm design <feature-name>` to proceed to Architecture.');

    } catch (error: any) {
        cli.stopSpinner(false, 'Planning failed');
        throw error;
    }
}
