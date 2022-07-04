import winston from 'winston';
import 'winston-daily-rotate-file';
import expressWinston from 'express-winston';

/*
   Setup the whitelists:
        In testing and development, log the minimum amount of informations for readability.
        In production, log all the usefull informations.
*/
expressWinston.bodyWhitelist = [];
expressWinston.requestWhitelist = [];
expressWinston.responseWhitelist = [];

if (process.env.NODE_ENV === 'production') {
    expressWinston.requestWhitelist.push('url', 'headers', 'method', 'originalUrl', 'query', 'httpVersion');
    expressWinston.responseWhitelist.push('statusCode');
} else {
    expressWinston.requestWhitelist.push('method', 'originalUrl', 'query', 'body');
    expressWinston.responseWhitelist.push('statusCode', 'body');
}

// Format to use for the logging
let loggerFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

/* Create request and error logger transports. Depending on the environment, the transports will be different:
        In testing, it will be done in files in the test folder.
        In production, it will be done in files.
        In development, it will be done in the console.
*/
let requestLoggerTransports = [];
let requestDailyRotateFileOptions = {
    datePattern: 'YYYY-MM-DD',
    filename: 'request-%DATE%.log',
    dirname: './logs/request',
    maxFiles: '14d',
    maxSize: '20m',
    format: loggerFormat,
};
let errorLoggerTransports = [];
let errorDailyRotateFileOptions = {
    datePattern: 'YYYY-MM-DD',
    filename: 'error-%DATE%.log',
    dirname: './logs/error',
    maxFiles: '14d',
    maxSize: '20m',
    format: loggerFormat,
};

if (process.env.NODE_ENV === 'test') {
    requestDailyRotateFileOptions.dirname = './test/logs/request';
    errorDailyRotateFileOptions.dirname = './test/logs/error';
    requestLoggerTransports.push(new winston.transports.DailyRotateFile(requestDailyRotateFileOptions));
    errorLoggerTransports.push(new winston.transports.DailyRotateFile(errorDailyRotateFileOptions));
} else if (process.env.NODE_ENV === 'development') {
    requestLoggerTransports.push(new winston.transports.Console({ format: winston.format.simple() }));
    errorLoggerTransports.push(new winston.transports.Console({ format: winston.format.simple() }));
} else {
    requestLoggerTransports.push(new winston.transports.DailyRotateFile(requestDailyRotateFileOptions));
    errorLoggerTransports.push(new winston.transports.DailyRotateFile(errorDailyRotateFileOptions));
}

// Request logger and it's associated middleware
const requestLogger = winston.createLogger({
    transports: requestLoggerTransports,
});

export const requestLoggerMiddleware = expressWinston.logger({
    winstonInstance: requestLogger,
    meta: true,
    msg: 'HTTP {{req.mehod}} {{req.url}}',
});

// Error logger and it's associated middleware
const errorLogger = winston.createLogger({ transports: errorLoggerTransports });

export const errorLoggerMiddleware = expressWinston.errorLogger({
    winstonInstance: errorLogger,
    meta: true,
    msg: 'Error : {{err.message}}, HTTP {{req.method}} {{req.url}}',
});
