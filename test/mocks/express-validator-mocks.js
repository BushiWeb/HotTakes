export const mockResultError = (message) => {
    const res = {};
    res.message = message;
    res.formatWith = jest.fn().mockReturnValue(res);
    res.array = jest.fn().mockReturnValue(res);
    return res;
};
