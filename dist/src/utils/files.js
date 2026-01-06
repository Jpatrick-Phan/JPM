"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileSystem = exports.SafeFileSystem = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const ignore_1 = __importDefault(require("ignore"));
const errors_1 = require("../core/errors");
const logger_1 = require("./logger");
class SafeFileSystem {
    rootDir;
    backupDir;
    ig;
    constructor(rootDir = process.cwd()) {
        this.rootDir = path_1.default.resolve(rootDir);
        this.backupDir = path_1.default.join(this.rootDir, '.jpm/backups');
        this.ig = (0, ignore_1.default)();
        this.initIgnore();
    }
    // Renamed init() to initIgnore()
    async initIgnore() {
        try {
            await promises_1.default.mkdir(this.backupDir, { recursive: true });
            await this.loadGitignore();
        }
        catch (err) {
            logger_1.logger.warn(`Failed to initialize SafeFileSystem: ${err}`);
        }
    }
    async loadGitignore() {
        try {
            const gitignorePath = path_1.default.join(this.rootDir, '.gitignore');
            const content = await promises_1.default.readFile(gitignorePath, 'utf-8');
            this.ig.add(content);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                logger_1.logger.warn(`Could not load .gitignore: ${err.message}`);
            }
        }
    }
    isSafePath(targetPath) {
        const resolvedPath = path_1.default.resolve(this.rootDir, targetPath);
        return resolvedPath.startsWith(this.rootDir) && !resolvedPath.includes('..');
    }
    isIgnored(targetPath) {
        try {
            const relativePath = path_1.default.relative(this.rootDir, targetPath)
                .split(path_1.default.sep).join('/');
            return this.ig.ignores(relativePath);
        }
        catch (error) {
            return false;
        }
    }
    async writeFileSafe(targetPath, content) {
        if (!this.isSafePath(targetPath)) {
            throw new errors_1.FileSystemError('Unsafe path detected: ' + targetPath);
        }
        if (this.isIgnored(targetPath)) {
            logger_1.logger.warn(`Writing to ignored file: ${targetPath}`);
        }
        const absolutePath = path_1.default.resolve(this.rootDir, targetPath);
        const dir = path_1.default.dirname(absolutePath);
        // Ensure dir exists
        await promises_1.default.mkdir(dir, { recursive: true });
        // Backup if exists
        try {
            await promises_1.default.access(absolutePath, fs_1.constants.F_OK);
            await this.backupFile(targetPath);
        }
        catch (e) {
            // File doesn't exist, no backup needed
        }
        // Write
        try {
            await promises_1.default.writeFile(absolutePath, content, 'utf-8');
            logger_1.logger.info(`Wrote to ${targetPath}`);
        }
        catch (err) {
            throw new errors_1.FileSystemError(`Write failed: ${err.message}`, targetPath);
        }
    }
    async readFileSafe(targetPath) {
        if (!this.isSafePath(targetPath)) {
            throw new errors_1.FileSystemError('Unsafe path detected: ' + targetPath);
        }
        const absolutePath = path_1.default.resolve(this.rootDir, targetPath);
        try {
            return await promises_1.default.readFile(absolutePath, 'utf-8');
        }
        catch (err) {
            throw new errors_1.FileSystemError(`Read failed: ${err.message}`, targetPath);
        }
    }
    async backupFile(targetPath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = path_1.default.basename(targetPath);
        const backupPath = path_1.default.join(this.backupDir, `${filename}.${timestamp}.bak`);
        const sourcePath = path_1.default.resolve(this.rootDir, targetPath);
        try {
            await promises_1.default.copyFile(sourcePath, backupPath);
            logger_1.logger.debug(`Backed up ${targetPath} to ${backupPath}`);
        }
        catch (err) {
            logger_1.logger.warn(`Backup failed for ${targetPath}: ${err.message}`);
            // We don't block the write on backup failure, but we log it.
        }
    }
}
exports.SafeFileSystem = SafeFileSystem;
exports.fileSystem = new SafeFileSystem();
