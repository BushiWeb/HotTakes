import ForbiddenError from '../../src/errors/ForbiddenError.js';

describe('AuthenticationError test suite', () => {
    describe('Constructor test suite', () => {
        test('The name property should have the right value', () => {
            const error = new ForbiddenError('Error message');
            expect(error.name).toMatch('AuthenticationError');
        });

        test('The message property should have the right value', () => {
            const errorMessage = 'Error message';
            const error = new ForbiddenError(errorMessage);
            expect(error.message).toBe(errorMessage);
        });

        test('The message property should be default message', () => {
            const error = new ForbiddenError();
            expect(error.message).toMatch(/Forbidden/);
        });

        test('The error should have status 403', () => {
            const error = new ForbiddenError();
            expect(error.status).toBe(403);
        });
    });
});
