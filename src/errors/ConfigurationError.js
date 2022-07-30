/**
 * Error inherited class to represent configurations errors.
 */
export default class ConfigurationError extends Error {
    /**
     * ConfigurationError constructor.
     * Calls the error constructor and sets the name.
     * @param {string|undefined} message - The errors's message.
     */
    constructor(message) {
        super(message);
        this.name = 'ConfigurationError';
    }
}
