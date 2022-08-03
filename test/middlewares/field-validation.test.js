import { validateFields } from '../../src/middlewares/field-validation';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import { Result } from 'express-validator';
import { mockResultError } from '../mocks/express-validator-mocks.js';
import UserInputValidationError from '../../src/errors/UserInputValidationError';

const mockValidationResultThrow = jest.spyOn(Result.prototype, 'throw');

const request = mockRequest({
    email: 'test@email.com',
    password: 'P@55w0r$',
});
const response = mockResponse();
const next = mockNext();

beforeEach(() => {
    mockValidationResultThrow.mockReset();
    response.status.mockClear();
    response.json.mockClear();
    next.mockClear();
});

describe('validateFields test suite', () => {
    test('Calls the next function if no validation error is generated', () => {
        mockValidationResultThrow.mockImplementation();

        validateFields(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
    });

    test('Calls the next function with an error containing the status 400 if the validation fails', () => {
        const errorMessage = 'Validation error message';
        const validationError = mockResultError(errorMessage);

        mockValidationResultThrow.mockImplementation(() => {
            throw validationError;
        });

        validateFields(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(UserInputValidationError);
    });
});
