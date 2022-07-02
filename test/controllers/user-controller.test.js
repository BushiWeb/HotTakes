import { signup, login } from '../../src/controllers/user-controller.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import User from '../../src/models/User.js';
import bcrypt from 'bcrypt';
import jsonWebToken from 'jsonwebtoken';
import { flushPromise } from '../flush-promise.js';

const mockUserSave = jest.spyOn(User.prototype, 'save');
const mockUserFindOne = jest.spyOn(User, 'findOne');
const mockBcryptHash = jest.spyOn(bcrypt, 'hash');
const mockBcryptCompare = jest.spyOn(bcrypt, 'compare');
const mockJWTSign = jest.spyOn(jsonWebToken, 'sign');

const request = mockRequest({
    email: 'test@email.com',
    password: 'P@55w0rd',
});
const response = mockResponse();
const next = mockNext();

beforeEach(() => {
    mockUserSave.mockReset();
    mockUserFindOne.mockReset();
    mockBcryptHash.mockReset();
    mockBcryptCompare.mockReset();
    mockJWTSign.mockReset();
    response.status.mockClear();
    response.json.mockClear();
    next.mockClear();
});

describe('User controllers test suite', () => {
    describe('Signup controller test suite', () => {
        test('Sends a response containing status 201 and a message', async () => {
            mockBcryptHash.mockResolvedValue('hash');
            mockUserSave.mockResolvedValue(null);

            signup(request, response, next);

            await flushPromise();

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
        });

        test('Calls the next middleware with an error containing status 400 if user already exits', async () => {
            const errorMessage = 'User save error message';
            const saveError = { message: errorMessage, name: 'ValidationError' };
            mockBcryptHash.mockResolvedValue('hash');
            mockUserSave.mockRejectedValue(saveError);

            signup(request, response, next);

            await flushPromise();

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 400, ...saveError });
        });

        test('Calls the next middleware with an error if saving fails', async () => {
            const errorMessage = 'User save error message';
            const saveError = { message: errorMessage };
            mockBcryptHash.mockResolvedValue('hash');
            mockUserSave.mockRejectedValue(saveError);

            signup(request, response, next);

            await flushPromise();

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(saveError);
        });

        test('Calls the next middleware with an error if password hash fails', async () => {
            const errorMessage = 'Hash error message';
            const hashError = { message: errorMessage };
            mockBcryptHash.mockRejectedValue(hashError);

            signup(request, response, next);

            await flushPromise();

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(hashError);

            expect(mockUserSave).not.toHaveBeenCalled();
        });
    });

    describe('Login controller test suite', () => {
        test('Sends a response containing status 201, the user id and a Json Web Token', async () => {
            mockBcryptCompare.mockResolvedValue(true);
            mockUserFindOne.mockResolvedValue({ _id: '1' });
            mockJWTSign.mockReturnValue('token');

            login(request, response, next);

            await flushPromise();

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('token');
            expect(response.json.mock.calls[0][0]).toHaveProperty('userId');
        });

        test("Calls the next middleware with an error containing status 404 if user doesn't exist", async () => {
            mockBcryptCompare.mockResolvedValue(true);
            mockUserFindOne.mockResolvedValue(null);

            login(request, response, next);

            await flushPromise();

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toHaveProperty('message');
            expect(next.mock.calls[0][0]).toHaveProperty('status', 404);
        });

        test('Calls the next middleware with an error containing status 401 if the password is invalid', async () => {
            mockBcryptCompare.mockResolvedValue(false);
            mockUserFindOne.mockResolvedValue({ _id: '1' });

            login(request, response, next);

            await flushPromise();

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toHaveProperty('message');
            expect(next.mock.calls[0][0]).toHaveProperty('status', 401);
        });

        test('Calls the next middleware with an error if password compare fails', async () => {
            const errorMessage = 'Compare error message';
            const compareError = { message: errorMessage };
            mockBcryptCompare.mockRejectedValue(compareError);
            mockUserFindOne.mockResolvedValue({ _id: '1' });

            login(request, response, next);

            await flushPromise();

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(compareError);

            expect(mockJWTSign).not.toHaveBeenCalled();
        });

        test('Calls the next middleware with an error if the user query fails', async () => {
            const errorMessage = 'Querry error message';
            const querryError = { message: errorMessage };
            mockUserFindOne.mockRejectedValue(querryError);

            login(request, response, next);

            await flushPromise();

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(querryError);

            expect(mockBcryptCompare).not.toHaveBeenCalled();
            expect(mockJWTSign).not.toHaveBeenCalled();
        });
    });
});
