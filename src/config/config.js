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
    logging: {
        levels: {
            levelsValues: {
                fatal: 0,
                error: 1,
                warn: 2,
                info: 3,
                http: 4,
                debug: 5,
            },
            levelsColors: {
                fatal: 'red bold',
                error: 'red',
                warn: 'yellow',
                info: 'white',
                http: 'cyan',
                debug: 'gray',
            },
            maxLevel: 'info',
        },
    },
};

export default CONFIG;
