import AuthenticationError from './AuthenticationError.js';

/**
 * Error inherited class to represent unauthorized authentication errors.
 */
export default class UnauthorizedError extends AuthenticationError {
    /**
     * ConfigurationError constructor.
     * Calls the error constructor and sets the name.
     * @param {string|undefined} message - The errors's message.
     */
    constructor(message) {
        message ||= 'Unauthorized: you must be authenticated to continue';
        super(message);
        this.status = 401;
    }
}
