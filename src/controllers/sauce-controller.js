import Sauce from '../models/Sauce.js';
import { unlink } from 'node:fs';
import { join } from 'node:path';

/**
 * Sauce creation controller.
 * Use the user informations to build the image url and save the sauce to the database.
 * Sends a message to the client with status 201 if the request is successful, or calls the error handler middleware if an error occurs.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function createSauce(req, res, next) {
    // Create image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;

    // Sauce creation
    const sauce = new Sauce({
        ...req.body,
        imageUrl: imageUrl,
        userId: req.auth.userId,
    });

    try {
        await sauce.save();
        res.status(201).json({ message: 'Nouvelle sauce créée!' });
    } catch (error) {
        if (error.name && error.name === 'ValidationError') {
            error.status = 400;
        }
        return next(error);
    }
}

/**
 * Sauce fetching controller.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function getAllSauces(req, res, next) {
    try {
        const sauces = await Sauce.find({}, '-__v');
        res.status(200).json(sauces);
    } catch (error) {
        return next(error);
    }
}

/**
 * Sauce fetching one by ID controller.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function getSauce(req, res, next) {
    try {
        const sauce = await Sauce.findById(req.params.id, '-__v');
        if (sauce === null) {
            throw {
                message: `Can't find the suace with id ${req.params.id}`,
                name: 'DocumentNotFoundError',
            };
        }
        res.status(200).json(sauce);
    } catch (error) {
        if (error.name && error.name === 'DocumentNotFoundError') {
            error.status = 404;
        }
        if (error.name && error.name === 'CastError') {
            error.status = 400;
        }
        return next(error);
    }
}

/**
 * Sauce update controller.
 * If an image is sent, build the image URL and delete the previous image after the sauce is updated.
 * Update the sauce data:
 *      Retrieves it from the database to get the current image URL.
 *      Updates it and saves the changes.
 * Sends a message to the client with status 200 if the request is successful, or calls the error handler middleware if an error occurs.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function updateSauce(req, res, next) {
    // Get the data and the image URL if needed
    const sauceData = { ...req.body };
    if (req.file) {
        sauceData.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    }

    let previousImageUrl = '';
    try {
        // Get the previous image URL
        let sauce = await Sauce.findById(req.params.id);
        previousImageUrl = sauce.imageUrl;

        // Updates
        await Sauce.updateOne({ _id: req.params.id }, sauceData);

        res.status(200).json({ message: `La sauce ${req.params.id} a bien été modifiée` });
    } catch (error) {
        if (error.name && error.name === 'DocumentNotFoundError') {
            error.status = 404;
        }
        if (error.name && error.name === 'CastError') {
            error.status = 400;
        }
        if (error.name && error.name === 'ValidationError') {
            error.status = 400;
        }
        return next(error);
    }

    // Deletes the previous image
    if (req.file) {
        const imageName = previousImageUrl.split('/images/')[1];
        const imagePath = join(req.app.get('root'), '../images', imageName);
        unlink(imagePath, () => {});
    }
}
