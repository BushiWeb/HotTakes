import { checkAuthentication, checkOwnership } from '../../src/middlewares/authentication.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import jsonWebToken from 'jsonwebtoken';
import { JsonWebTokenError } from 'jsonwebtoken';
import { Model, Error } from 'mongoose';
import UnauthorizedError from '../../src/errors/UnauthorizedError.js';
import ForbiddenError from '../../src/errors/ForbiddenError.js';

const mockJWTVerify = jest.spyOn(jsonWebToken, 'verify');
const authorizationHeader = 'Bearer 123312';

const mockFindById = jest.spyOn(Model, 'findById');

const request = mockRequest({}, { authorization: authorizationHeader });
const response = mockResponse();
const next = mockNext();

beforeEach(() => {
    mockJWTVerify.mockReset();
    response.status.mockClear();
    response.json.mockClear();
    next.mockClear();
    mockFindById.mockClear();
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

    test('Calls the next function with an error if the token is invalid', () => {
        mockJWTVerify.mockImplementation(() => {
            throw new JsonWebTokenError('Error message');
        });

        checkAuthentication(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(JsonWebTokenError);
    });

    test("Calls the next function with an error if the token doesn't contain the userId", () => {
        const decodedToken = { troll: 123 };
        mockJWTVerify.mockReturnValue(decodedToken);

        checkAuthentication(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
    });

    test('Calls the next function with an error containing the status 401 if the token is missing', () => {
        delete request.headers.authorization;
        checkAuthentication(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
        request.headers.authorization = authorizationHeader;
    });
});

describe('checkOwnership returned middleware  test suite', () => {
    let sauce;

    beforeEach(() => {
        request.auth = { userId: '123' };
        request.params = { id: 'sauceId' };
        sauce = { name: 'Tabasco', userId: '123', _id: request.params.id };
    });

    test('Calls next if the user id is right', async () => {
        mockFindById.mockResolvedValue(sauce);

        await checkOwnership(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0].length).toBe(0);
    });

    test('Saves the sauce in the request if the user id is right', async () => {
        mockFindById.mockResolvedValue(sauce);

        await checkOwnership(request, response, next);

        expect(request).toHaveProperty('cache');
        expect(request.cache).toHaveProperty('sauces');
        expect(request.cache.sauces).toHaveProperty(request.params.id, sauce);
    });

    test('Calls the next function with an error containing the status 403 if the user id is wrong', async () => {
        request.auth.userId = '456';
        mockFindById.mockResolvedValue(sauce);

        await checkOwnership(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(ForbiddenError);
    });

    test("Calls the next function with a mongoose DocumentNotFoundError if the element doesn't exist", async () => {
        mockFindById.mockResolvedValue(null);

        await checkOwnership(request, response, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error.DocumentNotFoundError);
    });
});
