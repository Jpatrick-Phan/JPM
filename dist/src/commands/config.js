"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandConfig = commandConfig;
const ui_1 = require("../cli/ui");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const logger_1 = require("../utils/logger");
async function commandConfig() {
    // Resolve package root (assuming built code is in dist/src/commands)
    // __dirname is dist/src/commands
    // Root is dist/src/commands/../../.. => Project Root
    const packageRoot = path_1.default.resolve(__dirname, '../../../');
    ui_1.cli.showInfo('Configuration', `Opening package root: ${packageRoot}`);
    console.log('You can create/edit your .env file here for global configuration.');
    const platform = process.platform;
    let command = '';
    if (platform === 'win32') {
        command = `start "" "${packageRoot}"`;
    }
    else if (platform === 'darwin') {
        command = `open "${packageRoot}"`;
    }
    else {
        command = `xdg-open "${packageRoot}"`;
    }
    try {
        (0, child_process_1.exec)(command);
    }
    catch (error) {
        logger_1.logger.error(`Failed to open directory: ${error.message}`);
    }
}
