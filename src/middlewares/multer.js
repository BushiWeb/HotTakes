import multer from 'multer';

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
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        const fileName = `${name}${Date.now}.${extension}`;
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
        callback(null, false);
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
