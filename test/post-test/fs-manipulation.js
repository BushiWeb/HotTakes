import fsPromises from 'node:fs/promises';
import path from 'node:path';

/**
 * Deletes all files from a directory, without deleting the directory.
 * @param {string} dirPath - Path to the directory.
 */
export async function emptyDirectory(dirPath) {
    try {
        const files = await fsPromises.readdir(dirPath);

        for (const file of files) {
            await fsPromises.unlink(path.join(dirPath, file));
        }
    } catch (error) {
        throw error;
    }
}
