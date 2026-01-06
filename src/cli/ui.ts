import ora, { Ora } from 'ora';
import boxen from 'boxen';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { logger } from '../utils/logger';

export class CLI {
    private spinner: Ora;

    constructor() {
        this.spinner = ora();
    }

    startSpinner(text: string) {
        this.spinner.text = text;
        this.spinner.start();
    }

    updateSpinner(text: string) {
        this.spinner.text = text;
    }

    stopSpinner(success: boolean = true, text?: string) {
        if (success) {
            this.spinner.succeed(text);
        } else {
            this.spinner.fail(text);
        }
    }

    showError(title: string, message: string) {
        console.log(
            boxen(chalk.red.bold(message), {
                title: title,
                titleAlignment: 'center',
                padding: 1,
                borderColor: 'red',
                borderStyle: 'round',
            })
        );
    }

    showInfo(title: string, message: string) {
        console.log(
            boxen(chalk.blue(message), {
                title: title,
                titleAlignment: 'center',
                padding: 1,
                borderColor: 'blue',
                borderStyle: 'round',
            })
        );
    }

    async confirm(message: string, defaultVal: boolean = true): Promise<boolean> {
        // Stop spinner before interacting
        const wasSpinning = this.spinner.isSpinning;
        if (wasSpinning) this.spinner.stop();

        const result = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'value',
                message: message,
                default: defaultVal,
            },
        ]);

        // Resume spinner if it was spinning? Usually not needed after a prompt.
        // if (wasSpinning) this.spinner.start();

        return result.value;
    }

    async promptInput(message: string, defaultVal?: string): Promise<string> {
        const result = await inquirer.prompt([
            {
                type: 'input',
                name: 'value',
                message: message,
                default: defaultVal,
            },
        ]);
        return result.value;
    }
}

export const cli = new CLI();
