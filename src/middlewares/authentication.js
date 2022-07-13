import jsonWebToken from 'jsonwebtoken';
import Sauce from '../models/Sauce.js';

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
 * Middleware, checks that the user owns the request subject.
 * Fetches the subject from the database and compares it's userId with the request's userId.
 * Go to the next middleware if the user owns the subject, and to the next error middleware otherwise.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export const checkOwnership = async (req, res, next) => {
    try {
        const sauce = await Sauce.findById(req.params.id).exec();
        if (!sauce) {
            throw { message: "The ressource you're requesting doesn't exist", status: 404 };
        }

        if (sauce.userId !== req.auth.userId) {
            throw { message: "Invalid request, you dont't have the right to access this ressource", status: 403 };
        }

        next();
    } catch (error) {
        return next(error);
    }
};
