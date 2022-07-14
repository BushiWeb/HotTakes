export const mockRequest = (body = {}, headers = {}, file = {}, protocol = '') => {
    const req = { body, headers, file, protocol };
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
