import { errorFormatter } from '../../src/utils/utils-validation.js';

describe('Validation utils test suite', () => {
    describe('errorFormatter test suite', () => {
        test('Returns the formated error', () => {
            const errorObject = {
                location: 'body',
                msg: 'error message',
                param: 'invalidParam',
                value: 'value',
                nesteErrors: null,
            };
            const expectedResult = {
                location: errorObject.location,
                param: errorObject.param,
                message: errorObject.msg,
            };

            const result = errorFormatter(errorObject);

            expect(result).toStrictEqual(expectedResult);
        });
    });
});
