#!/usr/bin/env node
import { cli } from './cli/ui';
import { logger } from './utils/logger';
import { aiClient } from './core/ai';
import { fileSystem } from './utils/files';
import { responseCache } from './core/cache';
import { JPMError } from './core/errors';
import path from 'path';
import fs from 'fs/promises';

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
        if (!command) {
            cli.showInfo('JPM', 'Jatrick Project Manager - TypeScript Edition');
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
                cli.showError('Error', 'Please provide a prompt');
                return;
            }

            try {
                const cached = await responseCache.get(prompt);
                if (cached) {
                    cli.showInfo('Cache Hit', 'Returning cached response');
                    console.log(cached);
                    return;
                }
            } catch (e) {
                logger.warn('Cache check failed');
            }

            cli.startSpinner('Thinking...');
            try {
                const response = await aiClient.generateContent(prompt);
                cli.stopSpinner(true, 'Done!');
                console.log(response);
                await responseCache.set(prompt, response);
            } catch (error: any) {
                cli.stopSpinner(false, 'Failed');
                throw error;
            }
        }

        else if (command === 'init') {
            const cwd = process.cwd();
            const confirmed = await cli.confirm(`Initialize JPM structure in ${cwd}?`);
            if (confirmed) {
                // Determine absolute paths
                const rootDir = process.cwd();

                // Config
                await fileSystem.writeFileSafe(path.join(rootDir, '.jpm/config.json'), JSON.stringify({ version: '1.0' }, null, 2));

                // SafeFileSystem handles dir creation, but we want to ensure .gitignore exists too
                const gitignorePath = path.join(rootDir, '.gitignore');
                try {
                    // Check if .gitignore exists, if not create, if yes append .jpm
                    let content = '';
                    try {
                        content = await fs.readFile(gitignorePath, 'utf-8');
                    } catch (e) { }

                    if (!content.includes('.jpm')) {
                        await fs.appendFile(gitignorePath, '\n.jpm/\n.jpm_backups/\n.jpm_cache/\n');
                        cli.showInfo('Gitignore', 'Added JPM folders to .gitignore');
                    }
                } catch (e) {
                    logger.warn('Failed to update .gitignore');
                }

                // Create storage dirs - strict structure
                await fileSystem.writeFileSafe(path.join(rootDir, '.jpm/storage/prds/.keep'), '');
                await fileSystem.writeFileSafe(path.join(rootDir, '.jpm/storage/epics/.keep'), '');
                await fileSystem.writeFileSafe(path.join(rootDir, '.jpm/storage/tasks/.keep'), '');

                // JPM Master Rule
                const { MASTER_TEMPLATE } = await import('./templates/master');
                await fileSystem.writeFileSafe(path.join(rootDir, '.jpm/JPM_MASTER.md'), MASTER_TEMPLATE);

                cli.showInfo('Success', 'Initialized .jpm in current directory');
            }
        }

        else if (command === 'plan') {
            const { commandPlan } = await import('./commands/plan');
            await commandPlan(args.slice(1));
        }

        else if (command === 'design') {
            const { commandDesign } = await import('./commands/design');
            await commandDesign(args.slice(1));
        }

        else if (command === 'split') {
            const { commandSplit } = await import('./commands/split');
            await commandSplit(args.slice(1));
        }

        else if (command === 'sync') {
            const { commandSync } = await import('./commands/sync');
            await commandSync();
        }

        else if (command === 'run') {
            const { commandRun } = await import('./commands/run');
            await commandRun();
        }

        else if (command === 'clean') {
            const { commandClean } = await import('./commands/clean');
            await commandClean();
        }

        else if (command === 'config') {
            const { commandConfig } = await import('./commands/config');
            await commandConfig();
        }

        else {
            cli.showError('Unknown Command', `Command '${command}' not found.`);
        }

    } catch (error: any) {
        logger.error(error.message);
        if (error.suggestion) {
            cli.showInfo('Suggestion', error.suggestion);
        }
        process.exit(1);
    }
}

main();
