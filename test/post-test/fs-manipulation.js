import fsPromises from 'node:fs/promises';
import path from 'node:path';

/**
 * Deletes all files from a directory, without deleting the directory.
 * @param {string} dirPath - Path to the directory.
 */
export async function emptyDirectory(dirPath) {
    const files = await fsPromises.readdir(dirPath);
    for (const file of files) {
        try {
            await fsPromises.unlink(path.join(dirPath, file));
        } catch (error) {
            console.error(`Can't delete file ${file}: ${error.message}`);
        }
    }
}
