import { multerCheckFile } from '../../src/middlewares/multer.js';
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
        multerCheckFile(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
    });

    test('Calls the next middleware if multiple files have been saved', () => {
        delete request.file;
        request.files = ['File', 'File2'];
        multerCheckFile(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);

        delete request.files;
    });

    test('Calls the next error middleware if no file has been saved', () => {
        delete request.file;
        multerCheckFile(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    test('Calls the next error middleware if no file has been saved but the files property is still in request as an array', () => {
        delete request.file;
        request.files = [];
        multerCheckFile(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);

        delete request.files;
    });

    test('Calls the next error middleware if no file has been saved but the files property is still in request as an object', () => {
        delete request.file;
        request.files = {};
        multerCheckFile(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);

        delete request.files;
    });

    test('Calls the next error middleware if the file is refused', () => {
        delete request.file;
        request.fileRefused = true;
        multerCheckFile(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);

        delete request.fileRefused;
    });
});
