import mongoose from 'mongoose';
import { mongoDBConnect } from '../../src/utils/utils-database.js';
import ConfigManager from '../../src/config/ConfigManager.js';

const mockMongooseConnect = jest.spyOn(mongoose, 'connect');
const mockGetEnvVariable = jest.spyOn(ConfigManager, 'getEnvVariable');
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
    mockMongooseConnect.mockReset();
    mockGetEnvVariable.mockReset();
    mockConsoleError.mockClear();
    mockConsoleLog.mockClear();
});

describe('Database utils test suite', () => {
    describe('mongoDBConnect test suite', () => {
        test('Connect to mongoDB and prints a confirmation message', async () => {
            mockGetEnvVariable.mockReturnValue('url');
            mockMongooseConnect.mockResolvedValue('URL');

            await mongoDBConnect();

            expect(mockConsoleLog).toHaveBeenCalled();
        });

        test('Prints an error if connection fails', async () => {
            mockGetEnvVariable.mockReturnValue('url');
            mockMongooseConnect.mockRejectedValue('URL');

            await mongoDBConnect();

            expect(mockConsoleError).toHaveBeenCalled();
        });

        test('Prints an error if database configuration is missing', async () => {
            mockGetEnvVariable.mockImplementation(() => {
                throw 'error';
            });
            mockMongooseConnect.mockResolvedValue('URL');

            await mongoDBConnect();

            expect(mockConsoleError).toHaveBeenCalled();
        });
    });
});
