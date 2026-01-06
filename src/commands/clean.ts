import { cli } from '../cli/ui';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

export async function commandClean() {
    const rootDir = process.cwd();
    const cacheDir = path.join(rootDir, '.jpm/cache');
    const backupDir = path.join(rootDir, '.jpm/backups');

    const confirmed = await cli.confirm('Are you sure you want to clean cache and backups? This cannot be undone.');
    if (!confirmed) {
        console.log('Cancelled.');
        return;
    }

    cli.startSpinner('Cleaning up...');

    try {
        // Clean Cache
        try {
            await fs.rm(cacheDir, { recursive: true, force: true });
            await fs.mkdir(cacheDir, { recursive: true });
            logger.debug('Cleaned cache');
        } catch (e) {
            logger.warn('Failed to clean cache');
        }

        // Clean Backups
        try {
            await fs.rm(backupDir, { recursive: true, force: true });
            await fs.mkdir(backupDir, { recursive: true });
            logger.debug('Cleaned backups');
        } catch (e) {
            logger.warn('Failed to clean backups');
        }

        cli.stopSpinner(true, 'Cleanup complete!');
        console.log(' - .jpm/cache cleared');
        console.log(' - .jpm/backups cleared');

    } catch (error: any) {
        cli.stopSpinner(false, 'Cleanup failed');
        throw error;
    }
}
