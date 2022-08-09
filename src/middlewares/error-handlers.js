import { MulterError } from 'multer';
import mongoose from 'mongoose';
import jsonWebToken from 'jsonwebtoken';
import UserInputValidationError from '../../src/errors/UserInputValidationError.js';
import { join } from 'node:path';
import { unlink } from 'node:fs';
import debug from 'debug';
import Logger from '../logger/logger.js';

const errorDebug = debug('hottakes:error');

/**
 * Middleware handling file deletion in case of an error.
 * If a file is saved during a request and that request throws an error, deletes the file.
 * @param {*} err - Error thrown by a middleware.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export function deleteFiles(err, req, res, next) {
    errorDebug('File deletion error middleware');
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
        errorDebug(`Delete file ${imagePath}`);
        unlink(imagePath, () => {});
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

    errorDebug('Multer error handler middleware');

    res.status(400).json({
        error: {
            name: err.name,
            message: err.message,
            code: err.code,
            field: err.field,
        },
    });
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

    errorDebug('Mongoose error handler middleware');

    const errorObject = {
        error: {
            type: 'MongooseError',
            name: err.name,
            message: err.message,
        },
    };

    if (
        err instanceof mongoose.Error.CastError ||
        err instanceof mongoose.Error.ValidationError ||
        err instanceof mongoose.Error.ValidatorError
    ) {
        return res.status(400).json(errorObject);
    }

    if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(404).json(errorObject);
    }

    res.status(500).json(errorObject);
    Logger.error({ message: err, label: 'Mongoose internal error' });
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

    errorDebug('JsonWebToken error handler middleware');

    const errorObject = {
        error: {
            type: 'JsonWebTokenError',
            name: err.name,
            message: err.message,
        },
    };

    if (err instanceof jsonWebToken.NotBeforeError) {
        errorObject.error.date = err.date;
    }

    if (err instanceof jsonWebToken.TokenExpiredError) {
        errorObject.error.expiredAt = err.expiredAt;
    }

    return res.status(401).json(errorObject);
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

    errorDebug('User input validation error handler middleware');

    const errorObject = {
        error: {
            name: err.name,
            message: err.message,
            fields: err.errors,
        },
    };

    return res.status(400).json(errorObject);
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
    errorDebug('Default error handler middleware');

    let status = 500;

    if (err instanceof Error) {
        err = {
            message: err.message,
            name: err.name,
            status: err.status || undefined,
        };
    }

    if (err.status !== undefined) {
        status = err.status;
        delete err.status;
    }

    res.status(status).json({ error: err });

    if (status >= 500) {
        Logger.error(err);
    }
}
