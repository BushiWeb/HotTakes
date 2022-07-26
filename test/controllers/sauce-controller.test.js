import {
    createSauce,
    getAllSauces,
    getSauce,
    updateSauce,
    deleteSauce,
    likeSauce,
} from '../../src/controllers/sauce-controller.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import Sauce from '../../src/models/Sauce.js';
import SAUCE_DATA from '../mocks/sauce-data.js';
import fs from 'node:fs';

const mockSauceSave = jest.spyOn(Sauce.prototype, 'save');
const mockSauceFind = jest.spyOn(Sauce, 'find');
const mockSauceFindById = jest.spyOn(Sauce, 'findById');
const mockSauceUpdateOne = jest.spyOn(Sauce, 'updateOne');
const mockSauceDeleteOne = jest.spyOn(Sauce, 'deleteOne');
const mockFsUnlink = jest.spyOn(fs, 'unlink');

const request = mockRequest();
request.auth = { userId: '123456' };
const response = mockResponse();
const next = mockNext();

beforeEach(() => {
    mockSauceSave.mockReset();
    mockSauceFind.mockReset();
    mockSauceFindById.mockReset();
    mockSauceUpdateOne.mockReset();
    mockSauceDeleteOne.mockReset();
    mockFsUnlink.mockReset();
    response.status.mockClear();
    response.json.mockClear();
    next.mockClear();
});

