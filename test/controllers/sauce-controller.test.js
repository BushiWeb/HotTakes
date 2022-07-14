import { createSauce } from '../../src/controllers/sauce-controller.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import Sauce from '../../src/models/Sauce.js';

const mockSauceSave = jest.spyOn(Sauce.prototype, 'save');

const request = mockRequest();
const response = mockResponse();
const next = mockNext();

beforeEach(() => {
    mockSauceSave.mockReset();
    response.status.mockClear();
    response.json.mockClear();
    next.mockClear();
});

describe('Sauce controllers test suite', () => {
    describe('createSauce controller test suite', () => {
        beforeEach(() => {
            const sauceData = {
                name: 'tabasco',
                manufacturer: "I don't know",
                description: 'Popular sauce',
                mainPepper: "I don't know either",
                heat: 3,
            };

            request.body.sauce = JSON.stringify(sauceData);
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
});
