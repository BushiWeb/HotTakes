import http from 'node:http';
import app from './app.js';
import { normalizePort, getConnectionInformations, errorHandler } from './utils/utils-server.js';
import ConfigManager from './config/ConfigManager.js';
import Logger from './logger/logger.js';

let port;
try {
    port = normalizePort(ConfigManager.getEnvVariable('PORT'));
} catch (error) {
    port = normalizePort('3000');
    Logger.error(error);
    Logger.warn(`The port can't be normalized. Use defaut port ${port} instead`);
}

app.set('port', port);

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
    const connectionInformations = getConnectionInformations(server, port);
    Logger.info(`Server listening on ${connectionInformations}`);
});

server.listen(port);
