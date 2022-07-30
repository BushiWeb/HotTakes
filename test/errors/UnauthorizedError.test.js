import UnauthorizedError from '../../src/errors/UnauthorizedError.js';

describe('AuthenticationError test suite', () => {
    describe('Constructor test suite', () => {
        test('The name property should have the right value', () => {
            const error = new UnauthorizedError('Error message');
            expect(error.name).toMatch('AuthenticationError');
        });

        test('The message property should have the right value', () => {
            const errorMessage = 'Error message';
            const error = new UnauthorizedError(errorMessage);
            expect(error.message).toBe(errorMessage);
        });

        test('The message property should be default message', () => {
            const error = new UnauthorizedError();
            expect(error.message).toMatch(/Unauthorized/);
        });

        test('The error should have status 401', () => {
            const error = new UnauthorizedError();
            expect(error.status).toBe(401);
        });
    });
});
