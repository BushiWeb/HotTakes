import { connection } from 'mongoose';
import http from 'node:http';
import { normalizePort, getConnectionInformations, errorHandler } from '../../src/utils/utils-server.js';

describe('Server utils test suite', () => {
    describe('normalizePort test suite', () => {
        test('Returns the port number if it is given a number', () => {
            const port = 3000;
            expect(normalizePort(port)).toBe(port);
        });

        test('Returns the port number if it is given a string containing a number', () => {
            const port = 3000;
            const portString = `${port}`;
            expect(normalizePort(portString)).toBe(port);
        });

        test('Throws an arror if it is given a negative number', () => {
            const port = -3000;
            expect(() => normalizePort(port)).toThrow();
        });

        test('Throws an error if the parameter is neither a string nor a number', () => {
            const port = null;
            expect(() => normalizePort(port)).toThrow();
        });
    });

    describe('getConnectionInformations test suite', () => {
        test('Returns a string containing the address, or the address informations', () => {
            const port = 5050;
            const server = http.createServer();
            server.listen(port);
            const address = server.address();
            const connectionInformations = getConnectionInformations(server, port);

            const isResultFormatOk =
                address !== null &&
                (new RegExp(`${address}`).test(connectionInformations) ||
                    (new RegExp(`${address.port}`).test(connectionInformations) &&
                        new RegExp(`${address.family}`).test(connectionInformations) &&
                        new RegExp(`${address.address}`).test(connectionInformations)));

            expect(isResultFormatOk).toBeTruthy();
            server.close();
        });

        test("Returns the port number if the address can't be given", () => {
            const port = 5050;
            const server = http.createServer();
            const address = server.address();
            const connectionInformations = getConnectionInformations(server, port);

            expect(connectionInformations).toMatch(`port: ${port}`);
        });
    });
});
