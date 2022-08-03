/**
 * Error inherited class to represent validations errors.
 */
export default class UserInputValidationError extends Error {
    /**
     * ValidationError constructor.
     * Calls the error constructor and sets the name.
     * @param {Object[]} errors - The different validation errors.
     * @param {string|null} [message=null] - Custom error message.
     */
    constructor(errors, message = null) {
        message ||= 'User inputs have invalid values.';
        super(message);
        this.name = 'UserInputValidationError';
        this.errors = errors;
    }
}
