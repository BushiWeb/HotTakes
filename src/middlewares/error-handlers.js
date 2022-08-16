import { MulterError } from 'multer';
import mongoose from 'mongoose';
import jsonWebToken from 'jsonwebtoken';
import UserInputValidationError from '../../src/errors/UserInputValidationError.js';
import { join } from 'node:path';
import { unlink } from 'node:fs';
import { createDebugNamespace } from '../logger/logger.js';
import Logger from '../logger/logger.js';

const errorDebug = createDebugNamespace('hottakes:middleware:error');

/**
 * Middleware handling file deletion in case of an error.
 * If a file is saved during a request and that request throws an error, deletes the file.
 * @param {*} err - Error thrown by a middleware.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export function deleteFiles(err, req, res, next) {
    errorDebug('Error middleware execution: file deletion');
    let files = [];
    if (req.file) {
        files.push(req.file);
    }

    if (req.files) {
        if (Array.isArray(req.files)) {
            files = req.files;
        } else {
            for (const fileName in req.files) {
                files.push(...req.files[fileName]);
            }
        }
    }

    files.forEach((file) => {
        const imagePath = join(req.app.get('root'), '../images', file.filename);
        unlink(imagePath, () => {});
        errorDebug(`File ${imagePath} has been deleted`);
    });

    next(err);
}

/**
 * Multer error handling middleware.
 * It catches and handles MulterErrors.
 * If the error is not a MulterError, then it calls the next error middleware.
 * @param {*} err - Error thrown by a middleware.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export function multerErrorHandler(err, req, res, next) {
    if (!(err instanceof MulterError)) {
        return next(err);
    }

    errorDebug('Error middleware execution: Multer errors handling');

    const error = {
        name: err.name,
        message: err.message,
        code: err.code,
        field: err.field,
    };

    res.status(400).json({
        error,
    });

    Logger.error({ message: err, label: 'Multer Error' });
}

/**
 * Mongoose error handling middleware.
 * It catches and handles MongooseError.
 * If the error is not a MongooseError, then it calls the next error middleware.
 * @param {*} err - Error thrown by a middleware.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export function mongooseErrorHandler(err, req, res, next) {
    if (!(err instanceof mongoose.Error)) {
        return next(err);
    }

    errorDebug('Error middleware execution: Mongoose errors handling');

    const error = {
        type: 'MongooseError',
        name: err.name,
        message: err.message,
    };

    if (
        err instanceof mongoose.Error.CastError ||
        err instanceof mongoose.Error.ValidationError ||
        err instanceof mongoose.Error.ValidatorError
    ) {
        res.status(400).json({ error });
    } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(404).json({ error });
    } else {
        res.status(500).json({ error });
    }

    Logger.error({ message: err, label: 'Mongoose Error' });
}

/**
 * JsonWebToken error handling middleware.
 * It catches and handles errors thrown by JsonWebToken.
 * If the error is not a JsonWebToken error, then it calls the next error middleware.
 * @param {*} err - Error thrown by a middleware.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export function jwtErrorHandler(err, req, res, next) {
    if (!(err instanceof jsonWebToken.JsonWebTokenError)) {
        return next(err);
    }

    errorDebug('Error middleware execution: Json Web Token errors handling');

    const error = {
        type: 'JsonWebTokenError',
        name: err.name,
        message: err.message,
    };

    if (err instanceof jsonWebToken.NotBeforeError) {
        error.date = err.date;
    }

    if (err instanceof jsonWebToken.TokenExpiredError) {
        error.expiredAt = err.expiredAt;
    }

    res.status(401).json({ error });

    Logger.error({ message: err, label: 'JsonWebToken Error' });
}

/**
 * User input validation error handling middleware.
 * It catches and handles UserInputValidationError.
 * If the error is not a UserInputValidationError error, then it calls the next error middleware.
 * @param {*} err - Error thrown by a middleware.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export function userInputValidationErrorHandler(err, req, res, next) {
    if (!(err instanceof UserInputValidationError)) {
        return next(err);
    }

    errorDebug('Error middleware execution: user inputs validation errors handling');

    const error = {
        name: err.name,
        message: err.message,
        fields: err.errors,
    };

    res.status(400).json({ error });

    Logger.error({ message: err, label: 'User input validation error' });
}

/**
 * Default error handling middleware. It catches the errors thrown by the different middlewares and handles them.
 * Last error handler to be used.
 * Sets the response status to 500 by default, or to the value of the status property of the err parameter.
 * Sets the return value with the value of the err parameter.
 * @param {*} err - Error thrown by a middleware.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export function defaultErrorHandler(err, req, res, next) {
    errorDebug('Error middleware execution: default error handler');
    let status = 500;
    let error;
    let loggedError;

    if (err instanceof Error) {
        error = {
            message: err.message,
            name: err.name,
        };
        loggedError = err;
    } else {
        error = { ...err };
        loggedError = err.message;
    }

    if (err.status !== undefined) {
        status = err.status;
    }

    delete error.status;
    res.status(status).json({ error });

    Logger.error(loggedError);
}
