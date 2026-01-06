import { fileSystem } from './files';
import path from 'path';

export async function getMasterRules(rootDir: string = process.cwd()): Promise<string> {
    const masterPath = path.join(rootDir, '.jpm/JPM_MASTER.md');
    try {
        const content = await fileSystem.readFileSafe(masterPath);
        return content;
    } catch (e) {
        return 'No JPM_MASTER.md found. Using defaults.';
    }
}
