import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import bcrypt from 'bcrypt';

const mockUserSave = jest.spyOn(User.prototype, 'save').mockResolvedValue();

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
        });

        test('Responds with an error and status 400 if the email is absent', async () => {
            const requestBody = { password: 'P@55w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 400 if the password is invalid', async () => {
            const requestBody = { email: 'testemail.com', password: 'P@w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 400 if the password is absent', async () => {
            const requestBody = { email: 'test@email.com' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 500 if the password hash fails', async () => {
            const mockBcryptHash = jest.spyOn(bcrypt, 'hash').mockRejectedValueOnce(new Error('Hash fail'));
            const requestBody = { email: 'test@email.com', password: 'P@55w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');

            mockBcryptHash.mockRestore();
        });

        test('Responds with an error and status 400 if the saving fails', async () => {
            mockUserSave.mockRejectedValueOnce(new Error('Save fail'));
            const requestBody = { email: 'test@email.com', password: 'P@55w0r$' };
            const response = await request(app).post('/api/auth/signup').send(requestBody);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });
    });
});
