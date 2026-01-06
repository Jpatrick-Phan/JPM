"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandClean = commandClean;
const ui_1 = require("../cli/ui");
const logger_1 = require("../utils/logger");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function commandClean() {
    const rootDir = process.cwd();
    const cacheDir = path_1.default.join(rootDir, '.jpm/cache');
    const backupDir = path_1.default.join(rootDir, '.jpm/backups');
    const confirmed = await ui_1.cli.confirm('Are you sure you want to clean cache and backups? This cannot be undone.');
    if (!confirmed) {
        console.log('Cancelled.');
        return;
    }
    ui_1.cli.startSpinner('Cleaning up...');
    try {
        // Clean Cache
        try {
            await promises_1.default.rm(cacheDir, { recursive: true, force: true });
            await promises_1.default.mkdir(cacheDir, { recursive: true });
            logger_1.logger.debug('Cleaned cache');
        }
        catch (e) {
            logger_1.logger.warn('Failed to clean cache');
        }
        // Clean Backups
        try {
            await promises_1.default.rm(backupDir, { recursive: true, force: true });
            await promises_1.default.mkdir(backupDir, { recursive: true });
            logger_1.logger.debug('Cleaned backups');
        }
        catch (e) {
            logger_1.logger.warn('Failed to clean backups');
        }
        ui_1.cli.stopSpinner(true, 'Cleanup complete!');
        console.log(' - .jpm/cache cleared');
        console.log(' - .jpm/backups cleared');
    }
    catch (error) {
        ui_1.cli.stopSpinner(false, 'Cleanup failed');
        throw error;
    }
}
