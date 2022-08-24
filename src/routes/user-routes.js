import express from 'express';
import { signup, login } from '../controllers/user-controller.js';
import { validatePayload } from '../middlewares/field-validation.js';
import { createDebugNamespace } from '../logger/logger.js';

const userRouterDebug = createDebugNamespace('hottakes:app:sauceRouter');

const router = express.Router();
userRouterDebug('User router initialization');

/**
 * Signup route.
 * Validates data against the credentials schema.
 * Uses signup user controller.
 */
router.post('/signup', validatePayload('credentials'), signup);
userRouterDebug('Use the signup middleware for the /signup endpoint with the POST method');

/**
 * Login route.
 * Validates data against the credentials schema.
 * Uses login user controller.
 */
router.post('/login', validatePayload('credentials'), login);
userRouterDebug('Use the login middleware for the /login endpoint with the POST method');

export default router;
