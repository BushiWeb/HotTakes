import { bodyPropertyAssignToBody } from '../../src/middlewares/request-body-manipulation.js';
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
    test('Calls next if the property is not a string nor an object', () => {
        const propertyValue = true;
        request.body.property = propertyValue;

        const middleware = bodyPropertyAssignToBody('property');
        middleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
        expect(request.body).toHaveProperty('property', propertyValue);
    });

    test('Calls next if the property is falsy', () => {
        const propertyValue = null;
        request.body.property = propertyValue;

        const middleware = bodyPropertyAssignToBody('property');
        middleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
        expect(request.body).toHaveProperty('property', propertyValue);
    });

    test('Calls next and updates the property if the property is a string', () => {
        const data = { name: 'name' };
        request.body.property = JSON.stringify(data);

        const middleware = bodyPropertyAssignToBody('property');
        middleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
        expect(request.body).toMatchObject(data);
        expect(request.body).not.toHaveProperty('property');
    });

    test('Calls next and updates the property if the property is an object', () => {
        const data = { name: 'name' };
        request.body.property = data;

        const middleware = bodyPropertyAssignToBody('property');
        middleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
        expect(request.body).toMatchObject(data);
        expect(request.body).not.toHaveProperty('property');
    });

    test("Calls the next function with an error if the property doesn't exist and the second parameter isn't set", () => {
        request.body.property = { name: 'name' };

        const middleware = bodyPropertyAssignToBody('otherProperty');
        middleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(next.mock.calls.length).toBe(1);
    });

    test("Calls the next function with an error if the property doesn't exist and the second parameter is true", () => {
        request.body.property = { name: 'name' };

        const middleware = bodyPropertyAssignToBody('otherProperty', true);
        middleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(next.mock.calls.length).toBe(1);
    });

    test('Calls the next function with no parameters if the property is undefined but the second paramter is false', () => {
        request.body.property = { name: 'name' };

        const middleware = bodyPropertyAssignToBody('otherProperty', false);
        middleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
    });

    test('Calls the next function with an error if the parsing fails', () => {
        request.body.property = 'Random string';

        const middleware = bodyPropertyAssignToBody('property');
        middleware(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(next.mock.calls.length).toBe(1);
    });
});