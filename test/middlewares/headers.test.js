import { contentTypeFilter } from '../../src/middlewares/headers.js';
import { mockResponse, mockRequest, mockNext } from '../mocks/express-mocks.js';
import { defaultConfigManager } from '../../src/config/ConfigManager.js';
import ConfigurationError from '../../src/errors/ConfigurationError.js';

const request = mockRequest();
const response = mockResponse();
const next = mockNext();

const mockDefaultConfigManagerGetConfig = jest
    .spyOn(defaultConfigManager, 'getConfig')
    .mockReturnValue(['application/json', 'multipart/form-data']);

beforeEach(() => {
    response.status.mockClear();
    response.json.mockClear();
    next.mockClear();
    mockDefaultConfigManagerGetConfig.mockClear();
});

describe('Headers middleware test suite', () => {
    describe('contentTypeFilter test suite', () => {
        test('The Content-Type is accepted', () => {
            request['Content-Type'] = 'multipart/form-data';

            contentTypeFilter(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0]).toHaveLength(0);
        });

        test('The Content-Type is accepted but contains more informations', () => {
            request['Content-Type'] = 'multipart/form-data; boundary=123';

            contentTypeFilter(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0]).toHaveLength(0);
        });

        test('The Content-Type is not set, but is still accepted', () => {
            request['Content-Type'] = undefined;

            contentTypeFilter(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0]).toHaveLength(0);
        });

        test('The Content-Type is not accepted', () => {
            request['Content-Type'] = 'text/plain';

            contentTypeFilter(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
            expect(next.mock.calls[0][0]).toHaveProperty('status', 415);
        });

        test('The configuration manager throws', () => {
            const error = new ConfigurationError('Error');
            mockDefaultConfigManagerGetConfig.mockImplementation(() => {
                throw error;
            });

            contentTypeFilter(request, response, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(ConfigurationError);
        });
    });
});
