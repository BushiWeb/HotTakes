import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mongoDBConnect } from './utils/utils-database.js';
import userRouter from './routes/user-routes.js';
import sauceRouter from './routes/sauce-routes.js';
import {
    defaultErrorHandler,
    multerErrorHandler,
    mongooseErrorHandler,
    jwtErrorHandler,
    userInputValidationErrorHandler,
    deleteFiles,
} from './middlewares/error-handlers.js';
import ConfigManager from './config/ConfigManager.js';
import { defaultConfigManager } from './config/ConfigManager.js';
import Logger, { morganMiddleware, createDebugNamespace } from './logger/logger.js';

const appDebug = createDebugNamespace('hottakes:app');

const app = express();
appDebug('App initialization');

// Create a configuration manager, export it and store it in the app
app.set('config', defaultConfigManager);
appDebug('Set default configuration manager in app');

// Only connect to mongoDB if we are not testing
if (!ConfigManager.compareEnvironment('test')) {
    mongoDBConnect();
} else {
    Logger.info('Testing environment, no database connection required.');
}

/* Store the root folder absolute path in the app.
 * Since we are using ES modules, __dirname is unavailable.
 * by storing it in the app, all middleware will have access to its value.
 */
const appRoot = path.dirname(fileURLToPath(import.meta.url));
app.set('root', appRoot);
appDebug(`Set app root to ${appRoot}`);

app.use(morganMiddleware);
appDebug('Use morgan middleware for all routes');

let expressJsonOptions = {};

try {
    expressJsonOptions.limit = defaultConfigManager.getConfig('payload.maxSize');
    appDebug(`JSON payload heavier than ${expressJsonOptions.limit} will be rejected`);
} catch (error) {
    Logger.error(error);
    Logger.warn("Couldn't set the payload max size. Use the express default value instead");
}

app.use(express.json(expressJsonOptions));
appDebug({ message: 'Use express.json middleware for all routes, with options %o', splat: [expressJsonOptions] });

// CORS Headers settings
app.use((req, res, next) => {
    appDebug('Starting CORS Headers setting middleware');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    appDebug({ message: 'CORS Headers set: %o', splat: [res.getHeaders()] });
    next();
});
appDebug('Use the CORS Headers setting middleware on all routes');

// Static routes
const imagesPath = path.join(app.get('root'), '../images');
app.use('/images', express.static(imagesPath, { fallthrough: false }));
appDebug(`Use a static route for the /images endpoint. Serve images from the ${imagesPath} folder`);

// API routes
app.use('/api/auth', userRouter);
appDebug('Use the user router for the /api/auth endpoints');
app.use('/api/sauces', sauceRouter);
appDebug('Use the sauce router for the /api/sauces endpoints');

// Error handling
app.use(deleteFiles);
appDebug('Use the deleteFiles middleware when handling errors');
app.use(
    jwtErrorHandler,
    mongooseErrorHandler,
    multerErrorHandler,
    userInputValidationErrorHandler,
    defaultErrorHandler
);
appDebug(
    'Use the error handling middleware for JsonWebTokens, Mongoose, Multer, User input validation and other errors'
);

export default app;
