"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = exports.CLI = void 0;
const ora_1 = __importDefault(require("ora"));
const boxen_1 = __importDefault(require("boxen"));
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
class CLI {
    spinner;
    constructor() {
        this.spinner = (0, ora_1.default)();
    }
    startSpinner(text) {
        this.spinner.text = text;
        this.spinner.start();
    }
    updateSpinner(text) {
        this.spinner.text = text;
    }
    stopSpinner(success = true, text) {
        if (success) {
            this.spinner.succeed(text);
        }
        else {
            this.spinner.fail(text);
        }
    }
    showError(title, message) {
        console.log((0, boxen_1.default)(chalk_1.default.red.bold(message), {
            title: title,
            titleAlignment: 'center',
            padding: 1,
            borderColor: 'red',
            borderStyle: 'round',
        }));
    }
    showInfo(title, message) {
        console.log((0, boxen_1.default)(chalk_1.default.blue(message), {
            title: title,
            titleAlignment: 'center',
            padding: 1,
            borderColor: 'blue',
            borderStyle: 'round',
        }));
    }
    async confirm(message, defaultVal = true) {
        // Stop spinner before interacting
        const wasSpinning = this.spinner.isSpinning;
        if (wasSpinning)
            this.spinner.stop();
        const result = await inquirer_1.default.prompt([
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
    async promptInput(message, defaultVal) {
        const result = await inquirer_1.default.prompt([
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
exports.CLI = CLI;
exports.cli = new CLI();
