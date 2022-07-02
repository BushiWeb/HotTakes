import { errorHandler } from '../../src/middlewares/error-handler.js';
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
});
