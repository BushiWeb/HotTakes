import AuthenticationError from './AuthenticationError.js';

/**
 * Error inherited class to represent forbidden authentication errors.
 */
export default class ForbiddenError extends AuthenticationError {
    /**
     * ForbiddenError constructor.
     * Creates a default message if the message is not given.
     * Calls the parent constructor.
     * Sets the status.
     * @param {string|undefined} message - The errors's message.
     */
    constructor(message) {
        message ||= "Forbidden: you don't have the right to access this ressource";
        super(message);
        this.status = 403;
    }
}
