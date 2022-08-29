import { bodyPropertyAssignToBody, sanitizeBody } from '../../src/middlewares/request-body-manipulation.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import { defaultConfigManager } from '../../src/config/ConfigManager.js';

const request = mockRequest();
const response = mockResponse();
const next = mockNext();

beforeEach(() => {
    response.status.mockClear();
    response.json.mockClear();
    next.mockClear();
});

describe('Body manipualtion test suite', () => {
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

    describe('sanitizeBody test suite', () => {
        const blackListedStrings = ['<script', '<\\/script', '<!--', '-->', '\\]\\]>'];
        const mockDefaultConfigManagerGetConfig = jest
            .spyOn(defaultConfigManager, 'getConfig')
            .mockReturnValue(blackListedStrings);

        beforeEach(() => {
            mockDefaultConfigManagerGetConfig.mockClear();
        });

        afterAll(() => {
            mockDefaultConfigManagerGetConfig.mockRestore();
        });

        test('Sanitize the body', () => {
            request.body = {
                p1: "The <script tag and it's friend </script",
                p2: 'The characters <!-- and --> allows the developper to insert HTML comments',
                p3: "I don't know what CDATA are but they make use of those characters: ]]>",
            };

            sanitizeBody(request, response, next);

            expect(request.body.p1).not.toMatch(/(<script|<\/script)/);
            expect(request.body.p2).not.toMatch(/(<!--|-->)/);
            expect(request.body.p3).not.toMatch(/\]\]>/);
            expect(next).toHaveBeenCalled();
        });

        test("Don't change the body if there is no string", () => {
            request.body = {
                p1: 3,
                p2: true,
                p3: 'And a random string',
            };

            const previousBody = { ...request.body };

            sanitizeBody(request, response, next);

            expect(request.body).toEqual(previousBody);
            expect(next).toHaveBeenCalled();
        });

        test('Throw an error if no sanitization configuration is available', () => {
            const error = new Error('An error');
            mockDefaultConfigManagerGetConfig.mockImplementation((string) => {
                throw error;
            });

            sanitizeBody(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
