import winston from 'winston';
import 'winston-daily-rotate-file';
import ConfigManager from '../config/ConfigManager.js';

// Logging levels
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

// Associate a color to each level
const colors = {
    fatal: 'red bold',
    error: 'red',
    warn: 'yellow',
    info: 'white',
    http: 'cyan',
    debug: 'gray',
};
winston.addColors(colors);

// Format to use for the logging
let format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.printf(({ level, message, timestamp, label, ...metadata }) => {
        let formatedMessage = `${level}\t${timestamp}\t\t`;
        formatedMessage += label ? `[${label}] ` : '';
        formatedMessage += message;
        formatedMessage += ' ' + (metadata && Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : '');
        return formatedMessage;
    })
);

/*
    Create request and error logger transports. Depending on the environment, the transports will be different:
        In testing, it will be done in files in the test folder.
        In production, it will be done in files.
        In development, it will be done in the console.
*/
let loggerTransports = [];

if (ConfigManager.compareEnvironment('test')) {
    loggerTransports.push(
        new winston.transports.DailyRotateFile({
            datePattern: 'YYYY-MM-DD',
            filename: 'test-log-%DATE%',
            extension: 'log',
            dirname: './test/temp/logs',
            maxFiles: '1',
            maxSize: '20m',
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
            datePattern: 'YYYY-MM-DD',
            filename: 'log-%DATE%',
            extension: 'log',
            dirname: './logs',
            maxSize: '20m',
            zippedArchive: true,
        })
    );
}

// Logger creation
const Logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports: loggerTransports,
});

export default Logger;
