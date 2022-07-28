import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mongoDBConnect } from './utils/utils-database.js';
import userRouter from './routes/user-routes.js';
import sauceRouter from './routes/sauce-routes.js';
import { errorHandler } from './middlewares/error-handler.js';
import { requestLoggerMiddleware, errorLoggerMiddleware } from './logger/logger.js';
import ConfigManager from './config/ConfigManager.js';
import { defaultConfigManager } from './config/ConfigManager.js';

const app = express();

// Create a configuration manager, export it and store it in the app
app.set('config', defaultConfigManager);

// Only connect to mongoDB if we are not testing
if (!ConfigManager.compareEnvironment('test')) {
    mongoDBConnect();
} else {
    console.log('Testing environment, no database connection required.');
}

/* Store the root folder absolute path in the app.
 * Since we are using ES modules, __dirname is unavailable.
 * by storing it in the app, all middleware will have access to its value.
 */
app.set('root', path.dirname(fileURLToPath(import.meta.url)));

app.use(express.json());

// CORS Headers settings
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Request logger
app.use(requestLoggerMiddleware);

// Static routes
app.use('/images', express.static(path.join(app.get('root'), '../images'), { fallthrough: false }));

// API routes
app.use('/api/auth', userRouter);
app.use('/api/sauces', sauceRouter);

// Error handling
app.use(errorLoggerMiddleware);
app.use(errorHandler);

export default app;
