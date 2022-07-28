import { MulterError } from 'multer';
import { errorHandler } from '../../src/middlewares/error-handlers.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';

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
});

describe('Error handler test suite', () => {
    test('Sends a response containing status 500 and the error object as JSON', () => {
        const error = { message: 'Error message' };

        errorHandler(error, request, response, next);

        expect(response.status).toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalled();
        expect(response.json).toHaveBeenCalledWith({ error });
    });

    test('Sends a response containing custom status, and the error object without the status', () => {
        const error = { message: 'Error message', status: 404 };

        errorHandler(error, request, response, next);

        expect(response.status).toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalled();
        expect(response.json).toHaveBeenCalledWith({
            error: {
                message: error.message,
            },
        });
    });

    test('Sends a response containing status 500 and a message in a JSON object if the error is an instance of error', () => {
        const error = new Error('Error message');

        errorHandler(error, request, response, next);

        expect(response.status).toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalled();
        expect(response.json.mock.calls[0][0]).toHaveProperty('error');
        expect(response.json.mock.calls[0][0].error).toHaveProperty('message');
    });

    test('Sends a response containing status 400 and a message in a JSON object if the error is an instance of MulterError', () => {
        const error = new MulterError('CODE', 'fieldName');
        error.message = 'Error message';

        errorHandler(error, request, response, next);

        expect(response.status).toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalled();
        expect(response.json).toHaveBeenCalledWith({
            error: {
                message: error.message,
                code: error.code,
                name: error.name,
                field: error.field,
            },
        });
    });

    test('Sends a response containing status 400 and a message in a JSON object if the error is an instance of MulterError, but with no field', () => {
        const error = new MulterError('CODE');
        error.message = 'Error message';

        errorHandler(error, request, response, next);

        expect(response.status).toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalled();
        expect(response.json).toHaveBeenCalledWith({
            error: {
                message: error.message,
                code: error.code,
                name: error.name,
                field: undefined,
            },
        });
    });
});
