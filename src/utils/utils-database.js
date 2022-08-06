import { exit } from 'node:process';
import mongoose from 'mongoose';
import ConfigManager from '../config/ConfigManager.js';
import Logger from '../logger/logger.js';
import debug from 'debug';

const mongoDbDebug = debug('hottakes:mongoDB');

/**
 * Creates a mongo DB databasa URl dependong on some environment variables.
 * @returns Returns the database URL
 * @throws {ConfigurationErrors} Throws ConfigurationErrors if the environment variables are not defined.
 */
const createDBUrl = () => {
    mongoDbDebug('MongoDB Database URL creation');
    return `mongodb+srv://${ConfigManager.getEnvVariable('DB_USERNAME')}:${ConfigManager.getEnvVariable(
        'DB_PASSWORD'
    )}@${ConfigManager.getEnvVariable('DB_HOST')}/${ConfigManager.getEnvVariable(
        'DB_NAME'
    )}?retryWrites=true&w=majority`;
};

/**
 * Connects to MongoDB.
 * Prints the result.
 */
export const mongoDBConnect = async () => {
    mongoDbDebug('MongoDB connection');
    try {
        const dbUrl = createDBUrl();
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        Logger.info('MongoDB connection successful.');
    } catch (error) {
        Logger.fatal(error);
        exit(1);
    }
};
