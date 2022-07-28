import jsonWebToken from 'jsonwebtoken';
import Sauce from '../models/Sauce.js';
import mongoose from 'mongoose';

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
        const jwtKey = req.app.get('config').getJwtKey();
        const decodedToken = jsonWebToken.verify(token, jwtKey);
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
 * Middleware checking that the user owns the sauce.
 * Fetches the subject from the database and compares it's userId with the request's userId.
 * Depending on the result, it either goes to the next middleware or the next error middleware
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export const checkOwnership = async (req, res, next) => {
    try {
        const sauce = await Sauce.findById(req.params.id);
        if (!sauce) {
            throw new mongoose.Error.DocumentNotFoundError(`Can't find the sauce with id ${req.params.id}`);
        }

        if (sauce.userId !== req.auth.userId) {
            throw { message: "Invalid request, you don't have the right to access this ressource", status: 403 };
        }

        // Saves the sauce in the request for later use
        req.cache ??= { sauces: {} };
        req.cache.sauces ??= {};
        req.cache.sauces[sauce._id] = sauce;
        next();
    } catch (error) {
        return next(error);
    }
};
