/**
 * Returns a middleware that parses the body to JSON if it is a string.
 * This middleware checks that the property is a string and parses it if it is the case.
 * Depending on the result, it either goes to the next middleware or the next error middleware.
 * To create a middleware that can checks any type of property, we use dependency injection: bodyJsonParse gets the name of the property to parse so that the middleware can use it.
 * If the property doesn't exist, the error handler is called.
 * @param {string} propertyName - Name of the property to parse.
 */
export const bodyJsonParse = (propertyName) => {
    return (req, res, next) => {
        if (req.body[propertyName] === undefined) {
            next(new Error(`The body property ${propertyName} doesn't exist.`));
        }

        if (typeof req.body[propertyName] === 'string' || req.body[propertyName] instanceof String) {
            req.body[propertyName] = JSON.parse(req.body[propertyName]);
        }

        next();
    };
};
