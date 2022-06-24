import http from 'node:http';
import process from 'node:process';
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
        test('Returns the address informations', () => {
            const port = 5050;
            const server = http.createServer();
            server.listen(port);

            const address = server.address();
            const connectionInformations = getConnectionInformations(server, port);

            const isResultFormatOk =
                address !== null &&
                new RegExp(`${address.port}`).test(connectionInformations) &&
                new RegExp(`${address.family}`).test(connectionInformations) &&
                new RegExp(`${address.address}`).test(connectionInformations);

            expect(isResultFormatOk).toBeTruthy();
            server.close();
        });

        test('Returns a string containing the address', () => {
            const port = 5050;
            const server = http.createServer();
            server.listen(port);

            server.address = jest.fn(() => 'address');
            const address = server.address();
            const connectionInformations = getConnectionInformations(server, port);

            const isResultFormatOk = address !== null && new RegExp(`${address}`).test(connectionInformations);

            expect(isResultFormatOk).toBeTruthy();
            server.close();
        });

        test("Returns the port number if the address can't be given", () => {
            const port = 5050;
            const server = http.createServer();
            const connectionInformations = getConnectionInformations(server, port);

            expect(connectionInformations).toMatch(`port: ${port}`);
        });
    });

    describe('errorHandler test suite', () => {
        class MockSystemError extends Error {
            constructor(syscall, code, message) {
                super(message);
                this.syscall = syscall;
                this.code = code;
            }
        }

        const mockConsoleError = jest.spyOn(console, 'error');
        const mockProcessExit = jest.spyOn(process, 'exit');
        mockProcessExit.mockImplementation(() => {});

        beforeEach(() => {
            mockConsoleError.mockClear();
            mockProcessExit.mockClear();
        });

        afterAll(() => {
            mockConsoleError.mockRestore();
            mockProcessExit.mockRestore();
        });

        test("Throws an error if the error.syscall isn't 'listen'", () => {
            const error = new MockSystemError('test syscall', 'test code', 'Test message');
            expect(() => {
                errorHandler(error);
            }).toThrow();
        });

        test("Prints an error and exit if the error code is 'EADDRINUSE' ", () => {
            const error = new MockSystemError('listen', 'EADDRINUSE', 'test message');
            errorHandler(error);
            expect(mockConsoleError).toHaveBeenCalled();
            expect(mockProcessExit).toHaveBeenCalled();
        });

        test("Throws an error if the error code is not 'EADDRINUSE'", () => {
            const error = new MockSystemError('listen', 'test code', 'Test message');
            expect(() => {
                errorHandler(error);
            }).toThrow();
        });
    });
});
