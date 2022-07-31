import AuthenticationError from './AuthenticationError.js';

/**
 * Error inherited class to represent unauthorized authentication errors.
 */
export default class UnauthorizedError extends AuthenticationError {
    /**
     * UnauthorizedError constructor.
     * Creates a default message if the message is not given.
     * Calls the parent constructor.
     * Sets the status.
     * @param {string|undefined} message - The errors's message.
     */
    constructor(message) {
        message ||= 'Unauthorized: you must be authenticated to continue';
        super(message);
        this.status = 401;
    }
}
