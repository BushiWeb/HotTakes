import AuthenticationError from '../../src/errors/AuthenticationError.js';

describe('AuthenticationError test suite', () => {
    describe('Constructor test suite', () => {
        test('The name property should have the right value', () => {
            const error = new AuthenticationError('Error message');
            expect(error.name).toMatch('AuthenticationError');
        });

        test('The message property should have the right value', () => {
            const errorMessage = 'Error message';
            const error = new AuthenticationError(errorMessage);
            expect(error.message).toBe(errorMessage);
        });

        test('The message property should be an empty string if not set', () => {
            const error = new AuthenticationError();
            expect(error.message).toBe('');
        });
    });
});
