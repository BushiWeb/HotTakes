import jsonWebToken from 'jsonwebtoken';
import Sauce from '../models/Sauce.js';
import mongoose from 'mongoose';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import ForbiddenError from '../errors/ForbiddenError.js';
import { createDebugNamespace } from '../logger/logger.js';

const authenticationDebug = createDebugNamespace('hottakes:middleware:authentication');

/**
 * Middleware, checks that the user is authenticated while making the request, by checking that the authentication token is valid.
 * Stores the userId in the request object and go to the next middleware if the JsonWebToken and the userId are valid.
 * Go to the next error middleware if there is a problem.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export const checkAuthentication = (req, res, next) => {
    authenticationDebug('Middleware execution: check user authentication');
    try {
        authenticationDebug('Authorization header presence test');
        if (!req.headers.authorization) {
            authenticationDebug('Authorization header missing, throwing an error');
            throw new UnauthorizedError();
        }

        authenticationDebug('JsonWebToken verification');
        const token = req.headers.authorization.split(' ')[1];
        const jwtKey = req.app.get('config').getJwtKey();
        const decodedToken = jsonWebToken.verify(token, jwtKey, {
            algorithms: ['HS256'],
            issuer: 'hottakes-api',
            audience: 'hottakes-front',
        });
        if (!decodedToken.userId) {
            authenticationDebug("JsonWebToken is valid but doesn't contain the userId, throwing an error");
            throw new UnauthorizedError();
        }
        authenticationDebug('Valid JsonWebToken.');
        req.auth = { userId: decodedToken.userId };
        authenticationDebug('Save the userId in the request');
        next();
    } catch (error) {
        return next(error);
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
    authenticationDebug('Middleware execution: sauce ownership checking');
    try {
        const sauce = await Sauce.findById(req.params.id);
        authenticationDebug('Query the sauce from the database');
        if (!sauce) {
            authenticationDebug("The desired sauce doesn't exist, throwing an error");
            throw new mongoose.Error.DocumentNotFoundError(`Can't find the sauce with id ${req.params.id}`);
        }

        authenticationDebug("Check the sauce's userId against the user's user id");
        if (sauce.userId !== req.auth.userId) {
            authenticationDebug("The user doesn't own the sauce, throwing an error");
            throw new ForbiddenError();
        }
        authenticationDebug('The user owns the sauce');

        // Saves the sauce in the request for later use
        req.cache ??= { sauces: {} };
        req.cache.sauces ??= {};
        req.cache.sauces[sauce._id] = sauce;
        authenticationDebug('The sauce is cached');
        next();
    } catch (error) {
        return next(error);
    }
};
