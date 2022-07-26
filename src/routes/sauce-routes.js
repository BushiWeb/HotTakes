import express from 'express';
import { body } from 'express-validator';
import {
    createSauce,
    getAllSauces,
    getSauce,
    updateSauce,
    deleteSauce,
    likeSauce,
} from '../controllers/sauce-controller.js';
import { validateFields } from '../middlewares/field-validation.js';
import { bodyJsonParse } from '../middlewares/body-json-parse.js';
import { checkAuthentication, checkOwnership } from '../middlewares/authentication.js';
import multer from '../middlewares/multer.js';
import { multerCheckFileExists } from '../middlewares/multer.js';

const router = express.Router();

/**
 * Fetches all sauces.
 * Checks that the user is authenticated.
 * Uses the getAllSauces controller.
 */
router.get('/', checkAuthentication, getAllSauces);

/**
 * Fetches one sauce using it's id.
 * Checks that the user is authenticated.
 * Uses the getSauce controller.
 */
router.get('/:id', checkAuthentication, getSauce);

/**
 * Creates a sauce.
 * Checks that the user is authenticated.
 * Use the multer middleware to parse the request body and save the image.
 * Parses the body to JSON.
 * Validates and sanitize data:
 *      name, manufacturer, description and mainPepper are required, should be strings and are escaped;
 *      heat is required, should be a number between 1 and 10 and is converted to an integer.
 * Uses the createSauce controller.
 */
router.post(
    '/',
    checkAuthentication,
    multer,
    multerCheckFileExists,
    bodyJsonParse('sauce'),
    body(['name', 'manufacturer', 'description', 'mainPepper'])
        .exists({ checkNull: true })
        .withMessage((value, { req, location, path }) => {
            return `The ${path} parameter is required`;
        })
        .bail()
        .isString()
        .withMessage((value, { req, location, path }) => {
            return `The ${path} parameter should be a string`;
        })
        .bail()
        .escape(),
    body('heat')
        .exists({ checkNull: true })
        .withMessage("The sauce's heat is required")
        .bail()
        .isInt({ min: 1, max: 10 })
        .withMessage("The sauce's heat should be a number between 1 and 10")
        .bail()
        .toInt(),
    validateFields,
    createSauce
);

/**
 * Updates a sauce.
 * Checks that the user is authenticated and owns the sauce.
 * Use the multer middleware to parse the request body and save the image.
 * Parses the body to JSON, but don't throw if the paramter is undefined.
 * Validates and sanitize data:
 *      name, manufacturer, description and mainPepper should be strings and are escaped;
 *      heat should be a number between 1 and 10 and is converted to an integer.
 * Uses the updateSauce controller.
 */
router.put(
    '/:id',
    checkAuthentication,
    checkOwnership,
    multer,
    bodyJsonParse('sauce', false),
    body(['name', 'manufacturer', 'description', 'mainPepper'])
        .optional()
        .isString()
        .withMessage((value, { req, location, path }) => {
            return `The ${path} parameter should be a string`;
        })
        .bail()
        .escape(),
    body('heat')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage("The sauce's heat should be a number between 1 and 10")
        .bail()
        .toInt(),
    validateFields,
    updateSauce
);

/**
 * Deletes a sauce.
 * Checks that the user is authenticated and owns the sauce.
 * Uses the deleteSauce controller.
 */
router.delete('/:id', checkAuthentication, checkOwnership, deleteSauce);

/**
 * Likes or dislikes a sauce.
 * Checks that the user is authenticated.
 * Validates and sanitize data:
 *      heat is required, should be either 0, 1 or -1.
 * Uses the likeSauce controller.
 */
router.post(
    '/:id/like',
    checkAuthentication,
    body('like')
        .exists({ checkNull: true })
        .withMessage('The like value is required')
        .bail()
        .isInt({ min: -1, max: 1 })
        .withMessage(
            'The like parameter should be 1 if you wish to like the sauce, -1 if you wish to dislike the sauce or 0 if you wish to reset your action.'
        )
        .bail()
        .toInt(),
    validateFields,
    likeSauce
);

export default router;
