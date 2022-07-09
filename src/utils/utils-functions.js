/**
 * Checks if the argument is a string or not.
 * @param {*} argument - Argument to check.
 * @returns {boolean} Returns true if the argument is a string, and false otherwise.
 */
export const validateStringArgument = (argument) => {
    if (typeof argument !== 'string' && !(argument instanceof String)) {
        return false;
    }

    return true;
};
