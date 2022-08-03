import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jsonWebToken from 'jsonwebtoken';
import mongoose from 'mongoose';
import UnauthorizedError from '../errors/UnauthorizedError.js';

/**
 * User signup controller.
 * Encrypts the password and save a new user.
 * Sends a message to the client with status 201 if the request is successful, or calls the error handler middleware if an error occurs.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function signup(req, res, next) {
    try {
        // Password hash
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        // User creation
        const user = new User({
            email: req.body.email,
            password: passwordHash,
        });

        await user.save();
        res.status(201).json({ message: 'Nouvel utilisateur créé!' });
    } catch (error) {
        return next(error);
    }
}
/**
 * User login controller.
 * Gets the user from the database and compare the passwords.
 * Sends the JsonWebToken to the user with status 200, or calls the error handler middleware if an arror occurs.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function login(req, res, next) {
    try {
        // Get the user
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            throw new mongoose.Error.DocumentNotFoundError(`Can't find the user with email ${req.body.email}`);
        }

        // Password check
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return next(new UnauthorizedError('Invalid password'));
        }

        // Sends the json web token
        const jwtKey = req.app.get('config').getJwtKey();
        res.status(200).json({
            userId: user._id,
            token: jsonWebToken.sign({ userId: user._id }, jwtKey, {
                expiresIn: '24h',
            }),
        });
    } catch (error) {
        return next(error);
    }
}
