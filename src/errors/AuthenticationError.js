/**
 * Error inherited class to represent authentication errors.
 */
export default class AuthenticationError extends Error {
    /**
     * ConfigurationError constructor.
     * Calls the error constructor and sets the name.
     * @param {string|undefined} message - The errors's message.
     */
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
    }
}
