const CONFIG = {
    fileUpload: {
        maxFileSize: 5242880,
        allowedMimeTypes: {
            'image/jpg': 'jpg',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/avif': 'avif',
        },
    },
    passwordValidation: {
        minLength: 8,
        minLowerCase: 1,
        minUpperCase: 1,
        minNumbers: 1,
        minSymbols: 1,
    },
};

export default CONFIG;
