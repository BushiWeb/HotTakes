/**
 * Error handling middleware. It catches the errors thrown by the different middlewares and handles them.
 * Sets the response status to 500 by default, or to the value of the status property of the err parameter.
 * Sets the return value with the value of the err parameter.
 * @param {*} err - Error thrown by a middleware.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export function errorHandler(err, req, res, next) {
    let status = 500;

    if (err.status !== undefined) {
        status = err.status;
        delete err.status;
    }

    res.status(status).json({ error: err });
}
