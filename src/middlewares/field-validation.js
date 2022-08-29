import UserInputValidationError from '../errors/UserInputValidationError.js';
import { createDebugNamespace } from '../logger/logger.js';
import ajv from '../schemas/json-validator.js';
import validator from 'validator';

const validationDebug = createDebugNamespace('hottakes:middleware:validation');

/**
 * Payload validation middleware.
 * Returns a middleware that validates the body against the specified JSON schema. If there is an error, call the next error middleware with a UserInputValidationError.
 * @param {string} schemaName - Name of the schema to uszer for the validation.
 */
export const validatePayload = (schemaName) => {
    validationDebug(`Create the payload validator for the ${schemaName} schema`);
    return (req, res, next) => {
        validationDebug('Validation middleware execution: payload validation');
        const validate = ajv.getSchema(schemaName);

        // Throws an error if the schema doesn't exist
        if (!validate) {
            return next(new Error(`The JSON schema ${schemaName} doesn't exist`));
        }

        // Calls the next middleware if the body is valid
        if (validate(req.body)) {
            return next();
        }

        // Generates a UserInputValidationMiddleware if the body is invalid
        let errors = [];
        for (const error of validate.errors) {
            errors.push({
                property: error.instancePath || undefined,
                message: error.message,
            });
        }
        return next(new UserInputValidationError(errors));
    };
};

/**
 * Id parameter validation middleware. Validates that the received ID is a MongoDB ID.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export const validateIdParameter = (req, res, next) => {
    validationDebug('Validation middleware execution: ID parameter validation');
    if (req.params.id && validator.isMongoId(req.params.id)) {
        return next();
    }

    const error = {
        location: 'query',
        parameter: ':id',
        message: 'The requested ID must be a valid MongoDB ID',
    };

    next(new UserInputValidationError([error]));
};
