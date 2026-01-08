import fs from 'fs/promises';
import { constants as fsConstants } from 'fs';
import path from 'path';
import ignore from 'ignore';
import { FileSystemError } from '../core/errors';
import { logger } from './logger';

// Define the Ignore type if it's not globally available or imported from 'ignore'
// For the 'ignore' package, the return type of `ignore()` is typically an object
// with methods like `add`, `ignores`, etc. We can define a simple interface for it.
interface Ignore {
    add(pattern: string | string[]): Ignore;
    ignores(pathname: string): boolean;
}

export class SafeFileSystem {
    private rootDir: string;
    private backupDir: string;
    private ig: Ignore;

    constructor(rootDir: string = process.cwd()) {
        this.rootDir = path.resolve(rootDir);
        this.backupDir = path.join(this.rootDir, '.jpm/backups');
        this.ig = ignore() as Ignore;
        this.initIgnore();
    }

    // Renamed init() to initIgnore()
    private async initIgnore() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
            await this.loadGitignore();
        } catch (err) {
            logger.warn(`Failed to initialize SafeFileSystem: ${err}`);
        }
    }

    private async loadGitignore() {
        try {
            const gitignorePath = path.join(this.rootDir, '.gitignore');
            const content = await fs.readFile(gitignorePath, 'utf-8');
            this.ig.add(content);
        } catch (err: any) {
            if (err.code !== 'ENOENT') {
                logger.warn(`Could not load .gitignore: ${err.message}`);
            }
        }
    }

    isSafePath(targetPath: string): boolean {
        const resolvedPath = path.resolve(this.rootDir, targetPath);
        return resolvedPath.startsWith(this.rootDir) && !resolvedPath.includes('..');
    }

    isIgnored(targetPath: string): boolean {
        try {
            const relativePath = path.relative(this.rootDir, targetPath).split(path.sep).join('/');
            return this.ig.ignores(relativePath);
        } catch (error) {
            return false;
        }
    }

    async writeFileSafe(targetPath: string, content: string): Promise<void> {
        if (!this.isSafePath(targetPath)) {
            throw new FileSystemError('Unsafe path detected: ' + targetPath);
        }

        if (this.isIgnored(targetPath)) {
            logger.warn(`Writing to ignored file: ${targetPath}`);
        }

        const absolutePath = path.resolve(this.rootDir, targetPath);
        const dir = path.dirname(absolutePath);

        // Ensure dir exists
        await fs.mkdir(dir, { recursive: true });

        // Backup if exists
        try {
            await fs.access(absolutePath, fsConstants.F_OK);
            await this.backupFile(targetPath);
        } catch (e) {
            // File doesn't exist, no backup needed
        }

        // Write
        try {
            await fs.writeFile(absolutePath, content, 'utf-8');
            logger.info(`Wrote to ${targetPath}`);
        } catch (err: any) {
            throw new FileSystemError(`Write failed: ${err.message}`, targetPath);
        }
    }

    async readFileSafe(targetPath: string): Promise<string> {
        if (!this.isSafePath(targetPath)) {
            throw new FileSystemError('Unsafe path detected: ' + targetPath);
        }
        const absolutePath = path.resolve(this.rootDir, targetPath);
        try {
            return await fs.readFile(absolutePath, 'utf-8');
        } catch (err: any) {
            throw new FileSystemError(`Read failed: ${err.message}`, targetPath);
        }
    }

    private async backupFile(targetPath: string) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = path.basename(targetPath);
        const backupPath = path.join(this.backupDir, `${filename}.${timestamp}.bak`);

        const sourcePath = path.resolve(this.rootDir, targetPath);

        try {
            await fs.copyFile(sourcePath, backupPath);
            logger.debug(`Backed up ${targetPath} to ${backupPath}`);
        } catch (err: any) {
            logger.warn(`Backup failed for ${targetPath}: ${err.message}`);
            // We don't block the write on backup failure, but we log it.
        }
    }
}

export const fileSystem = new SafeFileSystem();
