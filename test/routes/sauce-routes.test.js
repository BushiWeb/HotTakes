import request from 'supertest';
import app from '../../src/app.js';
import Sauce from '../../src/models/Sauce.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import jsonWebToken from 'jsonwebtoken';
import SAUCE_DATA from '../mocks/sauce-data.js';
import fs from 'node:fs';
import mongoose from 'mongoose';
import { MulterError } from 'multer';

const mockSauceSave = jest.spyOn(Sauce.prototype, 'save').mockResolvedValue();
const mockSauceFind = jest.spyOn(Sauce, 'find');
const mockSauceFindById = jest.spyOn(Sauce, 'findById');
const mockSauceUpdateOne = jest.spyOn(Sauce, 'updateOne');
const mockSauceDeleteOne = jest.spyOn(Sauce, 'deleteOne');
const mockFsUnlink = jest.spyOn(fs, 'unlink');

const authenticationTestKey = 'TEST';

beforeEach(() => {
    mockSauceSave.mockReset();
    mockSauceFind.mockReset();
    mockSauceFindById.mockReset();
    mockSauceUpdateOne.mockReset();
    mockSauceDeleteOne.mockReset();
    mockFsUnlink.mockReset();
});

describe('Sauce routes test suite', () => {
    describe('POST api/sauces', () => {
        const sauceData = JSON.parse(JSON.stringify(SAUCE_DATA[0]));
        delete sauceData._id;
        delete sauceData.userId;
        delete sauceData.imageUrl;
        delete sauceData.likes;
        delete sauceData.dislikes;
        delete sauceData.usersLiked;
        delete sauceData.usersDisliked;

        const imagePath = join(dirname(fileURLToPath(import.meta.url)), '../images/test.png');

        const jwt = jsonWebToken.sign({ userId: '123' }, authenticationTestKey, {
            expiresIn: '24h',
        });
        const authorizationHeader = `Bearer ${jwt}`;

        test('Responds with a message in JSON format, and status 201', async () => {
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(201);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
        });

        test('Responds with an error and status 400 if the name is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.name = true;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/name/);
        });

        test('Responds with an error and status 400 if the name is absent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            delete invalidSauceData.name;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/name/);
        });

        test('Responds with an error and status 400 if the heat is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = true;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the heat is absent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            delete invalidSauceData.heat;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the heat is outside the boundaries', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = 13;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the file is missing', async () => {
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' });

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'MulterError');
        });

        test('Responds with an error and status 400 if the description is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.description = true;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/description/);
        });

        test('Responds with an error and status 400 if the description is absent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            delete invalidSauceData.description;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/description/);
        });

        test('Responds with an error and status 400 if the manufacturer is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.manufacturer = true;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/manufacturer/);
        });

        test('Responds with an error and status 400 if the manufacturer is absent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            delete invalidSauceData.manufacturer;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/manufacturer/);
        });

        test('Responds with an error and status 400 if the main pepper is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.mainPepper = true;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/mainPepper/);
        });

        test('Responds with an error and status 400 if the main pepper is absent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            delete invalidSauceData.mainPepper;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/mainPepper/);
        });

        test('Responds with an error and status 401 if the jwt is invalid', async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, 'WRONG_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', invalidAuthorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' });

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'JsonWebTokenError');
        });

        test("Responds with an error and status 401 if the jwt doesn't contain the userId", async () => {
            const invalidJwt = jsonWebToken.sign({ useless: '123' }, authenticationTestKey, {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', invalidAuthorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' });

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'AuthenticationError');
        });

        test('Responds with an error and status 400 if the saving fails due to validation error', async () => {
            const error = new mongoose.Error.ValidationError();
            mockSauceSave.mockRejectedValueOnce(error);
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'ValidationError');
        });

        test('Responds with an error and status 500 if the saving fails', async () => {
            const error = new mongoose.Error();
            mockSauceSave.mockRejectedValueOnce(error);
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
        });
    });

    describe('GET api/sauces', () => {
        const jwt = jsonWebToken.sign({ userId: '123' }, authenticationTestKey, {
            expiresIn: '24h',
        });
        const authorizationHeader = `Bearer ${jwt}`;

        beforeEach(() => {
            mockSauceFind.mockReset();
        });

        test('Responds with a message in JSON format, and status 200', async () => {
            mockSauceFind.mockResolvedValue(SAUCE_DATA);
            const response = await request(app).get('/api/sauces/').set('Authorization', authorizationHeader);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toEqual(SAUCE_DATA);
        });

        test('Responds with an error and status 401 if the jwt is invalid', async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, 'WRONG_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app).get('/api/sauces/').set('Authorization', invalidAuthorizationHeader);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'JsonWebTokenError');
        });

        test("Responds with an error and status 401 if the jwt doesn't contain the userId", async () => {
            const invalidJwt = jsonWebToken.sign({ useless: '123' }, authenticationTestKey, {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app).get('/api/sauces/').set('Authorization', invalidAuthorizationHeader);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'AuthenticationError');
        });

        test('Responds with an error and status 500 if the fetching fails', async () => {
            const error = new mongoose.Error();
            mockSauceFind.mockRejectedValueOnce(error);
            const response = await request(app).get('/api/sauces/').set('Authorization', authorizationHeader);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
        });
    });

    describe('GET api/sauces/:id', () => {
        const jwt = jsonWebToken.sign({ userId: '123' }, authenticationTestKey, {
            expiresIn: '24h',
        });
        const authorizationHeader = `Bearer ${jwt}`;
        const requestUrl = `/api/sauces/${SAUCE_DATA[0]._id}`;

        beforeEach(() => {
            mockSauceFindById.mockReset();
        });

        test('Responds with a message in JSON format, and status 200', async () => {
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            const response = await request(app).get(requestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toEqual(SAUCE_DATA[0]);
        });

        test('Responds with an error and status 401 if the jwt is invalid', async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, 'WRONG_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app).get(requestUrl).set('Authorization', invalidAuthorizationHeader);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'JsonWebTokenError');
        });

        test("Responds with an error and status 401 if the jwt doesn't contain the userId", async () => {
            const invalidJwt = jsonWebToken.sign({ useless: '123' }, authenticationTestKey, {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app).get(requestUrl).set('Authorization', invalidAuthorizationHeader);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'AuthenticationError');
        });

        test('Responds with an error and status 500 if the fetching fails', async () => {
            const error = new mongoose.Error();
            mockSauceFindById.mockRejectedValueOnce(error);
            const response = await request(app).get(requestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
        });

        test("Responds with an error and status 404 if the document can't be found", async () => {
            const badRequestUrl = '/api/sauces/000000000';
            mockSauceFindById.mockResolvedValueOnce(null);
            const response = await request(app).get(badRequestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'DocumentNotFoundError');
        });

        test("Responds with an error and status 404 if the document can't be found and an error is thrown", async () => {
            const badRequestUrl = '/api/sauces/000000000';
            const error = new mongoose.Error.DocumentNotFoundError();
            mockSauceFindById.mockRejectedValueOnce(error);
            const response = await request(app).get(badRequestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'DocumentNotFoundError');
        });

        test('Responds with an error and status 400 if the id is incorrect', async () => {
            const badRequestUrl = '/api/sauces/000000000';
            const error = new mongoose.Error.CastError();
            mockSauceFindById.mockRejectedValueOnce(error);
            const response = await request(app).get(badRequestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'CastError');
        });
    });

    describe('PUT api/sauces/:id', () => {
        const sauceData = JSON.parse(JSON.stringify(SAUCE_DATA[0]));
        delete sauceData._id;
        delete sauceData.userId;
        delete sauceData.imageUrl;
        delete sauceData.likes;
        delete sauceData.dislikes;
        delete sauceData.usersLiked;
        delete sauceData.usersDisliked;

        const imagePath = join(dirname(fileURLToPath(import.meta.url)), '../images/test.png');

        const jwt = jsonWebToken.sign({ userId: SAUCE_DATA[0].userId }, authenticationTestKey, {
            expiresIn: '24h',
        });
        const authorizationHeader = `Bearer ${jwt}`;
        const requestUrl = `/api/sauces/${SAUCE_DATA[0]._id}`;

        test('Responds with a message in JSON format, and status 200 with an image', async () => {
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceUpdateOne).toHaveBeenCalled();
            expect(mockSauceUpdateOne.mock.calls[0][1]).toHaveProperty('imageUrl');
        });

        test('Responds with a message in JSON format, and status 200 with no image', async () => {
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Call the unlink method if an image is sent', async () => {
            mockSauceUpdateOne.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(mockFsUnlink).toHaveBeenCalled();
            expect(mockFsUnlink.mock.calls[0][0]).toMatch(new RegExp(SAUCE_DATA[0].imageUrl.split('/images/')[1]));
        });

        test("Don't call the unlink method if no image is sent", async () => {
            mockSauceUpdateOne.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(mockFsUnlink).not.toHaveBeenCalled();
        });

        test('Responds with an error and status 400 if the name is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.name = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/name/);
        });

        test('Responds with an error and status 400 if the name is invalid and no image is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.name = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/name/);
        });

        test('Responds with a message in JSON format, and status 200 if name is absent', async () => {
            const updatedSauceData = JSON.parse(JSON.stringify(sauceData));
            delete updatedSauceData.name;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(updatedSauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Responds with an error and status 400 if the heat is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the heat is invalid and no image is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with a message in JSON format, and status 200 if heat is absent', async () => {
            const updatedSauceData = JSON.parse(JSON.stringify(sauceData));
            delete updatedSauceData.heat;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(updatedSauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Responds with an error and status 400 if the heat is outside the boundaries', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = 13;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the heat is outside the boundaries and no file is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = 13;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the description is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.description = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/description/);
        });

        test('Responds with an error and status 400 if the description is invalid and no file is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.description = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/description/);
        });

        test('Responds with a message in JSON format, and status 200 if description is absent', async () => {
            const updatedSauceData = JSON.parse(JSON.stringify(sauceData));
            delete updatedSauceData.description;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(updatedSauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Responds with an error and status 400 if the manufacturer is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.manufacturer = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/manufacturer/);
        });

        test('Responds with an error and status 400 if the manufacturer is invalid and no file is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.manufacturer = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/manufacturer/);
        });

        test('Responds with a message in JSON format, and status 200 if manufacturer is absent', async () => {
            const updatedSauceData = JSON.parse(JSON.stringify(sauceData));
            delete updatedSauceData.manufacturer;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(updatedSauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Responds with an error and status 400 if the main pepper is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.mainPepper = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/mainPepper/);
        });

        test('Responds with an error and status 400 if the main pepper is invalid and no file is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.mainPepper = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/mainPepper/);
        });

        test('Responds with a message in JSON format, and status 200 if main pepper is absent', async () => {
            const updatedSauceData = JSON.parse(JSON.stringify(sauceData));
            delete updatedSauceData.mainPepper;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(updatedSauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Responds with an error and status 401 if the jwt is invalid', async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, 'WRONG_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', invalidAuthorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'JsonWebTokenError');
        });

        test("Responds with an error and status 401 if the jwt doesn't contain the userId", async () => {
            const invalidJwt = jsonWebToken.sign({ useless: '123' }, authenticationTestKey, {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', invalidAuthorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'AuthenticationError');
        });

        test("Responds with an error and status 403 if the user doesn't have the right to manipulate the sauce", async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, authenticationTestKey, {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', invalidAuthorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(403);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'AuthenticationError');
        });

        test('Responds with an error and status 400 if the update fails due to validation error', async () => {
            const error = new mongoose.Error.ValidationError();
            mockSauceUpdateOne.mockRejectedValueOnce(error);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'ValidationError');
        });

        test('Responds with an error and status 500 if the update fails', async () => {
            const error = new mongoose.Error();
            mockSauceUpdateOne.mockRejectedValueOnce(error);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
        });

        test('Responds with an error and status 500 if the fetching fails', async () => {
            const error = new mongoose.Error();
            mockSauceFindById.mockRejectedValueOnce(error);
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
        });

        test("Responds with an error and status 404 if the document can't be found", async () => {
            mockSauceFindById.mockResolvedValue(null);
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'DocumentNotFoundError');
        });

        test("Responds with an error and status 404 if the document can't be found and an error is thrown", async () => {
            const error = new mongoose.Error.DocumentNotFoundError();
            mockSauceFindById.mockRejectedValueOnce(error);
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'DocumentNotFoundError');
        });

        test('Responds with an error and status 400 if the id is incorrect', async () => {
            const error = new mongoose.Error.CastError();
            mockSauceFindById.mockRejectedValueOnce(error);
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'CastError');
        });
    });

    describe('DELETE api/sauces/:id', () => {
        const jwt = jsonWebToken.sign({ userId: SAUCE_DATA[0].userId }, authenticationTestKey, {
            expiresIn: '24h',
        });
        const authorizationHeader = `Bearer ${jwt}`;
        const requestUrl = `/api/sauces/${SAUCE_DATA[0]._id}`;

        test('Responds with a message in JSON format, and status 200', async () => {
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceDeleteOne.mockResolvedValue(null);

            const response = await request(app).delete(requestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceDeleteOne).toHaveBeenCalled();
            expect(mockSauceDeleteOne).toHaveBeenCalledWith({ _id: SAUCE_DATA[0]._id });
        });

        test('Call the unlink method', async () => {
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceDeleteOne.mockResolvedValue(null);

            const response = await request(app).delete(requestUrl).set('Authorization', authorizationHeader);

            expect(mockFsUnlink).toHaveBeenCalled();
            expect(mockFsUnlink.mock.calls[0][0]).toMatch(new RegExp(SAUCE_DATA[0].imageUrl.split('/images/')[1]));
        });

        test('Responds with an error and status 401 if the jwt is invalid', async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, 'WRONG_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app).delete(requestUrl).set('Authorization', invalidAuthorizationHeader);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'JsonWebTokenError');
        });

        test("Responds with an error and status 401 if the jwt doesn't contain the userId", async () => {
            const invalidJwt = jsonWebToken.sign({ useless: '123' }, authenticationTestKey, {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app).delete(requestUrl).set('Authorization', invalidAuthorizationHeader);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'AuthenticationError');
        });

        test("Responds with an error and status 403 if the user doesn't have the right to manipulate the sauce", async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, authenticationTestKey, {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            const response = await request(app).delete(requestUrl).set('Authorization', invalidAuthorizationHeader);

            expect(response.status).toBe(403);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'AuthenticationError');
        });

        test('Responds with an error and status 500 if the deletion fails', async () => {
            const error = new mongoose.Error();
            mockSauceDeleteOne.mockRejectedValueOnce(error);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            const response = await request(app).delete(requestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
        });

        test('Responds with an error and status 500 if the fetching fails', async () => {
            const error = new mongoose.Error();
            mockSauceFindById.mockRejectedValueOnce(error);
            const response = await request(app).delete(requestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
        });

        test("Responds with an error and status 404 if the document can't be found", async () => {
            mockSauceFindById.mockResolvedValue(null);
            const response = await request(app).delete(requestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'DocumentNotFoundError');
        });

        test("Responds with an error and status 404 if the document can't be found and an error is thrown", async () => {
            const error = new mongoose.Error.DocumentNotFoundError();
            mockSauceFindById.mockRejectedValueOnce(error);
            const response = await request(app).delete(requestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'DocumentNotFoundError');
        });

        test('Responds with an error and status 400 if the id is incorrect', async () => {
            const error = new mongoose.Error.CastError();
            mockSauceFindById.mockRejectedValueOnce(error);
            const response = await request(app).delete(requestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'CastError');
        });
    });

    describe('POST api/sauces/:id/like', () => {
        const defaultUserId = '666666';

        const createAuthorizationHeaderValue = (userId = defaultUserId, key = authenticationTestKey) => {
            const jwt = jsonWebToken.sign({ userId }, key, {
                expiresIn: '24h',
            });
            return `Bearer ${jwt}`;
        };

        const requestUrl = `/api/sauces/${SAUCE_DATA[0]._id}/like`;

        let returnedSauce;

        beforeEach(() => {
            returnedSauce = new Sauce(SAUCE_DATA[0]);
        });

        test('Responds with a message in JSON format, and status 200, like the sauce', async () => {
            mockSauceFindById.mockResolvedValue(returnedSauce);
            mockSauceSave.mockResolvedValue(null);

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId, like: 1 });

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes + 1);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length + 1);
            expect(returnedSauce.usersLiked).toContain(defaultUserId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length);
            expect(returnedSauce.usersDisliked).not.toContain(defaultUserId);
        });

        test("Responds with a message in JSON format, and status 200, try to like the sauce but don't do anything if the sauce is liked", async () => {
            mockSauceFindById.mockResolvedValue(returnedSauce);
            mockSauceSave.mockResolvedValue(null);

            const userId = SAUCE_DATA[0].usersLiked[0];

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue(userId))
                .send({ userId, like: 1 });

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length);
            expect(returnedSauce.usersLiked).toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length);
            expect(returnedSauce.usersDisliked).not.toContain(userId);
        });

        test('Responds with a message in JSON format, and status 200, reset the dislike first and like the sauce', async () => {
            mockSauceFindById.mockResolvedValue(returnedSauce);
            mockSauceSave.mockResolvedValue(null);

            const userId = SAUCE_DATA[0].usersDisliked[0];

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue(userId))
                .send({ userId, like: 1 });

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes + 1);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length + 1);
            expect(returnedSauce.usersLiked).toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes - 1);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length - 1);
            expect(returnedSauce.usersDisliked).not.toContain(userId);
        });
        test('Responds with a message in JSON format, and status 200, dislike the sauce', async () => {
            mockSauceFindById.mockResolvedValue(returnedSauce);
            mockSauceSave.mockResolvedValue(null);

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId, like: -1 });

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length);
            expect(returnedSauce.usersLiked).not.toContain(defaultUserId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes + 1);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length + 1);
            expect(returnedSauce.usersDisliked).toContain(defaultUserId);
        });

        test("Responds with a message in JSON format, and status 200, try to like the sauce but don't do anything if the sauce is already disliked", async () => {
            mockSauceFindById.mockResolvedValue(returnedSauce);
            mockSauceSave.mockResolvedValue(null);

            const userId = SAUCE_DATA[0].usersDisliked[0];

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue(userId))
                .send({ userId, like: -1 });

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length);
            expect(returnedSauce.usersLiked).not.toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length);
            expect(returnedSauce.usersDisliked).toContain(userId);
        });

        test('Responds with a message in JSON format, and status 200, reset the like first and dislike the sauce', async () => {
            mockSauceFindById.mockResolvedValue(returnedSauce);
            mockSauceSave.mockResolvedValue(null);

            const userId = SAUCE_DATA[0].usersLiked[0];

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue(userId))
                .send({ userId, like: -1 });

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes - 1);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length - 1);
            expect(returnedSauce.usersLiked).not.toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes + 1);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length + 1);
            expect(returnedSauce.usersDisliked).toContain(userId);
        });

        test('Responds with a message in JSON format, and status 200, reset a dislike', async () => {
            mockSauceFindById.mockResolvedValue(returnedSauce);
            mockSauceSave.mockResolvedValue(null);

            const userId = SAUCE_DATA[0].usersDisliked[0];

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue(userId))
                .send({ userId, like: 0 });

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length);
            expect(returnedSauce.usersLiked).not.toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes - 1);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length - 1);
            expect(returnedSauce.usersDisliked).not.toContain(userId);
        });

        test('Responds with a message in JSON format, and status 200, reset a like', async () => {
            mockSauceFindById.mockResolvedValue(returnedSauce);
            mockSauceSave.mockResolvedValue(null);

            const userId = SAUCE_DATA[0].usersLiked[0];

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue(userId))
                .send({ userId, like: 0 });

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes - 1);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length - 1);
            expect(returnedSauce.usersLiked).not.toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length);
            expect(returnedSauce.usersDisliked).not.toContain(userId);
        });

        test('Responds with a message in JSON format, and status 200, nothing to reset', async () => {
            mockSauceFindById.mockResolvedValue(returnedSauce);
            mockSauceSave.mockResolvedValue(null);

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId, like: 0 });

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length);
            expect(returnedSauce.usersLiked).not.toContain(defaultUserId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length);
            expect(returnedSauce.usersDisliked).not.toContain(defaultUserId);
        });

        test('Responds with an error and status 400 if the like value is invalid', async () => {
            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId, like: true });

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/like/);
        });

        test('Responds with an error and status 400 if the like value is absent', async () => {
            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId });

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/like/);
        });

        test('Responds with an error and status 400 if the like value is outside the boundaries', async () => {
            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId, like: 7 });

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/like/);
        });

        test('Responds with an error and status 401 if the jwt is invalid', async () => {
            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue(defaultUserId, 'WRONG_KEY'))
                .send({ userId: defaultUserId, like: 1 });

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'JsonWebTokenError');
        });

        test("Responds with an error and status 401 if the jwt doesn't contain the userId", async () => {
            const invalidJwt = jsonWebToken.sign({ useless: '123' }, authenticationTestKey, {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', invalidAuthorizationHeader)
                .send({ userId: defaultUserId, like: 1 });

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('name', 'AuthenticationError');
        });

        test('Responds with an error and status 400 if the saving fails due to validation error', async () => {
            const error = new mongoose.Error.ValidationError();
            mockSauceFindById.mockResolvedValue(returnedSauce);
            mockSauceSave.mockRejectedValueOnce(error);

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId, like: 1 });

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'ValidationError');
        });

        test('Responds with an error and status 500 if the saving fails', async () => {
            const error = new mongoose.Error();
            mockSauceFindById.mockResolvedValue(returnedSauce);
            mockSauceSave.mockRejectedValueOnce(error);

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId, like: 1 });

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
        });

        test('Responds with an error and status 500 if the fetching fails', async () => {
            const error = new mongoose.Error();
            mockSauceFindById.mockRejectedValueOnce(error);

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId, like: 1 });

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
        });

        test("Responds with an error and status 404 if the document can't be found", async () => {
            mockSauceFindById.mockResolvedValue(null);

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId, like: 1 });

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'DocumentNotFoundError');
        });

        test("Responds with an error and status 404 if the document can't be found and an error is thrown", async () => {
            const error = new mongoose.Error.DocumentNotFoundError();
            mockSauceFindById.mockRejectedValueOnce(error);

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId, like: 1 });

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'DocumentNotFoundError');
        });

        test('Responds with an error and status 400 if the id is incorrect', async () => {
            const error = new mongoose.Error.CastError();
            mockSauceFindById.mockRejectedValueOnce(error);

            const response = await request(app)
                .post(requestUrl)
                .set('Authorization', createAuthorizationHeaderValue())
                .send({ userId: defaultUserId, like: 1 });

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('type', 'MongooseError');
            expect(response.body.error).toHaveProperty('name', 'CastError');
        });
    });
});
