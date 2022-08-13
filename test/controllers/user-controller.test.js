import { signup, login } from '../../src/controllers/user-controller.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import User from '../../src/models/User.js';
import bcrypt from 'bcrypt';
import jsonWebToken from 'jsonwebtoken';
import mongoose from 'mongoose';
import UnauthorizedError from '../../src/errors/UnauthorizedError.js';
import ConfigManager from '../../src/config/ConfigManager.js';
import ConfigurationError from '../../src/errors/ConfigurationError.js';

const mockUserSave = jest.spyOn(User.prototype, 'save');
const mockUserFindOne = jest.spyOn(User, 'findOne');
const mockBcryptHash = jest.spyOn(bcrypt, 'hash');
const mockBcryptCompare = jest.spyOn(bcrypt, 'compare');
const mockJWTSign = jest.spyOn(jsonWebToken, 'sign');
const mockConfigManagerGetEnvVariable = jest.spyOn(ConfigManager, 'getEnvVariable');

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
    mockConfigManagerGetEnvVariable.mockReset();
    next.mockClear();

    mockConfigManagerGetEnvVariable.mockReturnValue(1);
});

describe('User controllers test suite', () => {
    describe('Signup controller test suite', () => {
        test('Sends a response containing status 201 and a message', async () => {
            mockBcryptHash.mockResolvedValue('hash');
            mockUserSave.mockResolvedValue(null);

            await signup(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
        });

        test('Calls the next middleware with an error if saving fails', async () => {
            const errorMessage = 'User save error message';
            const saveError = new mongoose.Error(errorMessage);
            mockBcryptHash.mockResolvedValue('hash');
            mockUserSave.mockRejectedValue(saveError);

            await signup(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(saveError);
        });

        test('Calls the next middleware with an error if password hash fails', async () => {
            const errorMessage = 'Hash error message';
            const hashError = new Error(errorMessage);
            mockBcryptHash.mockRejectedValue(hashError);

            await signup(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(hashError);

            expect(mockUserSave).not.toHaveBeenCalled();
        });

        test('Calls the next middleware with an error if there is no password encryption salt environment variable', async () => {
            const errorMessage = 'Hash error message';
            const configurationError = new ConfigurationError(errorMessage);
            mockConfigManagerGetEnvVariable.mockImplementation((param) => {
                throw configurationError;
            });

            await signup(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(configurationError);

            expect(mockUserSave).not.toHaveBeenCalled();
        });
    });

    describe('Login controller test suite', () => {
        test('Sends a response containing status 201, the user id and a Json Web Token', async () => {
            mockBcryptCompare.mockResolvedValue(true);
            mockUserFindOne.mockResolvedValue({ _id: '1' });
            mockJWTSign.mockReturnValue('token');

            await login(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('token');
            expect(response.json.mock.calls[0][0]).toHaveProperty('userId');
        });

        test("Calls the next middleware with a mongoose DocumentNotFoundError if the user doesn't exist", async () => {
            mockBcryptCompare.mockResolvedValue(true);
            mockUserFindOne.mockResolvedValue(null);

            await login(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(mongoose.Error.DocumentNotFoundError);
        });

        test('Calls the next middleware with an UnauthorizedError if the password is invalid', async () => {
            mockBcryptCompare.mockResolvedValue(false);
            mockUserFindOne.mockResolvedValue({ _id: '1' });

            await login(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
        });

        test('Calls the next middleware with an error if password compare fails', async () => {
            const errorMessage = 'Compare error message';
            const compareError = { message: errorMessage };
            mockBcryptCompare.mockRejectedValue(compareError);
            mockUserFindOne.mockResolvedValue({ _id: '1' });

            await login(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(compareError);

            expect(mockJWTSign).not.toHaveBeenCalled();
        });

        test('Calls the next middleware with an error if the user query fails', async () => {
            const errorMessage = 'Querry error message';
            const querryError = new mongoose.Error(errorMessage);
            mockUserFindOne.mockRejectedValue(querryError);

            await login(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(querryError);

            expect(mockBcryptCompare).not.toHaveBeenCalled();
            expect(mockJWTSign).not.toHaveBeenCalled();
        });
    });
});
