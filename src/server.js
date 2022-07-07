import http from 'node:http';
import app from './app.js';
import { normalizePort, getConnectionInformations, errorHandler } from './utils/utils-server.js';
import ConfigManager from './config/ConfigManager.js';

let port;
try {
    port = normalizePort(ConfigManager.getEnvVariable('PORT'));
} catch (error) {
    console.error(error);
    port = normalizePort('3000');
}

app.set('port', port);

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
    const connectionInformations = getConnectionInformations(server, port);
    console.log('Listening on', connectionInformations);
});

server.listen(port);
