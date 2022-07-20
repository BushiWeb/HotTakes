/**
 * Returns a middleware that populates the body with properties of an object inside of the body.
 * If the property is a string, then it is parsed first.
 * Depending on the result, it either goes to the next middleware or the next error middleware.
 * To create a middleware that can checks any type of property, we use dependency injection: bodyJsonParse gets the name of the property to parse so that the middleware can use it.
 * If the property doesn't exist, the error handler is called.
 * @param {string} propertyName - Name of the property to parse.
 */
export const bodyJsonParse = (propertyName) => {
    return (req, res, next) => {
        // Checks that the parameter exists
        if (req.body[propertyName] === undefined) {
            return next(new Error(`The body property ${propertyName} doesn't exist.`));
        }

        // If the parameter is a string, parses it
        if (typeof req.body[propertyName] === 'string' || req.body[propertyName] instanceof String) {
            try {
                req.body[propertyName] = JSON.parse(req.body[propertyName]);
            } catch (error) {
                return next(error);
            }
        }

        // If the parameter is an object, hydrates the body with it's value and deletes it
        if (!!req.body[propertyName] && typeof req.body[propertyName] === 'object') {
            req.body = Object.assign(req.body, req.body[propertyName]);
            delete req.body[propertyName];
        }

        next();
    };
};
