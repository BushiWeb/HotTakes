import jsonWebToken from 'jsonwebtoken';

/**
 * Middleware, checks that the user is authenticated while making the request, by checking that the authentication token is valid.
 * Stores the userId in the request object.
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
        return next({ message: 'Invalid request, you must be authenticated.', status: 401, error });
    }
};
