"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandRun = commandRun;
const ui_1 = require("../cli/ui");
const promises_1 = __importDefault(require("fs/promises"));
async function commandRun() {
    ui_1.cli.showInfo('Step 5: RUN', 'Looking for open tasks...');
    // List tasks
    const tasksDir = '.jpm/storage/tasks';
    const files = await promises_1.default.readdir(tasksDir);
    const taskFiles = files.filter((f) => f.startsWith('task-') && f.endsWith('.md'));
    if (taskFiles.length === 0) {
        ui_1.cli.showError('No Tasks', 'No tasks found. Run `jpm split` first.');
        return;
    }
    console.log(`Found ${taskFiles.length} tasks.`);
    // Simulate parallel execution
    ui_1.cli.startSpinner(`Executing ${taskFiles.length} tasks in parallel...`);
    const results = await Promise.all(taskFiles.map(async (file) => {
        await new Promise((r) => setTimeout(r, 2000)); // Simulate work
        return `Completed ${file}`;
    }));
    ui_1.cli.stopSpinner(true, 'All tasks completed!');
    results.forEach((r) => console.log(`✓ ${r}`));
}
