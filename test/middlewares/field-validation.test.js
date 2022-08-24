import { validateFields, validatePayload } from '../../src/middlewares/field-validation';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import { Result } from 'express-validator';
import { mockResultError } from '../mocks/express-validator-mocks.js';
import UserInputValidationError from '../../src/errors/UserInputValidationError';
import ajv from '../../src/schemas/json-validator.js';

const mockValidationResultThrow = jest.spyOn(Result.prototype, 'throw');
const testSchemaName = 'test';
ajv.addSchema(
    {
        type: 'object',
        properties: {
            p1: {
                type: 'string',
            },
            p2: {
                type: 'integer',
            },
        },
        required: ['p1', 'p2'],
    },
    testSchemaName
);

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
    request.body = {};
});

afterAll(() => {
    response.status.mockRestore();
    response.json.mockRestore();
    next.mockRestore();
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

describe.only('validatePayload middleware test suite', () => {
    test('Calls the next function if the body is valid', () => {
        request.body = {
            p1: 'test',
            p2: 3,
        };
        validatePayload(testSchemaName)(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
    });

    test("Calls the next function with an error if the schema doesn't exist", () => {
        validatePayload('undefinedSchema')(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    test('Calls the next function with a UserInputValidationError if the body is not valid', () => {
        request.body = {
            p2: '3',
        };
        validatePayload(testSchemaName)(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(UserInputValidationError);
    });
});
