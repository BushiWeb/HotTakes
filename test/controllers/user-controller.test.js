import { signup } from '../../src/controllers/user-controller.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import User from '../../src/models/User.js';
import bcrypt from 'bcrypt';
import { flushPromise } from '../flush-promise.js';

const mockUserSave = jest.spyOn(User.prototype, 'save');
const mockBcryptHash = jest.spyOn(bcrypt, 'hash');

const request = mockRequest({
    email: 'test@email.com',
    password: 'P@55w0rd',
});
const response = mockResponse();
const next = mockNext();

beforeEach(() => {
    mockUserSave.mockReset();
    mockBcryptHash.mockReset();
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
});
