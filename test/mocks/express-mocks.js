import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const mockRequest = (body = {}, headers = {}, file = {}, protocol = '', params = {}) => {
    const req = { body, headers, file, protocol, params };
    req.app = { root: dirname(fileURLToPath(import.meta.url)) };
    req.app.get = jest.fn().mockImplementation((parameter) => {
        if (parameter === 'root') {
            return req.app.root;
        }
        return parameter;
    });
    req.get = jest.fn().mockImplementation((parameter) => parameter);
    return req;
};

export const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

export const mockNext = () => jest.fn();
