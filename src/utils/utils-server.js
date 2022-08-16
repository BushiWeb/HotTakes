import { exit } from 'node:process';
import Logger from '../logger/logger.js';
import { createDebugNamespace } from '../logger/logger.js';

const serverDebug = createDebugNamespace('hottakes:server');

/**
 * Return the port value as a number.
 * @param {number | string} val - Port number, as a number or a string.
 * @returns Returns the port as a number.
 * @throws Throws an error if the parameter is neither a string nor an number.
 */
export const normalizePort = (val) => {
    serverDebug('Normalizing port');
    let port = val;

    if (typeof val === 'string') {
        port = parseInt(val, 10);
    }

    if (typeof port === 'number' && port >= 0) {
        return port;
    }

    throw new Error('The port value must be a number greater than 0. It should be given as a number or a string.');
};

/**
 * Created the bind information string.
 * @param {http.Server} server - Server instance to create the bind for.
 * @param {number} port - Port number the server is trying to connect to.
 * @returns Returns the port or the adress.
 */
export const getConnectionInformations = (server, port) => {
    const address = server.address();

    return address === null
        ? `port: ${port}`
        : typeof address === 'string'
        ? `pipe ${address}`
        : `port: ${address.port}, ${address.family} address: '${address.address}'`;
};

/**
 * Handles errors thrown by the server. Logs the error and exits the program..
 * @param {Error} error - Thrown error object.
 */
export const errorHandler = (error) => {
    Logger.fatal(error);
    exit(1);
};
