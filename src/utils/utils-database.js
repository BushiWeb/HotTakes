import mongoose from 'mongoose';
import ConfigManager from '../config/ConfigManager.js';

const createDBUrl = () => {
    return `mongodb+srv://${ConfigManager.getEnvVariable('DB_USERNAME')}:${ConfigManager.getEnvVariable(
        'DB_PASSWORD'
    )}@${ConfigManager.getEnvVariable('DB_HOST')}/${ConfigManager.getEnvVariable(
        'DB_NAME'
    )}?retryWrites=true&w=majority`;
};

export const mongoDBConnect = () => {
    mongoose
        .connect(createDBUrl(), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log('MongoDB connection successful.'))
        .catch((error) => {
            console.error('MongoDB connection failed: ', error.message);
        });
};
