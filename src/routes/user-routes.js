import express from 'express';
import { body } from 'express-validator';
import { signup, login } from '../controllers/user-controller.js';
import { validateFields } from '../middlewares/field-validation.js';
import Logger from '../logger/logger.js';
import { defaultConfigManager } from '../config/ConfigManager.js';
import { createDebugNamespace } from '../logger/logger.js';

const userRoutesDebug = createDebugNamespace('hottakes:userRoutes');

const router = express.Router();

/*
 * Get the password strength validation configuration.
 */
let passwordStrenghtValidationParameters;

try {
    passwordStrenghtValidationParameters = defaultConfigManager.getConfig('passwordValidation');
    userRoutesDebug('Password strenght validation parameters acquired: %o', passwordStrenghtValidationParameters);
} catch (error) {
    Logger.error(error);
    Logger.warn(`Couldn't set the password strength validation parameters. Default values will be used.`);
}

/**
 * Signup route.
 * Validates data:
 *      email is required and should have the right format,
 *      password is required and should have enough strength.
 * Uses signup user controller.
 */
router.post(
    '/signup',
    body('email')
        .exists({ checkNull: true })
        .withMessage('Email is required')
        .bail()
        .isString()
        .withMessage('Email should be a string')
        .bail()
        .isEmail()
        .withMessage('Email should use the right email format'),
    body('password')
        .exists({ checkNull: true })
        .withMessage('Password is required')
        .bail()
        .isString()
        .withMessage('Password should be a string')
        .bail()
        .isStrongPassword(passwordStrenghtValidationParameters)
        .withMessage(
            'Password should be at least 8 characters long, with at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol'
        ),
    validateFields,
    signup
);

/**
 * Login route.
 * Validates data:
 *      email is required and should have the right format,
 *      password is required.
 * Uses login user controller.
 */
router.post(
    '/login',
    body('email')
        .exists({ checkNull: true })
        .withMessage('Email is required')
        .bail()
        .isString()
        .withMessage('Email should be a string')
        .bail()
        .isEmail()
        .withMessage('Email should use the right email format'),
    body('password')
        .exists({ checkNull: true })
        .withMessage('Password is required')
        .bail()
        .isString()
        .withMessage('Password should be a string'),
    validateFields,
    login
);

export default router;
