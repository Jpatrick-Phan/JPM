import { cli } from '../cli/ui';
import fs from 'fs/promises';
import path from 'path';

export async function commandRun() {
    cli.showInfo('Step 5: RUN', 'Looking for open tasks...');

    // List tasks
    const tasksDir = '.jpm/storage/tasks';
    const files = await fs.readdir(tasksDir);
    const taskFiles = files.filter(f => f.startsWith('task-') && f.endsWith('.md'));

    if (taskFiles.length === 0) {
        cli.showError('No Tasks', 'No tasks found. Run `jpm split` first.');
        return;
    }

    console.log(`Found ${taskFiles.length} tasks.`);

    // Simulate parallel execution
    cli.startSpinner(`Executing ${taskFiles.length} tasks in parallel...`);

    const results = await Promise.all(taskFiles.map(async (file) => {
        await new Promise(r => setTimeout(r, 2000)); // Simulate work
        return `Completed ${file}`;
    }));

    cli.stopSpinner(true, 'All tasks completed!');
    results.forEach(r => console.log(`✓ ${r}`));
}
