import { cli } from '../cli/ui';
import path from 'path';
import { exec } from 'child_process';
import { logger } from '../utils/logger';

export async function commandConfig() {
    // Resolve package root (assuming built code is in dist/src/commands)
    // __dirname is dist/src/commands
    // Root is dist/src/commands/../../.. => Project Root
    const packageRoot = path.resolve(__dirname, '../../../');

    cli.showInfo('Configuration', `Opening package root: ${packageRoot}`);
    console.log('You can create/edit your .env file here for global configuration.');

    const platform = process.platform;
    let command = '';

    if (platform === 'win32') {
        command = `start "" "${packageRoot}"`;
    } else if (platform === 'darwin') {
        command = `open "${packageRoot}"`;
    } else {
        command = `xdg-open "${packageRoot}"`;
    }

    try {
        exec(command);
    } catch (error: any) {
        logger.error(`Failed to open directory: ${error.message}`);
    }
}
