import AuthenticationError from './AuthenticationError.js';

/**
 * Error inherited class to represent forbidden authentication errors.
 */
export default class ForbiddenError extends AuthenticationError {
    /**
     * ConfigurationError constructor.
     * Calls the error constructor and sets the name.
     * @param {string|undefined} message - The errors's message.
     */
    constructor(message) {
        if (!message) {
            message = "Forbidden: you don't have the right to access this ressource";
        }
        super(message);
        this.status = 403;
    }
}
