import express from 'express';
import { body } from 'express-validator';
import { signup, login } from '../controllers/user-controller.js';
import { validateFields } from '../middlewares/field-validation.js';

const router = express.Router();

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
        .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
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
