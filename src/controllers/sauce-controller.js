import Sauce from '../models/Sauce.js';

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
    const sauceData = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceData,
        imageUrl: imageUrl,
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
