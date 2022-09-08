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
import ConfigManager, { defaultConfigManager } from './config/ConfigManager.js';
import Logger, { morganMiddleware, createDebugNamespace } from './logger/logger.js';
import { contentTypeFilter } from './middlewares/headers.js';
import helmet from 'helmet';

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

/*
 * Store the root folder absolute path in the app.
 * Since we are using ES modules, __dirname is unavailable.
 * by storing it in the app, all middleware will have access to its value.
 */
const appRoot = path.dirname(fileURLToPath(import.meta.url));
app.set('root', appRoot);
appDebug(`Set app root to ${appRoot}`);

// remove X-Powered-By header
app.disable('x-powered-by');

// Add the Morgan middleware to log requests
app.use(morganMiddleware);
appDebug('Use morgan middleware for all routes');

// Filter the Content-Type to only accept multipart/form-data and application/json
app.use(contentTypeFilter);
appDebug('Use content type filter middleware on all routes');

// Add the express.json middleware with it's options
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
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    appDebug({ message: 'CORS Headers set: %o', splat: [res.getHeaders()] });
    next();
});
appDebug('Use the CORS Headers setting middleware on all routes');

// Other headers
app.use(
    helmet.noSniff(),
    helmet.frameguard({ action: 'deny' }),
    helmet.contentSecurityPolicy({ directives: { 'frame-ancestors': 'none' } })
);
appDebug('Use helmet.noSniff to set the X-Content-Type-Options to nosniff');
appDebug('Use helmet.framegard to set the X-Frame-Options to DENY');
appDebug('Use helmet.contentSecurityPpolicy to set the Content-Security-Policy frame-ancestors to none');

// Static routes
const imagesPath = path.join(app.get('root'), '../images');
app.use('/images', express.static(imagesPath, { fallthrough: false }));
appDebug(`Use a static route for the /images endpoint. Serve images from the ${imagesPath} folder`);

// API routes
app.use('/api/auth', userRouter);
appDebug('Use the user router for the /api/auth endpoints');
app.use('/api/sauces', sauceRouter);
appDebug('Use the sauce router for the /api/sauces endpoints');

// Customize 404 errors
app.use((req, res, next) => {
    const error = new Error("Sorry, but we can't find the ressource you're looking for");
    error.status = 404;
    next(error);
});

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
