export const mockRequest = (body = {}, headers = {}, file = {}, protocol = '', params = {}) => {
    const req = { body, headers, file, protocol, params };
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
