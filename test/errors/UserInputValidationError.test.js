import UserInputValidationError from '../../src/errors/UserInputValidationError.js';

describe('UserInputValidationError test suite', () => {
    describe('Constructor test suite', () => {
        test('The name property should have the right value', () => {
            const error = new UserInputValidationError([]);
            expect(error.name).toMatch('UserInputValidationError');
        });

        test('The message property should have the right value', () => {
            const errorMessage = 'Error message';
            const error = new UserInputValidationError([], errorMessage);
            expect(error.message).toBe(errorMessage);
        });

        test('The message property should be default message', () => {
            const error = new UserInputValidationError([]);
            expect(error.message).not.toEqual('');
        });

        test('The error property should be the right value', () => {
            const fieldsError = [
                {
                    message: 'Invalid field message',
                    location: 'body',
                },
                {
                    message: 'Missing header',
                    location: 'header',
                },
            ];
            const error = new UserInputValidationError(fieldsError);
            expect(error.errors).toEqual(fieldsError);
        });
    });
});
