import { validateStringArgument } from '../../src/utils/utils-functions.js';

describe('Fuctions utils test suite', () => {
    describe('validateStringArgument test suite', () => {
        test('Returns true if the argument is a string primitive', () => {
            const argument = 'String';
            expect(validateStringArgument(argument)).toBe(true);
        });

        test('Returns true if the argument is a string object', () => {
            const argument = new String('String');
            expect(validateStringArgument(argument)).toBe(true);
        });

        test('Returns false if the argument is not a string', () => {
            const argument = true;
            expect(validateStringArgument(argument)).toBe(false);
        });
    });
});
