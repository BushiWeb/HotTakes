import { bodyJsonParse } from '../../src/middlewares/multer-json-parse.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';

const request = mockRequest();
const response = mockResponse();
const next = mockNext();

beforeEach(() => {
    response.status.mockClear();
    response.json.mockClear();
    next.mockClear();
});

describe('bodyJsonParse returned middleware  test suite', () => {
    test('Calls next if the property is not a string', async () => {
        request.body.property = { name: 'name' };

        const middleware = await bodyJsonParse('property');
        await middleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
    });

    test('Calls next and updates the property if the property is a string', async () => {
        const data = { name: 'name' };
        request.body.property = JSON.stringify(data);

        const middleware = await bodyJsonParse('property');
        await middleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
        expect(request.body.property).toEqual(data);
    });

    test("Calls the next function with an error if the property doesn't exist", async () => {
        request.body.property = { name: 'name' };

        const middleware = await bodyJsonParse('otherProperty');
        await middleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
});
