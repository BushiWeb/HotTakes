import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jsonWebToken from 'jsonwebtoken';

/**
 * User signup controller.
 * Encrypts the password and save a new user.
 * Sends a message to the client with status 201 if the request is successful, and an error with the status 400 or 500 otherwise.
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
        return res.status(500).json({ error });
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
        return res.status(400).json({ error });
    }
}
/**
 * User login controller.
 * Gets the user from the database and compare the passwords.
 * Sends the JsonWebToken to the user with status 200, or an error if the user is not registered (404), the password is incorrect (401) or if the process fails (500).
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
        return res.status(500).json({ error });
    }

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Password check
    let validPassword;
    try {
        validPassword = await bcrypt.compare(req.body.password, user.password);
    } catch (error) {
        return res.status(500).json({ error });
    }

    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    // Sends the json web token
    res.status(200).json({
        userId: user._id,
        token: jsonWebToken.sign({ userId: user._id }, 'RANDOM_SECRET_KEY', {
            expiresIn: '24h',
        }),
    });
}
