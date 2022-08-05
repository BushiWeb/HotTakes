import mongoose from 'mongoose';
import { mongoDBConnect } from '../../src/utils/utils-database.js';
import ConfigManager from '../../src/config/ConfigManager.js';
import Logger from '../../src/logger/logger.js';

const mockMongooseConnect = jest.spyOn(mongoose, 'connect');
const mockGetEnvVariable = jest.spyOn(ConfigManager, 'getEnvVariable');
const mockLoggerFatal = jest.spyOn(Logger, 'fatal').mockImplementation(() => {});
const mockLoggerInfo = jest.spyOn(Logger, 'info').mockImplementation(() => {});
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

beforeEach(() => {
    mockMongooseConnect.mockReset();
    mockGetEnvVariable.mockReset();
    mockLoggerFatal.mockClear();
    mockLoggerInfo.mockClear();
    mockProcessExit.mockClear();
});

afterAll(() => {
    mockLoggerFatal.mockRestore();
    mockLoggerInfo.mockRestore();
    mockProcessExit.mockRestore();
});

describe('Database utils test suite', () => {
    describe('mongoDBConnect test suite', () => {
        test('Connect to mongoDB and prints a confirmation message', async () => {
            mockGetEnvVariable.mockReturnValue('url');
            mockMongooseConnect.mockResolvedValue('URL');

            await mongoDBConnect();

            expect(mockLoggerInfo).toHaveBeenCalled();
        });

        test('Prints an error and exit the progrem if connection fails', async () => {
            mockGetEnvVariable.mockReturnValue('url');
            mockMongooseConnect.mockRejectedValue('URL');

            await mongoDBConnect();

            expect(mockLoggerFatal).toHaveBeenCalled();
            expect(mockProcessExit).toHaveBeenCalled();
        });

        test('Prints an error if database configuration is missing', async () => {
            mockGetEnvVariable.mockImplementation(() => {
                throw 'error';
            });
            mockMongooseConnect.mockResolvedValue('URL');

            await mongoDBConnect();

            expect(mockLoggerFatal).toHaveBeenCalled();
            expect(mockProcessExit).toHaveBeenCalled();
        });
    });
});
