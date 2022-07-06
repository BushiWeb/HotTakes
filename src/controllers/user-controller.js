import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jsonWebToken from 'jsonwebtoken';

/**
 * User signup controller.
 * Encrypts the password and save a new user.
 * Sends a message to the client with status 201 if the request is successful, or calls the error handler middleware if an arror occurs.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export async function signup(req, res, next) {
    // Password hash
    let passwordHash = '';
    try {
        passwordHash = await bcrypt.hash(req.body.password, 10);
    } catch (error) {
        return next(error);
    }

    // User creation
    const user = new User({
        email: req.body.email,
        password: passwordHash,
    });

    try {
        await user.save();
        res.status(201).json({ message: 'Nouvel utilisateur créé!' });
    } catch (error) {
        if (error.name && error.name === 'ValidationError') {
            error.status = 400;
        }
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
    // Get the user
    let user;
    try {
        user = await User.findOne({ email: req.body.email });
    } catch (error) {
        return next(error);
    }

    if (!user) {
        return next({ message: 'User not found', status: 404 });
    }

    // Password check
    let validPassword;
    try {
        validPassword = await bcrypt.compare(req.body.password, user.password);
    } catch (error) {
        return next(error);
    }

    if (!validPassword) {
        return next({ message: 'Invalid password', status: 401 });
    }

    // Sends the json web token
    res.status(200).json({
        userId: user._id,
        token: jsonWebToken.sign({ userId: user._id }, 'RANDOM_SECRET_KEY', {
            expiresIn: '24h',
        }),
    });
}