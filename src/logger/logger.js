import winston from 'winston';
import 'winston-daily-rotate-file';
import ConfigManager from '../config/ConfigManager.js';
import process, { exit } from 'node:process';
import debug from 'debug';

/*
    Defines the logging levels.
*/
const levels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    debug: 5,
};

/*
   Decides the maximum logging to show depending on the environment.
   In development, show all logging messages.
   In productions, only show fatal logs, errors and warnings.
   In test, only show fatal logs, errors and warnings.
*/
const level = () => {
    if (ConfigManager.compareEnvironment('development')) {
        return 'debug';
    }

    return 'warn';
};

/*
    Defines the colors to use.
*/
const colors = {
    fatal: 'red bold',
    error: 'red',
    warn: 'yellow',
    info: 'white',
    http: 'cyan',
    debug: 'gray',
};
winston.addColors(colors);

/*
    Defines the format to use for logging.

    printfFormat:
        Formats the message to print.
        Displays the level and the date.
        If the stack property is defined, then it is used as a message, otherwise user the message property.
*/
function printfFormat({ level, message, timestamp, label, stack, ...metadata }) {
    let formatedMessage = `${level}\t${timestamp}\t\t`;

    if (!stack) {
        formatedMessage += label ? `[${label}] ` : '';
        formatedMessage += message;
    } else {
        formatedMessage += '[Error]';
        formatedMessage += ' ' + stack;
    }

    if (metadata && Object.keys(metadata).length > 0) {
        formatedMessage += ' ' + JSON.stringify(metadata);
    }
    return formatedMessage;
}

let format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(printfFormat)
);

/*
    Create transports. Depending on the environment, the transports will be different:
        In testing, it will be done in files in the test folder.
        In production, it will be done in files.
        In development, it will be done in the console.
*/
let loggerTransports = [];
const commonDailyRotateFileTransportsParameters = {
    datePattern: 'YYYY-MM-DD',
    extension: 'log',
    maxSize: '20m',
};

if (ConfigManager.compareEnvironment('test')) {
    loggerTransports.push(
        new winston.transports.DailyRotateFile({
            ...commonDailyRotateFileTransportsParameters,
            filename: 'test-log-%DATE%',
            dirname: './test/temp/logs',
            maxFiles: '1',
        })
    );
} else if (ConfigManager.compareEnvironment('development')) {
    loggerTransports.push(
        new winston.transports.Console({
            format: winston.format.combine(format, winston.format.colorize({ all: true })),
        })
    );
} else {
    loggerTransports.push(
        new winston.transports.DailyRotateFile({
            ...commonDailyRotateFileTransportsParameters,
            filename: 'log-%DATE%',
            dirname: './logs',
            zippedArchive: true,
        })
    );
}

/*
    Creates the logger and use it to print other logs.
*/
const Logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports: loggerTransports,
    exitOnError: true,
});

/*
    Handles uncaught exceptions and unhandled rejections.
*/
process.on('uncaughtException', (error, origin) => {
    Logger.fatal(error);
    exit(1);
});

export default Logger;
