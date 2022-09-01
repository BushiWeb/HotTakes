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
        const multerMiddleware = multerCheckFile();
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
    });

    test('Calls the next middleware if multiple files have been saved', () => {
        delete request.file;
        request.files = ['File', 'File2'];
        const multerMiddleware = multerCheckFile();
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);

        delete request.files;
    });

    test('Calls the next error middleware if no file has been saved', () => {
        delete request.file;
        const multerMiddleware = multerCheckFile();
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    test('Calls the next error middleware if no file has been saved but the files property is still in request as an array', () => {
        delete request.file;
        request.files = [];
        const multerMiddleware = multerCheckFile();
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);

        delete request.files;
    });

    test('Calls the next error middleware if no file has been saved but the files property is still in request as an object', () => {
        delete request.file;
        request.files = {};
        const multerMiddleware = multerCheckFile();
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);

        delete request.files;
    });

    test('Calls the next error middleware if no file has been saved and the file is required', () => {
        delete request.file;
        const multerMiddleware = multerCheckFile(true);
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    test('Calls the next error middleware if no file has been saved but the files property is still in request as an array and a file is required', () => {
        delete request.file;
        request.files = [];
        const multerMiddleware = multerCheckFile(true);
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);

        delete request.files;
    });

    test('Calls the next error middleware if no file has been saved but the files property is still in request as an object and a file is required', () => {
        delete request.file;
        request.files = {};
        const multerMiddleware = multerCheckFile(true);
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);

        delete request.files;
    });

    test('Calls the next middleware if no file has been saved and no file is required', () => {
        delete request.file;
        const multerMiddleware = multerCheckFile(false);
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
    });

    test('Calls the next middleware if no file has been saved but the files property is still in request as an array and no file is required', () => {
        delete request.file;
        request.files = [];
        const multerMiddleware = multerCheckFile(false);
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);

        delete request.files;
    });

    test('Calls the next middleware if no file has been saved but the files property is still in request as an object and no file is required', () => {
        delete request.file;
        request.files = {};
        const multerMiddleware = multerCheckFile(false);
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);

        delete request.files;
    });

    test('Calls the next error middleware if the file is refused', () => {
        delete request.file;
        request.fileRefused = true;
        const multerMiddleware = multerCheckFile();
        multerMiddleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);

        delete request.fileRefused;
    });
});
