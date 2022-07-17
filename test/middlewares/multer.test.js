import { multerCheckFileExists } from '../../src/middlewares/multer.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';

const request = mockRequest();
const response = mockResponse();
const next = mockNext();

beforeEach(() => {
    response.status.mockClear();
    response.json.mockClear();
    next.mockClear();
});

describe('multerCheckFileExists middleware test suite', () => {
    test('Calls the next middleware if a file has been saved', () => {
        request.file = 'File';
        multerCheckFileExists(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
    });

    test('Calls the next error middleware if no file has been saved', () => {
        delete request.file;
        multerCheckFileExists(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
});
