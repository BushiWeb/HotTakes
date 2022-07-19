import express from 'express';
import { body } from 'express-validator';
import { createSauce, getAllSauces, getSauce } from '../controllers/sauce-controller.js';
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
 *      name is required and is a string,
 *      manufacturer is required and is a string,
 *      description is required and is a string,
 *      mainPepper is required and is a string
 *      heat is required and is a number between 1 and 10
 * Uses the createSauce controller.
 */
router.post(
    '/',
    checkAuthentication,
    multer,
    multerCheckFileExists,
    bodyJsonParse('sauce'),
    body(['sauce.name', 'sauce.manufacturer', 'sauce.description', 'sauce.mainPepper'])
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
    body('sauce.heat')
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

export default router;
