import ConfigurationError from '../../src/errors/ConfigurationError.js';

describe('ConfigurationError test suite', () => {
    describe('Constructor test suite', () => {
        test('The name property should have the right value', () => {
            const error = new ConfigurationError('Error message');
            expect(error.name).toMatch('Configuration access error');
        });

        test('The message property should have the right value', () => {
            const errorMessage = 'Error message';
            const error = new ConfigurationError(errorMessage);
            expect(error.message).toBe(errorMessage);
        });

        test('The message property should be an empty string if not set', () => {
            const error = new ConfigurationError();
            expect(error.message).toBe('');
        });
    });
});
