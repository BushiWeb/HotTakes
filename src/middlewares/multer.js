import multer, { MulterError } from 'multer';
import { defaultConfigManager } from '../config/ConfigManager.js';
import validator from 'validator';
import Logger, { createDebugNamespace } from '../logger/logger.js';

const multerDebug = createDebugNamespace('hottakes:multer');

/**
 * Creates an multer error.
 * @param {string} message - Message of the error.
 * @param {string} code - Error's code.
 * @param {string} [field=undefined] - Field name.
 * @returns {MulterError} Returns an error that
 */
const createMulterError = (message, code, field = undefined) => {
    multerDebug({ message: 'Multer error creation: %o', splat: [{ message, code, field }] });
    const error = new MulterError(code, field);
    error.message = message;
    return error;
};

/*
 * Get the allowed mime types and the max file size from the configuration manager.
 */
let MIME_TYPES;
let maxFileSize;
let maxFieldSize;

try {
    MIME_TYPES = defaultConfigManager.getConfig('fileUpload.allowedMimeTypes');
    multerDebug({ message: 'Allowed files mime-types: %o', splat: [MIME_TYPES] });
} catch (error) {
    Logger.error(error);
    MIME_TYPES = {
        'image/jpg': 'jpg',
        'image/jpeg': 'jpg',
        'image/png': 'png',
    };
    Logger.warn(`Allowed MIME types couldn't be set. Using default value : ${JSON.stringify(MIME_TYPES)}`);
}

try {
    maxFileSize = defaultConfigManager.getConfig('fileUpload.maxFileSize');
    multerDebug({ message: 'Allowed maximum file size: %d', splat: [maxFileSize] });
} catch (error) {
    Logger.error(error);
    maxFileSize = 5242880;
    Logger.warn(`Maximum file size couldn't be set. Using default value : ${maxFileSize}`);
}

try {
    maxFieldSize = defaultConfigManager.getConfig('fileUpload.maxFieldSize');
    multerDebug({ message: 'Allowed maximum field size: %d', splat: [maxFieldSize] });
} catch (error) {
    Logger.error(error);
    maxFieldSize = 10240;
    Logger.warn(`Maximum field size couldn't be set. Using default value : ${maxFieldSize}`);
}

/*
 * Defines the disk storage for multer.
 * The images are stored in the 'images' folder.
 * The images will keep a similar name but sanitized:
 *      trailing and leading spaces removed;
 *      spaces converted to underscores;
 *      only keeping alphanumerical characters as well as dash, dot and underscore;
 *      remove the extension.
 * The date is appended to the image name and then the extension, deduced from the MIME_TYPES object.
 */
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        let folderName = 'images';
        if (defaultConfigManager.compareEnvironment('test')) {
            folderName = 'test/temp/img';
        }
        multerDebug(`File saving destination: ${folderName}`);
        callback(null, folderName);
    },
    filename: (req, file, callback) => {
        /* To generate a safe and (hopefully) unique file name:
         *      - Remove the surrounding whitespaces
         *      - Replace spaces with underscores
         *      - Keep only alphanumerical characters, periods, underscores and dashes
         *      - Remove the extension
         *      - Append the current timestamp and the extension
         */
        let name = file.originalname;
        name = validator.trim(name);
        name = name.split(' ').join('_');
        name = validator.whitelist(name, 'A-Za-z0-9._-');
        name = name.replace(/\.[^/.]+$/, '');
        const extension = MIME_TYPES[file.mimetype];
        const fileName = `${name}${Date.now()}.${extension}`;
        multerDebug(`File saving new name: ${fileName}`);
        callback(null, fileName);
    },
});
multerDebug('Disk storage initialized');

/*
 * Defines the file filter for multer.
 * Only accepts files if their MIME-types is accepted.
 * The maximum file size is specified in the limits option and is checked by multer
 */
const fileFilter = (req, file, callback) => {
    multerDebug({ message: 'File filtering: %o', splat: [file] });

    // Check the file extension
    if (!Object.hasOwn(MIME_TYPES, file.mimetype)) {
        multerDebug('The file is refused');
        // Refuse the file and tell the request we've refused it
        req.fileRefused = true;
        return callback(null, false);
    }

    multerDebug('The file is accepted');
    callback(null, true);
};

/*
 * Exports the multer middleware.
 * Use the defined storage and file filter.
 * Defines a limit for the file size.
 */
export default multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: maxFileSize,
        fieldSize: maxFieldSize,
    },
}).single('image');

/**
 * Function returning a validator middleware checking that a file has been sent and accepted. If has been sent and accepted, then calls the next middleware, and calls the error middleware otherwise.
 * This middleware is set up depending on the function parameters.
 * @param {boolean} [required=true] - Tells if the file(s) is(are) required or not.
 */
export const multerCheckFile = (required = true) => {
    multerDebug(`Create multerCheckFile middleware, the files are ${required ? '' : 'not '}required`);
    return (req, res, next) => {
        multerDebug('Validation middleware execution: checking that files have been sent');
        // Checking for filtering errors
        if (req.fileRefused) {
            multerDebug('Invalid files sent, throwing an error');
            const fileTypeError = createMulterError(
                'This file type is not accepted. Please, use one of the following format: jpeg, png, webp, avif',
                'INVALID_FILE_TYPE'
            );
            return next(fileTypeError);
        }

        // Checking that files have been sent if required is true
        if (
            required &&
            !req.file &&
            (!req.files ||
                (Array.isArray(req.files) && req.files.length === 0) ||
                (typeof req.files === 'object' && Object.keys(req.files).length === 0))
        ) {
            multerDebug('No files sent, passing an error');
            const fileMissingError = createMulterError('The file is required.', 'FILE_MISSING');
            return next(fileMissingError);
        }

        next();
    };
};