describe('Sauce controllers test suite', () => {
    describe('createSauce controller test suite', () => {
        beforeEach(() => {
            const sauceData = JSON.parse(JSON.stringify(SAUCE_DATA[0]));
            delete sauceData._id;
            delete sauceData.userId;
            delete sauceData.imageUrl;
            delete sauceData.likes;
            delete sauceData.dislikes;
            delete sauceData.usersLiked;
            delete sauceData.usersDisliked;
            request.body.sauce = sauceData;
            request.file.filename = 'sauceImage.png';
            request.protocol = 'http';
        });

        test('Sends a response containing status 201 and a message', async () => {
            mockSauceSave.mockResolvedValue(null);

            await createSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(201);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
        });

        test('Calls the next middleware with an error if saving fails', async () => {
            const errorMessage = 'Sauce save error message';
            const saveError = { message: errorMessage };
            mockSauceSave.mockRejectedValue(saveError);

            await createSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(saveError);
        });

        test('Calls the next middleware with an error containing status 400 if the save method returns a validation error', async () => {
            const errorMessage = 'Sauce save error message';
            const saveError = { message: errorMessage, name: 'ValidationError' };
            mockSauceSave.mockRejectedValue(saveError);

            await createSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 400, ...saveError });
        });
    });

    describe('getAllSauces controller test suite', () => {
        test('Sends a response containing status 200 and the sauce array', async () => {
            mockSauceFind.mockResolvedValue(SAUCE_DATA);

            await getAllSauces(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toEqual(SAUCE_DATA);
        });

        test('Sends a response containing status 200 and empty array if there is no sauce', async () => {
            mockSauceFind.mockResolvedValue([]);

            await getAllSauces(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toEqual([]);
        });

        test('Calls the next middleware with an error if fetching fails', async () => {
            const errorMessage = 'Sauces fetching error message';
            const fetchError = { message: errorMessage };
            mockSauceFind.mockRejectedValue(fetchError);

            await getAllSauces(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(fetchError);
        });
    });

    describe('getSauce controller test suite', () => {
        afterAll(() => {
            delete request.params.id;
        });
        test('Sends a response containing status 200 and the sauce informations', async () => {
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            request.params.id = '123';

            await getSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toEqual(SAUCE_DATA[0]);
        });

        test('Calls the next middleware with an error if the document is not found', async () => {
            const errorMessage = 'Not found';
            const fetchError = { message: errorMessage, name: 'DocumentNotFoundError' };
            mockSauceFindById.mockResolvedValue(null);

            await getSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toHaveProperty('status', 404);
        });

        test('Calls the next middleware with an error if the document is not found and an error is thrown', async () => {
            const errorMessage = 'Not found';
            const fetchError = { message: errorMessage, name: 'DocumentNotFoundError' };
            mockSauceFindById.mockRejectedValue(fetchError);

            await getSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 404, ...fetchError });
        });

        test('Calls the next middleware with an error if the id is invalid', async () => {
            const errorMessage = 'Not found';
            const fetchError = { message: errorMessage, name: 'CastError' };
            mockSauceFindById.mockRejectedValue(fetchError);

            await getSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 400, ...fetchError });
        });

        test('Calls the next middleware with an error if fetching fails', async () => {
            const errorMessage = 'Sauces fetching error message';
            const fetchError = { message: errorMessage };
            mockSauceFindById.mockRejectedValue(fetchError);

            await getSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(fetchError);
        });
    });

    describe('updateSauce controller test suite', () => {
        beforeEach(() => {
            const sauceData = JSON.parse(JSON.stringify(SAUCE_DATA[0]));
            delete sauceData._id;
            delete sauceData.userId;
            delete sauceData.imageUrl;
            delete sauceData.likes;
            delete sauceData.dislikes;
            delete sauceData.usersLiked;
            delete sauceData.usersDisliked;
            request.body = sauceData;
            request.file = { filename: 'sauceImage.png' };
            request.protocol = 'http';
            request.params.id = '123';
        });

        afterAll(() => {
            delete request.params.id;
        });

        test('Sends a response containing status 200 and a message if no image is sent', async () => {
            mockSauceUpdateOne.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            delete request.file;

            await updateSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceUpdateOne).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalledWith({ _id: request.params.id }, request.body);
        });

        test('Sends a response containing status 200 and a message if an image is sent', async () => {
            mockSauceUpdateOne.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            await updateSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceFindById).toHaveBeenCalledWith(request.params.id);
            expect(mockSauceUpdateOne).toHaveBeenCalled();
            expect(mockSauceUpdateOne.mock.calls[0][0]).toEqual({ _id: request.params.id });
            expect(mockSauceUpdateOne.mock.calls[0][1]).toMatchObject(request.body);
            expect(mockSauceUpdateOne.mock.calls[0][1]).toHaveProperty('imageUrl');
            expect(mockSauceUpdateOne.mock.calls[0][1].imageUrl).toMatch(new RegExp(request.file.fileName));
        });

        test('Sends a response containing status 200 and a message if an image is sent and the image is in req.cache.sauce', async () => {
            mockSauceUpdateOne.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            request.cache = {
                sauces: {},
            };
            request.cache.sauces[request.params.id] = SAUCE_DATA[0];

            await updateSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceFindById).not.toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
            expect(mockSauceUpdateOne.mock.calls[0][0]).toEqual({ _id: request.params.id });
            expect(mockSauceUpdateOne.mock.calls[0][1]).toMatchObject(request.body);
            expect(mockSauceUpdateOne.mock.calls[0][1]).toHaveProperty('imageUrl');
            expect(mockSauceUpdateOne.mock.calls[0][1].imageUrl).toMatch(new RegExp(request.file.fileName));

            delete request.cache;
        });

        test('Call the unlink method if an image is sent', async () => {
            mockSauceUpdateOne.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            await updateSauce(request, response, next);

            expect(mockFsUnlink).toHaveBeenCalled();
            expect(mockFsUnlink.mock.calls[0][0]).toMatch(new RegExp(SAUCE_DATA[0].imageUrl.split('/images/')[1]));
        });

        test("Don't call the unlink method if no image is sent", async () => {
            mockSauceUpdateOne.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            delete request.file;

            await updateSauce(request, response, next);

            expect(mockFsUnlink).not.toHaveBeenCalled();
        });

        test("Don't call the unlink method if no image is sent", async () => {
            mockSauceUpdateOne.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            delete request.file;

            await updateSauce(request, response, next);

            expect(mockFsUnlink).not.toHaveBeenCalled();
        });

        test('Calls the next middleware with an error if updating fails', async () => {
            const errorMessage = 'Sauce update error message';
            const updateError = { message: errorMessage };
            mockSauceUpdateOne.mockRejectedValue(updateError);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            await updateSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(updateError);
        });

        test('Calls the next middleware with an error if fetching fails', async () => {
            const errorMessage = 'Sauce fetch error message';
            const fetchError = { message: errorMessage };
            mockSauceFindById.mockRejectedValue(fetchError);

            await updateSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(fetchError);
        });

        test('Calls the next middleware with an error containing status 400 if the update method returns a validation error', async () => {
            const errorMessage = 'Sauce update error message';
            const updateError = { message: errorMessage, name: 'ValidationError' };
            mockSauceUpdateOne.mockRejectedValue(updateError);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            await updateSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 400, ...updateError });
        });

        test('Calls the next middleware with an error containing status 400 if the fetch method returns a cast error', async () => {
            const errorMessage = 'Sauce fetch error message';
            const fetchError = { message: errorMessage, name: 'CastError' };
            mockSauceFindById.mockRejectedValue(fetchError);

            await updateSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 400, ...fetchError });
        });

        test('Calls the next middleware with an error containing status 404 if the fetch method returns a document not found error', async () => {
            const errorMessage = 'Sauce fetch error message';
            const fetchError = { message: errorMessage, name: 'DocumentNotFoundError' };
            mockSauceFindById.mockRejectedValue(fetchError);

            await updateSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 404, ...fetchError });
        });
    });

    describe('delete controller test suite', () => {
        beforeEach(() => {
            request.params.id = '123';
        });

        afterAll(() => {
            delete request.params.id;
        });

        test('Sends a response containing status 200 and a message', async () => {
            mockSauceDeleteOne.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            await deleteSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceFindById).toHaveBeenCalledWith(request.params.id);
            expect(mockSauceDeleteOne).toHaveBeenCalled();
            expect(mockSauceDeleteOne).toHaveBeenCalledWith({ _id: request.params.id });
        });

        test("Sends a response containing status 200 and a message and don't fetch the image if it is in req.cache", async () => {
            mockSauceDeleteOne.mockResolvedValue(null);

            request.cache = { sauces: {} };
            request.cache.sauces[request.params.id] = SAUCE_DATA[0];

            await deleteSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceFindById).not.toHaveBeenCalled();
            expect(mockSauceDeleteOne).toHaveBeenCalled();
            expect(mockSauceDeleteOne).toHaveBeenCalledWith({ _id: request.params.id });

            delete request.cache;
        });

        test('Call the unlink method', async () => {
            mockSauceDeleteOne.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            await deleteSauce(request, response, next);

            expect(mockFsUnlink).toHaveBeenCalled();
            expect(mockFsUnlink.mock.calls[0][0]).toMatch(new RegExp(SAUCE_DATA[0].imageUrl.split('/images/')[1]));
        });

        test('Calls the next middleware with an error if deleting fails', async () => {
            const errorMessage = 'Sauce delete error message';
            const deleteError = { message: errorMessage };
            mockSauceDeleteOne.mockRejectedValue(deleteError);
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            await deleteSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(deleteError);
        });

        test('Calls the next middleware with an error if fetching fails', async () => {
            const errorMessage = 'Sauce fetch error message';
            const fetchError = { message: errorMessage };
            mockSauceFindById.mockRejectedValue(fetchError);

            await deleteSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(fetchError);
        });

        test('Calls the next middleware with an error containing status 400 if the fetch method returns a cast error', async () => {
            const errorMessage = 'Sauce fetch error message';
            const fetchError = { message: errorMessage, name: 'CastError' };
            mockSauceFindById.mockRejectedValue(fetchError);

            await deleteSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 400, ...fetchError });
        });

        test('Calls the next middleware with an error containing status 404 if the fetch method returns a document not found error', async () => {
            const errorMessage = 'Sauce fetch error message';
            const fetchError = { message: errorMessage, name: 'DocumentNotFoundError' };
            mockSauceFindById.mockRejectedValue(fetchError);

            await deleteSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 404, ...fetchError });
        });
    });

    describe('likeSauce controller test suite', () => {
        let returnedSauce;
        beforeEach(() => {
            returnedSauce = new Sauce(SAUCE_DATA[0]);
            request.params.id = '123';
        });

        afterAll(() => {
            delete request.params.id;
        });

        test('Likes the sauce', async () => {
            mockSauceSave.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(returnedSauce);

            let userId = '66666';
            request.body = { userId, like: 1 };
            request.auth = { userId: userId };

            await likeSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceSave).toHaveBeenCalled();
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes + 1);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length + 1);
            expect(returnedSauce.usersLiked).toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length);
            expect(returnedSauce.usersDisliked).not.toContain(userId);
        });

        test('Likes the sauce and remove the dislike if the user has already disliked', async () => {
            mockSauceSave.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(returnedSauce);

            let userId = SAUCE_DATA[0].usersDisliked[0];
            request.body = { userId, like: 1 };
            request.auth = { userId: userId };

            await likeSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceSave).toHaveBeenCalled();
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes + 1);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length + 1);
            expect(returnedSauce.usersLiked).toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes - 1);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length - 1);
            expect(returnedSauce.usersDisliked).not.toContain(userId);
        });

        test("Don't do anything if the user wants to like the sauce but has already done so", async () => {
            mockSauceSave.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(returnedSauce);

            let userId = SAUCE_DATA[0].usersLiked[0];
            request.body = { userId, like: 1 };
            request.auth = { userId: userId };

            await likeSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceSave).toHaveBeenCalled();
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length);
            expect(returnedSauce.usersLiked).toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length);
            expect(returnedSauce.usersDisliked).not.toContain(userId);
        });

        test('Dislikes the sauce', async () => {
            mockSauceSave.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(returnedSauce);

            let userId = '66666';
            request.body = { userId, like: -1 };
            request.auth = { userId: userId };

            await likeSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceSave).toHaveBeenCalled();
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length);
            expect(returnedSauce.usersLiked).not.toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes + 1);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length + 1);
            expect(returnedSauce.usersDisliked).toContain(userId);
        });

        test('Dislikes the sauce and remove the like if the user has already liked', async () => {
            mockSauceSave.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(returnedSauce);

            let userId = SAUCE_DATA[0].usersLiked[0];
            request.body = { userId, like: -1 };
            request.auth = { userId: userId };

            await likeSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceSave).toHaveBeenCalled();
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes - 1);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length - 1);
            expect(returnedSauce.usersLiked).not.toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes + 1);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length + 1);
            expect(returnedSauce.usersDisliked).toContain(userId);
        });

        test("Don't do anything if the user wants to dislike the sauce but has already done so", async () => {
            mockSauceSave.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(returnedSauce);

            let userId = SAUCE_DATA[0].usersDisliked[0];
            request.body = { userId, like: -1 };
            request.auth = { userId: userId };

            await likeSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceSave).toHaveBeenCalled();
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length);
            expect(returnedSauce.usersLiked).not.toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length);
            expect(returnedSauce.usersDisliked).toContain(userId);
        });

        test('Reset a dislike', async () => {
            mockSauceSave.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(returnedSauce);

            let userId = SAUCE_DATA[0].usersDisliked[0];
            request.body = { userId, like: 0 };
            request.auth = { userId: userId };

            await likeSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceSave).toHaveBeenCalled();
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length);
            expect(returnedSauce.usersLiked).not.toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes - 1);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length - 1);
            expect(returnedSauce.usersDisliked).not.toContain(userId);
        });

        test('Reset a like', async () => {
            mockSauceSave.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(returnedSauce);

            let userId = SAUCE_DATA[0].usersLiked[0];
            request.body = { userId, like: 0 };
            request.auth = { userId: userId };

            await likeSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceSave).toHaveBeenCalled();
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes - 1);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length - 1);
            expect(returnedSauce.usersLiked).not.toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length);
            expect(returnedSauce.usersDisliked).not.toContain(userId);
        });

        test("Reset nothing if the user hasn't done anything", async () => {
            mockSauceSave.mockResolvedValue(null);
            mockSauceFindById.mockResolvedValue(returnedSauce);

            let userId = '666666';
            request.body = { userId, like: 0 };
            request.auth = { userId: userId };

            await likeSauce(request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('message');
            expect(mockSauceSave).toHaveBeenCalled();
            expect(returnedSauce.likes).toBe(SAUCE_DATA[0].likes);
            expect(returnedSauce.usersLiked.length).toBe(SAUCE_DATA[0].usersLiked.length);
            expect(returnedSauce.usersLiked).not.toContain(userId);
            expect(returnedSauce.dislikes).toBe(SAUCE_DATA[0].dislikes);
            expect(returnedSauce.usersDisliked.length).toBe(SAUCE_DATA[0].usersDisliked.length);
            expect(returnedSauce.usersDisliked).not.toContain(userId);
        });

        test('Calls the next middleware with an error if saving fails', async () => {
            const errorMessage = 'Sauce save error message';
            const saveError = { message: errorMessage };
            mockSauceSave.mockRejectedValue(saveError);
            mockSauceFindById.mockResolvedValue(returnedSauce);

            await likeSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(saveError);
        });

        test('Calls the next middleware with an error if fetching fails', async () => {
            const errorMessage = 'Sauce fetch error message';
            const fetchError = { message: errorMessage };
            mockSauceFindById.mockRejectedValue(fetchError);

            await likeSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(fetchError);
        });

        test('Calls the next middleware with an error containing status 400 if the save method returns a validation error', async () => {
            const errorMessage = 'Sauce save error message';
            const saveError = { message: errorMessage, name: 'ValidationError' };
            mockSauceSave.mockRejectedValue(saveError);
            mockSauceFindById.mockResolvedValue(returnedSauce);

            await likeSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 400, ...saveError });
        });

        test('Calls the next middleware with an error containing status 400 if the fetch method returns a cast error', async () => {
            const errorMessage = 'Sauce fetch error message';
            const fetchError = { message: errorMessage, name: 'CastError' };
            mockSauceFindById.mockRejectedValue(fetchError);

            await likeSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 400, ...fetchError });
        });

        test('Calls the next middleware with an error containing status 404 if the fetch method returns a document not found error', async () => {
            const errorMessage = 'Sauce fetch error message';
            const fetchError = { message: errorMessage, name: 'DocumentNotFoundError' };
            mockSauceFindById.mockRejectedValue(fetchError);

            await likeSauce(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ status: 404, ...fetchError });
        });
    });
});
