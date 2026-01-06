import { cli } from '../cli/ui';
import { aiClient } from '../core/ai';
import { fileSystem } from '../utils/files';
import { TASK_PROMPT } from '../templates/prompts';
import { JPMError } from '../core/errors';
import crypto from 'crypto';
import path from 'path';
import { getMasterRules } from '../utils/master';

export async function commandSplit(args: string[]) {
    const featureName = args.join(' ');
    const cleanName = featureName.toLowerCase().replace(/\s+/g, '-');

    if (!featureName) {
        cli.showError('Missing Argument', 'Please provide a feature name (must match an Architecture)');
        return;
    }

    const rootDir = process.cwd();
    const archPath = path.join(rootDir, '.jpm/storage/epics/arch-' + cleanName + '.md');

    try {
        const archContent = await fileSystem.readFileSafe(archPath);
        cli.showInfo('Step 3: SPLIT', `Decomposing Architecture for: ${featureName}`);

        cli.startSpinner('Breaking down tasks...');

        // Generate
        const masterRules = await getMasterRules(rootDir);
        let prompt = TASK_PROMPT.replace('{archContent}', archContent);
        prompt = prompt.replace('{masterRules}', masterRules);

        const rawResponse = await aiClient.generateContent(prompt);

        // Parse JSON with regex extraction
        let tasks = [];
        const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            cli.stopSpinner(false, 'No JSON array found in response');
            console.log('Raw output:', rawResponse);
            return;
        }

        try {
            tasks = JSON.parse(jsonMatch[0]);
        } catch (e) {
            cli.stopSpinner(false, 'Failed to parse extracted JSON');
            console.log('Extracted:', jsonMatch[0]);
            return;
        }

        cli.stopSpinner(true, `Generated ${tasks.length} tasks!`);

        // Save individual tasks
        for (const [index, task] of tasks.entries()) {
            const id = crypto.randomUUID().split('-')[0];
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
            await fileSystem.writeFileSafe(path.join(rootDir, `.jpm/storage/tasks/${taskFilename}`), taskContent);
            console.log(`- Created ${taskFilename}`);
        }

        console.log('');
        cli.showInfo('Success', 'Tasks saved to .jpm/storage/tasks/');
        console.log('Use `jpm run` to execute them.');

    } catch (error: any) {
        cli.stopSpinner(false, 'Split failed');
        if (error.code === 'ENOENT' || error.message.includes('Read failed')) {
            throw new JPMError(`Architecture not found at ${archPath}. Please run 'jpm design ${featureName}' first.`);
        }
        throw error;
    }
}
