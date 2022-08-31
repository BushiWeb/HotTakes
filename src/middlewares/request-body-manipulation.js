import { createDebugNamespace } from '../logger/logger.js';
import { defaultConfigManager } from '../config/ConfigManager.js';
import { validateStringArgument } from '../utils/utils-functions.js';

const bodyManipulationDebug = createDebugNamespace('hottakes:middleware:bodyManipulation');

/**
 * Returns a middleware that populates the body with properties of an object inside of the body.
 * If the property is a string, then it is parsed first.
 * Depending on the result, it either goes to the next middleware or the next error middleware.
 * To create a middleware that can checks any type of property, we use dependency injection: bodyJsonParse gets the name of the property to parse so that the middleware can use it.
 * If the property doesn't exist, the error handler is called if throwIfUndefined is true, do nothing otherwise.
 * @param {string} propertyName - Name of the property to parse.
 * @param {boolean} [throwIfUndefined=true] - Indicates weather or not to throw an error if the parameter is undefined. Useful if the parameter may not exist.
 */
export const bodyPropertyAssignToBody = (propertyName, throwIfUndefined = true) => {
    bodyManipulationDebug(`Create bodyJsonParse for the ${propertyName} property`);
    return (req, res, next) => {
        bodyManipulationDebug(`Middleware execution: assigning ${propertyName} properties to the body`);
        // Checks that the parameter exists
        if (req.body[propertyName] === undefined && throwIfUndefined) {
            return next(new Error(`The body property ${propertyName} doesn't exist.`));
        }

        // If the parameter is a string, parses it
        if (typeof req.body[propertyName] === 'string' || req.body[propertyName] instanceof String) {
            try {
                req.body[propertyName] = JSON.parse(req.body[propertyName]);
                bodyManipulationDebug(`The ${propertyName} parameter was a string and is now parsed`);
            } catch (error) {
                return next(error);
            }
        }

        // If the parameter is an object, hydrates the body with it's value and deletes it
        if (!!req.body[propertyName] && typeof req.body[propertyName] === 'object') {
            req.body = Object.assign(req.body, req.body[propertyName]);
            delete req.body[propertyName];
            bodyManipulationDebug(`The ${propertyName} parameters content has been assigned to the body`);
        }

        next();
    };
};

/**
 * Sanitizes the body.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export const sanitizeBody = (req, res, next) => {
    try {
        const blackListedStrings = defaultConfigManager.getConfig('payload.sanitization');
        for (const property in req.body) {
            // Don't bother sanitizing numbers, null or booleans
            if (!validateStringArgument(req.body[property])) {
                continue;
            }

            // Remove blacklisted strings
            for (const string of blackListedStrings) {
                req.body[property] = req.body[property].replace(new RegExp(string, 'ig'), '');
            }
        }
        return next();
    } catch (error) {
        return next(error);
    }
};
