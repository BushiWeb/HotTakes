import http from 'node:http';
import app from './app.js';
import { normalizePort, getConnectionInformations, errorHandler } from './utils/utils-server.js';

let port;
try {
    port = normalizePort(process.env.PORT);
} catch (error) {
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
