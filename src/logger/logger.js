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

/* Create request logger transports. Depending on the environment, the transports will be different:
        In testing, it will be done in files in the test folder.
        In production, it will be done in files.
        In development, it will be done in the console.
*/
let requestLoggerTransports = [];
let loggerFormat = winston.format.combine(
    winston.format.label({ label: 'Request log' }),
    winston.format.timestamp(),
    winston.format.json()
);
let dailyRotateFileOptions = {
    datePattern: 'YYYY-MM-DD-HH',
    filename: 'request-%DATE%.log',
    dirname: './logs/request',
    maxFiles: '14d',
    maxSize: '20m',
    format: loggerFormat,
};

if (process.env.NODE_ENV === 'test') {
    dailyRotateFileOptions.dirname = './test/logs/request';
    requestLoggerTransports.push(new winston.transports.DailyRotateFile(dailyRotateFileOptions));
} else if (process.env.NODE_ENV === 'development') {
    requestLoggerTransports.push(new winston.transports.Console({ format: winston.format.simple() }));
} else {
    requestLoggerTransports.push(new winston.transports.DailyRotateFile(dailyRotateFileOptions));
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
