import multer from 'multer';
import { MulterError } from 'multer';
import ConfigManager from '../config/ConfigManager.js';
import validator from 'validator';

/**
 * Creates an multer error.
 * @param {string} message - Message of the error.
 * @param {string} code - Error's code.
 * @param {string} [field=undefined] - Field name.
 * @returns {MulterError} Returns an error that
 */
const createMulterError = (message, code, field = undefined) => {
    const error = new MulterError(code, field);
    error.message = message;
    return error;
};

/*
 * Array of accepted MIME-types
 */
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
};

/*
 * Defines the disk storage for multer.
 * The images are stored in the 'images' folder.
 * The images will keep their name but the spaces will be replaced with underscores.
 * The date is appended to the image name and then the extension, deduced from the MIME_TYPES object.
 */
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        let folderName = 'images';
        if (ConfigManager.compareEnvironment('test')) {
            folderName = 'test/temp/img';
        }
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
        callback(null, fileName);
    },
});

/*
 * Defines the file filter for multer.
 * Only accepts files if their MIME-types is accepted.
 * The maximum file size is specified in the limits option and is checked by multer
 */
const fileFilter = (req, file, callback) => {
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
 * Defines a 5mb limit for the file size.
 */
export default multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5242880,
    },
}).single('image');

/**
 * Validator middleware checking that a file has been sent. If has been sent, then calls the next middleware, and calls the error middleware otherwise.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export const multerCheckFileExists = (req, res, next) => {
    if (!req.file) {
        const fileMissingError = createMulterError('The file is required.', 'FILE_MISSING');
        return next(fileMissingError);
    }

    next();
};
