import Sauce from '../models/Sauce.js';
import { unlink } from 'node:fs';
import { join } from 'node:path';
import mongoose from 'mongoose';
import { createDebugNamespace } from '../logger/logger.js';

const sauceControllerDebug = createDebugNamespace('hottakes:middleware:sauce');

/**
 * Sauce creation controller.
 * Use the user informations to build the image url and save the sauce to the database.
 * Sends a message to the client with status 201 if the request is successful, or calls the error handler middleware if an error occurs.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function createSauce(req, res, next) {
    sauceControllerDebug('Middleware execution: creating sauce');

    // Create image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    sauceControllerDebug(`Sauce image URL created: ${imageUrl}`);

    // Sauce creation
    const sauce = new Sauce({
        ...req.body,
        imageUrl: imageUrl,
        userId: req.auth.userId,
    });

    try {
        await sauce.save();
        sauceControllerDebug('Sauce saved');

        res.status(201).json({ message: 'Nouvelle sauce créée!' });
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
    sauceControllerDebug('Middleware execution: getting all sauces');

    try {
        const sauces = await Sauce.find({}, '-__v');
        sauceControllerDebug('Sauces fetched');

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
    sauceControllerDebug('Middleware execution: getting one sauce');

    try {
        const sauce = await Sauce.findById(req.params.id, '-__v');
        sauceControllerDebug(`Sauce ${req.params.id} fetched`);
        // Check if the sauce exists
        if (sauce === null) {
            sauceControllerDebug(`Sauce ${req.params.id} doesn't exist, throwing an error`);
            throw new mongoose.Error.DocumentNotFoundError(`Can't find the sauce with id ${req.params.id}`);
        }

        res.status(200).json(sauce);
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
    sauceControllerDebug('Middleware execution: updating one sauce');

    // Get the data and the image URL if needed
    const sauceData = { ...req.body };
    if (req.file) {
        sauceData.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        sauceControllerDebug(`Sauce image URL created: ${sauceData.imageUrl}`);
    }

    let previousImageUrl = '';
    try {
        // Get the previous image URL from the request cache or from the database if the request contains a file
        if (req.file) {
            let sauce = req.cache?.sauces?.[req.params.id] || (await Sauce.findById(req.params.id));
            sauceControllerDebug(`A file has been sent, sauce ${req.params.id} fetched`);
            // Check if the sauce exists
            if (sauce === null) {
                sauceControllerDebug(`Sauce ${req.params.id} doesn't exist, throwing an error`);
                throw new mongoose.Error.DocumentNotFoundError(`Can't find the sauce with id ${req.params.id}`);
            }
            previousImageUrl = sauce.imageUrl;
            sauceControllerDebug(`Previous image URL saved: ${previousImageUrl}`);
        }

        // Updates
        await Sauce.updateOne({ _id: req.params.id }, sauceData);
        sauceControllerDebug('Sauce updated');

        res.status(200).json({ message: `La sauce ${req.params.id} a bien été modifiée` });
    } catch (error) {
        return next(error);
    }

    // Deletes the previous image
    if (req.file) {
        sauceControllerDebug('A file has been sent, previous image deletion');
        const imageName = previousImageUrl.split('/images/')[1];
        const imagePath = join(req.app.get('root'), '../images', imageName);
        unlink(imagePath, () => {});
        sauceControllerDebug(`Image ${imagePath} has been deleted`);
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
    sauceControllerDebug('Middleware execution: deleting one sauce');

    let imageUrl = '';
    try {
        // Get the previous image URL from the request cache or from the database
        let sauce = req.cache?.sauces?.[req.params.id] || (await Sauce.findById(req.params.id));
        sauceControllerDebug(`Sauce ${req.params.id} fetched`);
        // Check if the sauce exist
        if (sauce === null) {
            sauceControllerDebug(`Sauce ${req.params.id} doesn't exist, throwing an error`);
            throw new mongoose.Error.DocumentNotFoundError(`Can't find the sauce with id ${req.params.id}`);
        }
        imageUrl = sauce.imageUrl;
        sauceControllerDebug(`Image URL saved: ${imageUrl}`);

        // Deletes
        await Sauce.deleteOne({ _id: req.params.id });
        sauceControllerDebug('Sauce deleted');

        res.status(200).json({ message: `La sauce ${req.params.id} a bien été supprimée` });
    } catch (error) {
        return next(error);
    }

    // Deletes the previous image
    sauceControllerDebug('Image deletion');
    const imageName = imageUrl.split('/images/')[1];
    const imagePath = join(req.app.get('root'), '../images', imageName);
    unlink(imagePath, () => {});
    sauceControllerDebug(`Image ${imagePath} has been deleted`);
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
    sauceControllerDebug('Middleware execution: liking one sauce');
    try {
        // Fetch the sauce to update it
        const sauce = await Sauce.findById(req.params.id);
        sauceControllerDebug(`Sauce ${req.params.id} fetched`);
        // Check if the sauce exists
        if (sauce === null) {
            sauceControllerDebug(`Sauce ${req.params.id} doesn't exist, throwing an error`);
            throw new mongoose.Error.DocumentNotFoundError(`Can't find the sauce with id ${req.params.id}`);
        }

        // Update the sauce liking
        const { previousAction, newAction } = sauce.setLiking(req.body.like, req.auth.userId);
        sauceControllerDebug('Sauce like values updated');

        // Set the response message
        let message = '';
        let messageLikeInformations = `La sauce a été likée ${sauce.likes} fois, et dislikée ${sauce.dislikes} fois.`;

        if (previousAction === newAction && newAction !== 0) {
            /*
                The user wants to like or dislike the sauce a second time :
                    {action: 1, reset: 1}
                    ou
                    {action: -1, reset: -1}
            */
            message = `Vous avez déjà ${newAction === 1 ? 'liké' : 'disliké'} cette sauce.`;
        } else if (newAction !== 0) {
            /*
                The user wants to like or dislike the sauce for the first time :
                    {action: 1, reset: -1 | 0}
                    ou
                    {action: -1, reset: 1 | 0}
            */
            message = `Votre ${
                newAction === 1 ? 'like' : 'dislike'
            } a bien été pris en compte. ${messageLikeInformations}`;
        } else if (previousAction === 0) {
            /*
                The user wants to reset his choice, but there is nothing to reset :
                    {action: 0, reset: 0}
            */
            message = 'Aucune action à annuler.';
        } else {
            /*
                The user wants to reset his choice :
                    {action: 0, reset: 1 | -1}
            */
            message = `Votre ${
                previousAction === 1 ? 'like' : 'dislike'
            } a bien été annulé. ${messageLikeInformations}`;
        }
        sauceControllerDebug(`Response message created: "${message}"`);

        await sauce.save();
        sauceControllerDebug('Updates saved');

        res.status(200).json({ message });
    } catch (error) {
        return next(error);
    }
}
