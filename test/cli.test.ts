import { exec } from 'child_process';
import path from 'path';

const cliPath = path.join(__dirname, '../src/index.ts');

function runCLI(args: string): Promise<{ stdout: string; stderr: string; code: number | null }> {
    return new Promise((resolve) => {
        // Use ts-node to run the source directly without build dependency
        // Need to ensure ts-node is executable or use npx
        // Assuming ts-node is in node_modules/.bin
        const command = `npx ts-node "${cliPath}" ${args}`;

        exec(command, (error, stdout, stderr) => {
            resolve({
                stdout,
                stderr,
                code: error ? error.code || 1 : 0
            });
        });
    });
}

describe('CLI Integration', () => {
    // Increase timeout for spawning processes
    jest.setTimeout(30000);

    it('should show version with -v', async () => {
        const { stdout } = await runCLI('-v');
        expect(stdout).toMatch(/v\d+\.\d+\.\d+/);
    });

    it('should show version with --version', async () => {
        const { stdout } = await runCLI('--version');
        expect(stdout).toMatch(/v\d+\.\d+\.\d+/);
    });

    it('should show help with -h', async () => {
        const { stdout } = await runCLI('-h');
        expect(stdout).toContain('Usage: jpm');
        expect(stdout).toContain('Options:');
    });

    it('should show help when no command provided', async () => {
        const { stdout } = await runCLI('');
        expect(stdout).toContain('Usage: jpm');
    });
});
