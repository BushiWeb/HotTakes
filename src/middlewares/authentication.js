import jsonWebToken from 'jsonwebtoken';

/**
 * Middleware, checks that the user is authenticated while making the request, by checking that the authentication token is valid.
 * Stores the userId in the request object and go to the next middleware if the JsonWebToken and the userId are valid.
 * Go to the next error middleware if there is a problem.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export const checkAuthentication = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jsonWebToken.verify(token, 'RANDOM_SECRET_KEY');
        if (!decodedToken.userId) {
            throw "The token is valid but doesn't contain the required informations";
        }
        req.auth = { userId: decodedToken.userId };
        next();
    } catch (error) {
        return next({ message: 'Invalid request, you must be authenticated', status: 401, error });
    }
};

/**
 * Returns a middleware checking that the user owns the request subject.
 * This middleware fetches the subject from the database and compares it's userId with the request's userId.
 * Depending on the result, it either goes to the next middleware or the next error middleware.
 * To create a middleware that can checks any type of model, we use dependency injection: checkOwnership gets the name of the model to use and imports it, so that the middleware can use it.
 * @param {string} modelName - Name of the file containing the model to use for checking. The file should be stored in the models folder.
 */
export const checkOwnership = async (modelName) => {
    let model;
    try {
        const module = await import(`../models/${modelName}.js`);
        model = module.default;
    } catch (error) {
        model = new Error(error.message);
        model.name = 'Model import error';
    }

    return async (req, res, next) => {
        try {
            if (model instanceof Error) {
                throw model;
            }

            const document = await model.findById(req.params.id).exec();
            if (!document) {
                throw { message: "The ressource you're requesting doesn't exist", status: 404 };
            }

            if (document.userId !== req.auth.userId) {
                throw { message: "Invalid request, you dont't have the right to access this ressource", status: 403 };
            }

            next();
        } catch (error) {
            return next(error);
        }
    };
};
