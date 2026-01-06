"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMasterRules = getMasterRules;
const files_1 = require("./files");
const path_1 = __importDefault(require("path"));
async function getMasterRules(rootDir = process.cwd()) {
    const masterPath = path_1.default.join(rootDir, '.jpm/JPM_MASTER.md');
    try {
        const content = await files_1.fileSystem.readFileSafe(masterPath);
        return content;
    }
    catch (e) {
        return 'No JPM_MASTER.md found. Using defaults.';
    }
}
