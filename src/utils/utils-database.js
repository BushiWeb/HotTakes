import { exit } from 'node:process';
import mongoose from 'mongoose';
import ConfigManager from '../config/ConfigManager.js';
import Logger from '../logger/logger.js';

/**
 * Creates a mongo DB databasa URl dependong on some environment variables.
 * @returns Returns the database URL
 * @throws {ConfigurationErrors} Throws ConfigurationErrors if the environment variables are not defined.
 */
const createDBUrl = () => {
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
    try {
        const dbUrl = createDBUrl();
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        Logger.info('MongoDB connection successful.');
    } catch (error) {
        Logger.fatal(`MongoDB connection failed: [${error.name}] ${error.message}`);
        exit(1);
    }
};
