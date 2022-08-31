import { exit } from 'node:process';
import mongoose from 'mongoose';
import ConfigManager from '../config/ConfigManager.js';
import Logger, { createDebugNamespace } from '../logger/logger.js';

const mongoDbDebug = createDebugNamespace('hottakes:mongoDB');

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
 * Add debugging configuration to mongoose with a custom logger.
 */
const setupDbDebug = () => {
    const mongooseDebug = createDebugNamespace('mongoose');
    mongoose.set('debug', (collectionName, methodName, ...methodArguments) => {
        let logMessage = `${collectionName}.${methodName}(`;
        for (let i = 0; i < methodArguments.length; i++) {
            if (i !== 0) {
                logMessage += ', ';
            }
            logMessage += '%o';
        }
        logMessage += ')';
        mongooseDebug({ message: logMessage, splat: methodArguments });
    });
};

/**
 * Connects to MongoDB.
 * Prints the result.
 */
export const mongoDBConnect = async () => {
    mongoDbDebug('MongoDB connection');
    setupDbDebug();
    try {
        const dbUrl = createDBUrl();
        mongoDbDebug(`MongoDB connection URL: ${dbUrl}`);
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
