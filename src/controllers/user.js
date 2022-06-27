import bcrypt from 'bcrypt';
import User from '../models/User.js';

/**
 * User signup controller.
 * Checks the email and password format.
 * Encrypts the password and save a new user.
 * Sends a message to the client with status 201 if the request is successful, and an error with the status 422 otherwise.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export function signup(req, res, next) {
    bcrypt
        .hash(req.body.password, 10)
        .then((hash) => {
            const user = new User({
                email: req.body.email,
                password: hash,
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Nouvel utilisateur créé!' }))
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
}
