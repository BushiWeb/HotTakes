import { validatePayload } from '../../src/middlewares/field-validation';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import UserInputValidationError from '../../src/errors/UserInputValidationError';
import ajv from '../../src/schemas/json-validator.js';

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

describe('validatePayload middleware test suite', () => {
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
