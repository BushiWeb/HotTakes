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

        test('Sends a response containing status 400 and an error if user saving fails', async () => {
            const errorMessage = 'User save error message';
            const saveError = new Error(errorMessage);
            mockBcryptHash.mockResolvedValue('hash');
            mockUserSave.mockRejectedValue(saveError);

            signup(request, response, next);

            await flushPromise();

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('message');
            expect(response.json.mock.calls[0][0].error.message).toBe(errorMessage);
        });

        test('Sends a response containing status 500 and an error if password hash fails', async () => {
            const errorMessage = 'Hash error message';
            const hashError = new Error(errorMessage);
            mockBcryptHash.mockRejectedValue(hashError);

            signup(request, response, next);

            await flushPromise();

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(500);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('message');
            expect(response.json.mock.calls[0][0].error.message).toBe(errorMessage);

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

        test("Sends a response containing status 404 and an error if user doesn't exist", async () => {
            mockBcryptCompare.mockResolvedValue(true);
            mockUserFindOne.mockResolvedValue(null);

            login(request, response, next);

            await flushPromise();

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(mockBcryptCompare).not.toHaveBeenCalled();
            expect(mockJWTSign).not.toHaveBeenCalled();
        });

        test('Sends a response containing status 401 and an error if the password is invalid', async () => {
            mockBcryptCompare.mockResolvedValue(false);
            mockUserFindOne.mockResolvedValue({ _id: '1' });

            login(request, response, next);

            await flushPromise();

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(401);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(mockJWTSign).not.toHaveBeenCalled();
        });

        test('Sends a response containing status 500 and an error if password compare fails', async () => {
            const errorMessage = 'Compare error message';
            const compareError = new Error(errorMessage);
            mockBcryptCompare.mockRejectedValue(compareError);
            mockUserFindOne.mockResolvedValue({ _id: '1' });

            login(request, response, next);

            await flushPromise();

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(500);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('message');
            expect(response.json.mock.calls[0][0].error.message).toBe(errorMessage);

            expect(mockJWTSign).not.toHaveBeenCalled();
        });

        test('Sends a response containing status 500 and an error if the user query fails', async () => {
            const errorMessage = 'Querry error message';
            const querryError = new Error(errorMessage);
            mockUserFindOne.mockRejectedValue(querryError);

            login(request, response, next);

            await flushPromise();

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(500);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('message');
            expect(response.json.mock.calls[0][0].error.message).toBe(errorMessage);

            expect(mockBcryptCompare).not.toHaveBeenCalled();
            expect(mockJWTSign).not.toHaveBeenCalled();
        });
    });
});
