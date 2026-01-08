import { cli } from '../cli/ui';
import { aiClient } from '../core/ai';
import { fileSystem } from '../utils/files';
import { ARCH_PROMPT } from '../templates/prompts';
import { JPMError } from '../core/errors';
import path from 'path';
import { getMasterRules } from '../utils/master';

export async function commandDesign(args: string[]) {
    const featureName = args.join(' ');
    const cleanName = featureName.toLowerCase().replace(/\s+/g, '-');

    if (!featureName) {
        cli.showError('Missing Argument', 'Please provide a feature name (must match a PRD)');
        return;
    }

    const rootDir = process.cwd();
    const prdPath = path.join(rootDir, '.jpm/storage/prds/prd-' + cleanName + '.md');

    try {
        const prdContent = await fileSystem.readFileSafe(prdPath);
        cli.showInfo('Step 2: DESIGN', `Generating Architecture for: ${featureName}`);

        cli.startSpinner('Architecting solution...');

        // Generate
        const masterRules = await getMasterRules(rootDir);
        let prompt = ARCH_PROMPT.replace('{prdContent}', prdContent);
        prompt = prompt.replace('{masterRules}', masterRules);

        const archContent = await aiClient.generateContent(prompt);

        cli.stopSpinner(true, 'Architecture Designed!');

        // Save
        const archPath = path.join(rootDir, '.jpm/storage/epics/arch-' + cleanName + '.md');
        await fileSystem.writeFileSafe(archPath, archContent);

        cli.showInfo('Artifact Saved', path.relative(rootDir, archPath));
        console.log('Use `jpm split <feature-name>` to break this down into tasks.');
    } catch (error: any) {
        cli.stopSpinner(false, 'Design failed');
        if (error.code === 'ENOENT' || error.message.includes('Read failed')) {
            throw new JPMError(
                `PRD not found at ${prdPath}. Please run 'jpm plan ${featureName}' first.`,
            );
        }
        throw error;
    }
}
