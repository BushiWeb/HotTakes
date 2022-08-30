import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ConfigManager from '../../src/config/ConfigManager.js';

export const mockRequest = (body = {}, headers = {}, file = {}, protocol = '', params = {}) => {
    const req = { body, headers, file, protocol, params };
    req.app = { root: dirname(fileURLToPath(import.meta.url)) };
    req.app.get = jest.fn().mockImplementation((parameter) => {
        switch (parameter) {
            case 'root':
                return req.app.root;
            case 'config':
                return new ConfigManager();
            default:
                return parameter;
        }
    });
    req.get = jest.fn().mockImplementation((parameter) => {
        switch (parameter) {
            case 'Content-Type':
                return req['Content-Type'];
            default:
                return parameter;
        }
    });
    return req;
};

export const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

export const mockNext = () => jest.fn();
