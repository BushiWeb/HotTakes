import { defaultConfigManager } from '../config/ConfigManager.js';
import { createDebugNamespace } from '../logger/logger.js';

const headerDebug = createDebugNamespace('hottakes:middleware:headers');

/**
 * Middleware filtering the request based on it's content type.
 * Calls the next middleware if the content type is accepted or absent, and the error middelwares otherwise.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export function contentTypeFilter(req, res, next) {
    headerDebug('Validation middleware execution: Content-Type filtering');
    try {
        const allowedContentTypes = defaultConfigManager.getConfig('headers.allowedContentTypes');

        // Test if the content type of the element is in the allowed list. Since Content-Type can contain other informations, like boundary with multipart/form-data, use a regexp.
        if (
            !req.get('Content-Type') ||
            allowedContentTypes.find((element) => new RegExp(element).test(req.get('Content-Type')))
        ) {
            return next();
        }

        const error = new Error(`The Content-Type ${req.get('Content-Type')} is not accepted.`);
        error.status = 415;
        throw error;
    } catch (error) {
        next(error);
    }
}
