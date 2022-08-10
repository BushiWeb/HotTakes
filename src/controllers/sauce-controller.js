import Sauce from '../models/Sauce.js';
import { unlink } from 'node:fs';
import { join } from 'node:path';
import mongoose from 'mongoose';
import debug from 'debug';

const sauceControllerDebug = debug('hottakes:sauce');

/**
 * Sauce creation controller.
 * Use the user informations to build the image url and save the sauce to the database.
 * Sends a message to the client with status 201 if the request is successful, or calls the error handler middleware if an error occurs.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function createSauce(req, res, next) {
    sauceControllerDebug('Sauce creation controller');
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

        sauceControllerDebug('Sauce created: response sent');
    } catch (error) {
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
    sauceControllerDebug('Get all sauce controller');
    try {
        const sauces = await Sauce.find({}, '-__v');
        res.status(200).json(sauces);
        sauceControllerDebug('Sauces fetched: response sent');
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
    sauceControllerDebug('Get one sauce controller');
    try {
        const sauce = await Sauce.findById(req.params.id, '-__v');
        if (sauce === null) {
            throw new mongoose.Error.DocumentNotFoundError(`Can't find the sauce with id ${req.params.id}`);
        }
        res.status(200).json(sauce);
        sauceControllerDebug('Sauce fetched: response sent');
    } catch (error) {
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
    sauceControllerDebug('Update sauce controller');
    // Get the data and the image URL if needed
    const sauceData = { ...req.body };
    if (req.file) {
        sauceData.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    }

    let previousImageUrl = '';
    try {
        // Get the previous image URL from the request cache or from the database if the request contains a file
        if (req.file) {
            let sauce = req.cache?.sauces?.[req.params.id] || (await Sauce.findById(req.params.id));
            if (sauce === null) {
                throw new mongoose.Error.DocumentNotFoundError(`Can't find the sauce with id ${req.params.id}`);
            }
            previousImageUrl = sauce.imageUrl;
        }

        // Updates
        await Sauce.updateOne({ _id: req.params.id }, sauceData);

        res.status(200).json({ message: `La sauce ${req.params.id} a bien été modifiée` });
        sauceControllerDebug('Sauce updated: response sent');
    } catch (error) {
        return next(error);
    }

    // Deletes the previous image
    if (req.file) {
        sauceControllerDebug('Previous image deletion');
        const imageName = previousImageUrl.split('/images/')[1];
        const imagePath = join(req.app.get('root'), '../images', imageName);
        unlink(imagePath, () => {});
    }
}

/**
 * Delete sauce controller.
 * Deletes the sauce:
 *      Retrieves it from the database to get the current image URL.
 *      Deletes it.
 *      Send the response and delete the image.
 * Sends a message to the client with status 200 if the request is successful, or calls the error handler middleware if an error occurs.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function deleteSauce(req, res, next) {
    sauceControllerDebug('Sauce deletion controller');
    let imageUrl = '';
    try {
        // Get the previous image URL from the request cache or from the database
        let sauce = req.cache?.sauces?.[req.params.id] || (await Sauce.findById(req.params.id));
        if (sauce === null) {
            throw new mongoose.Error.DocumentNotFoundError(`Can't find the sauce with id ${req.params.id}`);
        }
        imageUrl = sauce.imageUrl;

        // Deletes
        await Sauce.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: `La sauce ${req.params.id} a bien été supprimée` });
        sauceControllerDebug('Sauce deleted: response sent');
    } catch (error) {
        return next(error);
    }

    // Deletes the previous image
    sauceControllerDebug("Sauce's image deletion");
    const imageName = imageUrl.split('/images/')[1];
    const imagePath = join(req.app.get('root'), '../images', imageName);
    unlink(imagePath, () => {});
}

/**
 * Like controller.
 * This controller manages the like action:
 *      If a user likes a sauce, then it's like count increases and the user is appended to the usersLiked array.
 *      If a user dislikes a sauce, then it's dislike count increases and the user is appended to the usersDisliked array.
 *      The like / dislike of a user can also be reseted by decreasing the right counter and removing it's name from the array.
 * If a users has already liked (disliked) and decides to dislike (like), then the like (dislike) is removed.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function likeSauce(req, res, next) {
    sauceControllerDebug('Sauce liking controller');
    try {
        // Fetch the sauce to update it
        const sauce = await Sauce.findById(req.params.id);
        if (sauce === null) {
            throw new mongoose.Error.DocumentNotFoundError(`Can't find the sauce with id ${req.params.id}`);
        }

        // Update the sauce, depending on the like value
        const likeResult = sauce.setLiking(req.body.like, req.auth.userId);
        let message = '';
        switch (likeResult.action) {
            case 1:
                if (likeResult.action === likeResult.reset) {
                    message =
                        "Votre like n'a pas pu être pris en compte, vous ne pouvez pas liker la même sauce plusieurs fois.";
                } else {
                    message = 'Votre like a bien été pris en compte.';
                }
                break;

            case -1:
                if (likeResult.action === likeResult.reset) {
                    message =
                        "Votre dislike n'a pas pu être pris en compte, vous ne pouvez pas disliker la même sauce plusieurs fois.";
                } else {
                    message = 'Votre dislike a bien été pris en compte.';
                }
                break;

            default:
                if (likeResult.reset === -1) {
                    message = "Nous avons bien enregistré votre désir d'annuler votre dislike.";
                } else if (likeResult.reset === 1) {
                    message = "Nous avons bien enregistré votre désir d'annuler votre like.";
                } else {
                    message = 'Aucune action à annuler.';
                }
        }
        await sauce.save();

        message += ` La sauce a donc été likée ${sauce.likes} fois, et dislikée ${sauce.dislikes} fois.`;

        res.status(200).json({ message });
        sauceControllerDebug('Sauce like set: response sent');
    } catch (error) {
        return next(error);
    }
}
