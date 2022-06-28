/**
 * Formats the validation error message. Creates a more readable version of the error and hides the value of the field, for security reasons.
 * @param {Object} error
 * @param {string} error.location - Location of the invalid parameter.
 * @param {string} error.msg - Error message.
 * @param {string} error.param - Name of the invalid parameter.
 * @param {string} error.value - Value of the parameter.
 * @param nestedErrors - Nested errors.
 * @returns Returns an object containing the location, the parameter name and the message.
 */
export const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    return {
        location: location,
        param: param,
        message: msg,
    };
};
