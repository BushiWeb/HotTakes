import { checkAuthentication, checkOwnership } from '../../src/middlewares/authentication.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import jsonWebToken from 'jsonwebtoken';
import { JsonWebTokenError } from 'jsonwebtoken';
import { Query, Model } from 'mongoose';

const mockJWTVerify = jest.spyOn(jsonWebToken, 'verify');
const authorizationHeader = 'Bearer 123312';

const mockFindById = jest.spyOn(Model, 'findById').mockImplementation(() => new Query());
const mockExec = jest.spyOn(Query.prototype, 'exec');

const request = mockRequest({}, { authorization: authorizationHeader });
const response = mockResponse();
const next = mockNext();

beforeEach(() => {
    mockJWTVerify.mockReset();
    response.status.mockClear();
    response.json.mockClear();
    next.mockClear();
    mockFindById.mockClear();
    mockExec.mockClear();
    delete request.auth;
});

describe('checkAuthentication test suite', () => {
    test('Calls next if the token is valid', () => {
        const decodedToken = { userId: 123 };
        mockJWTVerify.mockReturnValue(decodedToken);

        checkAuthentication(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
    });

    test('Stores the userId in the request if the token is valid', () => {
        const decodedToken = { userId: 123 };
        mockJWTVerify.mockReturnValue(decodedToken);

        checkAuthentication(request, response, next);

        expect(request).toHaveProperty('auth');
        expect(request.auth).toHaveProperty('userId', decodedToken.userId);
    });

    test('Calls the next function with an error containing the status 401 if the token is invalid', () => {
        mockJWTVerify.mockImplementation(() => {
            throw new JsonWebTokenError('Error message');
        });

        checkAuthentication(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toHaveProperty('message');
        expect(next.mock.calls[0][0]).toHaveProperty('status', 401);
        expect(next.mock.calls[0][0]).toHaveProperty('error');
    });

    test("Calls the next function with an error containing the status 401 if the token doesn't contain the userId", () => {
        const decodedToken = { troll: 123 };
        mockJWTVerify.mockReturnValue(decodedToken);

        checkAuthentication(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toHaveProperty('message');
        expect(next.mock.calls[0][0]).toHaveProperty('status', 401);
        expect(next.mock.calls[0][0]).toHaveProperty('error');
    });

    test('Calls the next function with an error containing the status 401 if the token is missing', () => {
        delete request.headers.authorization;
        checkAuthentication(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toHaveProperty('message');
        expect(next.mock.calls[0][0]).toHaveProperty('status', 401);
        expect(next.mock.calls[0][0]).toHaveProperty('error');
        request.headers.authorization = authorizationHeader;
    });
});

describe('checkOwnership returned middleware  test suite', () => {
    test('Calls next if the user id is right', async () => {
        request.auth = { userId: '123' };
        request.params = { id: 'sauceId' };
        const sauce = { name: 'Tabasco', userId: '123' };
        mockExec.mockResolvedValue(sauce);

        await checkOwnership(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
    });

    test('Calls the next function with an error containing the status 403 if the user id is wrong', async () => {
        request.auth = { userId: '456' };
        request.params = { id: 'sauceId' };
        const sauce = { name: 'Tabasco', userId: '123' };
        mockExec.mockResolvedValue(sauce);

        await checkOwnership(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toHaveProperty('message');
        expect(next.mock.calls[0][0]).toHaveProperty('status', 403);
    });

    test("Calls the next function with an error containing the status 404 if the element doesn't exist", async () => {
        request.auth = { userId: '456' };
        request.params = { id: 'sauceId' };
        mockExec.mockResolvedValue(null);

        await checkOwnership(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toHaveProperty('message');
        expect(next.mock.calls[0][0]).toHaveProperty('status', 404);
    });
});
