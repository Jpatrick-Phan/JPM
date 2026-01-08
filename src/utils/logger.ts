import winston from 'winston';
import chalk from 'chalk';

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp }) => {
    return `${chalk.gray(timestamp)} [${level}]: ${message}`;
});

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // Default to info, can be 'debug'
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), colorize(), customFormat),
    transports: [
        new winston.transports.Console(),
        // We can add File transports here later if needed
        // new winston.transports.File({ filename: '.jpm/logs/error.log', level: 'error' }),
        // new winston.transports.File({ filename: '.jpm/logs/combined.log' }),
    ],
});
