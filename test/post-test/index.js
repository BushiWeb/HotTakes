import { emptyDirectory } from './fs-manipulation.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

emptyDirectory(path.join(DIRNAME, '..', 'temp', 'img'))
    .then(() => {
        console.log('Images deleted');
    })
    .catch((error) => {
        console.error(`Can't delete images: ${error.message}`);
    });

emptyDirectory(path.join(DIRNAME, '..', 'temp', 'logs'))
    .then(() => {
        console.log('Logs deleted');
    })
    .catch((error) => {
        console.error(`Can't delete logs: ${error.message}`);
    });
