import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jsonWebToken from 'jsonwebtoken';
import mongoose from 'mongoose';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import { createDebugNamespace } from '../logger/logger.js';
import ConfigManager from '../config/ConfigManager.js';

const userControllerDebug = createDebugNamespace('hottakes:middleware:user');

/**
 * User signup controller.
 * Encrypts the password and save a new user.
 * Sends a message to the client with status 201 if the request is successful, or calls the error handler middleware if an error occurs.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function signup(req, res, next) {
    userControllerDebug('Middleware execution: signing up');
    try {
        // Password hash
        const hashSalt = parseInt(ConfigManager.getEnvVariable('PASSWORD_ENCRYPTION_SALT'));
        const passwordHash = await bcrypt.hash(req.body.password, hashSalt);
        userControllerDebug('Password hashed');

        // User creation
        const user = new User({
            email: req.body.email,
            password: passwordHash,
        });

        await user.save();
        userControllerDebug('New user saved');

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
    userControllerDebug('Middleware execution: loging in');
    try {
        // Get the user
        const user = await User.findOne({ email: req.body.email });
        userControllerDebug(`User ${req.body.email} fetched`);
        if (!user) {
            userControllerDebug(`User ${req.body.email} doesn't exist, throwing an error`);
            throw new UnauthorizedError('Invalid connection credentials');
        }

        // Password check
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        userControllerDebug('Sent password checked against stored password');
        if (!validPassword) {
            userControllerDebug('Invalid password, throwing an error');
            throw new UnauthorizedError('Invalid connection credentials');
        }

        // Sends the json web token
        const jwtKey = req.app.get('config').getJwtKey();
        userControllerDebug('Token created');

        res.status(200).json({
            userId: user._id,
            token: jsonWebToken.sign({ userId: user._id }, jwtKey, {
                algorithm: 'HS256',
                expiresIn: '6h',
                issuer: 'hottakes-api',
                audience: 'hottakes-front',
            }),
        });
    } catch (error) {
        return next(error);
    }
}
