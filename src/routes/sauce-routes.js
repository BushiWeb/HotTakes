import express from 'express';
import {
    createSauce,
    getAllSauces,
    getSauce,
    updateSauce,
    deleteSauce,
    likeSauce,
} from '../controllers/sauce-controller.js';
import { validatePayload, validateIdParameter } from '../middlewares/field-validation.js';
import { bodyPropertyAssignToBody, sanitizeBody } from '../middlewares/request-body-manipulation.js';
import { checkAuthentication, checkOwnership } from '../middlewares/authentication.js';
import multer, { multerCheckFile } from '../middlewares/multer.js';
import { createDebugNamespace } from '../logger/logger.js';

const sauceRouterDebug = createDebugNamespace('hottakes:app:sauceRouter');

const router = express.Router();
sauceRouterDebug('Sauce router initialization');

/**
 * Fetches all sauces.
 * Checks that the user is authenticated.
 * Uses the getAllSauces controller.
 */
router.get('/', checkAuthentication, getAllSauces);
sauceRouterDebug('Use the getAllSauces middleware for the / endpoint with the GET method');

/**
 * Fetches one sauce using it's id.
 * Checks that the user is authenticated.
 * Uses the getSauce controller.
 */
router.get('/:id', validateIdParameter, checkAuthentication, getSauce);
sauceRouterDebug('Use the getSauce middleware for the /:id endpoint with the GET method');

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
    multerCheckFile(),
    bodyPropertyAssignToBody('sauce'),
    sanitizeBody,
    validatePayload('sauceRequired'),
    createSauce
);
sauceRouterDebug('Use the createSauce middleware for the / endpoint with the POST method');

/**
 * Updates a sauce.
 * Checks that the user is authenticated and owns the sauce.
 * Use the multer middleware to parse the request body and save the image. The image is optionnal.
 * Parses the body to JSON, but don't throw if the paramter is undefined.
 * Validates and sanitize data:
 *      name, manufacturer, description and mainPepper should be strings and are escaped;
 *      heat should be a number between 1 and 10 and is converted to an integer.
 * Uses the updateSauce controller.
 */
router.put(
    '/:id',
    validateIdParameter,
    checkAuthentication,
    checkOwnership,
    multer,
    multerCheckFile(false),
    bodyPropertyAssignToBody('sauce', false),
    sanitizeBody,
    validatePayload('sauce'),
    updateSauce
);
sauceRouterDebug('Use the updateSauce middleware for the /:id endpoint with the PUT method');

/**
 * Deletes a sauce.
 * Checks that the user is authenticated and owns the sauce.
 * Uses the deleteSauce controller.
 */
router.delete('/:id', validateIdParameter, checkAuthentication, checkOwnership, deleteSauce);
sauceRouterDebug('Use the deleteSauce middleware for the /:id endpoint with the DELETE method');

/**
 * Likes or dislikes a sauce.
 * Checks that the user is authenticated.
 * Validates and sanitize data:
 *      heat is required, should be either 0, 1 or -1.
 * Uses the likeSauce controller.
 */
router.post('/:id/like', validateIdParameter, checkAuthentication, validatePayload('like'), likeSauce);
sauceRouterDebug('Use the likeSauce middleware for the /:id/like endpoint with the POST method');

export default router;
