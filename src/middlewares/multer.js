import multer from 'multer';
import { MulterError } from 'multer';
import { defaultConfigManager } from '../config/ConfigManager.js';
import validator from 'validator';
import Logger from '../logger/logger.js';
import { createDebugNamespace } from '../logger/logger.js';

const multerDebug = createDebugNamespace('hottakes:multer');

/**
 * Creates an multer error.
 * @param {string} message - Message of the error.
 * @param {string} code - Error's code.
 * @param {string} [field=undefined] - Field name.
 * @returns {MulterError} Returns an error that
 */
const createMulterError = (message, code, field = undefined) => {
    multerDebug('Multer error creation');
    const error = new MulterError(code, field);
    error.message = message;
    return error;
};

/*
 * Get the allowed mime types and the max file size from the configuration manager.
 */
let MIME_TYPES;
let maxFileSize;

try {
    MIME_TYPES = defaultConfigManager.getConfig('fileUpload.allowedMimeTypes');
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
} catch (error) {
    Logger.error(error);
    maxFileSize = 5242880;
    Logger.warn(`Maximum file size couldn't be set. Using default value : ${maxFileSize}`);
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

/*
 * Defines the file filter for multer.
 * Only accepts files if their MIME-types is accepted.
 * The maximum file size is specified in the limits option and is checked by multer
 */
const fileFilter = (req, file, callback) => {
    multerDebug('File filtering');
    if (!MIME_TYPES[file.mimetype]) {
        const fileTypeError = createMulterError(
            'This file type is not accepted. Please, use one of the following format: jpeg, png, webp, avif',
            'INVALID_FILE_TYPE',
            file.fieldName
        );
        callback(fileTypeError);
    }

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
    },
}).single('image');

/**
 * Validator middleware checking that a file has been sent. If has been sent, then calls the next middleware, and calls the error middleware otherwise.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export const multerCheckFileExists = (req, res, next) => {
    multerDebug('Checks that the file exists');
    if (
        !req.file &&
        (!req.files ||
            (Array.isArray(req.files) && req.files.length === 0) ||
            (typeof req.files === 'object' && Object.keys(req.files).length === 0))
    ) {
        const fileMissingError = createMulterError('The file is required.', 'FILE_MISSING');
        return next(fileMissingError);
    }

    next();
};
