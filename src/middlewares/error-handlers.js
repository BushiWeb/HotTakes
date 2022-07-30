import { MulterError } from 'multer';
import mongoose from 'mongoose';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';

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

    return res.status(500).json(errorObject);
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
    if (!(err instanceof JsonWebTokenError)) {
        return next(err);
    }

    const errorObject = {
        error: {
            type: 'JsonWebTokenError',
            name: err.name,
            message: err.message,
        },
    };

    if (err instanceof NotBeforeError) {
        errorObject.error.date = err.date;
    }

    if (err instanceof TokenExpiredError) {
        errorObject.error.expiredAt = err.expiredAt;
    }

    return res.status(401).json(errorObject);
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
}
