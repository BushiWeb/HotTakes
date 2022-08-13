import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import ConfigManager from '../../src/config/ConfigManager.js';
import ConfigurationError from '../../src/errors/ConfigurationError.js';

const mockUserSave = jest.spyOn(User.prototype, 'save').mockResolvedValue();
const mockUserFindOne = jest.spyOn(User, 'findOne');
const mockConfigManagerGetEnvVariable = jest.spyOn(ConfigManager, 'getEnvVariable');

beforeEach(() => {
    mockConfigManagerGetEnvVariable.mockReturnValue(1);
});

describe('Authentication routes test suite', () => {
    describe('POST api/auth/signup', () => {
        test('Responds with a message in JSON format, and status 201', async () => {
            const requestBody = { email: 'test@email.com', password: 'P@55w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(201);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
        });

        test('Responds with an error and status 400 if the email is invalid', async () => {
            const requestBody = { email: 'testemail.com', password: 'P@55w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'UserInputValidationError');
            expect(response.body.error).toHaveProperty('fields');
            expect(response.body.error.fields).toHaveLength(1);
            expect(response.body.error.fields[0]).toMatchObject({ param: 'email' });
        });

        test('Responds with an error and status 400 if the email is absent', async () => {
            const requestBody = { password: 'P@55w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'UserInputValidationError');
            expect(response.body.error).toHaveProperty('fields');
            expect(response.body.error.fields).toHaveLength(1);
            expect(response.body.error.fields[0]).toMatchObject({ param: 'email' });
        });

        test('Responds with an error and status 400 if the password is invalid', async () => {
            const requestBody = { email: 'test@email.com', password: 'P@w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'UserInputValidationError');
            expect(response.body.error).toHaveProperty('fields');
            expect(response.body.error.fields).toHaveLength(1);
            expect(response.body.error.fields[0]).toMatchObject({ param: 'password' });
        });

        test('Responds with an error and status 400 if the password is absent', async () => {
            const requestBody = { email: 'test@email.com' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'UserInputValidationError');
            expect(response.body.error).toHaveProperty('fields');
            expect(response.body.error.fields).toHaveLength(1);
            expect(response.body.error.fields[0]).toMatchObject({ param: 'password' });
        });

        test('Responds with an error and status 500 if the password hash fails', async () => {
            const mockBcryptHash = jest.spyOn(bcrypt, 'hash').mockRejectedValueOnce({ message: 'Hash fail' });
            const requestBody = { email: 'test@email.com', password: 'P@55w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');

            mockBcryptHash.mockRestore();
        });

        test('Responds with an error and status 500 if the saving fails', async () => {
            const error = new mongoose.Error();
            mockUserSave.mockRejectedValueOnce(error);
            const requestBody = { email: 'test@email.com', password: 'P@55w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
        });

        test('Responds with an error and status 400 if the saving fails due to a validation error', async () => {
            const error = new mongoose.Error.ValidationError();
            mockUserSave.mockRejectedValueOnce(error);
            const requestBody = { email: 'test@email.com', password: 'P@55w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'ValidationError');
        });

        test('Responds with an error and status 500 if there is no password encryption salt environment variable', async () => {
            const error = new ConfigurationError('');
            mockConfigManagerGetEnvVariable.mockImplementation((param) => {
                throw error;
            });
            const requestBody = { email: 'test@email.com', password: 'P@55w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'ConfigurationError');
        });
    });

    describe('POST api/auth/login', () => {
        const userData = {
            _id: '1',
            email: 'test@email.com',
            password: '',
            clearPassword: 'P@55w0r$',
        };

        userData.password = bcrypt.hashSync(userData.clearPassword, 1);

        test('Responds with a message in JSON format containing the token, and status 200', async () => {
            const requestBody = { email: userData.email, password: userData.clearPassword };
            mockUserFindOne.mockResolvedValueOnce(userData);
            const response = await request(app).post('/api/auth/login').send(requestBody);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('userId');
            expect(response.body).toHaveProperty('token');
        });

        test('Responds with an error and status 400 if the email is invalid', async () => {
            const requestBody = { email: 'invalidEmail.com', password: userData.clearPassword };
            const response = await request(app).post('/api/auth/login').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'UserInputValidationError');
            expect(response.body.error).toHaveProperty('fields');
            expect(response.body.error.fields).toHaveLength(1);
            expect(response.body.error.fields[0]).toMatchObject({ param: 'email' });
        });

        test('Responds with an error and status 400 if the email is missing', async () => {
            const requestBody = { password: userData.clearPassword };
            const response = await request(app).post('/api/auth/login').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'UserInputValidationError');
            expect(response.body.error).toHaveProperty('fields');
            expect(response.body.error.fields).toHaveLength(1);
            expect(response.body.error.fields[0]).toMatchObject({ param: 'email' });
        });

        test('Responds with an error and status 400 if the password is missing', async () => {
            const requestBody = { email: userData.email };
            const response = await request(app).post('/api/auth/login').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'UserInputValidationError');
            expect(response.body.error).toHaveProperty('fields');
            expect(response.body.error.fields).toHaveLength(1);
            expect(response.body.error.fields[0]).toMatchObject({ param: 'password' });
        });

        test("Responds with an error and status 404 if the user doesn't exist", async () => {
            const requestBody = { email: userData.email, password: userData.clearPassword };
            mockUserFindOne.mockResolvedValueOnce(null);
            const response = await request(app).post('/api/auth/login').send(requestBody);

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'DocumentNotFoundError');
        });

        test('Responds with an error and status 401 if the password is wrong', async () => {
            const requestBody = { email: userData.email, password: 'otherPassw0r$' };
            mockUserFindOne.mockResolvedValueOnce(userData);
            const response = await request(app).post('/api/auth/login').send(requestBody);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'AuthenticationError');
        });

        test('Responds with an error and status 500 if user fetching fails', async () => {
            const requestBody = { email: userData.email, password: userData.clearPassword };
            mockUserFindOne.mockRejectedValueOnce(new mongoose.Error());
            const response = await request(app).post('/api/auth/login').send(requestBody);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
        });

        test('Responds with an error and status 500 if bcrypt comparison fails', async () => {
            const mockBcryptCompare = jest.spyOn(bcrypt, 'compare').mockRejectedValueOnce({ message: 'Compare fails' });
            const requestBody = { email: userData.email, password: userData.clearPassword };
            mockUserFindOne.mockResolvedValueOnce(userData);
            const response = await request(app).post('/api/auth/login').send(requestBody);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');

            mockBcryptCompare.mockRestore();
        });
    });
});
