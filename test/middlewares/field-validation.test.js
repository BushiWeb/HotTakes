import { validateFields } from '../../src/middlewares/field-validation';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import { Result } from 'express-validator';
import { mockResultError } from '../mocks/express-validator-mocks.js';

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
        expect(response.status).not.toHaveBeenCalled();
        expect(response.json).not.toHaveBeenCalled();
    });

    test('Sends a response containing status 400 and an error if the validation fails, the next function is not calld', () => {
        const errorMessage = 'Validation error message';
        const validationError = mockResultError(errorMessage);

        mockValidationResultThrow.mockImplementation(() => {
            throw validationError;
        });

        validateFields(request, response, next);

        expect(response.status).toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalled();
        expect(response.json.mock.calls[0][0]).toHaveProperty('error');
        expect(response.json.mock.calls[0][0].error).toHaveProperty('message');
        expect(response.json.mock.calls[0][0].error.message).toBe(errorMessage);
        expect(next).not.toHaveBeenCalled();
    });
});
