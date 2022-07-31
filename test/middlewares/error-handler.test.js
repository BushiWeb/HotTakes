import { MulterError } from 'multer';
import {
    defaultErrorHandler,
    mongooseErrorHandler,
    multerErrorHandler,
    jwtErrorHandler,
    userInputValidationErrorHandler,
    deleteFiles,
} from '../../src/middlewares/error-handlers.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import mongoose from 'mongoose';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import UserInputValidationError from '../../src/errors/UserInputValidationError.js';
import fs from 'node:fs';

const request = mockRequest({
    email: 'test@email.com',
    password: 'P@55w0r$',
});
const response = mockResponse();
const next = mockNext();

const mockFsUnlink = jest.spyOn(fs, 'unlink');

beforeEach(() => {
    response.status.mockClear();
    response.json.mockClear();
    next.mockClear();
    mockFsUnlink.mockClear();
});

describe('Error handlers test suite', () => {
    describe('deleteFiles test suite', () => {
        afterEach(() => {
            delete request.files;
            request.file = {};
        });
        test('Calls the next function with the error if no file is sent', () => {
            const error = new Error('Error message');

            delete request.file;

            deleteFiles(error, request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });

        test('Calls the unlink method if a file is sent', () => {
            const error = new Error('Error message');

            request.file = {
                filename: 'file.png',
            };

            deleteFiles(error, request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
            expect(mockFsUnlink).toHaveBeenCalled();
            expect(mockFsUnlink.mock.calls[0][0]).toMatch(request.file.filename);
        });

        test('Calls the unlink method if an array of files is sent', () => {
            const error = new Error('Error message');

            delete request.file;

            request.files = [
                {
                    filename: 'file.png',
                },
                {
                    filename: 'file2.png',
                },
            ];

            deleteFiles(error, request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
            expect(mockFsUnlink).toHaveBeenCalledTimes(2);

            for (let i = 0; i < request.files.length; i++) {
                expect(mockFsUnlink.mock.calls[i][0]).toMatch(request.files[i].filename);
            }
        });

        test('Calls the unlink method if an object of files is sent', () => {
            const error = new Error('Error message');

            delete request.file;

            request.files = {
                filename: [
                    {
                        filename: 'file.png',
                    },
                ],
                filename2: [
                    {
                        filename: 'file2.png',
                    },
                    {
                        filename: 'file3.png',
                    },
                ],
            };

            deleteFiles(error, request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
            expect(mockFsUnlink).toHaveBeenCalled();

            let counter = 0;
            let fields = Object.keys(request.files);
            for (let i = 0; i < fields.length; i++) {
                for (let j = 0; j < request.files[fields[i]].length; j++, counter++) {
                    expect(mockFsUnlink.mock.calls[counter][0]).toMatch(request.files[fields[i]][j].filename);
                }
            }
        });
    });

    describe('multerErrorHandler test suite', () => {
        test('Calls the next function with the error if the error is not a MulterError', () => {
            const error = new Error('Error message');

            multerErrorHandler(error, request, response, next);

            expect(response.json).not.toHaveBeenCalled();
            expect(response.status).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });

        test('Sends a response with status 400 and the error in JSON format if the error is a MulterError', () => {
            const error = new MulterError('Error message');

            multerErrorHandler(error, request, response, next);

            expect(response.json).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('mongooseErrorHandler test suite', () => {
        test('Calls the next function with the error if the error is not a MongooseError', () => {
            const error = new Error('Error message');

            mongooseErrorHandler(error, request, response, next);

            expect(response.json).not.toHaveBeenCalled();
            expect(response.status).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });

        test('Sends a response with status 400 and the error in JSON format if the error is a CastError', () => {
            const error = new mongoose.Error.CastError('Error message');

            mongooseErrorHandler(error, request, response, next);

            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('type', 'MongooseError');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('name', 'CastError');
            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        test('Sends a response with status 400 and the error in JSON format if the error is a ValidationError', () => {
            const error = new mongoose.Error.ValidationError();

            mongooseErrorHandler(error, request, response, next);

            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('type', 'MongooseError');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('name', 'ValidationError');
            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        test('Sends a response with status 400 and the error in JSON format if the error is a ValidatorError', () => {
            const error = new mongoose.Error.ValidatorError({ message: 'Message', type: 'Unique', value: 'A value' });

            mongooseErrorHandler(error, request, response, next);

            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('type', 'MongooseError');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('name', 'ValidatorError');
            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        test('Sends a response with status 404 and the error in JSON format if the error is a DocumentNotFoundError', () => {
            const error = new mongoose.Error.DocumentNotFoundError('Error message');

            mongooseErrorHandler(error, request, response, next);

            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('type', 'MongooseError');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('name', 'DocumentNotFoundError');
            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(404);
            expect(next).not.toHaveBeenCalled();
        });

        test('Sends a response with status 500 and the error in JSON format if the error is an other mongoose error', () => {
            const error = new mongoose.Error('Error message');

            mongooseErrorHandler(error, request, response, next);

            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('type', 'MongooseError');
            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(500);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('jwtErrorHandler test suite', () => {
        test('Calls the next function with the error if the error is not a JsonWebTokenError', () => {
            const error = new Error('Error message');

            jwtErrorHandler(error, request, response, next);

            expect(response.json).not.toHaveBeenCalled();
            expect(response.status).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });

        test('Sends a response with status 401 and the error in JSON format if the error is a JsonWebTokenError', () => {
            const error = new JsonWebTokenError('Error message');

            jwtErrorHandler(error, request, response, next);

            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('type', 'JsonWebTokenError');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('name', 'JsonWebTokenError');
            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        test('Sends a response with status 401 and the error in JSON format if the error is a TokenExpiredError', () => {
            const error = new TokenExpiredError('Error message', '123');

            jwtErrorHandler(error, request, response, next);

            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('type', 'JsonWebTokenError');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('name', 'TokenExpiredError');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('expiredAt', '123');
            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        test('Sends a response with status 401 and the error in JSON format if the error is a NotBeforeError', () => {
            const error = new NotBeforeError('Error message', '123');

            jwtErrorHandler(error, request, response, next);

            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('type', 'JsonWebTokenError');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('name', 'NotBeforeError');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('date', '123');
            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('userInputValidationErrorHandler test suite', () => {
        test('Calls the next function with the error if the error is not a UserInputValidationError', () => {
            const error = new Error('Error message');

            userInputValidationErrorHandler(error, request, response, next);

            expect(response.json).not.toHaveBeenCalled();
            expect(response.status).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });

        test('Sends a response with status 400 and the error in JSON format if the error is a UserInputValidationError', () => {
            const fieldsError = [
                {
                    message: 'Invalid field message',
                    location: 'body',
                },
                {
                    message: 'Missing header',
                    location: 'header',
                },
            ];
            const message = 'Input error';
            const error = new UserInputValidationError(fieldsError, message);

            userInputValidationErrorHandler(error, request, response, next);

            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('name', 'UserInputValidationError');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('fields', fieldsError);
            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('defaultErrorHandler test suite', () => {
        test('Sends a response containing status 500 and the error object as JSON', () => {
            const error = { message: 'Error message' };

            defaultErrorHandler(error, request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(500);
            expect(response.json).toHaveBeenCalled();
            expect(response.json).toHaveBeenCalledWith({ error });
        });

        test('Sends a response containing custom status, and the error object without the status', () => {
            const error = { message: 'Error message', status: 404 };

            defaultErrorHandler(error, request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalled();
            expect(response.json).toHaveBeenCalledWith({
                error: {
                    message: error.message,
                },
            });
        });

        test('Sends a response containing status 500 and a message in a JSON object if the error is an instance of error', () => {
            const error = new Error('Error message');

            defaultErrorHandler(error, request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(500);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('message');
        });

        test('Sends a response containing custom status and a message in a JSON object if the error is an instance of error with a status property', () => {
            const error = new Error('Error message');
            error.status = 404;

            defaultErrorHandler(error, request, response, next);

            expect(response.status).toHaveBeenCalled();
            expect(response.status).toHaveBeenCalledWith(error.status);
            expect(response.json).toHaveBeenCalled();
            expect(response.json.mock.calls[0][0]).toHaveProperty('error');
            expect(response.json.mock.calls[0][0].error).toHaveProperty('message');
        });
    });
});
