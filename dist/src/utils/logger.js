"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const chalk_1 = __importDefault(require("chalk"));
const { combine, timestamp, printf, colorize } = winston_1.default.format;
const customFormat = printf(({ level, message, timestamp }) => {
    return `${chalk_1.default.gray(timestamp)} [${level}]: ${message}`;
});
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info', // Default to info, can be 'debug'
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), colorize(), customFormat),
    transports: [
        new winston_1.default.transports.Console(),
        // We can add File transports here later if needed
        // new winston.transports.File({ filename: '.jpm/logs/error.log', level: 'error' }),
        // new winston.transports.File({ filename: '.jpm/logs/combined.log' }),
    ],
});
