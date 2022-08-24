import UserInputValidationError from '../errors/UserInputValidationError.js';
import { createDebugNamespace } from '../logger/logger.js';
import ajv from '../schemas/json-validator.js';

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
                property: error.instancePath,
                message: error.message,
            });
        }
        return next(new UserInputValidationError(errors));
    };
};
